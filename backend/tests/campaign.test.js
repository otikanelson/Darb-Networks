const { validateCampaign } = require('../validators/campaign.validator');

describe('Campaign Validator', () => {
  describe('Draft campaigns', () => {
    test('allows draft with only title', () => {
      const result = validateCampaign({ title: 'My Campaign' }, true);
      expect(result.isValid).toBe(true);
    });

    test('requires title to be at least 10 characters if provided', () => {
      const result = validateCampaign({ title: 'Short' }, true);
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toContain('10 characters');
    });

    test('allows empty optional fields in draft', () => {
      const result = validateCampaign({
        title: 'My Campaign',
        targetAmount: 0,
        minimumInvestment: 0
      }, true);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Submitted campaigns', () => {
    test('requires all mandatory fields', () => {
      const result = validateCampaign({}, false);
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBeDefined();
      expect(result.errors.description).toBeDefined();
      expect(result.errors.problemStatement).toBeDefined();
      expect(result.errors.solution).toBeDefined();
    });

    test('requires problem statement on submit', () => {
      const result = validateCampaign({
        title: 'Test Campaign',
        description: 'A good description that is long enough',
        category: 'Business & Finance',
        location: 'Lagos',
        problemStatement: '', // Empty
        solution: 'Solution here'
      }, false);
      expect(result.isValid).toBe(false);
      expect(result.errors.problemStatement).toContain('required');
    });

    test('requires solution on submit', () => {
      const result = validateCampaign({
        title: 'Test Campaign',
        description: 'A good description that is long enough',
        problemStatement: 'Problem description here',
        solution: '' // Empty
      }, false);
      expect(result.isValid).toBe(false);
      expect(result.errors.solution).toContain('required');
    });
  });

  describe('Financial validation', () => {
    test('rejects minimum investment greater than target', () => {
      const result = validateCampaign({
        targetAmount: 100000,
        minimumInvestment: 150000
      }, true);
      expect(result.isValid).toBe(false);
      expect(result.errors.minimumInvestment).toContain('exceed target');
    });

    test('rejects maximum investment greater than target', () => {
      const result = validateCampaign({
        targetAmount: 100000,
        maximumInvestment: 150000
      }, true);
      expect(result.isValid).toBe(false);
      expect(result.errors.maximumInvestment).toContain('exceed target');
    });

    test('requires minimum ₦1000', () => {
      const result = validateCampaign({
        minimumInvestment: 500
      }, true);
      expect(result.isValid).toBe(false);
      expect(result.errors.minimumInvestment).toContain('₦1,000');
    });

    test('requires target ≥ ₦100,000', () => {
      const result = validateCampaign({
        targetAmount: 50000
      }, true);
      expect(result.isValid).toBe(false);
      expect(result.errors.targetAmount).toContain('₦100,000');
    });
  });

  describe('Milestones validation', () => {
    test('rejects when milestone sum exceeds target', () => {
      const result = validateCampaign({
        targetAmount: 100000,
        milestones: [
          { title: 'Phase 1', amount: 60000 },
          { title: 'Phase 2', amount: 50000 }
        ]
      }, true);
      expect(result.isValid).toBe(false);
      expect(result.errors.milestones).toContain('exceed target');
    });

    test('requires milestone title at least 3 characters', () => {
      const result = validateCampaign({
        milestones: [
          { title: 'P1', amount: 1000 }
        ]
      }, true);
      expect(result.isValid).toBe(false);
      expect(result.errors['milestones.0.title']).toContain('3 characters');
    });

    test('rejects milestone amount of 0', () => {
      const result = validateCampaign({
        milestones: [
          { title: 'Phase 1', amount: 0 }
        ]
      }, true);
      expect(result.isValid).toBe(false);
      expect(result.errors['milestones.0.amount']).toContain('greater than 0');
    });

    test('allows max 8 milestones', () => {
      const milestones = Array.from({ length: 9 }, (_, i) => ({
        title: `Phase ${i + 1}`,
        amount: 1000
      }));
      const result = validateCampaign({ milestones }, true);
      expect(result.isValid).toBe(false);
      expect(result.errors.milestones).toContain('Maximum 8');
    });
  });

  describe('URL validation', () => {
    test('rejects document URL not starting with https://', () => {
      const result = validateCampaign({
        documents: [
          { name: 'Plan', url: 'http://example.com/plan.pdf', type: 'business_plan' }
        ]
      }, true);
      expect(result.isValid).toBe(false);
      expect(result.errors['documents.0.url']).toContain('https://');
    });

    test('rejects video URL not from YouTube/Vimeo', () => {
      const result = validateCampaign({
        videoUrl: 'https://example.com/video.mp4'
      }, true);
      expect(result.isValid).toBe(false);
      expect(result.errors.videoUrl).toContain('YouTube');
    });

    test('allows YouTube URLs', () => {
      const result = validateCampaign({
        videoUrl: 'https://youtube.com/watch?v=abc123'
      }, true);
      expect(result.isValid).toBe(true);
    });

    test('allows Vimeo URLs', () => {
      const result = validateCampaign({
        videoUrl: 'https://vimeo.com/123456'
      }, true);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Complete valid campaign', () => {
    test('accepts fully valid campaign for submission', () => {
      const result = validateCampaign({
        title: 'SwiftPay - Cross Border Remittance',
        description: 'A platform that enables fast and cheap cross-border remittance services',
        category: 'Business & Finance',
        location: 'Lagos, Nigeria',
        country: 'Nigeria',
        problemStatement: 'Cross-border remittance costs 5-10% due to intermediaries',
        solution: 'We use stablecoins and smart contracts for instant, cheap transfers',
        businessPlan: 'Revenue from transaction fees, 1% per transfer',
        targetAmount: 500000,
        minimumInvestment: 10000,
        maximumInvestment: 100000,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        milestones: [
          { title: 'MVP Launch', amount: 150000, targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
          { title: 'Scale to 3 Countries', amount: 200000, targetDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
        ],
        documents: [
          { name: 'Business Plan', url: 'https://example.com/plan.pdf', type: 'business_plan' }
        ],
        videoUrl: 'https://youtube.com/watch?v=xyz789'
      }, false);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });
  });
});
