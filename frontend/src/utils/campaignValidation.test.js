import {
  validateTitle,
  validateDescription,
  validateTargetAmount,
  validateMinimumInvestment,
  validateMaximumInvestment,
  validateEndDate,
  validateMilestones,
  validateVideoUrls,
  validateDocuments
} from './campaignValidation';

describe('Campaign Validation Utils', () => {
  describe('Title validation', () => {
    test('requires title for non-draft', () => {
      expect(validateTitle('', false)).toContain('required');
    });

    test('allows empty title for draft', () => {
      expect(validateTitle('', true)).toBeNull();
    });

    test('requires at least 10 characters', () => {
      expect(validateTitle('Short', false)).toContain('10 characters');
    });

    test('rejects title over 100 characters', () => {
      const long = 'a'.repeat(101);
      expect(validateTitle(long, false)).toContain('exceed 100');
    });

    test('accepts valid title', () => {
      expect(validateTitle('Valid Campaign Title', false)).toBeNull();
    });
  });

  describe('Description validation', () => {
    test('requires at least 50 characters for non-draft', () => {
      expect(validateDescription('Short', false)).toContain('50 characters');
    });

    test('strips HTML before counting', () => {
      const html = '<p>' + 'a'.repeat(50) + '</p>';
      expect(validateDescription(html, false)).toBeNull();
    });

    test('rejects description over 600 characters', () => {
      const long = 'a'.repeat(601);
      expect(validateDescription(long, false)).toContain('exceed 600');
    });
  });

  describe('Amount validation', () => {
    test('requires target amount for non-draft', () => {
      expect(validateTargetAmount('', false)).toContain('required');
    });

    test('requires minimum ₦100,000', () => {
      expect(validateTargetAmount('50000', false)).toContain('₦100,000');
    });

    test('requires minimum investment ₦1,000', () => {
      expect(validateMinimumInvestment('500', false)).toContain('₦1,000');
    });

    test('rejects minimum > target', () => {
      const error = validateMinimumInvestment('150000', false, 100000);
      expect(error).toContain('exceed');
    });

    test('rejects maximum > target', () => {
      const error = validateMaximumInvestment('150000', null, 100000);
      expect(error).toContain('exceed');
    });
  });

  describe('End date validation', () => {
    test('requires end date for non-draft', () => {
      expect(validateEndDate('', false)).toContain('required');
    });

    test('requires at least 7 days from today', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      expect(validateEndDate(dateStr, false)).toContain('7 days');
    });

    test('rejects date more than 180 days out', () => {
      const future = new Date();
      future.setDate(future.getDate() + 181);
      const dateStr = future.toISOString().split('T')[0];
      expect(validateEndDate(dateStr, false)).toContain('180 days');
    });

    test('accepts valid future date', () => {
      const valid = new Date();
      valid.setDate(valid.getDate() + 30);
      const dateStr = valid.toISOString().split('T')[0];
      expect(validateEndDate(dateStr, false)).toBeNull();
    });
  });

  describe('Milestones validation', () => {
    test('rejects when sum exceeds target', () => {
      const errors = validateMilestones(
        [
          { title: 'P1', amount: '60000' },
          { title: 'P2', amount: '50000' }
        ],
        true,
        100000
      );
      expect(errors.global).toContain('exceed');
    });

    test('rejects milestone with no title', () => {
      const errors = validateMilestones(
        [{ title: '', amount: '1000' }],
        true
      );
      // Empty title is allowed (optional last row)
      expect(Object.keys(errors).length).toBe(0);
    });

    test('rejects title under 3 characters', () => {
      const errors = validateMilestones(
        [{ title: 'P1', amount: '1000' }],
        true
      );
      expect(errors['0.title']).toContain('3 characters');
    });

    test('rejects amount of 0', () => {
      const errors = validateMilestones(
        [{ title: 'Phase 1', amount: '0' }],
        true
      );
      expect(errors['0.amount']).toContain('greater than 0');
    });
  });

  describe('Video URL validation', () => {
    test('requires https://', () => {
      expect(validateVideoUrls('http://youtube.com/watch?v=abc')).toContain('https://');
    });

    test('requires YouTube or Vimeo', () => {
      expect(validateVideoUrls('https://example.com/video.mp4')).toContain('YouTube');
    });

    test('allows YouTube URLs', () => {
      expect(validateVideoUrls('https://youtube.com/watch?v=abc123')).toBeNull();
      expect(validateVideoUrls('https://youtu.be/abc123')).toBeNull();
    });

    test('allows Vimeo URLs', () => {
      expect(validateVideoUrls('https://vimeo.com/123456')).toBeNull();
    });

    test('rejects more than 5 videos', () => {
      const urls = Array(6).fill('https://youtube.com/watch?v=abc').join(',');
      expect(validateVideoUrls(urls)).toContain('Maximum 5');
    });
  });

  describe('Documents validation', () => {
    test('requires https://', () => {
      expect(
        validateDocuments([
          { name: 'Plan', url: 'http://example.com/plan.pdf', type: 'business_plan' }
        ])
      ).toContain('https://');
    });

    test('rejects more than 10 documents', () => {
      const docs = Array(11).fill({
        name: 'Doc',
        url: 'https://example.com/doc.pdf',
        type: 'business_plan'
      });
      expect(validateDocuments(docs)).toContain('Maximum 10');
    });

    test('requires valid type', () => {
      expect(
        validateDocuments([
          { name: 'Plan', url: 'https://example.com/plan.pdf', type: 'invalid' }
        ])
      ).toContain('type is invalid');
    });

    test('accepts valid documents', () => {
      expect(
        validateDocuments([
          { name: 'Business Plan', url: 'https://example.com/plan.pdf', type: 'business_plan' },
          { name: 'Financials', url: 'https://example.com/fin.xlsx', type: 'financial' }
        ])
      ).toBeNull();
    });
  });
});
