/**
 * Random Data Generation Helpers
 * 
 * Utility functions for generating random values used throughout the seeding process.
 * These functions provide consistent random data generation with proper bounds checking.
 */

/**
 * Select a random element from an array
 * @param {Array} array - The array to select from
 * @returns {*} A random element from the array
 */
function randomElement(array) {
  if (!array || array.length === 0) {
    throw new Error('Cannot select from empty array');
  }
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} Random integer between min and max
 */
function randomInt(min, max) {
  if (min > max) {
    throw new Error('min must be less than or equal to max');
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random float between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random float between min and max
 */
function randomFloat(min, max) {
  if (min > max) {
    throw new Error('min must be less than or equal to max');
  }
  return Math.random() * (max - min) + min;
}

/**
 * Generate a random date between start and end dates
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Date} Random date between start and end
 */
function randomDate(start, end) {
  if (!(start instanceof Date) || !(end instanceof Date)) {
    throw new Error('start and end must be Date objects');
  }
  if (start > end) {
    throw new Error('start date must be before end date');
  }
  const timestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(timestamp);
}

/**
 * Generate a random boolean with a given probability of being true
 * @param {number} probability - Probability of returning true (0-1)
 * @returns {boolean} Random boolean
 */
function randomBoolean(probability = 0.5) {
  if (probability < 0 || probability > 1) {
    throw new Error('probability must be between 0 and 1');
  }
  return Math.random() < probability;
}

module.exports = {
  randomElement,
  randomInt,
  randomFloat,
  randomDate,
  randomBoolean
};
