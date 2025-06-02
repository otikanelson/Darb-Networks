// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/authService';
import UserService from '../services/userService';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Check if user data exists in localStorage
        const currentUser = AuthService.getCurrentUser();
        
        if (currentUser) {
          console.log("User found in local storage:", currentUser);
          
          // Verify if the token is still valid with the backend
          const isValid = await AuthService.verifyToken();
          
          if (isValid) {
            setUser(currentUser);
          } else {
            // If token is invalid, clear the user data
            AuthService.logout();
            setUser(null);
          }
        } else {
          console.log("No user found in local storage");
          setUser(null);
        }
      } catch (err) {
        console.error("Error during auth initialization:", err);
        setError(err.message);
        // Make sure to set user to null if there's an error
        setUser(null);
        // Cleanup any invalid auth data
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
      console.log("Registering with data:", userData);
      
      const newUser = await AuthService.register(userData);
      setUser(newUser);
      return newUser;
    } catch (err) {
      console.error("Error during registration:", err);
      setError(err.message || "Registration failed");
      // Re-throw the error so it can be caught by components
      throw err;
    } finally {
      setLoading(false);
    }
  };

const login = async (credentials) => {
  try {
    setLoading(true);
    setError(null);
    console.log("Logging in with:", credentials.email);
    
    const loggedInUser = await AuthService.login(credentials);
    console.log("Login response user:", loggedInUser);
    
    // *** CRITICAL: Fetch complete profile data after login ***
    try {
      const completeProfile = await AuthService.verifyToken();
      if (completeProfile) {
        console.log("Setting complete user profile:", completeProfile);
        setUser(completeProfile);
      } else {
        console.log("Verify token failed, using login response");
        setUser(loggedInUser);
      }
    } catch (verifyError) {
      console.log("Profile fetch failed, using login response:", verifyError);
      setUser(loggedInUser);
    }
    
    return loggedInUser;
  } catch (err) {
    console.error("Error during login:", err);
    
    if (axios.isAxiosError(err)) {
      if (err.response) {
        setError(err.response.data?.message || "Invalid credentials");
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Login failed. Please try again.");
      }
    } else {
      setError(err.message || "Login failed. Please try again.");
    }
    
    throw err;
  } finally {
    setLoading(false);
  }
};

  const logout = async () => {
    try {
      console.log("Logging out");
      await AuthService.logout();
      setUser(null);
    } catch (err) {
      console.error("Error during logout:", err);
      setError(err.message);
      // Even if there's an error, still clear the user state
      setUser(null);
      // Ensure localStorage is cleared
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  };

  // Function to update the user context data
  const updateUserContext = async (updatedData) => {
    console.log("Updating user context with:", updatedData);
    
    try {
      if (user && updatedData) {
        // Create the updated user object
        const updatedUser = {
          ...user,
          ...updatedData
        };
        
        console.log("Previous user data:", user);
        console.log("New user data:", updatedUser);
        
        // Update the local state (this triggers re-renders)
        setUser(updatedUser);
        
        // Update the stored user data in localStorage
        AuthService.setCurrentUser(updatedUser);
        
        console.log("User context updated successfully");
        console.log("New profileImageUrl:", updatedUser.profileImageUrl);
        
        return updatedUser;
      }
    } catch (error) {
      console.error("Error updating user context:", error);
      setError(error.message);
      throw error;
    }
  };

  // Helper function to get combined user data
  const getUserData = () => {
    if (!user) return null;
    
    // Add id property for consistency with the previous implementation
    const userData = {
      ...user,
      id: user.id
    };
    
    console.log("User data:", userData);
    return userData;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user: getUserData(), 
      login, 
      logout, 
      register, 
      isAuthenticated,
      updateUserContext,
      error,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};