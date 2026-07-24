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
  Lightbulb,
  LogIn,
  UserPlus,
  Bookmark,
} from 'lucide-react';

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

// Separate SearchBar component to prevent re-renders
const SearchBar = React.memo(({ 
  isMobile = false, 
  searchQuery, 
  onSearchQueryChange, 
  onSearch, 
  onClearSearch,
  showSuggestions,
  onShowSuggestions,
  onSuggestionClick,
  searchRef 
}) => {
  // Memoize filtered suggestions
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

  return (
    <div className={`relative ${isMobile ? 'w-full' : 'flex-1 max-w-2xl mx-4 lg:mx-8'}`} ref={searchRef}>
      <form onSubmit={onSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchQueryChange}
            onFocus={() => onShowSuggestions(searchQuery.length > 0)}
            placeholder="Search campaigns, founders..."
            className={`w-full pl-9 sm:pl-12 pr-9 sm:pr-12 ${isMobile ? 'py-2 sm:py-2.5' : 'py-2 sm:py-3'} border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                     bg-white shadow-sm text-gray-900 placeholder-gray-500 text-xs sm:text-base`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Search Suggestions
            </div>
            {filteredSuggestions.map((suggestion, index) => {
              const IconComp = suggestion.IconComponent;
              return (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
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
                  <span>Type <span className="font-mono bg-gray-100 px-1 rounded">founder:John</span></span>
                </p>
                <p className="flex items-start space-x-2">
                  <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-gray-400" />
                  <span>Type <span className="font-mono bg-gray-100 px-1 rounded">location:Kenya</span></span>
                </p>
                <p className="flex items-start space-x-2">
                  <DollarSign className="h-3 w-3 mt-0.5 flex-shrink-0 text-gray-400" />
                  <span>Type <span className="font-mono bg-gray-100 px-1 rounded">goal:50000</span></span>
                </p>
                <p className="flex items-start space-x-2">
                  <Tag className="h-3 w-3 mt-0.5 flex-shrink-0 text-gray-400" />
                  <span>Type <span className="font-mono bg-gray-100 px-1 rounded">tag:innovation</span></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showSuggestions && filteredSuggestions.length === 0 && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="px-4 py-3 text-sm text-gray-500">
            No suggestions found. Press Enter to search for "{searchQuery}"
          </div>
        </div>
      )}
    </div>
  );
});

const Navbars = ({ 
  variant = 'default', 
  showCreateButton = true,
  showNavLinks = true,
  showProfileDropdown = true,
  showSearch = false, 
  customNavLinks = null,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // FAQ bookmark sliver — reads from localStorage
  const [bookmarkSliver, setBookmarkSliver] = useState(null);
  const [sliverDismissed, setSliverDismissed] = useState(false);

  useEffect(() => {
    const sync = () => {
      const ids = JSON.parse(localStorage.getItem('faqBookmarks') || '[]');
      setBookmarkSliver(ids.length > 0 ? ids.length : null);
    };
    sync();
    // Re-sync when another tab writes to localStorage
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

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
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowSearchSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  const handleLogout = async () => {
    try {
      console.log('🚪 Navbar: Logging out...');
      await logout();
      console.log('✅ Navbar: Logout successful, navigating to home');
      setIsSidebarOpen(false);
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
      setIsSidebarOpen(false);
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

  const handleSuggestionClick = React.useCallback((suggestion) => {
    console.log('💡 Navbar: Suggestion clicked:', suggestion);
    
    if (suggestion.isPrefix) {
      setSearchQuery(suggestion.text);
      setShowSearchSuggestions(true);
      return;
    }
    
    setSearchQuery(suggestion.text);
    setShowSearchSuggestions(false);
    setIsSidebarOpen(false);
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
      return [
        { to: '/register', label: 'For Investors' },
        { to: '/about', label: 'Success Stories' },
        { to: '/about', label: 'Resources' }
      ];
    }

    const baseLinks = [];

    switch (variant) {
      case 'default':
        baseLinks.push({ to: '/dashboard', label: 'Dashboard' });
        if (user?.userType !== 'admin') {
          baseLinks.push({ to: '/my-campaigns', label: 'My Campaigns' });
        }
        break;

      case 'dashboard':
        baseLinks.push({ to: '/', label: 'Home' });
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
        break;
    }

    return baseLinks;
  };

  // Helper function to build profile image
  const getProfileImageUrl = () => {
    if (!user?.profileImageUrl) return null;
    const baseUrl = buildImageUrl(user.profileImageUrl);
    const cacheBuster = user.profileImageTimestamp ? `?t=${user.profileImageTimestamp}` : '';
    return cacheBuster ? `${baseUrl}${cacheBuster}` : baseUrl;
  };

  const profileImageUrl = getProfileImageUrl();

  // Profile dropdown component
  const ProfileDropdown = () => {
    return (
      <div className="ml-3 relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 rounded-full"
        >
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
            {profileImageUrl ? (
              <img 
                src={profileImageUrl} 
                alt="Profile" 
                className="h-full w-full object-cover"
                key={profileImageUrl}
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
    <>
      {/* Spacer so fixed navbar doesn't overlap page content */}
      <div className={`${bookmarkSliver && !sliverDismissed ? 'h-[calc(4rem+2rem)]' : 'h-16'} transition-all duration-300`} />

      <div className="fixed top-0 left-0 right-0 z-30">
        <nav className={`bg-white border-b border-gray-200 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo Only */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <img 
                  src="/assets/Logo.png" 
                  alt="Logo" 
                  className="h-9 sm:h-12 md:h-14 w-auto"
                />
              </Link>
            </div>

            {/* Center: Search Bar (desktop only when showSearch is true) */}
            {showSearch && (
              <div className="hidden md:flex flex-1">
                <SearchBar 
                  searchQuery={searchQuery}
                  onSearchQueryChange={handleSearchInputChange}
                  onSearch={handleSearch}
                  onClearSearch={clearSearch}
                  showSuggestions={showSearchSuggestions}
                  onShowSuggestions={setShowSearchSuggestions}
                  onSuggestionClick={handleSuggestionClick}
                  searchRef={searchRef}
                />
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
                  {/* Create Campaign Button - Only show for Founders */}
                  {showCreateButton && isFounder && (
                    <Link
                      to="/pages/CreateCampaign"
                      className="hidden sm:flex items-center px-3 sm:px-4 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-600 transition-colors text-xs sm:text-sm font-medium"
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                      <span className="hidden sm:inline">New Campaign</span>
                    </Link>
                  )}

                  {/* Profile Dropdown (desktop) */}
                  <div className="hidden md:block">
                    {showProfileDropdown && <ProfileDropdown />}
                  </div>
                  
                  {/* Mobile Burger Menu Button */}
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Open Navigation Sidebar"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                </>
              ) : (
                // Logged out Desktop & Mobile View
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
                      to="/register" 
                      className="text-sm text-gray-500 hover:text-purple-700 font-bold"
                    >
                      SignUp
                    </Link>
                    <button 
                      onClick={() => navigate('/register')}
                      className="bg-primary-700 text-white font-bold px-4 lg:px-6 py-2 rounded-md flex items-center space-x-2 hover:bg-primary-600 transition-colors text-sm"
                    >
                      <span className="hidden lg:inline">Join Campaign</span>
                      <span className="lg:hidden">Join</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  
                  {/* Mobile Burger Menu Button for logged out users */}
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Open Navigation Sidebar"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* FAQ bookmark sliver — appears just below navbar when there are saved bookmarks */}
      {bookmarkSliver && !sliverDismissed && (
        <div className="bg-primary-600/95 backdrop-blur-sm px-4 py-1.5 flex items-center justify-between">
          <Link
            to="/faq"
            className="flex items-center gap-2 text-primary-600 hover:text-black/90 transition-colors text-xs font-medium"
          >
            <Bookmark className="h-3 w-3 flex-shrink-0" />
            <span>
              You have {bookmarkSliver} bookmarked FAQ{bookmarkSliver > 1 ? 's' : ''} — view them
            </span>
          </Link>
          <button
            onClick={() => setSliverDismissed(true)}
            className="ml-4 text-white/60 hover:text-white transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      </div>

      {/* ── MOBILE SIDEBAR OVERLAY & PANEL (RIGHT SLIDE) ── */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Semi-transparent backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sliding Sidebar - Positioned on the Right Side */}
        <aside 
          className={`fixed top-0 right-0 bottom-0 w-[82%] max-w-sm bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out transform ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Top Header: Logo Left, Close Button Right */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <Link to="/" onClick={() => setIsSidebarOpen(false)}>
              <img src="/assets/Logo.png" alt="Logo" className="h-8 w-auto" />
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Sidebar Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            {/* Mobile Search inside Sidebar */}
            {showSearch && (
              <div>
                <SearchBar 
                  isMobile={true}
                  searchQuery={searchQuery}
                  onSearchQueryChange={handleSearchInputChange}
                  onSearch={handleSearch}
                  onClearSearch={clearSearch}
                  showSuggestions={showSearchSuggestions}
                  onShowSuggestions={setShowSearchSuggestions}
                  onSuggestionClick={handleSuggestionClick}
                  searchRef={mobileSearchRef}
                />
              </div>
            )}

            {/* Authenticated User Header Card */}
            {isAuthenticated() ? (
              <div className="flex items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 flex-shrink-0">
                  {profileImageUrl ? (
                    <img 
                      src={profileImageUrl} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold text-base">
                      {user?.displayName?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.displayName || user?.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-700 rounded-full capitalize">
                    {user?.userType || 'User'}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Action Button for Founders */}
            {isAuthenticated() && showCreateButton && isFounder && (
              <Link
                to="/pages/CreateCampaign"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center justify-center w-full px-4 py-2.5 bg-primary-700 text-white rounded-lg font-medium text-sm hover:bg-primary-600 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Link>
            )}

            {/* Main Navigation */}
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2 px-2">
                Navigation
              </p>
              <div className="space-y-1">
                <Link
                  to="/"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-primary-700 hover:bg-purple-50 transition-colors"
                >
                  <Home className="h-4 w-4 mr-3 text-gray-400" />
                  Home
                </Link>
                {navLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.to}
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-primary-700 hover:bg-purple-50 transition-colors"
                  >
                    <Folder className="h-4 w-4 mr-3 text-gray-400" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Authenticated User Menu Links */}
            {isAuthenticated() && (
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2 px-2">
                  Account Options
                </p>
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-primary-700 hover:bg-purple-50 transition-colors"
                  >
                    <User className="h-4 w-4 mr-3 text-gray-400" />
                    Profile Settings
                  </Link>

                  {user?.userType !== 'admin' && (
                    <>
                      <Link
                        to="/my-campaigns"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-primary-700 hover:bg-purple-50 transition-colors"
                      >
                        <Heart className="h-4 w-4 mr-3 text-gray-400" />
                        My Favorites
                      </Link>
                      <Link
                        to="/my-campaigns"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-primary-700 hover:bg-purple-50 transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-3 text-gray-400" />
                        My Campaigns
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Area / Auth Controls */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            {isAuthenticated() ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <LogIn className="h-4 w-4 mr-2 text-gray-500" />
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-white bg-primary-700 rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default Navbars;