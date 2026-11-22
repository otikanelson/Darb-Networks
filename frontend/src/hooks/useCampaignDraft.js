/**
 * Hook for managing campaign draft lifecycle
 * Handles autosave, localStorage backup, unsaved changes tracking
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useBeforeUnload } from 'react-router-dom';
import { saveDraftToLocalStorage, getDraftFromLocalStorage, clearDraftFromLocalStorage, hasUnsavedChanges, createAutoSaveDebounce } from '../utils/draftManager';

export const useCampaignDraft = (userId, campaignId, formData, onAutoSave) => {
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [savedDraft, setSavedDraft] = useState(null);
  const autoSaveRef = useRef(null);
  const initialDataRef = useRef(null);

  // Check for localStorage backup on mount (create mode only)
  useEffect(() => {
    if (campaignId) return; // Edit mode: skip restore

    const draft = getDraftFromLocalStorage(userId);
    if (draft) {
      setSavedDraft(draft);
      setShowRestorePrompt(true);
    }
  }, [userId, campaignId]);

  // Create autosave debounce
  useEffect(() => {
    if (!autoSaveRef.current) {
      autoSaveRef.current = createAutoSaveDebounce(async () => {
        if (!onAutoSave) return;
        try {
          setIsSaving(true);
          await onAutoSave();
          setLastSaved(new Date());
        } catch (error) {
          console.error('Autosave failed:', error);
        } finally {
          setIsSaving(false);
        }
      }, 3000);
    }

    return () => {
      if (autoSaveRef.current) {
        autoSaveRef.current.cancel();
      }
    };
  }, [onAutoSave]);

  // Trigger autosave when form changes (only if campaign exists)
  useEffect(() => {
    if (!campaignId || !formData || !autoSaveRef.current) return;

    // Don't autosave if no meaningful changes
    if (initialDataRef.current && !hasUnsavedChanges(formData, initialDataRef.current)) {
      return;
    }

    autoSaveRef.current(formData);
  }, [formData, campaignId]);

  // Also save to localStorage as backup (before first save to server)
  useEffect(() => {
    if (!formData || !userId) return;
    if (campaignId) return; // Don't backup after first save

    // Backup every change to localStorage
    saveDraftToLocalStorage(userId, formData);
  }, [formData, userId, campaignId]);

  // Warn before leaving with unsaved changes
  const hasChanges = campaignId 
    ? (initialDataRef.current && hasUnsavedChanges(formData, initialDataRef.current))
    : false; // Let localStorage handle pre-save drafts

  useBeforeUnload(
    useCallback(() => {
      if (hasChanges) {
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    }, [hasChanges])
  );

  // On first successful save (create mode), mark data as "saved" so autosave knows baseline
  const markAsSaved = useCallback(() => {
    initialDataRef.current = JSON.parse(JSON.stringify(formData));
    setLastSaved(new Date());
    // Clear localStorage after first save
    clearDraftFromLocalStorage(userId);
  }, [formData, userId]);

  // Restore from localStorage
  const restoreDraft = useCallback(() => {
    if (savedDraft) {
      setShowRestorePrompt(false);
      return savedDraft.data;
    }
    return null;
  }, [savedDraft]);

  // Discard localStorage draft
  const discardDraft = useCallback(() => {
    clearDraftFromLocalStorage(userId);
    setShowRestorePrompt(false);
    setSavedDraft(null);
  }, [userId]);

  return {
    lastSaved,
    isSaving,
    showRestorePrompt,
    savedDraft,
    markAsSaved,
    restoreDraft,
    discardDraft,
    hasUnsavedChanges: hasChanges,
  };
};
