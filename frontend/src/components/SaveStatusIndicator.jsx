/**
 * Save status indicator for autosave feedback
 */

import React, { useState, useEffect } from 'react';
import { Check, Loader, AlertCircle } from 'lucide-react';

const SaveStatusIndicator = ({ lastSaved, isSaving, error }) => {
  const [showStatus, setShowStatus] = useState(false);

  // Show status for 2 seconds after save
  useEffect(() => {
    if (lastSaved || error) {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved, error]);

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Loader className="h-4 w-4 animate-spin" />
        <span>Saving…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span>Save failed</span>
      </div>
    );
  }

  if (showStatus && lastSaved) {
    const formatTime = (date) => {
      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);

      if (diffSecs < 60) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      return `${Math.floor(diffMins / 60)}h ago`;
    };

    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Check className="h-4 w-4" />
        <span>Saved · {formatTime(lastSaved)}</span>
      </div>
    );
  }

  return null;
};

export default SaveStatusIndicator;
