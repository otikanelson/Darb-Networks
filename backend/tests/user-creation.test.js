/**
 * Property-Based Tests for User Creation
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8**
 * 
 * Tests the user generation and creation functions to ensure they produce
 * valid user data with proper role distribution and data integrity.
 */

const fc = require('fast-check');
const bcrypt = require('bcryptjs');

// Mock mysql2/promise
const mockQuery = jest.fn();
const mockBeginTransaction = jest.fn();
const mockCommit = jest.fn();
const mockRollback = jest.fn();

jest.mock('mysql2/promise', () => ({
  createConnection: jest.fn().mockResolvedValue({
    query: mockQuery,
    beginTransaction: mockBeginTransaction,
    commit: mockCommit,
    rollback: mockRollback,
    end: jest.fn().mockResolvedValue(undefined)
  })
}));

describe('Property 1: User Creation Completeness', () => {
  let consoleLogSpy;

  beforeEach(() => {
    // Suppress console.log during tests
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Clear all mocks
    mockQuery.mockClear();
    mockBeginTransaction.mockClear();
    mockCommit.mockClear();
    mockRollback.mockClear();
    
    // Setup default mock responses
    mockBeginTransaction.mockResolvedValue(undefined);
    mockCommit.mockResolvedValue(undefined);
    mockRollback.mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (consoleLogSpy) {
      consoleLogSpy.mockRestore();
    }
  });

  /**
   * Property Test: User count should be between 5 and 8
   * 
   * For any execution of createUsers, the function SHALL create between 5 and 8 users.
   * **Validates: Requirement 2.1**
   */
  it('should create between 5 and 8 users', async () => {
    // Clear module cache to get fresh import
    delete require.cache[require.resolve('../seed-database')];
    const { createUsers } = require('../seed-database');

    // Setup mock to track insert calls
    let insertCount = 0;
    mockQuery.mockImplementation((sql) => {
      if (sql.includes('INSERT INTO users')) {
        insertCount++;
        return Promise.resolve([{ insertId: insertCount }]);
      }
      return Promise.resolve([]);
    });

    // Create mock connection
    const mockConnection = {
      query: mockQuery,
      beginTransaction: mockBeginTransaction,
      commit: mockCommit,
      rollback: mockRollback
    };

    // Execute: Call createUsers
    const users = await createUsers(mockConnection);

    // Verify: User count should be between 5 and 8
    expect(users.length).toBeGreaterThanOrEqual(5);
    expect(users.length).toBeLessThanOrEqual(8);
  });

  /**
   * Property Test: Role distribution should include at least 1 admin, 2 founders, 2 investors
   * 
   * For any execution of createUsers, the created users SHALL include:
   * - At least 1 user with role 'admin'
   * - At least 2 users with role 'founder'
   * - At least 2 users with role 'investor'
   * **Validates: Requirements 2.2, 2.3, 2.4, 2.5**
   */
  it('should ensure proper role distribution (1 admin, 2+ founders, 2+ investors)', async () => {
    // Clear module cache
    delete require.cache[require.resolve('../seed-database')];
    const { createUsers } = require('../seed-database');

    // Setup mock to capture inserted user data
    const insertedUsers = [];
    mockQuery.mockImplementation((sql, params) => {
      if (sql.includes('INSERT INTO users')) {
        insertedUsers.push({
          userType: params[3], // userType is at index 3
          email: params[0]
        });
        return Promise.resolve([{ insertId: insertedUsers.length }]);
      }
      return Promise.resolve([]);
    });

    // Create mock connection
    const mockConnection = {
      query: mockQuery,
      beginTransaction: mockBeginTransaction,
      commit: mockCommit,
      rollback: mockRollback
    };

    // Execute: Call createUsers once to verify role distribution
    const users = await createUsers(mockConnection);

    // Count roles
    const adminCount = users.filter(u => u.userType === 'admin').length;
    const founderCount = users.filter(u => u.userType === 'founder').length;
    const investorCount = users.filter(u => u.userType === 'investor').length;

    // Verify: At least 1 admin
    expect(adminCount).toBeGreaterThanOrEqual(1);
    
    // Verify: At least 2 founders
    expect(founderCount).toBeGreaterThanOrEqual(2);
    
    // Verify: At least 2 investors
    expect(investorCount).toBeGreaterThanOrEqual(2);
    
    // Verify: All users have valid roles
    const validRoles = ['admin', 'founder', 'investor'];
    users.forEach(user => {
      expect(validRoles).toContain(user.userType);
    });
  }, 10000);

  /**
   * Property Test: All created users should have valid role values
   * 
   * For any user created by createUsers, the user's userType SHALL be one of:
   * 'admin', 'founder', or 'investor'.
   * **Validates: Requirement 2.2**
   */
  it('should assign valid roles to all users', async () => {
    delete require.cache[require.resolve('../seed-database')];
    const { createUsers } = require('../seed-database');

    const createdUsers = [];
    mockQuery.mockImplementation((sql, params) => {
      if (sql.includes('INSERT INTO users')) {
        createdUsers.push({
          userType: params[3],
          email: params[0]
        });
        return Promise.resolve([{ insertId: createdUsers.length }]);
      }
      return Promise.resolve([]);
    });

    const mockConnection = {
      query: mockQuery,
      beginTransaction: mockBeginTransaction,
      commit: mockCommit,
      rollback: mockRollback
    };

    const users = await createUsers(mockConnection);

    // Verify: All users have valid roles
    const validRoles = ['admin', 'founder', 'investor'];
    users.forEach(user => {
      expect(validRoles).toContain(user.userType);
    });
  });
});

