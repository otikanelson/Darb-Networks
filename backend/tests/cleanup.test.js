/**
 * Unit Tests for Cleanup Module
 * Tests the cleanupExistingData function for cascade deletion behavior and statistics tracking
 */

const { cleanupExistingData } = require('../seed-database');

describe('Cleanup Module - cleanupExistingData', () => {
  let mockConnection;

  beforeEach(() => {
    // Create a mock connection object
    mockConnection = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      query: jest.fn(),
    };
  });

  test('should return CleanupStats object with correct structure', async () => {
    // Mock query responses
    mockConnection.query
      .mockResolvedValueOnce([[{ count: 5 }]]) // campaigns count
      .mockResolvedValueOnce([[{ count: 10 }]]) // images count
      .mockResolvedValueOnce([[{ count: 8 }]]) // milestones count
      .mockResolvedValueOnce([[{ count: 12 }]]) // collaborators count
      .mockResolvedValueOnce([[{ count: 15 }]]) // investments count
      .mockResolvedValueOnce(undefined); // DELETE campaigns

    // Execute cleanup
    const cleanupStats = await cleanupExistingData(mockConnection);

    // Verify CleanupStats structure
    expect(cleanupStats).toHaveProperty('campaignsDeleted');
    expect(cleanupStats).toHaveProperty('imagesDeleted');
    expect(cleanupStats).toHaveProperty('milestonesDeleted');
    expect(cleanupStats).toHaveProperty('collaboratorsDeleted');
    expect(cleanupStats).toHaveProperty('investmentsDeleted');

    // Verify all properties are numbers
    expect(typeof cleanupStats.campaignsDeleted).toBe('number');
    expect(typeof cleanupStats.imagesDeleted).toBe('number');
    expect(typeof cleanupStats.milestonesDeleted).toBe('number');
    expect(typeof cleanupStats.collaboratorsDeleted).toBe('number');
    expect(typeof cleanupStats.investmentsDeleted).toBe('number');
  });

  test('should return correct cleanup stats with accurate counts', async () => {
    // Mock query responses
    mockConnection.query
      .mockResolvedValueOnce([[{ count: 2 }]]) // campaigns count
      .mockResolvedValueOnce([[{ count: 2 }]]) // images count
      .mockResolvedValueOnce([[{ count: 2 }]]) // milestones count
      .mockResolvedValueOnce([[{ count: 2 }]]) // collaborators count
      .mockResolvedValueOnce([[{ count: 2 }]]) // investments count
      .mockResolvedValueOnce(undefined); // DELETE campaigns

    // Execute cleanup
    const cleanupStats = await cleanupExistingData(mockConnection);

    // Verify cleanup stats
    expect(cleanupStats.campaignsDeleted).toBe(2);
    expect(cleanupStats.imagesDeleted).toBe(2);
    expect(cleanupStats.milestonesDeleted).toBe(2);
    expect(cleanupStats.collaboratorsDeleted).toBe(2);
    expect(cleanupStats.investmentsDeleted).toBe(2);
  });

  test('should handle cleanup when no data exists', async () => {
    // Mock query responses for zero counts
    mockConnection.query
      .mockResolvedValueOnce([[{ count: 0 }]]) // campaigns count
      .mockResolvedValueOnce([[{ count: 0 }]]) // images count
      .mockResolvedValueOnce([[{ count: 0 }]]) // milestones count
      .mockResolvedValueOnce([[{ count: 0 }]]) // collaborators count
      .mockResolvedValueOnce([[{ count: 0 }]]) // investments count
      .mockResolvedValueOnce(undefined); // DELETE campaigns

    // Execute cleanup
    const cleanupStats = await cleanupExistingData(mockConnection);

    // Verify cleanup stats show 0 deleted
    expect(cleanupStats.campaignsDeleted).toBe(0);
    expect(cleanupStats.imagesDeleted).toBe(0);
    expect(cleanupStats.milestonesDeleted).toBe(0);
    expect(cleanupStats.collaboratorsDeleted).toBe(0);
    expect(cleanupStats.investmentsDeleted).toBe(0);
  });

  test('should start and commit transaction', async () => {
    // Mock query responses
    mockConnection.query
      .mockResolvedValueOnce([[{ count: 1 }]]) // campaigns count
      .mockResolvedValueOnce([[{ count: 1 }]]) // images count
      .mockResolvedValueOnce([[{ count: 1 }]]) // milestones count
      .mockResolvedValueOnce([[{ count: 1 }]]) // collaborators count
      .mockResolvedValueOnce([[{ count: 1 }]]) // investments count
      .mockResolvedValueOnce(undefined); // DELETE campaigns

    // Execute cleanup
    await cleanupExistingData(mockConnection);

    // Verify transaction was started and committed
    expect(mockConnection.beginTransaction).toHaveBeenCalled();
    expect(mockConnection.commit).toHaveBeenCalled();
    expect(mockConnection.rollback).not.toHaveBeenCalled();
  });

  test('should rollback transaction on error', async () => {
    // Mock query to throw error
    mockConnection.query
      .mockResolvedValueOnce([[{ count: 1 }]]) // campaigns count
      .mockResolvedValueOnce([[{ count: 1 }]]) // images count
      .mockResolvedValueOnce([[{ count: 1 }]]) // milestones count
      .mockResolvedValueOnce([[{ count: 1 }]]) // collaborators count
      .mockResolvedValueOnce([[{ count: 1 }]]) // investments count
      .mockRejectedValueOnce(new Error('Database error')); // DELETE campaigns fails

    // Execute cleanup and expect error
    await expect(cleanupExistingData(mockConnection)).rejects.toThrow('Database error');

    // Verify rollback was called
    expect(mockConnection.rollback).toHaveBeenCalled();
  });

  test('should execute DELETE query for campaigns', async () => {
    // Mock query responses
    mockConnection.query
      .mockResolvedValueOnce([[{ count: 3 }]]) // campaigns count
      .mockResolvedValueOnce([[{ count: 5 }]]) // images count
      .mockResolvedValueOnce([[{ count: 4 }]]) // milestones count
      .mockResolvedValueOnce([[{ count: 6 }]]) // collaborators count
      .mockResolvedValueOnce([[{ count: 7 }]]) // investments count
      .mockResolvedValueOnce(undefined); // DELETE campaigns

    // Execute cleanup
    await cleanupExistingData(mockConnection);

    // Verify DELETE query was executed
    expect(mockConnection.query).toHaveBeenCalledWith('DELETE FROM campaigns');
  });

  test('should query all related tables before deletion', async () => {
    // Mock query responses
    mockConnection.query
      .mockResolvedValueOnce([[{ count: 1 }]]) // campaigns count
      .mockResolvedValueOnce([[{ count: 2 }]]) // images count
      .mockResolvedValueOnce([[{ count: 3 }]]) // milestones count
      .mockResolvedValueOnce([[{ count: 4 }]]) // collaborators count
      .mockResolvedValueOnce([[{ count: 5 }]]) // investments count
      .mockResolvedValueOnce(undefined); // DELETE campaigns

    // Execute cleanup
    await cleanupExistingData(mockConnection);

    // Verify all count queries were executed
    expect(mockConnection.query).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM campaigns');
    expect(mockConnection.query).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM campaign_images');
    expect(mockConnection.query).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM campaign_milestones');
    expect(mockConnection.query).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM campaign_collaborators');
    expect(mockConnection.query).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM investments');
  });

  test('should return stats with large numbers', async () => {
    // Mock query responses with large numbers
    mockConnection.query
      .mockResolvedValueOnce([[{ count: 1000 }]]) // campaigns count
      .mockResolvedValueOnce([[{ count: 5000 }]]) // images count
      .mockResolvedValueOnce([[{ count: 4000 }]]) // milestones count
      .mockResolvedValueOnce([[{ count: 6000 }]]) // collaborators count
      .mockResolvedValueOnce([[{ count: 7000 }]]) // investments count
      .mockResolvedValueOnce(undefined); // DELETE campaigns

    // Execute cleanup
    const cleanupStats = await cleanupExistingData(mockConnection);

    // Verify large numbers are handled correctly
    expect(cleanupStats.campaignsDeleted).toBe(1000);
    expect(cleanupStats.imagesDeleted).toBe(5000);
    expect(cleanupStats.milestonesDeleted).toBe(4000);
    expect(cleanupStats.collaboratorsDeleted).toBe(6000);
    expect(cleanupStats.investmentsDeleted).toBe(7000);
  });
});
