import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/authService';
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
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
          const isValid = await AuthService.verifyToken();
          setUser(isValid ? currentUser : null);
          if (!isValid) AuthService.logout();
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
        AuthService.logout();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await AuthService.register(userData);
      setUser(newUser);
      return newUser;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const loggedInUser = await AuthService.login(credentials);
      try {
        const completeProfile = await AuthService.verifyToken();
        setUser(completeProfile || loggedInUser);
      } catch {
        setUser(loggedInUser);
      }
      return loggedInUser;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setError(err.response.data?.message || 'Invalid email or password');
        } else if (err.request) {
          setError('Network error. Please check your connection.');
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    } finally {
      setUser(null);
    }
  };

  const updateUserContext = async (updatedData) => {
    try {
      if (user && updatedData) {
        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
        AuthService.setCurrentUser(updatedUser);
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
