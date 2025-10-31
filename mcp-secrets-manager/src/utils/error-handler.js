/**
 * Error handling utilities for AWS Secrets Manager MCP
 */

export class SecretsManagerError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'SecretsManagerError';
    this.code = code;
    this.originalError = originalError;
  }
}

export class ValidationError extends SecretsManagerError {
  constructor(message, field = null) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class AuthenticationError extends SecretsManagerError {
  constructor(message) {
    super(message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends SecretsManagerError {
  constructor(message, originalError = null) {
    super(message, 'NETWORK_ERROR', originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Handle AWS SDK errors and convert them to our custom error types
 */
export function handleAWSError(error) {
  if (error.name === 'CredentialsProviderError') {
    return new AuthenticationError(
      'AWS credentials not found or invalid. Please configure your credentials using environment variables, AWS profile, or access keys.'
    );
  }

  if (error.name === 'InvalidTokenException') {
    return new AuthenticationError(
      'AWS credentials are invalid or expired. Please refresh your credentials.'
    );
  }

  if (error.name === 'ResourceNotFoundException') {
    return new SecretsManagerError(
      'The requested secret was not found.',
      'SECRET_NOT_FOUND'
    );
  }

  if (error.name === 'ResourceExistsException') {
    return new SecretsManagerError(
      'A secret with this name already exists.',
      'SECRET_ALREADY_EXISTS'
    );
  }

  if (error.name === 'InvalidParameterException') {
    return new ValidationError(
      error.message || 'Invalid parameter provided.',
      'parameter'
    );
  }

  if (error.name === 'InvalidRequestException') {
    return new SecretsManagerError(
      error.message || 'Invalid request.',
      'INVALID_REQUEST'
    );
  }

  if (error.name === 'DecryptionFailureException') {
    return new SecretsManagerError(
      'Secrets Manager cannot decrypt the protected secret text.',
      'DECRYPTION_FAILURE'
    );
  }

  if (error.name === 'InternalServiceErrorException') {
    return new NetworkError(
      'An error occurred on the server side. Please try again later.',
      error
    );
  }

  if (error.name === 'AccessDeniedException') {
    return new AuthenticationError(
      'You do not have permission to perform this action. Check your IAM permissions.'
    );
  }

  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return new NetworkError(
      'Network error occurred. Please check your internet connection.',
      error
    );
  }

  if (error.code === 'ETIMEDOUT') {
    return new NetworkError(
      'Request timed out. Please try again.',
      error
    );
  }

  // For unknown errors, wrap them in a generic SecretsManagerError
  return new SecretsManagerError(
    error.message || 'An unknown error occurred.',
    'UNKNOWN_ERROR',
    error
  );
}

/**
 * Validate secret name according to AWS requirements
 */
export function validateSecretName(name) {
  const errors = [];

  if (!name || typeof name !== 'string') {
    errors.push('Secret name is required and must be a string');
  } else {
    if (name.length < 1 || name.length > 512) {
      errors.push('Secret name must be between 1 and 512 characters');
    }

    if (!/^[a-zA-Z0-9_/+=.@-]+$/.test(name)) {
      errors.push('Secret name can only contain alphanumeric characters, forward slashes, underscores, plus signs, equals signs, periods, at signs, and hyphens');
    }

    if (name.startsWith('aws/')) {
      errors.push('Secret name cannot start with "aws/" (reserved prefix)');
    }

    if (name.endsWith('/')) {
      errors.push('Secret name cannot end with a forward slash');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * validate secret value
 */
export function validateSecretValue(value) {
  const errors = [];

  if (!value) {
    errors.push('Secret value is required');
  }

  // Check if value is too large (Secrets Manager limit is 10KB)
  if (typeof value === 'string' && value.length > 10240) {
    errors.push('Secret value cannot exceed 10KB');
  }

  // Validate JSON if it looks like JSON
  if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
    try {
      JSON.parse(value);
    } catch {
      errors.push('Invalid JSON format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate AWS region
 */
export function validateRegion(region) {
  const validRegions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'ca-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3',
    'eu-central-1', 'eu-north-1', 'ap-southeast-1', 'ap-southeast-2',
    'ap-northeast-1', 'ap-northeast-2', 'ap-south-1', 'sa-east-1'
  ];

  const errors = [];

  if (!region || typeof region !== 'string') {
    errors.push('Region is required and must be a string');
  } else if (!validRegions.includes(region)) {
    errors.push(`Invalid region: ${region}. Valid regions include: ${validRegions.slice(0, 5).join(', ')}...`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate AWS credentials
 */
export function validateCredentials(credentials) {
  const errors = [];

  if (credentials.accessKeyId && credentials.secretAccessKey) {
    if (typeof credentials.accessKeyId !== 'string' || credentials.accessKeyId.length < 16) {
      errors.push('Invalid AWS Access Key ID format');
    }

    if (typeof credentials.secretAccessKey !== 'string' || credentials.secretAccessKey.length < 16) {
      errors.push('Invalid AWS Secret Access Key format');
    }
  } else if (!credentials.profile && !credentials.accessKeyId) {
    errors.push('Either AWS profile or access keys must be provided');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize error messages for logging (remove sensitive information)
 */
export function sanitizeErrorMessage(message) {
  // Remove potential access keys or secrets from error messages
  return message
    .replace(/[A-Z0-9]{20}/g, '[REDACTED-ACCESS-KEY]')
    .replace(/[A-Za-z0-9+/]{40}/g, '[REDACTED-SECRET]')
    .replace(/[A-Za-z0-9-]{36}/g, '[REDACTED-UUID]');
}

/**
 * Create a standardized error response for MCP
 */
export function createErrorResponse(error, context = '') {
  const handledError = error.name === 'SecretsManagerError' ? error : handleAWSError(error);

  const message = sanitizeErrorMessage(handledError.message);
  const fullMessage = context ? `${context}: ${message}` : message;

  return {
    content: [
      {
        type: 'text',
        text: `Error: ${fullMessage}`
      }
    ],
    isError: true,
    errorCode: handledError.code,
    context
  };
}

/**
 * Retry mechanism for transient errors
 */
export async function withRetry(operation, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on authentication or validation errors
      if (error.name === 'AuthenticationError' || error.name === 'ValidationError') {
        throw error;
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.warn(`Attempt ${attempt} failed, retrying in ${waitTime}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}