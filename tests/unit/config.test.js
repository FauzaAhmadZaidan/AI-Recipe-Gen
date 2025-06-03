const path = require('path');
const fs = require('fs');

// Mock dotenv config
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('Config Module', () => {
  // Save the original process.env
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear the module cache to ensure fresh imports
    jest.resetModules();
    // Reset process.env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore process.env
    process.env = originalEnv;
  });

  test('should export HF_API_TOKEN from environment', () => {
    // Set up the environment variable
    process.env.HF_API_TOKEN = 'test-token';

    // Import the module
    const config = require('../../src/config');

    // Check if the token is correctly exported
    expect(config.hfApiToken).toBe('test-token');
  });

  test('should return undefined if HF_API_TOKEN is not set', () => {
    // Ensure the environment variable is not set
    delete process.env.HF_API_TOKEN;

    // Import the module
    const config = require('../../src/config');

    // Check if the token is undefined
    expect(config.hfApiToken).toBeUndefined();
  });

  test('should have a .env file in the project root', () => {
    const envPath = path.join(__dirname, '../../.env');
    const exists = fs.existsSync(envPath);
    expect(exists).toBe(true);
  });
});
