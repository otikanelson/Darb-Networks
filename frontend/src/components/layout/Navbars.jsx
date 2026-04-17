import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CustomNav } from '../../hooks/CustomNavigation';
import { buildImageUrl } from '../../config/apiUrl';
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
  X,
  Menu,
  Folder,
  MapPin,
  DollarSign,
  Tag,
  TrendingUp,
  Lightbulb
} from 'lucide-react';

/**
 * UNIFIED NAVBAR COMPONENT with Search
 * Replaces all individual navbar components with a single, configurable one
 */

// Campaign categories - defined outside component to prevent re-creation
const CATEGORIES = {
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
    "Business & Finance",
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

// Flatten categories once
const ALL_CATEGORIES = Object.values(CATEGORIES).flat();

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Debug: Log when user context changes
  useEffect(() => {
    console.log('Navbar: User context updated:', {
      profileImageUrl: user?.profileImageUrl,
      profileImageTimestamp: user?.profileImageTimestamp,
      fullName: user?.fullName
    });
  }, [user?.profileImageUrl, user?.profileImageTimestamp]);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchSuggestions(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      console.log('🚪 Navbar: Logging out...');
      await logout();
      console.log('✅ Navbar: Logout successful, navigating to home');
      navigate('/');
    } catch (error) {
      console.error('❌ Navbar: Error logging out:', error);
    }
  };

  // Handle search
  const handleSearch = React.useCallback((e) => {
    e.preventDefault();
    console.log('🔍 Navbar: Search submitted:', searchQuery);
    if (searchQuery.trim()) {
      const searchUrl = `/dashboard?search=${encodeURIComponent(searchQuery.trim())}`;
      console.log('  - Navigating to:', searchUrl);
      navigate(searchUrl);
      setSearchQuery('');
      setShowSearchSuggestions(false);
    }
  }, [searchQuery, navigate]);

  const handleSearchInputChange = React.useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchSuggestions(value.length > 0);
  }, []);

  // Memoize filtered suggestions to prevent unnecessary recalculations
  const filteredSuggestions = React.useMemo(() => {
    if (!searchQuery) return [];
    
    const query = searchQuery.toLowerCase();
    const suggestions = [];
    
    // Add matching categories
    ALL_CATEGORIES.forEach(category => {
      if (category.toLowerCase().includes(query)) {
        suggestions.push({
          type: 'category',
          text: category,
          label: `Category: ${category}`,
          IconComponent: Folder
        });
      }
    });

    // Add search type suggestions
    const searchTypes = [
      { prefix: 'founder:', label: 'Search by founder name', IconComponent: User },
      { prefix: 'location:', label: 'Search by location', IconComponent: MapPin },
      { prefix: 'goal:', label: 'Search by funding goal', IconComponent: DollarSign },
      { prefix: 'tag:', label: 'Search by keyword/tag', IconComponent: Tag }
    ];

    searchTypes.forEach(({ prefix, label, IconComponent }) => {
      if (prefix.includes(query) || label.toLowerCase().includes(query)) {
        suggestions.push({
          type: 'searchType',
          text: prefix,
          label: label,
          IconComponent: IconComponent,
          isPrefix: true
        });
      }
    });

    // Add popular search terms
    const popularTerms = [
      'Technology', 'Healthcare', 'Fintech', 'AI', 'Startup', 
      'Innovation', 'Agriculture', 'Education', 'Renewable Energy'
    ];
    popularTerms.forEach(term => {
      if (term.toLowerCase().includes(query) && !suggestions.some(s => s.text === term)) {
        suggestions.push({
          type: 'term',
          text: term,
          label: term,
          IconComponent: TrendingUp
        });
      }
    });

    return suggestions.slice(0, 8);
  }, [searchQuery]);

  const handleSuggestionClick = React.useCallback((suggestion) => {
    console.log('💡 Navbar: Suggestion clicked:', suggestion);
    
    // If it's a prefix suggestion, just add it to the search box
    if (suggestion.isPrefix) {
      setSearchQuery(suggestion.text);
      setShowSearchSuggestions(true);
      return;
    }
    
    setSearchQuery(suggestion.text);
    setShowSearchSuggestions(false);
    const searchUrl = `/dashboard?search=${encodeURIComponent(suggestion.text)}`;
    console.log('  - Navigating to:', searchUrl);
    navigate(searchUrl);
  }, [navigate]);

  const clearSearch = React.useCallback(() => {
    setSearchQuery('');
    setShowSearchSuggestions(false);
  }, []);

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
        // no self-link to /dashboard
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

  // Search component - Memoized to prevent re-renders
  const SearchBar = React.useMemo(() => {
    const Component = ({ isMobile = false }) => (
      <div className={`relative ${isMobile ? 'w-full' : 'flex-1 max-w-2xl mx-4 lg:mx-8'}`} ref={isMobile ? null : searchRef}>
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => setShowSearchSuggestions(searchQuery.length > 0)}
              placeholder="Search campaigns, founders, categories, or use founder:, location:, goal:, tag:"
              className={`w-full pl-9 sm:pl-12 pr-9 sm:pr-12 ${isMobile ? 'py-2.5' : 'py-2 sm:py-3'} border border-gray-300 rounded-full 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                       bg-white shadow-sm text-gray-900 placeholder-gray-500 text-sm sm:text-base`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
        </form>

        {/* Search Suggestions Dropdown */}
        {showSearchSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            {filteredSuggestions.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Search Suggestions
                </div>
                {filteredSuggestions.map((suggestion, index) => {
                  const IconComp = suggestion.IconComponent;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-start space-x-3 transition-colors"
                    >
                      <IconComp className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {suggestion.label}
                        </div>
                        {suggestion.type === 'category' && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Browse campaigns in this category
                          </div>
                        )}
                        {suggestion.type === 'searchType' && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Type "{suggestion.text}" followed by your search term
                          </div>
                        )}
                        {suggestion.type === 'term' && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Search for campaigns related to {suggestion.text.toLowerCase()}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
                <div className="px-4 py-3 border-t border-gray-100 mt-2">
                  <div className="text-xs text-gray-600 space-y-1.5">
                    <div className="flex items-center space-x-2 font-semibold text-primary-700">
                      <Lightbulb className="h-4 w-4" />
                      <span>Search Tips:</span>
                    </div>
                    <p className="flex items-start space-x-2">
                      <User className="h-3 w-3 mt-0.5 flex-shrink-0 text-gray-400" />
                      <span>Type <span className="font-mono bg-gray-100 px-1 rounded">founder:John</span> to search by founder name</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-gray-400" />
                      <span>Type <span className="font-mono bg-gray-100 px-1 rounded">location:Kenya</span> to search by location</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <DollarSign className="h-3 w-3 mt-0.5 flex-shrink-0 text-gray-400" />
                      <span>Type <span className="font-mono bg-gray-100 px-1 rounded">goal:50000</span> to find campaigns by funding goal</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <Tag className="h-3 w-3 mt-0.5 flex-shrink-0 text-gray-400" />
                      <span>Type <span className="font-mono bg-gray-100 px-1 rounded">tag:innovation</span> to search by keywords</span>
                    </p>
                  </div>
                </div>
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
    return Component;
  }, [searchQuery, showSearchSuggestions, filteredSuggestions, handleSearch, handleSearchInputChange, handleSuggestionClick, clearSearch]);

  // Profile dropdown component
  const ProfileDropdown = () => {
    // Add cache-busting timestamp to profile image URL
    const getProfileImageUrl = () => {
      console.log('🖼️ ProfileDropdown: Building profile image URL');
      console.log('  - user.profileImageUrl:', user?.profileImageUrl);
      console.log('  - user.profileImageTimestamp:', user?.profileImageTimestamp);
      
      if (!user?.profileImageUrl) {
        console.log('  ❌ No profile image URL found');
        return null;
      }
      
      const baseUrl = buildImageUrl(user.profileImageUrl);
      console.log('  - baseUrl:', baseUrl);
      
      const cacheBuster = user.profileImageTimestamp ? `?t=${user.profileImageTimestamp}` : '';
      console.log('  - cacheBuster:', cacheBuster);
      
      const finalUrl = cacheBuster ? `${baseUrl}${cacheBuster}` : baseUrl;
      console.log('  ✅ Final URL:', finalUrl);
      
      return finalUrl;
    };

    const profileImageUrl = getProfileImageUrl();

    return (
      <div className="ml-3 relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
            {profileImageUrl ? (
              <img 
                src={profileImageUrl} 
                alt="Profile" 
                className="h-full w-full object-cover"
                key={profileImageUrl}
                onLoad={() => console.log('Γ£à Navbar: Profile image loaded successfully')}
                onError={(e) => {
                  console.error('Γ¥î Navbar: Profile image failed to load:', profileImageUrl);
                  e.target.style.display = 'none';
                  e.target.parentNode.querySelector('.fallback-initials').style.display = 'flex';
                }}
              />
            ) : null}
            
            <span 
              className={`text-gray-600 font-medium fallback-initials ${profileImageUrl ? 'hidden' : 'flex'} items-center justify-center`}
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
};

  const navLinks = getNavLinks();

  return (
    <nav className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img 
                src="/assets/Logo.png" 
                alt="Logo" 
                className="h-10 sm:h-12 md:h-14 w-auto"
              />
            </Link>
          </div>

          {/* Center: Search Bar (desktop only when showSearch is true) */}
          {showSearch && (
            <div className="hidden md:flex flex-1">
              <SearchBar />
            </div>
          )}

          {/* Center/Right: Navigation Links (desktop) */}
          {showNavLinks && navLinks.length > 0 && (
            <div className={`hidden lg:flex lg:space-x-2 xl:space-x-3 ${showSearch ? 'lg:ml-4' : 'lg:ml-8'}`}>
              {(showSearch ? navLinks.slice(0, 2) : navLinks).map((link, index) => (
                <Link 
                  key={index}
                  to={link.to} 
                  className="px-2 xl:px-3 py-2 font-bold text-gray-500 hover:text-purple-700 text-sm whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isAuthenticated() ? (
              <>
                {/* Create Campaign Button - Only show for Founders (hidden on small mobile) */}
                {showCreateButton && isFounder && (
                  <Link
                    to="/pages/CreateCampaign"
                    className="hidden sm:flex items-center px-3 sm:px-4 py-2 bg-primary-700 text-white rounded-full 
                             hover:bg-primary-600 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">New Campaign</span>
                  </Link>
                )}

                {/* Profile Dropdown (desktop) */}
                <div className="hidden md:block">
                  {showProfileDropdown && <ProfileDropdown />}
                </div>

                {/* Mobile Menu Button (authenticated) */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </>
            ) : (
              // Logged out view
              <>
                {variant === 'default' ? (
                  // Home page style
                  <>
                    <div className="hidden sm:flex items-center space-x-3">
                      <Link 
                        to="/login" 
                        className="text-sm text-gray-500 hover:text-purple-700 font-bold"
                      >
                        Login
                      </Link>
                      <span className="text-gray-500 font-bold">/</span>
                      <Link 
                        to="/Register" 
                        className="text-sm text-gray-500 hover:text-purple-700 font-bold"
                      >
                        SignUp
                      </Link>
                      <button 
                        onClick={() => navigate('/Register')}
                        className="bg-primary-700 text-white font-bold px-4 lg:px-6 py-2 rounded-full flex items-center space-x-2 hover:bg-primary-600 transition-colors text-sm"
                      >
                        <span className="hidden lg:inline">Join Campaign</span>
                        <span className="lg:hidden">Join</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                    {/* Mobile buttons */}
                    <div className="flex sm:hidden items-center space-x-2">
                      <Link 
                        to="/login" 
                        className="text-xs text-gray-500 hover:text-purple-700 font-bold px-2 py-1"
                      >
                        Login
                      </Link>
                      <button 
                        onClick={() => navigate('/Register')}
                        className="bg-primary-700 text-white font-bold px-3 py-1.5 rounded-full text-xs hover:bg-primary-600 transition-colors"
                      >
                        Sign Up
                      </button>
                    </div>
                  </>
                ) : (
                  // Standard login/signup for other variants
                  <>
                    <div className="hidden sm:flex items-center space-x-3">
                      <Link to="/login" className="text-gray-500 hover:text-gray-900 font-medium text-sm">
                        Log in
                      </Link>
                      <Link to="/register" className="bg-primary-700 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium">
                        Sign up
                      </Link>
                    </div>
                    {/* Mobile buttons */}
                    <div className="flex sm:hidden items-center space-x-2">
                      <Link to="/login" className="text-xs text-gray-500 hover:text-gray-900 font-medium px-2 py-1">
                        Log in
                      </Link>
                      <Link to="/register" className="bg-primary-700 text-white px-3 py-1.5 rounded-md hover:bg-purple-700 transition-colors text-xs font-medium">
                        Sign up
                      </Link>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Bar (when showSearch is true) */}
        {showSearch && (
          <div className="md:hidden pb-3">
            <SearchBar isMobile={true} />
          </div>
        )}
      </div>

      {/* Mobile Menu (authenticated users) */}
      {isAuthenticated() && isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden border-t border-gray-200 bg-white shadow-lg"
        >
          <div className="px-4 pt-2 pb-3 space-y-1">
            {/* Profile Section */}
            <div className="flex items-center px-3 py-3 border-b border-gray-100 mb-2">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 flex-shrink-0">
                {user?.profileImageUrl ? (
                  <img 
                    src={buildImageUrl(user.profileImageUrl)} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 font-medium text-sm">
                    {user?.displayName?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.displayName || user?.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Navigation Links */}
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                {link.label}
              </Link>
            ))}

            {/* Create Campaign (mobile - founders only) */}
            {showCreateButton && isFounder && (
              <Link
                to="/pages/CreateCampaign"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-primary-700 hover:bg-primary-50"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Campaign
              </Link>
            )}

            {/* Profile Links */}
            <Link
              to="/profile"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              <User className="h-5 w-5 mr-2 text-gray-500" />
              Profile
            </Link>

            {user?.userType !== 'admin' && (
              <>
                <Link
                  to="/my-campaigns"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <Heart className="h-5 w-5 mr-2 text-gray-500" />
                  My Favorites
                </Link>
                <Link
                  to="/my-campaigns"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <FileText className="h-5 w-5 mr-2 text-gray-500" />
                  My Campaigns
                </Link>
              </>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbars;
