/**
 * Draft management utility
 * Handles localStorage backup, autosave tracking, and restoration
 */

/**
 * Get localStorage key for user's unsaved campaign
 */
const getDraftKey = (userId) => `campaign_draft_${userId}`;

/**
 * Save campaign form to localStorage (backup)
 */
export const saveDraftToLocalStorage = (userId, formData) => {
  if (!userId) return;
  try {
    const key = getDraftKey(userId);
    const backup = {
      data: formData,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(backup));
  } catch (error) {
    console.warn('Failed to save draft to localStorage:', error);
  }
};

/**
 * Get saved draft from localStorage
 */
export const getDraftFromLocalStorage = (userId) => {
  if (!userId) return null;
  try {
    const key = getDraftKey(userId);
    const backup = localStorage.getItem(key);
    if (!backup) return null;
    const parsed = JSON.parse(backup);
    return { data: parsed.data, savedAt: parsed.savedAt };
  } catch (error) {
    console.warn('Failed to retrieve draft from localStorage:', error);
    return null;
  }
};

/**
 * Clear saved draft from localStorage
 */
export const clearDraftFromLocalStorage = (userId) => {
  if (!userId) return;
  try {
    const key = getDraftKey(userId);
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear draft from localStorage:', error);
  }
};

/**
 * Check if unsaved changes exist
 */
export const hasUnsavedChanges = (currentData, savedData) => {
  return JSON.stringify(currentData) !== JSON.stringify(savedData);
};

/**
 * Debounce autosave (wait until user stops typing)
 */
export const createAutoSaveDebounce = (callback, delayMs = 3000) => {
  let timeoutId = null;

  const debounced = (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...args);
      timeoutId = null;
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
  };

  debounced.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
};
