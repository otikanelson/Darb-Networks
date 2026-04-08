/**
 * Tests for Content Generators
 */

const {
  generateBusinessPlan,
  generateDescription,
  generateProblemStatement,
  generateSolution
} = require('./content-generators');

describe('Content Generators', () => {
  describe('generateBusinessPlan', () => {
    it('should generate business plan with minimum length', () => {
      const minLength = 500;
      const result = generateBusinessPlan(minLength);
      expect(result.length).toBeGreaterThanOrEqual(minLength);
      expect(typeof result).toBe('string');
    });

    it('should generate long business plans for large minLength', () => {
      const minLength = 1500;
      const result = generateBusinessPlan(minLength);
      expect(result.length).toBeGreaterThanOrEqual(minLength);
    });

    it('should generate varied content', () => {
      const plans = new Set();
      for (let i = 0; i < 10; i++) {
        plans.add(generateBusinessPlan(500));
      }
      // Should have multiple different plans
      expect(plans.size).toBeGreaterThan(1);
    });

    it('should contain realistic Nigerian business content', () => {
      const result = generateBusinessPlan(500);
      const keywords = ['Nigeria', 'market', 'growth', 'team', 'strategy', 'business'];
      const hasKeywords = keywords.some(keyword => result.toLowerCase().includes(keyword));
      expect(hasKeywords).toBe(true);
    });

    it('should default to 500 character minimum', () => {
      const result = generateBusinessPlan();
      expect(result.length).toBeGreaterThanOrEqual(500);
    });
  });

  describe('generateDescription', () => {
    it('should generate description within length range', () => {
      const minLength = 200;
      const maxLength = 800;
      const result = generateDescription(minLength, maxLength);
      expect(result.length).toBeGreaterThanOrEqual(minLength);
      expect(result.length).toBeLessThanOrEqual(maxLength);
    });

    it('should respect custom length parameters', () => {
      const minLength = 300;
      const maxLength = 500;
      for (let i = 0; i < 10; i++) {
        const result = generateDescription(minLength, maxLength);
        expect(result.length).toBeGreaterThanOrEqual(minLength);
        expect(result.length).toBeLessThanOrEqual(maxLength);
      }
    });

    it('should generate varied descriptions', () => {
      const descriptions = new Set();
      for (let i = 0; i < 10; i++) {
        descriptions.add(generateDescription(200, 800));
      }
      expect(descriptions.size).toBeGreaterThan(1);
    });

    it('should contain realistic content', () => {
      const result = generateDescription(200, 800);
      // Just verify it's a non-empty string with reasonable content
      expect(result.length).toBeGreaterThan(0);
      expect(typeof result).toBe('string');
      // Check for at least some business-related words
      const businessWords = ['service', 'platform', 'team', 'solution', 'opportunity', 'innovation', 'business', 'value', 'market', 'customer'];
      const hasBusinessContent = businessWords.some(word => result.toLowerCase().includes(word));
      expect(hasBusinessContent).toBe(true);
    });

    it('should use default parameters', () => {
      const result = generateDescription();
      expect(result.length).toBeGreaterThanOrEqual(200);
      expect(result.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('generateProblemStatement', () => {
    it('should generate problem statement within length range', () => {
      const minLength = 300;
      const maxLength = 800;
      const result = generateProblemStatement(minLength, maxLength);
      expect(result.length).toBeGreaterThanOrEqual(minLength);
      expect(result.length).toBeLessThanOrEqual(maxLength);
    });

    it('should respect custom length parameters', () => {
      const minLength = 400;
      const maxLength = 600;
      for (let i = 0; i < 10; i++) {
        const result = generateProblemStatement(minLength, maxLength);
        expect(result.length).toBeGreaterThanOrEqual(minLength);
        expect(result.length).toBeLessThanOrEqual(maxLength);
      }
    });

    it('should generate varied problem statements', () => {
      const statements = new Set();
      for (let i = 0; i < 10; i++) {
        statements.add(generateProblemStatement(300, 800));
      }
      expect(statements.size).toBeGreaterThan(1);
    });

    it('should contain realistic Nigerian context', () => {
      const result = generateProblemStatement(300, 800);
      const keywords = ['Nigeria', 'challenge', 'problem', 'sector', 'market'];
      const hasKeywords = keywords.some(keyword => result.toLowerCase().includes(keyword));
      expect(hasKeywords).toBe(true);
    });

    it('should use default parameters', () => {
      const result = generateProblemStatement();
      expect(result.length).toBeGreaterThanOrEqual(300);
      expect(result.length).toBeLessThanOrEqual(800);
    });
  });

  describe('generateSolution', () => {
    it('should generate solution within length range', () => {
      const minLength = 300;
      const maxLength = 800;
      const result = generateSolution(minLength, maxLength);
      expect(result.length).toBeGreaterThanOrEqual(minLength);
      expect(result.length).toBeLessThanOrEqual(maxLength);
    });

    it('should respect custom length parameters', () => {
      const minLength = 350;
      const maxLength = 700;
      for (let i = 0; i < 10; i++) {
        const result = generateSolution(minLength, maxLength);
        expect(result.length).toBeGreaterThanOrEqual(minLength);
        expect(result.length).toBeLessThanOrEqual(maxLength);
      }
    });

    it('should generate varied solutions', () => {
      const solutions = new Set();
      for (let i = 0; i < 10; i++) {
        solutions.add(generateSolution(300, 800));
      }
      expect(solutions.size).toBeGreaterThan(1);
    });

    it('should contain realistic content', () => {
      const result = generateSolution(300, 800);
      const keywords = ['solution', 'technology', 'approach', 'strategy', 'implementation'];
      const hasKeywords = keywords.some(keyword => result.toLowerCase().includes(keyword));
      expect(hasKeywords).toBe(true);
    });

    it('should use default parameters', () => {
      const result = generateSolution();
      expect(result.length).toBeGreaterThanOrEqual(300);
      expect(result.length).toBeLessThanOrEqual(800);
    });
  });

  describe('Content Variety', () => {
    it('should generate varied business plan lengths', () => {
      const lengths = new Set();
      for (let i = 0; i < 20; i++) {
        const plan = generateBusinessPlan(500);
        lengths.add(Math.floor(plan.length / 100) * 100); // Round to nearest 100
      }
      // Should have multiple different length ranges
      expect(lengths.size).toBeGreaterThan(1);
    });

    it('should generate varied description lengths', () => {
      const lengths = new Set();
      for (let i = 0; i < 20; i++) {
        const desc = generateDescription(200, 1000);
        lengths.add(Math.floor(desc.length / 100) * 100);
      }
      expect(lengths.size).toBeGreaterThan(1);
    });

    it('should generate varied problem statement lengths', () => {
      const lengths = new Set();
      for (let i = 0; i < 20; i++) {
        const stmt = generateProblemStatement(300, 800);
        lengths.add(Math.floor(stmt.length / 100) * 100);
      }
      expect(lengths.size).toBeGreaterThan(1);
    });

    it('should generate varied solution lengths', () => {
      const lengths = new Set();
      for (let i = 0; i < 20; i++) {
        const sol = generateSolution(300, 800);
        lengths.add(Math.floor(sol.length / 100) * 100);
      }
      expect(lengths.size).toBeGreaterThan(1);
    });
  });
});
