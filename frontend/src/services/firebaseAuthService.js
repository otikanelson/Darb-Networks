import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  applyActionCode,
  checkActionCode,
  currentUser,
  deleteUser as firebaseDeleteUser,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../config/firebaseConfig';
import ApiService from './apiService';
import { API_ENDPOINTS } from '../config/apiConfig';

class FirebaseAuthService {
  /**
   * Store Firebase ID token in localStorage
   * @param {string} token - Firebase ID token
   */
  static setToken(token) {
    localStorage.setItem('firebaseIdToken', token);
  }

  /**
   * Get Firebase ID token from localStorage
   * @returns {string|null} The Firebase ID token or null
   */
  static getToken() {
    return localStorage.getItem('firebaseIdToken');
  }

  /**
   * Remove Firebase ID token from localStorage
   */
  static removeToken() {
    localStorage.removeItem('firebaseIdToken');
  }

  /**
   * Store current user data in localStorage
   * @param {Object} user - User profile data from backend
   */
  static setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  /**
   * Get current user data from localStorage
   * @returns {Object|null} User profile data or null
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
   * Register a new user with Firebase and backend
   * 
   * Flow:
   * 1. Create user in Firebase (email/password)
   * 2. Get Firebase ID token
   * 3. Send token + profile data to backend
   * 4. Backend creates MySQL profile linked to Firebase UID
   * 
   * @param {Object} userData - Registration data including email, password, fullName, etc.
   * @returns {Promise<Object>} User profile from backend
   */
  static async register(userData) {
    try {
      const { email, password, fullName, companyName, phoneNumber, address, userType, captchaToken } = userData;

      // Step 1: Create user in Firebase
      const firebaseUserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = firebaseUserCredential.user;

      // Step 2: Get Firebase ID token
      const firebaseIdToken = await firebaseUser.getIdToken();
      this.setToken(firebaseIdToken);

      // Step 3: Create profile on backend
      const backendData = {
        fullName,
        companyName: companyName || null,
        phoneNumber: phoneNumber || null,
        address: address || null,
        userType: userType || 'investor', // Default to investor for self-registration
        captchaToken: captchaToken || null
      };

      // Send token in Authorization header - backend will verify it
      const headers = {
        'Authorization': `Bearer ${firebaseIdToken}`
      };

      const response = await ApiService.post(API_ENDPOINTS.AUTH.REGISTER, backendData, { headers });

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
          isEmailVerified: response.data.isEmailVerified,
          createdAt: response.data.createdAt
        };
        this.setCurrentUser(user);
        return user;
      }
      throw new Error('Backend registration failed');
    } catch (error) {
      console.error('Registration error:', error);

      // Clean up Firebase user if backend registration fails
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        try {
          await firebaseDeleteUser(firebaseUser);
        } catch (cleanupError) {
          console.error('Failed to clean up Firebase user:', cleanupError);
        }
      }

      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email already in use. Please log in instead.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password too weak. Please use a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  /**
   * Log in an existing user with Firebase
   * 
   * Flow:
   * 1. Authenticate with Firebase (email/password)
   * 2. Get Firebase ID token
   * 3. Send token to backend to get profile
   * 
   * @param {Object} credentials - Login credentials (email, password)
   * @returns {Promise<Object>} User profile from backend
   */
  static async login(credentials) {
    try {
      const { email, password } = credentials;

      // Step 1: Sign in with Firebase
      const firebaseUserCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = firebaseUserCredential.user;

      // Step 2: Get Firebase ID token
      const firebaseIdToken = await firebaseUser.getIdToken();
      this.setToken(firebaseIdToken);

      // Step 3: Get user profile from backend
      const headers = {
        'Authorization': `Bearer ${firebaseIdToken}`
      };

      const response = await ApiService.post(API_ENDPOINTS.AUTH.LOGIN, {}, { headers });

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
          isEmailVerified: response.data.isEmailVerified,
          createdAt: response.data.createdAt
        };
        this.setCurrentUser(user);
        return user;
      }
      throw new Error('Failed to retrieve profile');
    } catch (error) {
      console.error('Login error:', error);

      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many login attempts. Please try again later.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  /**
   * Verify token and get current user profile
   * @returns {Promise<Object|false>} User profile or false if invalid
   */
  static async verifyToken() {
    try {
      const firebaseIdToken = this.getToken();
      if (!firebaseIdToken) return false;

      const headers = {
        'Authorization': `Bearer ${firebaseIdToken}`
      };

      const response = await ApiService.get(API_ENDPOINTS.AUTH.PROFILE, { headers });

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
          isEmailVerified: response.data.isEmailVerified,
          createdAt: response.data.createdAt
        };
        this.setCurrentUser(user);
        return user;
      }
      return false;
    } catch (error) {
      console.error('Token verification error:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Send email verification to current user
   * @returns {Promise<void>}
   */
  static async sendEmailVerification() {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('No user logged in');
      }

      await sendEmailVerification(firebaseUser);
      console.log('Email verification sent');
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Verify email after user clicks email link
   * @returns {Promise<void>}
   */
  static async verifyEmail() {
    try {
      const firebaseIdToken = this.getToken();
      if (!firebaseIdToken) {
        throw new Error('Not authenticated');
      }

      const headers = {
        'Authorization': `Bearer ${firebaseIdToken}`
      };

      const response = await ApiService.post(
        API_ENDPOINTS.AUTH.VERIFY_EMAIL,
        {},
        { headers }
      );

      if (response && response.success) {
        // Update local user data
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          currentUser.isEmailVerified = true;
          this.setCurrentUser(currentUser);
        }
        return response.data;
      }
      throw new Error('Email verification failed');
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Log out the current user
   */
  static async logout() {
    try {
      // Sign out from Firebase
      await signOut(auth);
    } catch (error) {
      console.error('Firebase sign out error:', error);
    } finally {
      // Clear local storage regardless
      this.removeToken();
      this.removeCurrentUser();
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has a valid token
   */
  static isAuthenticated() {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  /**
   * Listen to Firebase auth state changes
   * @param {Function} callback - Function to call with auth state
   * @returns {Function} Unsubscribe function
   */
  static onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Get current Firebase user
   * @returns {Object|null} Firebase user object or null
   */
  static getCurrentFirebaseUser() {
    return auth.currentUser;
  }

  /**
   * Sign in with Google
   * @returns {Promise<Object>} User profile from backend or redirect to register
   */
  static async signInWithGoogle() {
    try {
      const firebaseUserCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = firebaseUserCredential.user;

      // Get Firebase ID token
      const firebaseIdToken = await firebaseUser.getIdToken();
      this.setToken(firebaseIdToken);

      // Try to log in (get existing profile)
      const headers = {
        'Authorization': `Bearer ${firebaseIdToken}`
      };

      try {
        const response = await ApiService.post(
          API_ENDPOINTS.AUTH.LOGIN,
          {},
          { headers }
        );

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
            isEmailVerified: response.data.isEmailVerified,
            createdAt: response.data.createdAt
          };
          this.setCurrentUser(user);
          return user;
        }
      } catch (loginError) {
        // If 401, user profile doesn't exist - redirect to registration
        if (loginError.response?.status === 401) {
          throw new Error('PROFILE_NOT_FOUND');
        }
        throw loginError;
      }

      throw new Error('Failed to retrieve profile');
    } catch (error) {
      console.error('Google sign in error:', error);
      if (error.message === 'PROFILE_NOT_FOUND') {
        throw new Error('profile_not_found');
      }
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign in cancelled.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign in popup was blocked. Please allow popups.');
      }
      throw error;
    }
  }

  /**
   * Sign in with Facebook
   * @returns {Promise<Object>} User profile from backend
   */
  static async signInWithFacebook() {
    try {
      const firebaseUserCredential = await signInWithPopup(auth, facebookProvider);
      const firebaseUser = firebaseUserCredential.user;

      // Get Firebase ID token
      const firebaseIdToken = await firebaseUser.getIdToken();
      this.setToken(firebaseIdToken);

      // Create or get profile from backend
      const headers = {
        'Authorization': `Bearer ${firebaseIdToken}`
      };

      const response = await ApiService.post(
        API_ENDPOINTS.AUTH.LOGIN,
        {},
        { headers }
      );

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
          isEmailVerified: response.data.isEmailVerified,
          createdAt: response.data.createdAt
        };
        this.setCurrentUser(user);
        return user;
      }
      throw new Error('Failed to retrieve profile');
    } catch (error) {
      console.error('Facebook sign in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign in cancelled.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign in popup was blocked. Please allow popups.');
      }
      throw error;
    }
  }
}

export default FirebaseAuthService;
