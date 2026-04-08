import { useState, useCallback, useRef, useEffect } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const toastsRef = useRef(toasts);

  // Keep ref in sync with state
  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random(); // Add random to ensure uniqueness
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const hideToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message, duration) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message, duration) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  return {
    toasts,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info
  };
};
