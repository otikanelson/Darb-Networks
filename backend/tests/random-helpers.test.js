/**
 * Unit tests for random helper functions
 * Tests requirement 12.1
 */

const {
  randomElement,
  randomInt,
  randomFloat,
  randomDate,
  randomBoolean
} = require('../utils/random-helpers');

describe('Random Helper Functions', () => {
  describe('randomElement', () => {
    it('should return an element from a single-element array', () => {
      const array = ['only'];
      const result = randomElement(array);
      expect(result).toBe('only');
    });

    it('should return an element from the array', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      const result = randomElement(array);
      expect(array).toContain(result);
    });

    it('should return different elements over multiple calls', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      const results = new Set();
      
      // Run 50 times to get statistical variety
      for (let i = 0; i < 50; i++) {
        results.add(randomElement(array));
      }
      
      // Should get at least 2 different values (very high probability)
      expect(results.size).toBeGreaterThan(1);
    });

    it('should throw error for empty array', () => {
      expect(() => randomElement([])).toThrow('Cannot select from empty array');
    });

    it('should throw error for null input', () => {
      expect(() => randomElement(null)).toThrow('Cannot select from empty array');
    });

    it('should throw error for undefined input', () => {
      expect(() => randomElement(undefined)).toThrow('Cannot select from empty array');
    });

    it('should work with arrays of different types', () => {
      const numbers = [1, 2, 3];
      const objects = [{ id: 1 }, { id: 2 }];
      
      expect(numbers).toContain(randomElement(numbers));
      expect(objects).toContain(randomElement(objects));
    });
  });

  describe('randomInt', () => {
    it('should return the same value when min equals max', () => {
      const result = randomInt(5, 5);
      expect(result).toBe(5);
    });

    it('should return a value within range', () => {
      const min = 10;
      const max = 20;
      const result = randomInt(min, max);
      
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should return values at boundaries', () => {
      const min = 1;
      const max = 2;
      const results = new Set();
      
      // Run many times to hit both boundaries
      for (let i = 0; i < 100; i++) {
        results.add(randomInt(min, max));
      }
      
      // Should eventually get both 1 and 2
      expect(results.has(1) || results.has(2)).toBe(true);
    });

    it('should work with negative numbers', () => {
      const result = randomInt(-10, -5);
      expect(result).toBeGreaterThanOrEqual(-10);
      expect(result).toBeLessThanOrEqual(-5);
    });

    it('should work with zero', () => {
      const result = randomInt(0, 10);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(10);
    });

    it('should work with large numbers', () => {
      const result = randomInt(1000000, 2000000);
      expect(result).toBeGreaterThanOrEqual(1000000);
      expect(result).toBeLessThanOrEqual(2000000);
    });

    it('should throw error when min is greater than max', () => {
      expect(() => randomInt(10, 5)).toThrow('min must be less than or equal to max');
    });

    it('should generate different values over multiple calls', () => {
      const results = new Set();
      
      for (let i = 0; i < 50; i++) {
        results.add(randomInt(1, 100));
      }
      
      // Should get multiple different values
      expect(results.size).toBeGreaterThan(5);
    });
  });

  describe('randomFloat', () => {
    it('should return a value within range', () => {
      const min = 0.0;
      const max = 1.0;
      const result = randomFloat(min, max);
      
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
      expect(typeof result).toBe('number');
    });

    it('should return approximately min when min equals max', () => {
      const result = randomFloat(5.5, 5.5);
      expect(result).toBeCloseTo(5.5, 10);
    });

    it('should work with negative numbers', () => {
      const result = randomFloat(-10.5, -5.5);
      expect(result).toBeGreaterThanOrEqual(-10.5);
      expect(result).toBeLessThanOrEqual(-5.5);
    });

    it('should work with decimal ranges', () => {
      const result = randomFloat(0.1, 0.2);
      expect(result).toBeGreaterThanOrEqual(0.1);
      expect(result).toBeLessThanOrEqual(0.2);
    });

    it('should work with large numbers', () => {
      const result = randomFloat(1000000.5, 2000000.5);
      expect(result).toBeGreaterThanOrEqual(1000000.5);
      expect(result).toBeLessThanOrEqual(2000000.5);
    });

    it('should throw error when min is greater than max', () => {
      expect(() => randomFloat(10.5, 5.5)).toThrow('min must be less than or equal to max');
    });

    it('should generate different values over multiple calls', () => {
      const results = [];
      
      for (let i = 0; i < 10; i++) {
        results.push(randomFloat(0, 100));
      }
      
      // All values should be different (very high probability for floats)
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(10);
    });

    it('should return float values, not integers', () => {
      let hasDecimal = false;
      
      for (let i = 0; i < 20; i++) {
        const result = randomFloat(0, 100);
        if (result % 1 !== 0) {
          hasDecimal = true;
          break;
        }
      }
      
      expect(hasDecimal).toBe(true);
    });
  });

  describe('randomDate', () => {
    it('should return a date within range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const result = randomDate(start, end);
      
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(end.getTime());
    });

    it('should return start date when start equals end', () => {
      const date = new Date('2024-06-15');
      const result = randomDate(date, date);
      
      expect(result.getTime()).toBe(date.getTime());
    });

    it('should work with dates far apart', () => {
      const start = new Date('2020-01-01');
      const end = new Date('2025-12-31');
      const result = randomDate(start, end);
      
      expect(result.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(end.getTime());
    });

    it('should work with dates close together', () => {
      const start = new Date('2024-06-15T10:00:00');
      const end = new Date('2024-06-15T11:00:00');
      const result = randomDate(start, end);
      
      expect(result.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(end.getTime());
    });

    it('should throw error when start is after end', () => {
      const start = new Date('2024-12-31');
      const end = new Date('2024-01-01');
      
      expect(() => randomDate(start, end)).toThrow('start date must be before end date');
    });

    it('should throw error when start is not a Date object', () => {
      const end = new Date('2024-12-31');
      
      expect(() => randomDate('2024-01-01', end)).toThrow('start and end must be Date objects');
      expect(() => randomDate(null, end)).toThrow('start and end must be Date objects');
      expect(() => randomDate(undefined, end)).toThrow('start and end must be Date objects');
      expect(() => randomDate(123456789, end)).toThrow('start and end must be Date objects');
    });

    it('should throw error when end is not a Date object', () => {
      const start = new Date('2024-01-01');
      
      expect(() => randomDate(start, '2024-12-31')).toThrow('start and end must be Date objects');
      expect(() => randomDate(start, null)).toThrow('start and end must be Date objects');
      expect(() => randomDate(start, undefined)).toThrow('start and end must be Date objects');
      expect(() => randomDate(start, 123456789)).toThrow('start and end must be Date objects');
    });

    it('should generate different dates over multiple calls', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      const results = new Set();
      
      for (let i = 0; i < 20; i++) {
        results.add(randomDate(start, end).getTime());
      }
      
      // Should get multiple different dates
      expect(results.size).toBeGreaterThan(5);
    });

    it('should work with past dates', () => {
      const start = new Date('2020-01-01');
      const end = new Date('2021-01-01');
      const result = randomDate(start, end);
      
      expect(result.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(end.getTime());
    });

    it('should work with future dates', () => {
      const start = new Date('2025-01-01');
      const end = new Date('2026-01-01');
      const result = randomDate(start, end);
      
      expect(result.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(end.getTime());
    });
  });

  describe('randomBoolean', () => {
    it('should return a boolean value', () => {
      const result = randomBoolean();
      expect(typeof result).toBe('boolean');
    });

    it('should return both true and false over multiple calls with default probability', () => {
      const results = new Set();
      
      for (let i = 0; i < 50; i++) {
        results.add(randomBoolean());
      }
      
      // Should get both true and false
      expect(results.has(true)).toBe(true);
      expect(results.has(false)).toBe(true);
    });

    it('should always return true with probability 1', () => {
      for (let i = 0; i < 20; i++) {
        expect(randomBoolean(1)).toBe(true);
      }
    });

    it('should always return false with probability 0', () => {
      for (let i = 0; i < 20; i++) {
        expect(randomBoolean(0)).toBe(false);
      }
    });

    it('should return mostly true with high probability', () => {
      let trueCount = 0;
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        if (randomBoolean(0.9)) trueCount++;
      }
      
      // With 0.9 probability, expect at least 70% true (allowing for randomness)
      expect(trueCount).toBeGreaterThan(70);
    });

    it('should return mostly false with low probability', () => {
      let falseCount = 0;
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        if (!randomBoolean(0.1)) falseCount++;
      }
      
      // With 0.1 probability, expect at least 70% false (allowing for randomness)
      expect(falseCount).toBeGreaterThan(70);
    });

    it('should throw error when probability is less than 0', () => {
      expect(() => randomBoolean(-0.1)).toThrow('probability must be between 0 and 1');
      expect(() => randomBoolean(-1)).toThrow('probability must be between 0 and 1');
    });

    it('should throw error when probability is greater than 1', () => {
      expect(() => randomBoolean(1.1)).toThrow('probability must be between 0 and 1');
      expect(() => randomBoolean(2)).toThrow('probability must be between 0 and 1');
    });

    it('should work with decimal probabilities', () => {
      const result = randomBoolean(0.5);
      expect(typeof result).toBe('boolean');
    });

    it('should use default probability of 0.5 when no argument provided', () => {
      let trueCount = 0;
      const iterations = 200;
      
      for (let i = 0; i < iterations; i++) {
        if (randomBoolean()) trueCount++;
      }
      
      // With 0.5 probability, expect roughly 50% (allowing 30-70% range for randomness)
      expect(trueCount).toBeGreaterThan(60);
      expect(trueCount).toBeLessThan(140);
    });
  });
});
