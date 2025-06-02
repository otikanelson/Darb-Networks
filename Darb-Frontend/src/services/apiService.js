// src/services/apiService.js - Fixed handleResponse method

import { API_ENDPOINTS, REQUEST_TIMEOUT, DEFAULT_HEADERS } from '../config/apiConfig';
import axios from 'axios';

class ApiService {
  /**
   * Get the authentication token from localStorage
   * @returns {string|null} The auth token or null if not found
   */
  static getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Add authorization header to request if token is available
   * @param {Object} headers - The headers object
   * @returns {Object} Headers with Authorization if token exists
   */
  static addAuthHeader(headers = {}) {
    const token = this.getAuthToken();
    return token
      ? { ...headers, Authorization: `Bearer ${token}` }
      : headers;
  }

  /**
   * Handle API response and errors consistently
   * @param {Response} response - The axios response object
   * @returns {Promise} Promise that resolves to parsed response data or rejects with error
   */
  static handleResponse(response) {
    // Axios already parses JSON
    const responseData = response.data;
    
    console.log("🔧 API SERVICE: Full response data:", responseData);
    console.log("🔧 API SERVICE: Response structure:", {
      hasSuccess: 'success' in responseData,
      hasData: 'data' in responseData,
      hasToken: 'token' in responseData,
      hasMessage: 'message' in responseData
    });
    
    if (!response.status || response.status >= 400) {
      // Extract error message from the response structure
      const errorMessage = responseData.message || 'Server error';
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = responseData;
      throw error;
    }
    
    // FOR AUTH ENDPOINTS: Return the full response to preserve success, data, token structure
    if (responseData.success !== undefined && responseData.token !== undefined) {
      console.log("🔧 API SERVICE: Auth endpoint detected, returning full response");
      return responseData; // Return full { success: true, data: {...}, token: "..." }
    }
    
    // FOR OTHER ENDPOINTS: Extract the data from the response structure if available
    // Backend wraps responses in { success: true, message: "...", data: {...} }
    if (responseData.data !== undefined) {
      console.log("🔧 API SERVICE: Non-auth endpoint, returning data portion");
      return responseData.data;
    }
    
    console.log("🔧 API SERVICE: Returning full response as fallback");
    return responseData;
  }

  /**
   * Perform GET request
   * @param {string} url - The API endpoint URL
   * @param {Object} options - Additional fetch options
   * @returns {Promise} Promise that resolves to the API response
   */
  static async get(url, options = {}) {
    const { headers = {}, ...restOptions } = options;
    
    try {
      console.log("GET request with auth headers:", this.addAuthHeader({ ...DEFAULT_HEADERS, ...headers }));
      
      const response = await axios({
        method: 'GET',
        url,
        headers: this.addAuthHeader({ ...DEFAULT_HEADERS, ...headers }),
        ...restOptions,
        timeout: REQUEST_TIMEOUT
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  /**
   * Perform POST request
   * @param {string} url - The API endpoint URL
   * @param {Object} data - The request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise} Promise that resolves to the API response
   */
  static async post(url, data, options = {}) {
    const { headers = {}, ...restOptions } = options;
    
    try {
      console.log("POST request with auth headers:", this.addAuthHeader({ ...DEFAULT_HEADERS, ...headers }));
      console.log("POST request data:", data);
      
      const response = await axios({
        method: 'POST',
        url,
        data,
        headers: this.addAuthHeader({ ...DEFAULT_HEADERS, ...headers }),
        ...restOptions,
        timeout: REQUEST_TIMEOUT
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }

  /**
   * Perform PUT request
   * @param {string} url - The API endpoint URL
   * @param {Object} data - The request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise} Promise that resolves to the API response
   */
  static async put(url, data, options = {}) {
    const { headers = {}, ...restOptions } = options;
    
    try {
      console.log("PUT request with auth headers:", this.addAuthHeader({ ...DEFAULT_HEADERS, ...headers }));
      
      const response = await axios({
        method: 'PUT',
        url,
        data,
        headers: this.addAuthHeader({ ...DEFAULT_HEADERS, ...headers }),
        ...restOptions,
        timeout: REQUEST_TIMEOUT
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  }

  /**
   * Perform DELETE request
   * @param {string} url - The API endpoint URL
   * @param {Object} options - Additional fetch options
   * @returns {Promise} Promise that resolves to the API response
   */
  static async delete(url, options = {}) {
    const { headers = {}, ...restOptions } = options;
    
    try {
      console.log("DELETE request with auth headers:", this.addAuthHeader({ ...DEFAULT_HEADERS, ...headers }));
      
      const response = await axios({
        method: 'DELETE',
        url,
        headers: this.addAuthHeader({ ...DEFAULT_HEADERS, ...headers }),
        ...restOptions,
        timeout: REQUEST_TIMEOUT
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }

  /**
   * Upload file(s) using FormData
   * @param {string} url - The API endpoint URL
   * @param {Object} files - Object with file field names and file objects
   * @param {Object} additionalData - Additional form data to include
   * @param {Object} options - Additional fetch options
   * @returns {Promise} Promise that resolves to the API response
   */
  static async uploadFiles(url, files, additionalData = {}, options = {}) {
    const formData = new FormData();
    
    // Add all files to form data
    Object.entries(files).forEach(([fieldName, fileObj]) => {
      if (Array.isArray(fileObj)) {
        // Handle multiple files for the same field
        fileObj.forEach(file => formData.append(fieldName, file));
      } else {
        // Handle single file
        formData.append(fieldName, fileObj);
      }
    });
    
    // Add any additional data
    Object.entries(additionalData).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });
    
    const { headers = {}, ...restOptions } = options;
    
    try {
      // Log the token being used
      const authHeaders = this.addAuthHeader(headers);
      console.log("File upload with auth headers:", authHeaders);
      
      const response = await axios({
        method: 'POST',
        url,
        data: formData,
        headers: authHeaders,
        ...restOptions,
        timeout: REQUEST_TIMEOUT
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('File upload request failed:', error);
      throw error;
    }
  }
}

export default ApiService;