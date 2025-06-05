// src/components/layout/UnifiedNavbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CustomNav } from '../../hooks/CustomNavigation';
import { 
  Bell, 
  Settings, 
  Plus, 
  ChevronDown,
  LogOut,
  User,
  Heart,
  FileText,
  Home,
  ChevronRight,
  Search,
  X
} from 'lucide-react';

/**
 * UNIFIED NAVBAR COMPONENT with Search
 * Replaces all individual navbar components with a single, configurable one
 */

const Navbars = ({ 
  variant = 'default', // 'default', 'dashboard', 'profile', 'admin', 'display', 'campaigns'
  showCreateButton = true,
  showNavLinks = true,
  showProfileDropdown = true,
  showSearch = false, // New prop for search functionality
  customNavLinks = null,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Campaign categories for search suggestions
  const categories = {
    "Tech & Innovation": [
      "Audio",
      "Tools", 
      "Education",
      "Energy & Green Tech",
      "Fashion & Wearables",
      "Food & Beverages",
      "Health & Fitness",
      "Home",
      "Phones & Accessories",
      "Productivity",
      "Transportation",
      "Travel & Outdoors",
    ],
    "Creative Works": [
      "Art",
      "Comics",
      "Dance & Theater",
      "Film",
      "Music",
      "Photography",
      "Podcasts, Blogs & Vlogs",
      "Tabletop Games", 
      "Video Games",
      "TV series & Shows",
      "Writing & Publishing",
    ],
    "Community Projects": [
      "Culture",
      "Environment",
      "Human Rights",
      "Local Businesses",
      "Wellness",
    ],
  };

  // Flatten categories for search
  const allCategories = Object.values(categories).flat();
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to dashboard with search query
      navigate(`/dashboard?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearchSuggestions(false);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSearchSuggestions(false);
    navigate(`/dashboard?search=${encodeURIComponent(suggestion)}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchSuggestions(false);
  };

  // Filter suggestions based on search query
  const getFilteredSuggestions = () => {
    if (!searchQuery) return [];
    
    const query = searchQuery.toLowerCase();
    const suggestions = [];
    
    // Add matching categories
    allCategories.forEach(category => {
      if (category.toLowerCase().includes(query)) {
        suggestions.push({
          type: 'category',
          text: category,
          label: `Category: ${category}`
        });
      }
    });

    // Add popular search terms
    const popularTerms = ['Technology', 'Healthcare', 'Fintech', 'AI', 'Startup', 'Innovation'];
    popularTerms.forEach(term => {
      if (term.toLowerCase().includes(query) && !suggestions.some(s => s.text === term)) {
        suggestions.push({
          type: 'term',
          text: term,
          label: term
        });
      }
    });

    return suggestions.slice(0, 6); // Limit to 6 suggestions
  };

  // User type checks
  const isFounder = user?.userType?.toLowerCase() === 'founder';
  const isInvestor = user?.userType?.toLowerCase() === 'investor';
  const isAdmin = user?.userType?.toLowerCase() === 'admin';

  // Get navigation links based on variant and user type
  const getNavLinks = () => {
    if (customNavLinks) return customNavLinks;
    
    if (!isAuthenticated()) {
      // Public navigation for non-authenticated users
      return [
        { to: '/dashboard', label: 'Browse Startups' },
        { to: '/register', label: 'For Investors' },
        { to: '/about', label: 'Success Stories' },
        { to: '/about', label: 'Resources' }
      ];
    }

    // Base authenticated links - ADD Dashboard and My Campaigns for default (home) variant
    const baseLinks = [];

    // Add variant-specific links
    switch (variant) {
      case 'default':
        // HOME PAGE - show Dashboard and My Campaigns for authenticated users
        baseLinks.push({ to: '/dashboard', label: 'Dashboard' });
      if (user?.userType !== 'admin') {
        baseLinks.push({ to: '/my-campaigns', label: 'My Campaigns' });
      }
      break;

      case 'dashboard':
        baseLinks.push({ to: '/', label: 'Home' });
        baseLinks.push({ to: '/dashboard', label: 'Dashboard' });
        
        if (isFounder) {
          baseLinks.push({ to: '/my-campaigns', label: 'My Campaigns' });
        } else if (isInvestor) {
          baseLinks.push({ to: '/my-campaigns', label: 'Funded Campaigns' });
        } else if (isAdmin) {
          baseLinks.push({ to: '/admin', label: 'Admin Panel' });
        }
        break;

      case 'profile':
        baseLinks.push({ to: '/', label: 'Home' });
        baseLinks.push({ to: '/dashboard', label: 'Dashboard' });
        
        if (isFounder) {
          baseLinks.push({ to: '/my-campaigns', label: 'My Campaigns' });
        } else if (isInvestor) {
          baseLinks.push({ to: '/my-campaigns', label: 'Funded Campaigns' });
        } else if (isAdmin) {
          baseLinks.push({ to: '/admin', label: 'Admin Panel' });
        }
        break;

      case 'admin':
        baseLinks.push({ to: '/', label: 'Home' });
        baseLinks.push({ to: '/dashboard', label: 'Dashboard' });
        break;

      case 'display':
        baseLinks.push({ to: '/', label: 'Home' });
        baseLinks.push({ to: '/dashboard', label: 'Dashboard' });
        if (user?.userType !== 'admin') {
          baseLinks.push({ to: '/my-campaigns', label: 'My Campaigns' });
        }
        break;

      case 'campaigns':
        baseLinks.push({ to: '/', label: 'Home' });
        baseLinks.push({ to: '/dashboard', label: 'Dashboard' });
        break;

      default:
        // Fallback
        break;
    }

    return baseLinks;
  };

  // Search component
  const SearchBar = () => (
    <div className="relative flex-1 max-w-2xl mx-8" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={() => setShowSearchSuggestions(searchQuery.length > 0)}
            placeholder="Search campaigns, categories, or keywords..."
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-full 
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 
                     bg-white shadow-sm text-gray-900 placeholder-gray-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSearchSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
          {getFilteredSuggestions().length > 0 ? (
            <div className="py-2">
              {getFilteredSuggestions().map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {suggestion.label}
                    </div>
                    {suggestion.type === 'category' && (
                      <div className="text-xs text-gray-500">
                        Browse campaigns in this category
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No suggestions found. Press Enter to search for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Profile dropdown component
  const ProfileDropdown = () => (
    <div className="ml-3 relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      >
        <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
          {user?.profileImageUrl ? (
            <img 
              src={user.profileImageUrl.startsWith('http') 
                ? user.profileImageUrl 
                : `http://localhost:5000${user.profileImageUrl}`
              } 
              alt="Profile" 
              className="h-full w-full object-cover"
              key={user.profileImageUrl}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.querySelector('.fallback-initials').style.display = 'flex';
              }}
            />
          ) : null}
          
          <span 
            className={`text-gray-600 font-medium fallback-initials ${user?.profileImageUrl ? 'hidden' : 'flex'} items-center justify-center`}
          >
            {user?.displayName?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
          </span>
        </div>
        <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
      </button>

      {isDropdownOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user?.displayName || user?.fullName}</p>
            <p className="text-sm font-medium text-gray-500 truncate">{user?.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              Type: {user?.userType === 'founder' ? 'Founder' : user?.userType === 'investor' ? 'Investor' : 'Admin'}
            </p>
          </div>
          
          <Link
            to="/profile"
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsDropdownOpen(false)}
          >
            <User className="mr-3 h-4 w-4 text-gray-500" />
            Profile
          </Link>

          {/* Conditionally render My Favorites and My Campaigns */}
          {user?.userType !== 'admin' && (
            <>
              <Link
                to="/my-campaigns"
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Heart className="mr-3 h-4 w-4 text-gray-500" />
                My Favorites
              </Link>
              <Link
                to="/my-campaigns"
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FileText className="mr-3 h-4 w-4 text-gray-500" />
                My Campaigns
              </Link>
            </>
          )}

          <button
            onClick={() => {
              setIsDropdownOpen(false);
              handleLogout();
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <LogOut className="mr-3 h-4 w-4 text-gray-500" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );

  const navLinks = getNavLinks();

return (
  <nav className={`bg-white border-b border-gray-200 py-1 px-16 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Left: Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img 
              src="/src/assets/Logo.png" 
              alt="Logo" 
              className="h-14 w-auto"
            />
          </Link>
        </div>

        {/* Center: Search Bar (when showSearch is true) */}
        {showSearch && (
          <SearchBar />
        )}

        {/* Center/Left: Navigation Links */}
        {showNavLinks && navLinks.length > 0 && (
          <div className={`hidden md:flex md:space-x-3 ${showSearch ? 'lg:ml-8' : 'md:ml-14'}`}>
            {/* Show max 2 links when search is present, all links when no search */}
            {(showSearch ? navLinks.slice(0, 2) : navLinks).map((link, index) => (
              <Link 
                key={index}
                to={link.to} 
                className={`px-3 py-2 font-bold text-gray-500 hover:text-purple-700 ${
                  showSearch ? 'text-sm' : 'text-md'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center flex-shrink-0">
          {isAuthenticated() ? (
            <>
              {/* Create Campaign Button - Only show for Founders */}
              {showCreateButton && isFounder && (
                <Link
                  to="/pages/CreateCampaign"
                  className="flex items-center mx-3 px-4 py-2 bg-green-700 text-white rounded-3xl 
                           hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Campaign
                </Link>
              )}

              {/* Profile Dropdown */}
              {showProfileDropdown && <ProfileDropdown />}
            </>
          ) : (
            // Logged out view - varies by variant
            <div className="flex items-center space-x-4">
              {variant === 'default' ? (
                // Home page style
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-600 hover:text-purple-700 font-bold"
                  >
                    Login
                  </Link>
                  <Link 
                    className="text-gray-600 hover:text-green-700 font-bold"
                  >
                    /
                  </Link>
                  <Link 
                    to="/Register" 
                    className="text-gray-600 hover:text-purple-700 font-bold"
                  >
                    SignUp
                  </Link>
                  <button 
                    onClick={() => navigate('/Register')}
                    className="bg-green-700 text-white font-bold font-sans px-6 py-2 rounded-full flex items-center space-x-2 hover:bg-green-600 transition-colors"
                  >
                    <span>Join Campaign</span>
                    <ChevronRight size={16} />
                  </button>
                </>
              ) : (
                // Standard login/signup for other variants
                <>
                  <Link to="/login" className="text-gray-500 hover:text-gray-900 font-medium text-sm">
                    Log in
                  </Link>
                  <Link to="/register" className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </nav>
);
};

export default Navbars;