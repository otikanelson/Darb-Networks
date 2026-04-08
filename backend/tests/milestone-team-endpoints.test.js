/**
 * Test suite for milestone and team API endpoints
 * Tests requirements 2.10, 2.11, 2.12, 3.14, 3.15, 3.16
 */

const request = require('supertest');
const app = require('../server');

describe('Campaign Milestone and Team Endpoints', () => {
  const testCampaignId = 60; // Using a campaign that has milestones and team data

  describe('GET /api/campaigns/:id/milestones', () => {
    it('should return milestones for a campaign', async () => {
      const response = await request(app)
        .get(`/api/campaigns/${testCampaignId}/milestones`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      // Verify milestone structure
      if (response.body.data.length > 0) {
        const milestone = response.body.data[0];
        expect(milestone).toHaveProperty('id');
        expect(milestone).toHaveProperty('title');
        expect(milestone).toHaveProperty('description');
        expect(milestone).toHaveProperty('targetAmount');
        expect(milestone).toHaveProperty('orderIndex');
      }
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .get('/api/campaigns/99999/milestones')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Campaign not found');
    });

    it('should return empty array for campaign with no milestones', async () => {
      // Assuming campaign 1 might not have milestones
      const response = await request(app)
        .get('/api/campaigns/1/milestones')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/campaigns/:id/team', () => {
    it('should return team members for a campaign', async () => {
      const response = await request(app)
        .get(`/api/campaigns/${testCampaignId}/team`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      // Verify team member structure
      if (response.body.data.length > 0) {
        const member = response.body.data[0];
        expect(member).toHaveProperty('id');
        expect(member).toHaveProperty('name');
        expect(member).toHaveProperty('role');
        expect(member).toHaveProperty('description');
        expect(member).toHaveProperty('orderIndex');
      }
    });

    it('should return 404 for non-existent campaign', async () => {
      const response = await request(app)
        .get('/api/campaigns/99999/team')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Campaign not found');
    });

    it('should return empty array for campaign with no team members', async () => {
      // Assuming campaign 1 might not have team members
      const response = await request(app)
        .get('/api/campaigns/1/team')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/campaigns/:id - Main campaign endpoint', () => {
    it('should include milestones and collaborators in campaign response', async () => {
      const response = await request(app)
        .get(`/api/campaigns/${testCampaignId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('milestones');
      expect(response.body.data).toHaveProperty('collaborators');
      expect(response.body.data.milestones).toBeInstanceOf(Array);
      expect(response.body.data.collaborators).toBeInstanceOf(Array);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully for milestones', async () => {
      // Test with invalid campaign ID format (if applicable)
      const response = await request(app)
        .get('/api/campaigns/invalid/milestones');

      // Should either return 404 or 500 with proper error message
      expect([404, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should handle database errors gracefully for team', async () => {
      // Test with invalid campaign ID format (if applicable)
      const response = await request(app)
        .get('/api/campaigns/invalid/team');

      // Should either return 404 or 500 with proper error message
      expect([404, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Data formatting', () => {
    it('should return properly formatted milestone data', async () => {
      const response = await request(app)
        .get(`/api/campaigns/${testCampaignId}/milestones`)
        .expect(200);

      if (response.body.data.length > 0) {
        const milestone = response.body.data[0];
        
        // Check camelCase formatting
        expect(milestone).toHaveProperty('targetAmount');
        expect(milestone).toHaveProperty('currentAmount');
        expect(milestone).toHaveProperty('imageUrl');
        expect(milestone).toHaveProperty('videoUrl');
        expect(milestone).toHaveProperty('orderIndex');
        
        // Verify no snake_case properties
        expect(milestone).not.toHaveProperty('target_amount');
        expect(milestone).not.toHaveProperty('image_url');
      }
    });

    it('should return properly formatted team member data', async () => {
      const response = await request(app)
        .get(`/api/campaigns/${testCampaignId}/team`)
        .expect(200);

      if (response.body.data.length > 0) {
        const member = response.body.data[0];
        
        // Check camelCase formatting
        expect(member).toHaveProperty('profileImageUrl');
        expect(member).toHaveProperty('linkedinUrl');
        expect(member).toHaveProperty('orderIndex');
        
        // Verify no snake_case properties
        expect(member).not.toHaveProperty('profile_image_url');
        expect(member).not.toHaveProperty('linkedin_url');
      }
    });
  });
});
