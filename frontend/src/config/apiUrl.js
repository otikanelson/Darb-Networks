const getApiUrl = () => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.MODE === 'development' || 
                        window.location.hostname === 'localhost';
  
  // Use environment variable or fallback to appropriate URL
  const apiUrl = import.meta.env.VITE_API_URL || 
                 (isDevelopment ? 'http://localhost:5000/api' : 'https://darb-networks-backend.vercel.app/api');
  
  // Remove trailing slash if present
  return apiUrl.replace(/\/$/, '');
};

// Get the base API URL without /api
const getApiBase = () => {
  const fullUrl = getApiUrl();
  return fullUrl.replace(/\/api$/, '');
};

// Export as constants for easy import
export const API_URL = getApiUrl();
export const API_BASE = getApiBase();

// Helper function to build full URLs
export const buildApiUrl = (path) => {
  const base = API_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

// Helper for image URLs (without /api)
export const buildImageUrl = (path) => {
  try {
    // Handle null, undefined, or non-string inputs
    if (!path || typeof path !== 'string') {
      return '/placeholder-campaign.jpg';
    }
    
    // Trim whitespace
    const trimmedPath = path.trim();
    
    // Handle empty strings after trimming
    if (trimmedPath === '') {
      return '/placeholder-campaign.jpg';
    }
    
    // If it's already a complete URL (http:// or https://), return it as is
    if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
      return trimmedPath;
    }
    
    const base = API_BASE;
    const cleanPath = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;
    return `${base}${cleanPath}`;
  } catch (error) {
    console.error('Error in buildImageUrl:', error, 'path:', path);
    return '/placeholder-campaign.jpg';
  }
};

export default {
  API_URL,
  API_BASE,
  buildApiUrl,
  buildImageUrl,
  getApiUrl,
  getApiBase
};