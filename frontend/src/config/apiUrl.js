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
  if (!path) return '';
  // Already a full URL (e.g. Cloudinary), return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = API_BASE;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

export default {
  API_URL,
  API_BASE,
  buildApiUrl,
  buildImageUrl,
  getApiUrl,
  getApiBase
};