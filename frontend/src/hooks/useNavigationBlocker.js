/**
 * Hook for blocking navigation with unsaved changes (React Router v6)
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNavigationBlocker = (shouldBlock, message = 'You have unsaved changes. Are you sure?') => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!shouldBlock) return;

    // Store the current location so we can restore if needed
    let isBlocking = true;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    // Add beforeunload listener for page refresh/close
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      isBlocking = false;
    };
  }, [shouldBlock, message]);
};
