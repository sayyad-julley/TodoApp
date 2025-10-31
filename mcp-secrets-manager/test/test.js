#!/usr/bin/env node

import { SecretsManagerMCPServer } from '../src/mcp-server.js';
import { validateSecretName, validateSecretValue, validateRegion } from '../src/utils/error-handler.js';

/**
 * Simple test suite for the MCP Secrets Manager
 */
class TestRunner {
  constructor() {
    this.server = new SecretsManagerMCPServer();
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 Running MCP Secrets Manager Tests\n');

    for (const { name, testFn } of this.tests) {
      try {
        await testFn();
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);

    if (this.failed > 0) {
      process.exit(1);
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  assertThrows(fn, expectedMessage) {
    try {
      fn();
      throw new Error('Expected function to throw');
    } catch (error) {
      if (expectedMessage && !error.message.includes(expectedMessage)) {
        throw new Error(`Expected error message to contain "${expectedMessage}", got "${error.message}"`);
      }
    }
  }
}

// Validation tests
const testRunner = new TestRunner();

testRunner.test('Validate secret name - valid names', () => {
  const validNames = [
    'my-secret',
    'my/secret',
    'my_secret',
    'my.secret',
    'my-secret-123',
    'MySecret-ABC',
    'path/to/secret',
    'app/database/credentials'
  ];

  validNames.forEach(name => {
    const result = validateSecretName(name);
    testRunner.assert(result.isValid, `Valid name "${name}" should pass validation`);
  });
});

testRunner.test('Validate secret name - invalid names', () => {
  const invalidNames = [
    'aws/reserved',
    'ends-with-slash/',
    '',
    'a'.repeat(513), // Too long
    'invalid-char!',
    'invalid-char@#',
    'invalid space'
  ];

  invalidNames.forEach(name => {
    const result = validateSecretName(name);
    testRunner.assert(!result.isValid, `Invalid name "${name}" should fail validation`);
    testRunner.assert(result.errors.length > 0, `Should have error messages for "${name}"`);
  });
});

testRunner.test('Validate secret value - valid values', () => {
  const validValues = [
    'simple-secret',
    '{"key": "value"}',
    'multi-line\nsecret',
    '12345',
    ''
  ];

  validValues.forEach(value => {
    const result = validateSecretValue(value);
    // Empty string is valid for validation (but might be invalid in practice)
    testRunner.assert(result.isValid, `Valid value should pass validation`);
  });
});

testRunner.test('Validate secret value - invalid values', () => {
  const tooLong = 'a'.repeat(10241); // Over 10KB
  const invalidJson = '{invalid json}';

  const result1 = validateSecretValue(tooLong);
  testRunner.assert(!result1.isValid, 'Too long value should fail validation');

  const result2 = validateSecretValue(invalidJson);
  testRunner.assert(!result2.isValid, 'Invalid JSON should fail validation');
});

testRunner.test('Validate region - valid regions', () => {
  const validRegions = [
    'us-east-1',
    'us-west-2',
    'eu-west-1',
    'ap-southeast-1'
  ];

  validRegions.forEach(region => {
    const result = validateRegion(region);
    testRunner.assert(result.isValid, `Valid region "${region}" should pass validation`);
  });
});

testRunner.test('Validate region - invalid regions', () => {
  const invalidRegions = [
    'invalid-region',
    'us-east',
    '',
    null,
    undefined
  ];

  invalidRegions.forEach(region => {
    const result = validateRegion(region);
    testRunner.assert(!result.isValid, `Invalid region "${region}" should fail validation`);
  });
});

testRunner.test('AWS Config initialization - no credentials', async () => {
  const result = await testRunner.server.initializeAWS({
    region: 'us-east-1'
  });

  testRunner.assert(!result.success, 'Should fail without valid credentials');
});

testRunner.test('AWS Config initialization - invalid region', async () => {
  const result = await testRunner.server.initializeAWS({
    region: 'invalid-region',
    accessKeyId: 'test',
    secretAccessKey: 'test'
  });

  testRunner.assert(!result.success, 'Should fail with invalid region');
});

testRunner.test('AWS Config initialization - valid config structure', () => {
  const config = testRunner.server.awsConfig;
  testRunner.assert(config !== null, 'AWS config should be initialized');
});

testRunner.test('Secrets operations initialization', () => {
  testRunner.assert(testRunner.server.secretsOps === null, 'Secrets operations should not be initialized without AWS config');
});

// Run tests
testRunner.run().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});