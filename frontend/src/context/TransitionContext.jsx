import React, { createContext, useContext, useState, useCallback } from 'react';

const TransitionContext = createContext();

export const TransitionProvider = ({ children }) => {
  const [transitionState, setTransitionState] = useState({
    isTransitioning: false,
    cardRect: null,
    cardData: null,
    imageUrl: null,
  });

  const startTransition = useCallback((rect, cardData, imageUrl) => {
    setTransitionState({
      isTransitioning: true,
      cardRect: rect,
      cardData,
      imageUrl,
    });
  }, []);

  const endTransition = useCallback(() => {
    setTransitionState({
      isTransitioning: false,
      cardRect: null,
      cardData: null,
      imageUrl: null,
    });
  }, []);

  return (
    <TransitionContext.Provider value={{ transitionState, startTransition, endTransition }}>
      {children}
    </TransitionContext.Provider>
  );
};

export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within TransitionProvider');
  }
  return context;
};