describe('Property 2: User Data Validity', () => {
  let consoleLogSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    mockQuery.mockClear();
    mockBeginTransaction.mockClear();
    mockCommit.mockClear();
    mockRollback.mockClear();
    
    mockBeginTransaction.mockResolvedValue(undefined);
    mockCommit.mockResolvedValue(undefined);
    mockRollback.mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (consoleLogSpy) {
      consoleLogSpy.mockRestore();
    }
  });

  /**
   * Property Test: User emails should be in format [name]@example.com
   * 
   * For any user created by createUsers, the email SHALL match the pattern
   * [name]@example.com where [name] is a valid identifier.
   * **Validates: Requirement 2.7**
   */
  it('should generate emails in format [name]@example.com', async () => {
    delete require.cache[require.resolve('../seed-database')];
    const { createUsers } = require('../seed-database');

    const createdUsers = [];
    mockQuery.mockImplementation((sql, params) => {
      if (sql.includes('INSERT INTO users')) {
        createdUsers.push({
          email: params[0],
          password: params[1]
        });
        return Promise.resolve([{ insertId: createdUsers.length }]);
      }
      return Promise.resolve([]);
    });

    const mockConnection = {
      query: mockQuery,
      beginTransaction: mockBeginTransaction,
      commit: mockCommit,
      rollback: mockRollback
    };

    const users = await createUsers(mockConnection);

    // Verify: All emails match the pattern [name]@example.com
    const emailPattern = /^[a-z]+\.[a-z]+\d+@example\.com$/;
    users.forEach(user => {
      expect(user.email).toMatch(emailPattern);
    });
  });

  /**
   * Property Test: User profile image URLs should be assigned
   * 
   * For any execution of createUsers, each created user SHALL have a non-empty
   * profileImageUrl value.
   * **Validates: Requirement 2.6**
   */
  it('should assign profile image URLs to each user', async () => {
    delete require.cache[require.resolve('../seed-database')];
    const { createUsers } = require('../seed-database');

    const createdUsers = [];
    mockQuery.mockImplementation((sql, params) => {
      if (sql.includes('INSERT INTO users')) {
        createdUsers.push({
          profileImageUrl: params[6] // profileImageUrl is at index 6
        });
        return Promise.resolve([{ insertId: createdUsers.length }]);
      }
      return Promise.resolve([]);
    });

    const mockConnection = {
      query: mockQuery,
      beginTransaction: mockBeginTransaction,
      commit: mockCommit,
      rollback: mockRollback
    };

    const users = await createUsers(mockConnection);

    // Verify: All profile image URLs are non-empty
    users.forEach(user => {
      expect(user.profileImageUrl).toBeTruthy();
      expect(user.profileImageUrl).toMatch(/^https:\/\//);
    });
  }, 10000);

  /**
   * Property Test: User passwords should be valid bcrypt hashes
   * 
   * For any user created by createUsers, the password field SHALL be a valid
   * bcrypt hash (not plaintext).
   * **Validates: Requirement 2.8**
   */
  it('should hash passwords with bcrypt', async () => {
    delete require.cache[require.resolve('../seed-database')];
    const { createUsers } = require('../seed-database');

    const insertedPasswords = [];
    mockQuery.mockImplementation((sql, params) => {
      if (sql.includes('INSERT INTO users')) {
        insertedPasswords.push(params[1]); // password is at index 1
        return Promise.resolve([{ insertId: insertedPasswords.length }]);
      }
      return Promise.resolve([]);
    });

    const mockConnection = {
      query: mockQuery,
      beginTransaction: mockBeginTransaction,
      commit: mockCommit,
      rollback: mockRollback
    };

    const users = await createUsers(mockConnection);

    // Verify: All passwords are bcrypt hashes
    // Bcrypt hashes start with $2a$, $2b$, $2x$, or $2y$ and are 60 characters long
    const bcryptPattern = /^\$2[aby]\$\d{2}\$.{53}$/;
    insertedPasswords.forEach(password => {
      expect(password).toMatch(bcryptPattern);
    });
  }, 10000);

  /**
   * Property Test: User data should include required fields
   * 
   * For any user created by createUsers, the user record SHALL include:
   * - Non-empty email
   * - Non-empty fullName
   * - Valid userType
   * - Non-empty profileImageUrl
   * - Non-empty bio (100-300 characters)
   * - isActive = true
   * - isVerified = true
   */
  it('should include all required user fields with valid values', async () => {
    delete require.cache[require.resolve('../seed-database')];
    const { createUsers } = require('../seed-database');

    const createdUsers = [];
    mockQuery.mockImplementation((sql, params) => {
      if (sql.includes('INSERT INTO users')) {
        createdUsers.push({
          email: params[0],
          password: params[1],
          fullName: params[2],
          userType: params[3],
          profileImageUrl: params[6],
          bio: params[7],
          isActive: params[8],
          isVerified: params[9]
        });
        return Promise.resolve([{ insertId: createdUsers.length }]);
      }
      return Promise.resolve([]);
    });

    const mockConnection = {
      query: mockQuery,
      beginTransaction: mockBeginTransaction,
      commit: mockCommit,
      rollback: mockRollback
    };

    const users = await createUsers(mockConnection);

    // Verify: All required fields are present and valid
    users.forEach((user, index) => {
      expect(user.email).toBeTruthy();
      expect(user.fullName).toBeTruthy();
      expect(['admin', 'founder', 'investor']).toContain(user.userType);
      expect(user.profileImageUrl).toBeTruthy();
      expect(user.bio).toBeTruthy();
      expect(user.bio.length).toBeGreaterThanOrEqual(100);
      expect(user.bio.length).toBeLessThanOrEqual(300);
    });
  });

  /**
   * Property Test: Transaction should be used for user creation
   * 
   * For any execution of createUsers, the function SHALL:
   * - Call beginTransaction before inserting users
   * - Call commit after all users are inserted
   * - Call rollback if an error occurs
   */
  it('should use transactions for user creation', async () => {
    delete require.cache[require.resolve('../seed-database')];
    const { createUsers } = require('../seed-database');

    mockQuery.mockImplementation((sql) => {
      if (sql.includes('INSERT INTO users')) {
        return Promise.resolve([{ insertId: 1 }]);
      }
      return Promise.resolve([]);
    });

    const mockConnection = {
      query: mockQuery,
      beginTransaction: mockBeginTransaction,
      commit: mockCommit,
      rollback: mockRollback
    };

    await createUsers(mockConnection);

    // Verify: Transaction methods were called
    expect(mockBeginTransaction).toHaveBeenCalled();
    expect(mockCommit).toHaveBeenCalled();
    expect(mockRollback).not.toHaveBeenCalled();
  });

  /**
   * Property Test: Transaction should rollback on error
   * 
   * For any error during user creation, the function SHALL rollback the transaction.
   */
  it('should rollback transaction on error', async () => {
    delete require.cache[require.resolve('../seed-database')];
    const { createUsers } = require('../seed-database');

    // Mock query to throw error
    mockQuery.mockRejectedValue(new Error('Database error'));

    const mockConnection = {
      query: mockQuery,
      beginTransaction: mockBeginTransaction,
      commit: mockCommit,
      rollback: mockRollback
    };

    // Execute and expect error
    await expect(createUsers(mockConnection)).rejects.toThrow('Database error');

    // Verify: Rollback was called
    expect(mockRollback).toHaveBeenCalled();
    expect(mockCommit).not.toHaveBeenCalled();
  });
});
