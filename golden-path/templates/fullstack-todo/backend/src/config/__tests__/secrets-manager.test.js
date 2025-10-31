/**
 * Unit tests for SecretsManager
 * Tests AWS Secrets Manager integration and fallback behavior
 */

// Mock AWS SDK before importing
const mockGetSecretValue = jest.fn();
jest.mock('aws-sdk', () => ({
  __esModule: true,
  default: {
    SecretsManager: jest.fn(() => ({
      getSecretValue: mockGetSecretValue
    }))
  }
}));

describe('SecretsManager', () => {
  let SecretsManager, secretsManager, getDatabaseConfig, getJWTSecret;
  
  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
    jest.resetModules();
    
    // Clear environment variables
    delete process.env.MONGO_URI;
    delete process.env.JWT_SECRET;
    delete process.env.DB_SECRET_ARN;
    delete process.env.JWT_SECRET_ARN;
    delete process.env.AWS_REGION;
    
    // Dynamically import the module to ensure clean state
    const module = await import('../secrets-manager.js');
    SecretsManager = module.SecretsManager;
    secretsManager = module.secretsManager;
    getDatabaseConfig = module.getDatabaseConfig;
    getJWTSecret = module.getJWTSecret;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('SecretsManager class', () => {
    describe('constructor', () => {
      it('should create instance with default region', () => {
        const manager = new SecretsManager();
        expect(manager.client).toBeDefined();
      });

      it('should create instance with custom region', () => {
        const manager = new SecretsManager('us-west-2');
        expect(manager.client).toBeDefined();
      });

      it('should use AWS_REGION from environment', () => {
        process.env.AWS_REGION = 'eu-west-1';
        const manager = new SecretsManager();
        expect(manager.client).toBeDefined();
      });
    });

    describe('isArnUsable', () => {
      let manager;

      beforeEach(() => {
        manager = new SecretsManager();
      });

      it('should return false for null/undefined ARN', () => {
        expect(manager.isArnUsable(null)).toBe(false);
        expect(manager.isArnUsable(undefined)).toBe(false);
        expect(manager.isArnUsable('')).toBe(false);
      });

      it('should return false for placeholder ARNs with angle brackets', () => {
        expect(manager.isArnUsable('<your-secret-arn>')).toBe(false);
        expect(manager.isArnUsable('arn:aws:secretsmanager:us-east-1:123456789012:secret:<secret-name>')).toBe(false);
      });

      it('should return true for valid ARN format', () => {
        const validArn = 'arn:aws:secretsmanager:us-east-1:111111111111:secret:my-secret-ABC123';
        expect(manager.isArnUsable(validArn)).toBe(true);
      });

      it('should return true for valid ARN with special characters', () => {
        const validArn = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:my/secret_name.test@prod-ABC123';
        expect(manager.isArnUsable(validArn)).toBe(true);
      });

      it('should return true for AWS China partition ARN', () => {
        const chinaArn = 'arn:aws-cn:secretsmanager:cn-north-1:111111111111:secret:my-secret-ABC123';
        expect(manager.isArnUsable(chinaArn)).toBe(true);
      });

      it('should return false for invalid ARN format', () => {
        expect(manager.isArnUsable('not-an-arn')).toBe(false);
        expect(manager.isArnUsable('arn:aws:s3:::my-bucket')).toBe(false);
        expect(manager.isArnUsable('arn:aws:secretsmanager:us-east-1:invalid:secret:name')).toBe(false);
      });
    });

    describe('getDatabaseConfig', () => {
      let manager;

      beforeEach(() => {
        manager = new SecretsManager();
      });

      it('should return MONGO_URI from environment if set', async () => {
        process.env.MONGO_URI = 'mongodb://localhost:27017/testdb';
        
        const config = await manager.getDatabaseConfig();
        
        expect(config).toEqual({ uri: 'mongodb://localhost:27017/testdb' });
        expect(mockGetSecretValue).not.toHaveBeenCalled();
      });

      it('should return default MongoDB URI when no ARN or env var', async () => {
        const config = await manager.getDatabaseConfig();
        
        expect(config).toEqual({ uri: 'mongodb://localhost:27017/todoapp' });
        expect(mockGetSecretValue).not.toHaveBeenCalled();
      });

      it('should return default when ARN is not usable', async () => {
        process.env.DB_SECRET_ARN = '<your-secret-arn>';
        
        const config = await manager.getDatabaseConfig();
        
        expect(config).toEqual({ uri: 'mongodb://localhost:27017/todoapp' });
        expect(mockGetSecretValue).not.toHaveBeenCalled();
      });

      it('should fetch from Secrets Manager with valid ARN and direct URI format', async () => {
        process.env.DB_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:db-ABC123';
        
        mockGetSecretValue.mockReturnValue({
          promise: jest.fn().mockResolvedValue({
            SecretString: JSON.stringify({
              uri: 'mongodb+srv://user:pass@cluster.mongodb.net/mydb'
            })
          })
        });

        const config = await manager.getDatabaseConfig();

        expect(config).toEqual({ uri: 'mongodb+srv://user:pass@cluster.mongodb.net/mydb' });
        expect(mockGetSecretValue).toHaveBeenCalledWith({
          SecretId: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:db-ABC123'
        });
      });

      it('should construct URI from individual credentials', async () => {
        process.env.DB_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:db-ABC123';
        
        mockGetSecretValue.mockReturnValue({
          promise: jest.fn().mockResolvedValue({
            SecretString: JSON.stringify({
              username: 'dbuser',
              password: 'dbpass',
              host: 'db.example.com',
              port: 27017,
              database: 'mydb'
            })
          })
        });

        const config = await manager.getDatabaseConfig();

        expect(config).toEqual({ uri: 'mongodb://dbuser:dbpass@db.example.com:27017/mydb' });
      });

      it('should use default port 27017 when not specified', async () => {
        process.env.DB_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:db-ABC123';
        
        mockGetSecretValue.mockReturnValue({
          promise: jest.fn().mockResolvedValue({
            SecretString: JSON.stringify({
              username: 'dbuser',
              password: 'dbpass',
              host: 'db.example.com',
              database: 'mydb'
            })
          })
        });

        const config = await manager.getDatabaseConfig();

        expect(config).toEqual({ uri: 'mongodb://dbuser:dbpass@db.example.com:27017/mydb' });
      });

      it('should fallback to environment on Secrets Manager error', async () => {
        process.env.DB_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:db-ABC123';
        process.env.MONGO_URI = 'mongodb://fallback:27017/db';
        
        mockGetSecretValue.mockReturnValue({
          promise: jest.fn().mockRejectedValue(new Error('AccessDeniedException'))
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const config = await manager.getDatabaseConfig();

        expect(config).toEqual({ uri: 'mongodb://fallback:27017/db' });
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to retrieve database credentials from Secrets Manager:',
          expect.any(Error)
        );
        
        consoleSpy.mockRestore();
      });

      it('should fallback to default when Secrets Manager fails and no env var', async () => {
        process.env.DB_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:db-ABC123';
        
        mockGetSecretValue.mockReturnValue({
          promise: jest.fn().mockRejectedValue(new Error('Network error'))
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const config = await manager.getDatabaseConfig();

        expect(config).toEqual({ uri: 'mongodb://localhost:27017/todoapp' });
        consoleSpy.mockRestore();
      });
    });

    describe('getJWTSecret', () => {
      let manager;

      beforeEach(() => {
        manager = new SecretsManager();
      });

      it('should return JWT_SECRET from environment if set', async () => {
        process.env.JWT_SECRET = 'my-jwt-secret-key';
        
        const secret = await manager.getJWTSecret();
        
        expect(secret).toBe('my-jwt-secret-key');
        expect(mockGetSecretValue).not.toHaveBeenCalled();
      });

      it('should throw error when no JWT_SECRET or ARN', async () => {
        await expect(manager.getJWTSecret()).rejects.toThrow(
          'JWT_SECRET is not set and no JWT_SECRET_ARN provided'
        );
        expect(mockGetSecretValue).not.toHaveBeenCalled();
      });

      it('should throw error when ARN is not usable', async () => {
        process.env.JWT_SECRET_ARN = '<your-jwt-secret-arn>';
        
        await expect(manager.getJWTSecret()).rejects.toThrow(
          'JWT_SECRET is not set and no JWT_SECRET_ARN provided'
        );
        expect(mockGetSecretValue).not.toHaveBeenCalled();
      });

      it('should fetch from Secrets Manager with valid ARN', async () => {
        process.env.JWT_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:jwt-ABC123';
        
        mockGetSecretValue.mockReturnValue({
          promise: jest.fn().mockResolvedValue({
            SecretString: 'super-secret-jwt-key'
          })
        });

        const secret = await manager.getJWTSecret();

        expect(secret).toBe('super-secret-jwt-key');
        expect(mockGetSecretValue).toHaveBeenCalledWith({
          SecretId: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:jwt-ABC123'
        });
      });

      it('should fallback to environment on Secrets Manager error when JWT_SECRET exists', async () => {
        process.env.JWT_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:jwt-ABC123';
        process.env.JWT_SECRET = 'fallback-jwt-secret';
        
        mockGetSecretValue.mockReturnValue({
          promise: jest.fn().mockRejectedValue(new Error('AccessDeniedException'))
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const secret = await manager.getJWTSecret();

        expect(secret).toBe('fallback-jwt-secret');
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to retrieve JWT secret from Secrets Manager:',
          expect.any(Error)
        );
        
        consoleSpy.mockRestore();
      });

      it('should throw error when Secrets Manager fails and no env var', async () => {
        process.env.JWT_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:jwt-ABC123';
        
        mockGetSecretValue.mockReturnValue({
          promise: jest.fn().mockRejectedValue(new Error('Network error'))
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        
        await expect(manager.getJWTSecret()).rejects.toThrow(
          'JWT_SECRET is not set and failed to retrieve from Secrets Manager'
        );
        
        consoleSpy.mockRestore();
      });

      it('should handle JSON-formatted secret string', async () => {
        process.env.JWT_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:jwt-ABC123';
        
        mockGetSecretValue.mockReturnValue({
          promise: jest.fn().mockResolvedValue({
            SecretString: 'my-complex-jwt-secret-with-special-chars-!@#$%'
          })
        });

        const secret = await manager.getJWTSecret();

        expect(secret).toBe('my-complex-jwt-secret-with-special-chars-!@#$%');
      });
    });
  });

  describe('Singleton instance', () => {
    it('should export a singleton secretsManager instance', async () => {
      const module = await import('../secrets-manager.js');
      expect(module.secretsManager).toBeDefined();
      expect(module.secretsManager).toBeInstanceOf(SecretsManager);
    });
  });

  describe('Convenience functions', () => {
    beforeEach(() => {
      process.env.MONGO_URI = 'mongodb://test:27017/db';
      process.env.JWT_SECRET = 'test-jwt-secret';
    });

    it('should export getDatabaseConfig convenience function', async () => {
      const config = await getDatabaseConfig();
      expect(config).toEqual({ uri: 'mongodb://test:27017/db' });
    });

    it('should export getJWTSecret convenience function', async () => {
      const secret = await getJWTSecret();
      expect(secret).toBe('test-jwt-secret');
    });

    it('getDatabaseConfig should call singleton instance method', async () => {
      const spy = jest.spyOn(secretsManager, 'getDatabaseConfig');
      await getDatabaseConfig();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('getJWTSecret should call singleton instance method', async () => {
      const spy = jest.spyOn(secretsManager, 'getJWTSecret');
      await getJWTSecret();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('Edge cases and error scenarios', () => {
    let manager;

    beforeEach(() => {
      manager = new SecretsManager();
    });

    it('should handle malformed JSON in secret string for database config', async () => {
      process.env.DB_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:db-ABC123';
      
      mockGetSecretValue.mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          SecretString: 'invalid-json{'
        })
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const config = await manager.getDatabaseConfig();

      expect(config).toEqual({ uri: 'mongodb://localhost:27017/todoapp' });
      consoleSpy.mockRestore();
    });

    it('should handle empty secret string', async () => {
      process.env.DB_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:db-ABC123';
      
      mockGetSecretValue.mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          SecretString: ''
        })
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const config = await manager.getDatabaseConfig();

      expect(config).toEqual({ uri: 'mongodb://localhost:27017/todoapp' });
      consoleSpy.mockRestore();
    });

    it('should handle special characters in database credentials', async () => {
      process.env.DB_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:db-ABC123';
      
      mockGetSecretValue.mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          SecretString: JSON.stringify({
            username: 'user@domain',
            password: 'p@ss:w0rd!',
            host: 'db.example.com',
            database: 'my-db'
          })
        })
      });

      const config = await manager.getDatabaseConfig();

      expect(config).toEqual({ 
        uri: 'mongodb://user@domain:p@ss:w0rd!@db.example.com:27017/my-db' 
      });
    });

    it('should handle AWS throttling errors gracefully', async () => {
      process.env.JWT_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:jwt-ABC123';
      process.env.JWT_SECRET = 'fallback-secret';
      
      const throttlingError = new Error('Rate exceeded');
      throttlingError.code = 'ThrottlingException';
      
      mockGetSecretValue.mockReturnValue({
        promise: jest.fn().mockRejectedValue(throttlingError)
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const secret = await manager.getJWTSecret();

      expect(secret).toBe('fallback-secret');
      consoleSpy.mockRestore();
    });

    it('should handle ResourceNotFoundException', async () => {
      process.env.DB_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:db-ABC123';
      
      const notFoundError = new Error('Secret not found');
      notFoundError.code = 'ResourceNotFoundException';
      
      mockGetSecretValue.mockReturnValue({
        promise: jest.fn().mockRejectedValue(notFoundError)
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const config = await manager.getDatabaseConfig();

      expect(config).toEqual({ uri: 'mongodb://localhost:27017/todoapp' });
      consoleSpy.mockRestore();
    });
  });

  describe('Integration scenarios', () => {
    it('should prefer explicit MONGO_URI over valid ARN', async () => {
      process.env.MONGO_URI = 'mongodb://explicit:27017/db';
      process.env.DB_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:db-ABC123';
      
      mockGetSecretValue.mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          SecretString: JSON.stringify({ uri: 'mongodb://secrets:27017/db' })
        })
      });

      const manager = new SecretsManager();
      const config = await manager.getDatabaseConfig();

      expect(config).toEqual({ uri: 'mongodb://explicit:27017/db' });
      expect(mockGetSecretValue).not.toHaveBeenCalled();
    });

    it('should prefer explicit JWT_SECRET over valid ARN', async () => {
      process.env.JWT_SECRET = 'explicit-jwt';
      process.env.JWT_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123456789012:secret:jwt-ABC123';
      
      mockGetSecretValue.mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          SecretString: 'secrets-jwt'
        })
      });

      const manager = new SecretsManager();
      const secret = await manager.getJWTSecret();

      expect(secret).toBe('explicit-jwt');
      expect(mockGetSecretValue).not.toHaveBeenCalled();
    });
  });
});