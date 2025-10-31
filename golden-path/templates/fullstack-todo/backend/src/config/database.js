const mongoose = require('mongoose');
const AWSXRay = require('aws-xray-sdk-core');
const { getDatabaseConfig } = require('./secrets-manager');

let isConnecting = false;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (isConnecting) return new Promise(resolve => {
    mongoose.connection.once('connected', () => resolve(mongoose.connection));
  });

  let mongoUri;

  try {
    const isDev = (process.env.NODE_ENV || 'development') === 'development';
    const skipSecrets = String(process.env.SKIP_SECRETS_MANAGER || '').toLowerCase() === 'true';

    // In development or when explicitly requested, prefer env and skip Secrets Manager
    if (isDev || skipSecrets) {
      if (process.env.MONGO_URI) {
        mongoUri = process.env.MONGO_URI;
        console.log('Using MONGO_URI from environment (dev/skip mode)');
      } else {
        console.warn('MONGO_URI not set in environment; falling back to localhost for development.');
        mongoUri = 'mongodb://localhost:27017/todoapp';
      }
    } else if (process.env.MONGO_URI) {
      // In production, still allow explicit override via env
      mongoUri = process.env.MONGO_URI;
      console.log('Using MONGO_URI from environment');
    } else {
      // Try to get database config from Secrets Manager first
      const dbConfig = await getDatabaseConfig();
      mongoUri = dbConfig.uri;
      console.log('Retrieved database configuration from AWS Secrets Manager');
    }
  } catch (error) {
    console.warn('Could not retrieve from Secrets Manager, falling back to environment variables:', error.message);
    // Fallback to environment variables
    mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/todoapp';
  }

  isConnecting = true;
  try {
    // Add X-Ray subsegment for MongoDB connection (safe in dev when no context exists)
    let segment = null;
    try {
      segment = AWSXRay.getSegment();
    } catch (_) {
      segment = null;
    }
    if (segment) {
      const subsegment = segment.addNewSubsegment('MongoDB Connection');
      subsegment.addAnnotation('operation', 'connect');
      subsegment.addMetadata('mongodb_uri_host', (() => {
        try {
          const u = new URL(mongoUri.replace('mongodb+srv://','https://').replace('mongodb://','https://'));
          return u.host;
        } catch {
          return 'hidden';
        }
      })());

      try {
        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 15000,
          socketTimeoutMS: 45000,
          retryWrites: true
        });
        subsegment.addAnnotation('success', 'true');
        console.log('Connected to MongoDB');
        console.log(`MongoDB URI host: ${(() => { try { const u = new URL(mongoUri.replace('mongodb+srv://','https://').replace('mongodb://','https://')); return u.host; } catch { return 'hidden'; } })()}`);
        return mongoose.connection;
      } catch (err) {
        subsegment.addAnnotation('success', 'false');
        subsegment.addError(err);
        throw err;
      } finally {
        subsegment.close();
      }
    } else {
      // Fallback if no X-Ray segment is available
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        retryWrites: true
      });
      console.log('Connected to MongoDB');
      return mongoose.connection;
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    const allowStartWithoutDb = String(process.env.START_WITHOUT_DB || '').toLowerCase() === 'true'
      || (process.env.NODE_ENV || 'development') === 'development';
    if (allowStartWithoutDb) {
      // Do not exit the process; allow app to run without DB in dev/when allowed
      return null;
    }
    process.exit(1);
  } finally {
    isConnecting = false;
  }
}

module.exports = {
  connectToDatabase
};
