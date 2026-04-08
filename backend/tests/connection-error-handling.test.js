/**
 * Unit Tests for Database Connection Error Handling
 * 
 * **Validates: Requirements 12.8**
 * 
 * Tests specific error scenarios for the connectToDatabase function including
 * connection failures, authentication errors, and SSL configuration issues.
 */

// Create a mock for mysql2/promise
const mockCreateConnection = jest.fn();
jest.mock('mysql2/promise', () => ({
  createConnection: mockCreateConnection
}));

describe('Connection Error Handling', () => {
  let originalEnv;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // Save original environment variables
    originalEnv = { ...process.env };
    
    // Suppress console output during tests
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Clear all mocks
    mockCreateConnection.mockClear();
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
    
    // Restore console methods
    if (consoleLogSpy) {
      consoleLogSpy.mockRestore();
    }
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore();
    }
  });

  /**
   * Test: Network connection failure
   * 
   * Simulates a network-level connection failure (e.g., host unreachable)
   * and verifies that the error is properly handled and re-thrown.
   */
  it('should handle network connection failure', async () => {
    // Setup: Set valid environment variables
    process.env.DB_HOST = 'unreachable-host.example.com';
    process.env.DB_PORT = '3306';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpassword';
    process.env.DB_NAME = 'testdb';

    // Mock network connection failure
    const networkError = new Error('connect ETIMEDOUT');
    networkError.code = 'ETIMEDOUT';
    networkError.errno = -4039;
    mockCreateConnection.mockRejectedValue(networkError);

    // Clear module cache and re-import
    delete require.cache[require.resolve('../seed-database')];
    const { connectToDatabase } = require('../seed-database');

    // Execute & Verify: Should throw the network error
    await expect(connectToDatabase()).rejects.toThrow('connect ETIMEDOUT');

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Database connection failed:',
      'connect ETIMEDOUT'
    );

    // Verify connection was attempted
    expect(mockCreateConnection).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Authentication failure
   * 
   * Simulates an authentication error (invalid credentials) and verifies
   * that the error is properly handled and re-thrown.
   */
  it('should handle authentication failure', async () => {
    // Setup: Set environment variables with invalid credentials
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '3306';
    process.env.DB_USER = 'invalid_user';
    process.env.DB_PASSWORD = 'wrong_password';
    process.env.DB_NAME = 'testdb';

    // Mock authentication failure
    const authError = new Error('Access denied for user \'invalid_user\'@\'localhost\'');
    authError.code = 'ER_ACCESS_DENIED_ERROR';
    authError.errno = 1045;
    mockCreateConnection.mockRejectedValue(authError);

    // Clear module cache and re-import
    delete require.cache[require.resolve('../seed-database')];
    const { connectToDatabase } = require('../seed-database');

    // Execute & Verify: Should throw the authentication error
    await expect(connectToDatabase()).rejects.toThrow('Access denied for user');

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Database connection failed:',
      expect.stringContaining('Access denied for user')
    );

    // Verify connection was attempted
    expect(mockCreateConnection).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Database does not exist
   * 
   * Simulates an error where the specified database does not exist
   * and verifies that the error is properly handled and re-thrown.
   */
  it('should handle database not found error', async () => {
    // Setup: Set environment variables with non-existent database
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '3306';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpassword';
    process.env.DB_NAME = 'nonexistent_db';

    // Mock database not found error
    const dbError = new Error('Unknown database \'nonexistent_db\'');
    dbError.code = 'ER_BAD_DB_ERROR';
    dbError.errno = 1049;
    mockCreateConnection.mockRejectedValue(dbError);

    // Clear module cache and re-import
    delete require.cache[require.resolve('../seed-database')];
    const { connectToDatabase } = require('../seed-database');

    // Execute & Verify: Should throw the database error
    await expect(connectToDatabase()).rejects.toThrow('Unknown database');

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Database connection failed:',
      expect.stringContaining('Unknown database')
    );

    // Verify connection was attempted
    expect(mockCreateConnection).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Connection timeout
   * 
   * Simulates a connection timeout scenario and verifies that the error
   * is properly handled and re-thrown.
   */
  it('should handle connection timeout', async () => {
    // Setup: Set valid environment variables
    process.env.DB_HOST = 'slow-host.example.com';
    process.env.DB_PORT = '3306';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpassword';
    process.env.DB_NAME = 'testdb';

    // Mock connection timeout
    const timeoutError = new Error('Connection timeout');
    timeoutError.code = 'PROTOCOL_CONNECTION_LOST';
    mockCreateConnection.mockRejectedValue(timeoutError);

    // Clear module cache and re-import
    delete require.cache[require.resolve('../seed-database')];
    const { connectToDatabase } = require('../seed-database');

    // Execute & Verify: Should throw the timeout error
    await expect(connectToDatabase()).rejects.toThrow('Connection timeout');

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Database connection failed:',
      'Connection timeout'
    );

    // Verify connection was attempted
    expect(mockCreateConnection).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: SSL configuration with successful connection
   * 
   * Verifies that when SSL is enabled, the connection is established
   * with the correct SSL configuration.
   */
  it('should successfully connect with SSL enabled', async () => {
    // Setup: Set environment variables with SSL enabled
    process.env.DB_HOST = 'secure-host.example.com';
    process.env.DB_PORT = '3306';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpassword';
    process.env.DB_NAME = 'testdb';
    process.env.DB_SSL = 'true';

    // Mock successful SSL connection
    const mockConnection = {
      end: jest.fn().mockResolvedValue(undefined)
    };
    mockCreateConnection.mockResolvedValue(mockConnection);

    // Clear module cache and re-import
    delete require.cache[require.resolve('../seed-database')];
    const { connectToDatabase } = require('../seed-database');

    // Execute
    const connection = await connectToDatabase();

    // Verify: Connection was successful
    expect(connection).toBe(mockConnection);

    // Verify: SSL configuration was passed correctly
    const calledConfig = mockCreateConnection.mock.calls[0][0];
    expect(calledConfig.ssl).toBeDefined();
    expect(calledConfig.ssl.rejectUnauthorized).toBe(false);

    // Verify success message was logged
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '✅ Database connection established successfully'
    );
  });

  /**
   * Test: SSL configuration with connection failure
   * 
   * Verifies that SSL-related connection errors are properly handled
   * and re-thrown.
   */
  it('should handle SSL connection failure', async () => {
    // Setup: Set environment variables with SSL enabled
    process.env.DB_HOST = 'secure-host.example.com';
    process.env.DB_PORT = '3306';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpassword';
    process.env.DB_NAME = 'testdb';
    process.env.DB_SSL = 'true';

    // Mock SSL connection failure
    const sslError = new Error('SSL connection error: self signed certificate');
    sslError.code = 'DEPTH_ZERO_SELF_SIGNED_CERT';
    mockCreateConnection.mockRejectedValue(sslError);

    // Clear module cache and re-import
    delete require.cache[require.resolve('../seed-database')];
    const { connectToDatabase } = require('../seed-database');

    // Execute & Verify: Should throw the SSL error
    await expect(connectToDatabase()).rejects.toThrow('SSL connection error');

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Database connection failed:',
      expect.stringContaining('SSL connection error')
    );

    // Verify SSL configuration was passed
    const calledConfig = mockCreateConnection.mock.calls[0][0];
    expect(calledConfig.ssl).toBeDefined();
    expect(calledConfig.ssl.rejectUnauthorized).toBe(false);
  });

  /**
   * Test: Connection with SSL disabled
   * 
   * Verifies that when SSL is disabled, the connection is established
   * without SSL configuration.
   */
  it('should successfully connect with SSL disabled', async () => {
    // Setup: Set environment variables with SSL disabled
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '3306';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpassword';
    process.env.DB_NAME = 'testdb';
    process.env.DB_SSL = 'false';

    // Mock successful connection
    const mockConnection = {
      end: jest.fn().mockResolvedValue(undefined)
    };
    mockCreateConnection.mockResolvedValue(mockConnection);

    // Clear module cache and re-import
    delete require.cache[require.resolve('../seed-database')];
    const { connectToDatabase } = require('../seed-database');

    // Execute
    const connection = await connectToDatabase();

    // Verify: Connection was successful
    expect(connection).toBe(mockConnection);

    // Verify: SSL configuration was NOT included
    const calledConfig = mockCreateConnection.mock.calls[0][0];
    expect(calledConfig.ssl).toBeUndefined();

    // Verify success message was logged
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '✅ Database connection established successfully'
    );
  });

  /**
   * Test: Host unreachable error
   * 
   * Simulates a scenario where the database host is unreachable
   * and verifies proper error handling.
   */
  it('should handle host unreachable error', async () => {
    // Setup: Set environment variables
    process.env.DB_HOST = '192.0.2.1'; // TEST-NET-1 (unreachable)
    process.env.DB_PORT = '3306';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpassword';
    process.env.DB_NAME = 'testdb';

    // Mock host unreachable error
    const hostError = new Error('connect EHOSTUNREACH 192.0.2.1:3306');
    hostError.code = 'EHOSTUNREACH';
    hostError.errno = -4065;
    mockCreateConnection.mockRejectedValue(hostError);

    // Clear module cache and re-import
    delete require.cache[require.resolve('../seed-database')];
    const { connectToDatabase } = require('../seed-database');

    // Execute & Verify: Should throw the host unreachable error
    await expect(connectToDatabase()).rejects.toThrow('EHOSTUNREACH');

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Database connection failed:',
      expect.stringContaining('EHOSTUNREACH')
    );

    // Verify connection was attempted
    expect(mockCreateConnection).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Connection refused error
   * 
   * Simulates a scenario where the connection is refused (e.g., MySQL not running)
   * and verifies proper error handling.
   */
  it('should handle connection refused error', async () => {
    // Setup: Set environment variables
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '3306';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpassword';
    process.env.DB_NAME = 'testdb';

    // Mock connection refused error
    const refusedError = new Error('connect ECONNREFUSED 127.0.0.1:3306');
    refusedError.code = 'ECONNREFUSED';
    refusedError.errno = -4078;
    mockCreateConnection.mockRejectedValue(refusedError);

    // Clear module cache and re-import
    delete require.cache[require.resolve('../seed-database')];
    const { connectToDatabase } = require('../seed-database');

    // Execute & Verify: Should throw the connection refused error
    await expect(connectToDatabase()).rejects.toThrow('ECONNREFUSED');

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Database connection failed:',
      expect.stringContaining('ECONNREFUSED')
    );

    // Verify connection was attempted
    expect(mockCreateConnection).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Too many connections error
   * 
   * Simulates a scenario where the database has reached its connection limit
   * and verifies proper error handling.
   */
  it('should handle too many connections error', async () => {
    // Setup: Set environment variables
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '3306';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpassword';
    process.env.DB_NAME = 'testdb';

    // Mock too many connections error
    const tooManyError = new Error('Too many connections');
    tooManyError.code = 'ER_CON_COUNT_ERROR';
    tooManyError.errno = 1040;
    mockCreateConnection.mockRejectedValue(tooManyError);

    // Clear module cache and re-import
    delete require.cache[require.resolve('../seed-database')];
    const { connectToDatabase } = require('../seed-database');

    // Execute & Verify: Should throw the too many connections error
    await expect(connectToDatabase()).rejects.toThrow('Too many connections');

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Database connection failed:',
      'Too many connections'
    );

    // Verify connection was attempted
    expect(mockCreateConnection).toHaveBeenCalledTimes(1);
  });
});
