/**
 * Tests for Random Helpers
 */

const {
  randomElement,
  randomInt,
  randomFloat,
  randomDate,
  randomBoolean
} = require('./random-helpers');

describe('Random Helpers', () => {
  describe('randomElement', () => {
    it('should return an element from the array', () => {
      const array = [1, 2, 3, 4, 5];
      const result = randomElement(array);
      expect(array).toContain(result);
    });

    it('should throw error for empty array', () => {
      expect(() => randomElement([])).toThrow('Cannot select from empty array');
    });

    it('should throw error for null array', () => {
      expect(() => randomElement(null)).toThrow('Cannot select from empty array');
    });

    it('should work with single element array', () => {
      const result = randomElement(['only']);
      expect(result).toBe('only');
    });
  });

  describe('randomInt', () => {
    it('should return integer within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(10, 20);
        expect(result).toBeGreaterThanOrEqual(10);
        expect(result).toBeLessThanOrEqual(20);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('should handle min equals max', () => {
      const result = randomInt(5, 5);
      expect(result).toBe(5);
    });

    it('should throw error when min > max', () => {
      expect(() => randomInt(20, 10)).toThrow('min must be less than or equal to max');
    });

    it('should handle negative numbers', () => {
      const result = randomInt(-10, -5);
      expect(result).toBeGreaterThanOrEqual(-10);
      expect(result).toBeLessThanOrEqual(-5);
    });
  });

  describe('randomFloat', () => {
    it('should return float within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomFloat(10.5, 20.5);
        expect(result).toBeGreaterThanOrEqual(10.5);
        expect(result).toBeLessThanOrEqual(20.5);
      }
    });

    it('should throw error when min > max', () => {
      expect(() => randomFloat(20, 10)).toThrow('min must be less than or equal to max');
    });

    it('should handle negative numbers', () => {
      const result = randomFloat(-10.5, -5.5);
      expect(result).toBeGreaterThanOrEqual(-10.5);
      expect(result).toBeLessThanOrEqual(-5.5);
    });
  });

  describe('randomDate', () => {
    it('should return date within range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      
      for (let i = 0; i < 100; i++) {
        const result = randomDate(start, end);
        expect(result.getTime()).toBeGreaterThanOrEqual(start.getTime());
        expect(result.getTime()).toBeLessThanOrEqual(end.getTime());
      }
    });

    it('should throw error when start > end', () => {
      const start = new Date('2024-12-31');
      const end = new Date('2024-01-01');
      expect(() => randomDate(start, end)).toThrow('start date must be before end date');
    });

    it('should throw error for non-Date objects', () => {
      expect(() => randomDate('2024-01-01', new Date('2024-12-31'))).toThrow('start and end must be Date objects');
    });

    it('should handle same start and end date', () => {
      const date = new Date('2024-06-15');
      const result = randomDate(date, date);
      expect(result.getTime()).toBe(date.getTime());
    });
  });

  describe('randomBoolean', () => {
    it('should return boolean', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomBoolean();
        expect(typeof result).toBe('boolean');
      }
    });

    it('should respect probability of 1', () => {
      for (let i = 0; i < 100; i++) {
        expect(randomBoolean(1)).toBe(true);
      }
    });

    it('should respect probability of 0', () => {
      for (let i = 0; i < 100; i++) {
        expect(randomBoolean(0)).toBe(false);
      }
    });

    it('should throw error for invalid probability', () => {
      expect(() => randomBoolean(1.5)).toThrow('probability must be between 0 and 1');
      expect(() => randomBoolean(-0.5)).toThrow('probability must be between 0 and 1');
    });

    it('should default to 0.5 probability', () => {
      const results = [];
      for (let i = 0; i < 1000; i++) {
        results.push(randomBoolean());
      }
      const trueCount = results.filter(r => r === true).length;
      // With 1000 samples, should be roughly 50% (allow 30-70% range)
      expect(trueCount).toBeGreaterThan(300);
      expect(trueCount).toBeLessThan(700);
    });
  });
});
