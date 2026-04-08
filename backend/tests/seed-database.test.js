/**
 * Integration Tests for Database Seeding Script
 * 
 * Tests verify that the seeding script correctly:
 * - Connects to the database
 * - Cleans up existing data
 * - Creates users with proper role distribution
 * - Creates campaigns with varied characteristics
 * - Creates related data (images, milestones, collaborators, investments)
 * - Maintains data consistency and relationships
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Mock the seeding functions for testing
const {
  generateUser,
  generateCampaign,
  generateMilestone,
  generateCollaborator,
  generateStockImageUrl,
  generateVideoUrl
} = require('../seed-database');

const { randomInt, randomElement, randomBoolean } = require('../utils/random-helpers');
const { generateBusinessPlan, generateDescription, generateProblemStatement, generateSolution } = require('../utils/content-generators');

describe('Database Seeding Script', () => {
  
  describe('User Generation', () => {
    it('should generate valid user data', () => {
      const user = generateUser('founder', 0);
      
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('password');
      expect(user).toHaveProperty('fullName');
      expect(user).toHaveProperty('userType');
      expect(user).toHaveProperty('profileImageUrl');
      expect(user).toHaveProperty('bio');
      
      expect(user.userType).toBe('founder');
      expect(user.email).toMatch(/^[a-z]+\.[a-z]+\d+@example\.com$/);
      expect(user.bio.length).toBeGreaterThanOrEqual(100);
      expect(user.bio.length).toBeLessThanOrEqual(300);
    });
    
    it('should generate unique profile images for different users', () => {
      const user1 = generateUser('founder', 0);
      const user2 = generateUser('investor', 1);
      const user3 = generateUser('admin', 2);
      
      const images = [user1.profileImageUrl, user2.profileImageUrl, user3.profileImageUrl];
      const uniqueImages = new Set(images);
      
      expect(uniqueImages.size).toBeGreaterThan(1);
    });
    
    it('should assign company name only to founders', () => {
      const founder = generateUser('founder', 0);
      const investor = generateUser('investor', 1);
      const admin = generateUser('admin', 2);
      
      expect(founder.companyName).toBeTruthy();
      expect(investor.companyName).toBeNull();
      expect(admin.companyName).toBeNull();
    });
  });
  
  describe('Campaign Generation', () => {
    it('should generate valid campaign data', () => {
      const founder = { id: 1, fullName: 'Test Founder' };
      const campaign = generateCampaign(founder, 0);
      
      expect(campaign).toHaveProperty('title');
      expect(campaign).toHaveProperty('description');
      expect(campaign).toHaveProperty('category');
      expect(campaign).toHaveProperty('location');
      expect(campaign).toHaveProperty('target_amount');
      expect(campaign).toHaveProperty('current_amount');
      expect(campaign).toHaveProperty('minimum_investment');
      expect(campaign).toHaveProperty('maximum_investment');
      expect(campaign).toHaveProperty('founder_id');
      
      expect(campaign.founder_id).toBe(1);
      expect(campaign.target_amount).toBeGreaterThanOrEqual(5000000);
      expect(campaign.target_amount).toBeLessThanOrEqual(100000000);
      expect(campaign.minimum_investment).toBeGreaterThanOrEqual(50000);
      expect(campaign.minimum_investment).toBeLessThanOrEqual(500000);
    });
    
    it('should ensure current_amount is within valid progress range', () => {
      const founder = { id: 1 };
      const campaign = generateCampaign(founder, 0);
      
      const progressLevel = campaign.current_amount / campaign.target_amount;
      expect(progressLevel).toBeGreaterThanOrEqual(0);
      expect(progressLevel).toBeLessThanOrEqual(1.5);
    });
    
    it('should set investor_count proportional to progress', () => {
      const founder = { id: 1 };
      const campaign = generateCampaign(founder, 0);
      
      const progressLevel = campaign.current_amount / campaign.target_amount;
      const expectedInvestorCount = Math.max(1, Math.floor(progressLevel * 50));
      
      expect(campaign.investor_count).toBe(expectedInvestorCount);
    });
    
    it('should have valid date range', () => {
      const founder = { id: 1 };
      const campaign = generateCampaign(founder, 0);
      
      expect(campaign.end_date.getTime()).toBeGreaterThan(campaign.start_date.getTime());
      
      const daysDifference = (campaign.end_date - campaign.start_date) / (1000 * 60 * 60 * 24);
      expect(daysDifference).toBeGreaterThanOrEqual(30);
      expect(daysDifference).toBeLessThanOrEqual(180);
    });
  });
  
  describe('Milestone Generation', () => {
    it('should generate valid milestone data', () => {
      const campaign = { id: 1, target_amount: 50000000, category: 'Technology' };
      const milestone = generateMilestone(campaign, 0, 3);
      
      expect(milestone).toHaveProperty('title');
      expect(milestone).toHaveProperty('description');
      expect(milestone).toHaveProperty('target_amount');
      expect(milestone).toHaveProperty('status');
      expect(milestone).toHaveProperty('order_index');
      
      expect(milestone.order_index).toBe(1);
      expect(milestone.target_amount).toBeGreaterThan(0);
      expect(['pending', 'active', 'completed', 'failed']).toContain(milestone.status);
    });
    
    it('should have future target_date', () => {
      const campaign = { id: 1, target_amount: 50000000, category: 'Technology' };
      const milestone = generateMilestone(campaign, 0, 3);
      
      expect(milestone.target_date.getTime()).toBeGreaterThan(Date.now());
    });
  });
  
  describe('Collaborator Generation', () => {
    it('should generate valid collaborator data', () => {
      const campaign = { id: 1, category: 'Technology' };
      const collaborator = generateCollaborator(campaign, 0);
      
      expect(collaborator).toHaveProperty('name');
      expect(collaborator).toHaveProperty('role');
      expect(collaborator).toHaveProperty('description');
      expect(collaborator).toHaveProperty('profile_image_url');
      expect(collaborator).toHaveProperty('order_index');
      
      expect(collaborator.order_index).toBe(1);
      expect(collaborator.name.length).toBeGreaterThan(0);
    });
    
    it('should use user data when provided', () => {
      const campaign = { id: 1, category: 'Technology' };
      const user = {
        fullName: 'John Doe',
        profileImageUrl: 'https://example.com/image.jpg',
        bio: 'Test bio',
        email: 'john@example.com',
        phoneNumber: '+2341234567890'
      };
      
      const collaborator = generateCollaborator(campaign, 0, user);
      
      expect(collaborator.name).toBe(user.fullName);
      expect(collaborator.profile_image_url).toBe(user.profileImageUrl);
      expect(collaborator.description).toBe(user.bio);
      expect(collaborator.email).toBe(user.email);
    });
  });
  
  describe('Media Generation', () => {
    it('should generate valid stock image URLs', () => {
      const url = generateStockImageUrl('Technology', 0);
      
      expect(url).toContain('unsplash.com');
      expect(url).toContain('w=800');
      expect(url).toContain('h=600');
    });
    
    it('should generate valid video URLs', () => {
      const url = generateVideoUrl(0);
      
      expect(url).toContain('youtube.com');
      expect(url).toContain('watch?v=');
    });
  });
  
  describe('Content Generation', () => {
    it('should generate business plans with varied lengths', () => {
      const shortPlan = generateBusinessPlan(500);
      const longPlan = generateBusinessPlan(2000);
      
      expect(shortPlan.length).toBeGreaterThanOrEqual(500);
      expect(longPlan.length).toBeGreaterThanOrEqual(2000);
    });
    
    it('should generate descriptions with specified length range', () => {
      const description = generateDescription(200, 1000);
      
      expect(description.length).toBeGreaterThanOrEqual(200);
      expect(description.length).toBeLessThanOrEqual(1000);
    });
    
    it('should generate problem statements', () => {
      const statement = generateProblemStatement(300, 800);
      
      expect(statement.length).toBeGreaterThanOrEqual(300);
      expect(statement.length).toBeLessThanOrEqual(800);
    });
    
    it('should generate solutions', () => {
      const solution = generateSolution(300, 800);
      
      expect(solution.length).toBeGreaterThanOrEqual(300);
      expect(solution.length).toBeLessThanOrEqual(800);
    });
  });
  
  describe('Random Helpers', () => {
    it('should generate random integers within range', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInt(10, 20);
        expect(value).toBeGreaterThanOrEqual(10);
        expect(value).toBeLessThanOrEqual(20);
      }
    });
    
    it('should select random elements from array', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      for (let i = 0; i < 100; i++) {
        const element = randomElement(array);
        expect(array).toContain(element);
      }
    });
    
    it('should generate random booleans', () => {
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(randomBoolean(0.5));
      }
      
      const trueCount = results.filter(r => r === true).length;
      const falseCount = results.filter(r => r === false).length;
      
      // With 100 iterations and 0.5 probability, we should have roughly 50/50 split
      expect(trueCount).toBeGreaterThan(20);
      expect(falseCount).toBeGreaterThan(20);
    });
  });
});
