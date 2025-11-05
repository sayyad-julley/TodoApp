const jwt = require('jsonwebtoken');

async function getJwtSecretWithFallback() {
  const isDev = (process.env.NODE_ENV || 'development') === 'development';
  let secret = process.env.JWT_SECRET;
  if (!secret) {
    if (isDev) {
      secret = 'dev-insecure-jwt-secret-change-me';
      console.warn('JWT_SECRET is not set; using development fallback secret. Do NOT use in production.');
    } else {
      throw new Error('JWT_SECRET is not set');
    }
  }
  return secret;
}

function getJwtSecret() {
  // Synchronous version for backward compatibility
  let secret = process.env.JWT_SECRET;
  if (!secret) {
    if ((process.env.NODE_ENV || 'development') === 'development') {
      secret = 'dev-insecure-jwt-secret-change-me';
      console.warn('JWT_SECRET is not set; using development fallback secret. Do NOT use in production.');
    } else {
      throw new Error('JWT_SECRET is not set');
    }
  }
  return secret;
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || '7d';
}

async function generateToken(payload) {
  const secret = await getJwtSecretWithFallback();
  const expiresIn = getJwtExpiresIn();
  return jwt.sign(payload, secret, { expiresIn });
}

async function verifyToken(token) {
  try {
    const secret = await getJwtSecretWithFallback();
    return jwt.verify(token, secret);
  } catch (err) {
    const error = new Error('Invalid or expired token');
    error.statusCode = 401;
    throw error;
  }
}

// Synchronous versions for backward compatibility
function generateTokenSync(payload) {
  const secret = getJwtSecret();
  const expiresIn = getJwtExpiresIn();
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyTokenSync(token) {
  try {
    const secret = getJwtSecret();
    return jwt.verify(token, secret);
  } catch (err) {
    const error = new Error('Invalid or expired token');
    error.statusCode = 401;
    throw error;
  }
}

module.exports = {
  generateToken,
  verifyToken,
  generateTokenSync,
  verifyTokenSync
};


