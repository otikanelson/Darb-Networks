// src/services/authService.js - Fixed to handle new backend response format
import ApiService from './apiService';
import { API_ENDPOINTS } from '../config/apiConfig';

class AuthService {
  /**
   * Store auth token in localStorage
   * @param {string} token - JWT token
   */
  static setToken(token) {
    localStorage.setItem('authToken', token);
  }

  /**
   * Remove auth token from localStorage
   */
  static removeToken() {
    localStorage.removeItem('authToken');
  }

  /**
   * Store current user data in localStorage
   * @param {Object} user - User data
   */
  static setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Get current user data from localStorage
   * @returns {Object|null} User data or null if not found
   */
  static getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user && user !== 'null' ? JSON.parse(user) : null;
  }

  /**
   * Remove current user data from localStorage
   */
  static removeCurrentUser() {
    localStorage.removeItem('currentUser');
  }

  /**
   * Log in an existing user
   * @param {Object} credentials - Login credentials (email & password)
   * @returns {Promise<Object>} Promise resolving to the user data with token
   */
  static async login(credentials) {
    try {
      const response = await ApiService.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      console.log("Login API response:", response);
      
      // Handle the new response format from updated backend
      if (response && response.success && response.token && response.data) {
        this.setToken(response.token);
        
        // Convert response to a consistent format for frontend use
        const user = {
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.fullName,
          userType: response.data.userType,
          companyName: response.data.companyName,
          phoneNumber: response.data.phoneNumber,
          address: response.data.address,
          profileImageUrl: response.data.profileImageUrl,
          isActive: response.data.isActive,
          isVerified: response.data.isVerified,
          createdAt: response.data.createdAt
        };
        
        console.log("Processed login user data:", user);
        console.log("Profile image in login:", user.profileImageUrl);
        
        this.setCurrentUser(user);
        return user;
      }
      // Fallback for old response format (if still needed)
      else if (response && response.token) {
        this.setToken(response.token);
        
        const user = {
          id: response.id,
          email: response.email,
          fullName: response.fullName,
          userType: response.userType,
          companyName: response.companyName,
          phoneNumber: response.phoneNumber,
          address: response.address,
          profileImageUrl: response.profileImageUrl,
          isActive: response.isActive,
          isVerified: response.isVerified
        };
        
        this.setCurrentUser(user);
        return user;
      }
      
      throw new Error('Login response missing token or data');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }


  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Promise resolving to the new user data with token
   */
  static async register(userData) {
    try {
      console.log("🚀 FRONTEND: Starting registration with:", userData);
      
      // Convert camelCase to backend format if needed
      const backendData = {
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        userType: userData.userType,
        companyName: userData.companyName || null,
        phoneNumber: userData.phoneNumber || null,
        address: userData.address || null,
        bvn: userData.bvn || null,
        cacNumber: userData.cacNumber || null,
        accountNumber: userData.accountNumber || null,
        bankName: userData.bankName || null
      };
      
      
      const response = await ApiService.post(API_ENDPOINTS.AUTH.REGISTER, backendData);
      
      // The backend now returns: { success: true, data: {...}, token: "..." }
      if (response && response.success && response.token && response.data) {
        
        this.setToken(response.token);
        
        // Convert response to a consistent format for frontend use
        const user = {
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.fullName,
          userType: response.data.userType,
          companyName: response.data.companyName,
          phoneNumber: response.data.phoneNumber,
          address: response.data.address,
          profileImageUrl: response.data.profileImageUrl,
          isActive: response.data.isActive,
          isVerified: response.data.isVerified,
          createdAt: response.data.createdAt
        };
        
        
        this.setCurrentUser(user);
        return user;
      }
      
      throw new Error('Registration response missing required fields (success, token, or data)');
      
    } catch (error) {
      console.error('❌ FRONTEND: Registration failed:', error);
      
      // If it's an API error with response data, try to extract the message
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      
      throw error;
    }
  }

  /**
   * Verify token and get current user profile
   * @returns {Promise<Object|boolean>} Promise resolving to user data or false if invalid
   */
  static async verifyToken() {
    try {
      if (!this.getToken()) {
        return false;
      }
      
      console.log("Verifying token and fetching complete profile...");
      
      // Use the profile endpoint to verify token and get user data
      const response = await ApiService.get(API_ENDPOINTS.AUTH.PROFILE);
      console.log("Verify token response:", response);
      
      // Handle the new response format
      if (response && response.success && response.data) {
        const user = {
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.fullName,
          userType: response.data.userType,
          companyName: response.data.companyName,
          phoneNumber: response.data.phoneNumber,
          address: response.data.address,
          profileImageUrl: response.data.profileImageUrl,
          isActive: response.data.isActive,
          isVerified: response.data.isVerified,
          createdAt: response.data.createdAt
        };
        
        console.log("Complete user profile from verify:", user);
        console.log("Profile image URL from verify:", user.profileImageUrl);
        
        this.setCurrentUser(user);
        return user;
      }
      // Fallback for old response format
      else if (response && response.id) {
        const user = {
          id: response.id,
          email: response.email,
          fullName: response.fullName || response.full_name,
          userType: response.userType || response.user_type,
          companyName: response.companyName || response.company_name,
          phoneNumber: response.phoneNumber || response.phone_number,
          address: response.address,
          profileImageUrl: response.profileImageUrl || response.profile_image_url,
          isActive: response.isActive || response.is_active,
          isVerified: response.isVerified || response.is_verified,
          createdAt: response.createdAt || response.created_at
        };
        
        this.setCurrentUser(user);
        return user;
      }
      
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      // Clear user data on verification failure
      this.logout();
      return false;
    }
  }

  /**
   * Log out the current user
   */
  static logout() {
    // Clear local storage
    this.removeToken();
    this.removeCurrentUser();
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has a token
   */
  static isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Get the authentication token
   * @returns {string|null} The auth token or null if not found
   */
  static getToken() {
    return localStorage.getItem('authToken');
  }
}

export default AuthService;