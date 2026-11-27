/**
 * Prompt to restore unsaved draft from localStorage
 */

import React from 'react';
import { AlertCircle, RotateCcw, X } from 'lucide-react';

const RestoreDraftPrompt = ({ savedAt, onRestore, onDiscard }) => {
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-gray-900">Restore unsaved campaign?</h2>
            <p className="text-sm text-gray-600 mt-1">
              We found a campaign you were working on {formatTime(savedAt)}.
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-700">
          You can restore it now or start fresh. Either way, your work won't be lost.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onDiscard}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            <X className="h-4 w-4 inline mr-1" />
            Start Fresh
          </button>
          <button
            onClick={onRestore}
            className="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
          >
            <RotateCcw className="h-4 w-4 inline mr-1" />
            Restore
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestoreDraftPrompt;
