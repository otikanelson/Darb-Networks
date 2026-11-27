import React, { createContext, useContext, useState, useEffect } from 'react';
import FirebaseAuthService from '../services/firebaseAuthService';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Listen to Firebase auth state
        const unsubscribe = FirebaseAuthService.onAuthStateChanged(async (firebaseUser) => {
          if (firebaseUser) {
            // User is logged in with Firebase, verify token and get profile
            const profile = await FirebaseAuthService.verifyToken();
            setUser(profile || FirebaseAuthService.getCurrentUser());
          } else {
            // No Firebase user logged in
            setUser(null);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await FirebaseAuthService.register(userData);
      setUser(newUser);
      return newUser;
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const loggedInUser = await FirebaseAuthService.login(credentials);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      let errorMessage = 'Login failed';
      
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.request) {
          errorMessage = 'Network error. Please check your connection.';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await FirebaseAuthService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const updateUserContext = async (updatedData) => {
    try {
      if (user && updatedData) {
        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
        FirebaseAuthService.setCurrentUser(updatedUser);
        return updatedUser;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getUserData = () => {
    if (!user) return null;
    return { ...user, id: user.id };
  };

  const isAuthenticated = React.useCallback(() => !!user, [user]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    user,
    login,
    logout,
    register,
    isAuthenticated,
    updateUserContext,
    error,
    loading
  }), [user, login, logout, register, isAuthenticated, updateUserContext, error, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
