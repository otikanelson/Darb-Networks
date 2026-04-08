/**
 * Property-Based Tests for Database Connection Configuration
 * 
 * **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7**
 * 
 * Tests the connectToDatabase function to ensure it correctly reads and uses
 * environment variables for database connection configuration.
 */

const fc = require('fast-check');

// Create a mock for mysql2/promise
const mockCreateConnection = jest.fn();
jest.mock('mysql2/promise', () => ({
  createConnection: mockCreateConnection
}));

describe('Property: Connection Configuration Validity', () => {
  let originalEnv;
  let consoleLogSpy;

  beforeEach(() => {
    // Save original environment variables
    originalEnv = { ...process.env };
    
    // Suppress console.log during tests
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Clear all mocks
    mockCreateConnection.mockClear();
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
    
    // Restore console.log
    if (consoleLogSpy) {
      consoleLogSpy.mockRestore();
    }
  });

  /**
   * Property Test: Database connection configuration should correctly use all environment variables
   * 
   * For any valid set of database configuration parameters (host, port, user, password, database, ssl),
   * the connectToDatabase function SHALL:
   * 1. Read the correct environment variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL)
   * 2. Use DB_PORT with default value 3306 when not provided
   * 3. Pass the correct configuration to mysql.createConnection
   * 4. Include SSL configuration with rejectUnauthorized: false when DB_SSL is 'true'
   * 5. Exclude SSL configuration when DB_SSL is not 'true'
   */
  it('should correctly read and use all environment variables for database connection', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary database configuration values
        fc.record({
          host: fc.oneof(
            fc.domain(),
            fc.ipV4(),
            fc.constant('localhost')
          ),
          port: fc.option(
            fc.integer({ min: 1024, max: 65535 }),
            { nil: undefined }
          ),
          user: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/),
          password: fc.string({ minLength: 8, maxLength: 32 }),
          database: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{2,31}$/),
          ssl: fc.boolean()
        }),
        async (config) => {
          // Clear mock from previous iteration
          mockCreateConnection.mockClear();
          
          // Setup: Set environment variables
          process.env.DB_HOST = config.host;
          if (config.port !== undefined) {
            process.env.DB_PORT = String(config.port);
          } else {
            delete process.env.DB_PORT;
          }
          process.env.DB_USER = config.user;
          process.env.DB_PASSWORD = config.password;
          process.env.DB_NAME = config.database;
          process.env.DB_SSL = config.ssl ? 'true' : 'false';

          // Mock successful connection
          const mockConnection = {
            end: jest.fn().mockResolvedValue(undefined)
          };
          mockCreateConnection.mockResolvedValue(mockConnection);

          // Clear module cache and re-import to pick up new env vars
          delete require.cache[require.resolve('../seed-database')];
          const { connectToDatabase } = require('../seed-database');

          // Execute: Call connectToDatabase
          const connection = await connectToDatabase();

          // Verify: Check that mysql.createConnection was called with correct config
          expect(mockCreateConnection).toHaveBeenCalledTimes(1);
          
          const calledConfig = mockCreateConnection.mock.calls[0][0];
          
          // Validate: Requirements 12.2 - DB_HOST
          expect(calledConfig.host).toBe(config.host);
          
          // Validate: Requirements 12.3 - DB_PORT with default 3306
          const expectedPort = config.port !== undefined ? config.port : 3306;
          expect(calledConfig.port).toBe(expectedPort);
          
          // Validate: Requirements 12.4 - DB_USER
          expect(calledConfig.user).toBe(config.user);
          
          // Validate: Requirements 12.5 - DB_PASSWORD
          expect(calledConfig.password).toBe(config.password);
          
          // Validate: Requirements 12.6 - DB_NAME
          expect(calledConfig.database).toBe(config.database);
          
          // Validate: Requirements 12.7 - DB_SSL configuration
          if (config.ssl) {
            expect(calledConfig.ssl).toBeDefined();
            expect(calledConfig.ssl.rejectUnauthorized).toBe(false);
          } else {
            expect(calledConfig.ssl).toBeUndefined();
          }

          // Verify connection was returned
          expect(connection).toBe(mockConnection);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Missing required environment variables should throw an error
   * 
   * For any configuration where one or more required environment variables
   * (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) are missing, the connectToDatabase
   * function SHALL throw an error indicating missing required variables.
   */
  it('should throw error when required environment variables are missing', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a configuration with at least one missing required field
        fc.record({
          host: fc.option(fc.domain(), { nil: undefined }),
          user: fc.option(fc.string({ minLength: 3, maxLength: 16 }), { nil: undefined }),
          password: fc.option(fc.string({ minLength: 8, maxLength: 32 }), { nil: undefined }),
          database: fc.option(fc.string({ minLength: 3, maxLength: 32 }), { nil: undefined })
        }).filter(config => 
          // Ensure at least one required field is missing
          !config.host || !config.user || !config.password || !config.database
        ),
        async (config) => {
          // Clear mock from previous iteration
          mockCreateConnection.mockClear();
          
          // Setup: Set environment variables (some may be undefined)
          if (config.host) {
            process.env.DB_HOST = config.host;
          } else {
            delete process.env.DB_HOST;
          }
          if (config.user) {
            process.env.DB_USER = config.user;
          } else {
            delete process.env.DB_USER;
          }
          if (config.password) {
            process.env.DB_PASSWORD = config.password;
          } else {
            delete process.env.DB_PASSWORD;
          }
          if (config.database) {
            process.env.DB_NAME = config.database;
          } else {
            delete process.env.DB_NAME;
          }

          // Clear module cache and re-import
          delete require.cache[require.resolve('../seed-database')];
          const { connectToDatabase } = require('../seed-database');

          // Execute & Verify: Should throw an error
          await expect(connectToDatabase()).rejects.toThrow(
            'Missing required database environment variables'
          );

          // Verify mysql.createConnection was never called
          expect(mockCreateConnection).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: DB_PORT should default to 3306 when not provided or empty
   * 
   * For any valid configuration where DB_PORT is not set or is an empty string,
   * the connectToDatabase function SHALL use port 3306 as the default value.
   */
  it('should use default port 3306 when DB_PORT is not provided', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          host: fc.domain(),
          user: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/),
          password: fc.string({ minLength: 8, maxLength: 32 }),
          database: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{2,31}$/),
          portValue: fc.constantFrom(undefined, '', null)
        }),
        async (config) => {
          // Clear mock from previous iteration
          mockCreateConnection.mockClear();
          
          // Setup: Set environment variables without DB_PORT
          process.env.DB_HOST = config.host;
          if (config.portValue) {
            process.env.DB_PORT = config.portValue;
          } else {
            delete process.env.DB_PORT;
          }
          process.env.DB_USER = config.user;
          process.env.DB_PASSWORD = config.password;
          process.env.DB_NAME = config.database;

          // Mock successful connection
          const mockConnection = {
            end: jest.fn().mockResolvedValue(undefined)
          };
          mockCreateConnection.mockResolvedValue(mockConnection);

          // Clear module cache and re-import
          delete require.cache[require.resolve('../seed-database')];
          const { connectToDatabase } = require('../seed-database');

          // Execute
          await connectToDatabase();

          // Verify: Port should default to 3306
          const calledConfig = mockCreateConnection.mock.calls[0][0];
          expect(calledConfig.port).toBe(3306);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: SSL configuration should only be included when DB_SSL is 'true'
   * 
   * For any valid configuration, the SSL configuration SHALL be included in the
   * connection config only when DB_SSL environment variable is exactly 'true',
   * and SHALL have rejectUnauthorized set to false.
   */
  it('should only include SSL config when DB_SSL is exactly "true"', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          host: fc.domain(),
          user: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/),
          password: fc.string({ minLength: 8, maxLength: 32 }),
          database: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{2,31}$/),
          sslValue: fc.oneof(
            fc.constant('true'),
            fc.constant('false'),
            fc.constant('TRUE'),
            fc.constant('1'),
            fc.constant('yes'),
            fc.constant(undefined),
            fc.constant('')
          )
        }),
        async (config) => {
          // Clear mock from previous iteration
          mockCreateConnection.mockClear();
          
          // Setup: Set environment variables
          process.env.DB_HOST = config.host;
          process.env.DB_USER = config.user;
          process.env.DB_PASSWORD = config.password;
          process.env.DB_NAME = config.database;
          if (config.sslValue) {
            process.env.DB_SSL = config.sslValue;
          } else {
            delete process.env.DB_SSL;
          }

          // Mock successful connection
          const mockConnection = {
            end: jest.fn().mockResolvedValue(undefined)
          };
          mockCreateConnection.mockResolvedValue(mockConnection);

          // Clear module cache and re-import
          delete require.cache[require.resolve('../seed-database')];
          const { connectToDatabase } = require('../seed-database');

          // Execute
          await connectToDatabase();

          // Verify: SSL config should only be present when DB_SSL is exactly 'true'
          const calledConfig = mockCreateConnection.mock.calls[0][0];
          
          if (config.sslValue === 'true') {
            expect(calledConfig.ssl).toBeDefined();
            expect(calledConfig.ssl.rejectUnauthorized).toBe(false);
          } else {
            expect(calledConfig.ssl).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Connection errors should be properly handled and re-thrown
   * 
   * For any valid configuration where the database connection fails,
   * the connectToDatabase function SHALL log the error and re-throw it.
   */
  it('should handle and re-throw connection errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          host: fc.domain(),
          user: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{2,15}$/),
          password: fc.string({ minLength: 8, maxLength: 32 }),
          database: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9_]{2,31}$/),
          errorMessage: fc.string({ minLength: 10, maxLength: 50 })
        }),
        async (config) => {
          // Clear mock from previous iteration
          mockCreateConnection.mockClear();
          
          // Setup: Set environment variables
          process.env.DB_HOST = config.host;
          process.env.DB_USER = config.user;
          process.env.DB_PASSWORD = config.password;
          process.env.DB_NAME = config.database;

          // Mock connection failure
          const connectionError = new Error(config.errorMessage);
          mockCreateConnection.mockRejectedValue(connectionError);

          // Spy on console.error
          const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

          // Clear module cache and re-import
          delete require.cache[require.resolve('../seed-database')];
          const { connectToDatabase } = require('../seed-database');

          // Execute & Verify: Should throw the error
          await expect(connectToDatabase()).rejects.toThrow(config.errorMessage);

          // Verify error was logged
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            '❌ Database connection failed:',
            config.errorMessage
          );

          // Cleanup
          consoleErrorSpy.mockRestore();
        }
      ),
      { numRuns: 100 }
    );
  });
});
