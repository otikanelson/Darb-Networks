import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UnifiedNavbar from "../components/layout/Navbars";
import Footer from "../components/layout/Footer";
import MobileFilters from "../components/MobileFilters";
import CampaignCard from "../components/ui/CampaignCard";
import CampaignService from "../services/campaignService";

import {
  Search,
  Grid,
  List,
  ChevronDown,
  Plus,
  Clock,
  CheckCircle,
  Filter,
  Calendar,
  Eye,
  Heart,
  PenLine,
  DollarSign,
  FileText,
  Edit,
  ArrowUpDown,
  Loader,
  X,
  SlidersHorizontal,
  MapPin,
  Building,
  User
} from "lucide-react";
import { CustomNav } from "../hooks/CustomNavigation";

// Campaign Skeleton Loader Component
const CampaignSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="h-48 bg-gray-200 w-full"></div>
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="h-6 bg-gray-200 rounded-full w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded-full w-1/5"></div>
      </div>
      <div className="h-7 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
      <div className="h-2 bg-gray-200 rounded-full mb-3"></div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="h-6 bg-gray-200 rounded mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div>
          <div className="h-6 bg-gray-200 rounded mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div>
          <div className="h-6 bg-gray-200 rounded mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  // URL search params for handling search and filters
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Basic state variables
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedFilter, setSelectedFilter] = useState("All Campaigns");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("Date Posted");
  const [searchTerm, setSearchTerm] = useState("");
  const { user, isAuthenticated } = useAuth();
  const navigate = CustomNav();

  // Enhanced filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [limit, setLimit] = useState(12);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState("");
  const [error, setError] = useState(null);

  // Define user types
  const isFounder = user && user.userType && user.userType.toLowerCase() === "founder";
  const isInvestor = user && user.userType && user.userType.toLowerCase() === "investor";

  // Enhanced categories with proper mapping
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

  // Flatten all categories for search
  const allCategories = Object.values(categories).flat();

  // Filter options
  const filterOptions = [
    { id: "all", label: "All Campaigns" },
    { id: "goal-reached", label: "Goal Reached" },
    { id: "goal-unreached", label: "Goal Unreached" },
    { id: "active", label: "Active" },
    { id: "featured", label: "Featured" },
  ];

  const stageFilterOptions = [
    { label: "All Stages", value: "" },
    { label: "Concept", value: "concept" },
    { label: "Prototype", value: "prototype" },
    { label: "MVP", value: "mvp" },
    { label: "Market", value: "market" },
    { label: "Scaling", value: "scaling" },
  ];

  // Initialize from URL params
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    const categoryFromUrl = searchParams.get('category') || 'All Categories';
    const filterFromUrl = searchParams.get('filter') || 'All Campaigns';
    
    setSearchTerm(searchFromUrl);
    setSelectedCategory(categoryFromUrl);
    setSelectedFilter(filterFromUrl);
  }, [searchParams]);

  // Load campaigns
  useEffect(() => {
    loadCampaigns();
  }, []);

  // Apply filters and search whenever data or filters change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [campaigns, selectedCategory, selectedFilter, searchTerm, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedFilter, searchTerm, sortBy]);

  const loadCampaigns = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading campaigns...');
      
      const response = await fetch('http://localhost:5000/api/campaigns');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📦 Campaigns loaded:', result);
      
      const campaignData = result.success ? result.data : result;
      setCampaigns(campaignData || []);
      setTotalCampaigns(campaignData?.length || 0);
      
    } catch (error) {
      console.error('❌ Load campaigns error:', error);
      setError('Failed to load campaigns: ' + error.message);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...campaigns];

    console.log('🔧 Applying filters:', { 
      searchTerm, 
      selectedCategory, 
      selectedFilter, 
      totalCampaigns: campaigns.length 
    });

    // Apply search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(campaign => 
        campaign.title?.toLowerCase().includes(query) ||
        campaign.description?.toLowerCase().includes(query) ||
        campaign.category?.toLowerCase().includes(query) ||
        campaign.founder_name?.toLowerCase().includes(query) ||
        campaign.location?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== "All Categories") {
      // Check if it's a main category or subcategory
      if (Object.keys(categories).includes(selectedCategory)) {
        // Main category - include all subcategories
        const subcategories = categories[selectedCategory];
        filtered = filtered.filter(campaign => 
          subcategories.includes(campaign.category)
        );
      } else {
        // Specific subcategory
        filtered = filtered.filter(campaign => 
          campaign.category === selectedCategory
        );
      }
    }

    // Apply status filter
    if (selectedFilter && selectedFilter !== "All Campaigns") {
      switch (selectedFilter) {
        case "Goal Reached":
          filtered = filtered.filter(campaign => 
            (campaign.current_amount || 0) >= (campaign.target_amount || 1)
          );
          break;
        case "Goal Unreached":
          filtered = filtered.filter(campaign => 
            (campaign.current_amount || 0) < (campaign.target_amount || 1)
          );
          break;
        case "Active":
          filtered = filtered.filter(campaign => 
            campaign.status === 'approved' && 
            (campaign.current_amount || 0) < (campaign.target_amount || 1)
          );
          break;
        case "Featured":
          filtered = filtered.filter(campaign => {
            // Handle different possible field names for featured status
            return campaign.is_featured === true || 
                   campaign.is_featured === 1 || 
                   campaign.isFeatured === true ||
                   campaign.featured === true;
          });
          break;
      }
    }

    // Apply sorting
    switch (sortBy) {
      case "Most Funded":
        filtered.sort((a, b) => (b.current_amount || 0) - (a.current_amount || 0));
        break;
      case "End Date":
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "Date Posted":
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    setFilteredCampaigns(filtered);
    setFilteredCount(filtered.length);
    setTotalPages(Math.ceil(filtered.length / limit));

    console.log('✅ Filters applied:', {
      original: campaigns.length,
      filtered: filtered.length,
      pages: Math.ceil(filtered.length / limit)
    });
  };

  const handleFavoriteToggle = async (campaignId) => {
    try {
      return await CampaignService.toggleFavorite(campaignId);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      return false;
    }
  };

  const handleViewClick = async (campaignId) => {
    try {
      await CampaignService.trackView(campaignId);
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateURLParams({ search: value });
  };

  const clearSearch = () => {
    setSearchTerm("");
    updateURLParams({ search: null });
  };

  // Update URL parameters
  const updateURLParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'All Categories' || value === 'All Campaigns') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    setSearchParams(newParams);
  };

  // Handle filter changes
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    updateURLParams({ filter: filter });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    updateURLParams({ category: category });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate progress percentage
  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100);
  };

  // Get current page campaigns
  const getCurrentPageCampaigns = () => {
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredCampaigns.slice(startIndex, endIndex);
  };

  // Pagination component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center my-8">
        <nav className="flex items-center">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-md mr-2 border border-gray-300 
                   bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else {
                const startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(totalPages, startPage + 4);
                pageNum = startPage + i;
                if (pageNum > endPage) return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 flex items-center justify-center rounded-md 
                          ${
                            currentPage === pageNum
                              ? "bg-green-600 text-white font-medium"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="w-10 h-10 flex items-center justify-center">
                ...
              </span>
            )}

            {totalPages > 5 && currentPage < totalPages - 1 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="w-10 h-10 flex items-center justify-center rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              >
                {totalPages}
              </button>
            )}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-md ml-2 border border-gray-300 
                   bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      </div>
    );
  };

  // Enhanced Category Filter component
  const CategoryFilter = () => (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="font-bold text-gray-900 mb-4">Categories</h3>

      <div className="space-y-3">
        <button
          className={`text-sm w-full text-left ${
            selectedCategory === "All Categories"
              ? "text-green-600 font-medium"
              : "text-gray-700"
          }`}
          onClick={() => handleCategoryChange("All Categories")}
        >
          All Categories
        </button>

        {Object.entries(categories).map(([group, subcategories]) => (
          <div key={group} className="space-y-2">
            <button
              className={`text-sm font-medium w-full text-left flex items-center justify-between ${
                selectedCategory === group ? "text-green-600" : "text-gray-900"
              }`}
              onClick={() => {
                handleCategoryChange(group);
                setCategoryMenuOpen((prev) => (prev === group ? null : group));
              }}
            >
              <span>{group}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  categoryMenuOpen === group ? "rotate-180" : ""
                }`}
              />
            </button>

            {categoryMenuOpen === group && (
              <div className="ml-4 space-y-2">
                {subcategories.map((category) => (
                  <button
                    key={category}
                    className={`text-sm block w-full text-left ${
                      selectedCategory === category
                        ? "text-green-600 font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Enhanced ListView Component
  const EnhancedListView = ({ campaigns }) => (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => navigate(`/campaign/${campaign.id}`)}
        >
          <div className="flex">
            {/* Campaign Image */}
            <div className="w-64 h-48 flex-shrink-0 relative">
              <img
                src={campaign.main_image_url 
                  ? `http://localhost:5000${campaign.main_image_url}`
                  : '/placeholder-campaign.jpg'
                }
                alt={campaign.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/placeholder-campaign.jpg";
                }}
              />
              
              {/* Status Badges */}
              <div className="absolute top-3 left-3 flex flex-col space-y-1">
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  {campaign.category}
                </span>
                {campaign.is_featured && (
                  <span className="bg-yellow-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                    FEATURED
                  </span>
                )}
                {calculateProgress(campaign.current_amount, campaign.target_amount) >= 100 && (
                  <span className="bg-green-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                    FUNDED
                  </span>
                )}
              </div>
            </div>

            {/* Campaign Content */}
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {campaign.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {campaign.location}
                  </div>
                </div>
                
                {/* View Count */}
                <div className="text-sm text-gray-500 flex items-center ml-4">
                  <Eye className="h-4 w-4 mr-1" />
                  {campaign.view_count || 0}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {campaign.description}
              </p>

              {/* Progress Section */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(calculateProgress(campaign.current_amount, campaign.target_amount))}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${calculateProgress(campaign.current_amount, campaign.target_amount)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(campaign.current_amount || 0)}
                  </span>
                  <span className="text-gray-500">
                    of {formatCurrency(campaign.target_amount)}
                  </span>
                </div>
              </div>

              {/* Footer with Creator Info */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center">
                  {/* Creator Avatar */}
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-medium overflow-hidden mr-3">
                    {campaign.founder_avatar ? (
                      <img
                        src={campaign.founder_avatar.startsWith('http') 
                          ? campaign.founder_avatar 
                          : `http://localhost:5000${campaign.founder_avatar}`
                        }
                        alt={campaign.founder_name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.querySelector('.founder-initials').style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span 
                      className={`founder-initials text-gray-600 font-medium text-sm ${
                        campaign.founder_avatar ? 'hidden' : 'flex'
                      } items-center justify-center h-full w-full`}
                    >
                      {(campaign.founder_name || 'Anonymous').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {campaign.founder_name || "Anonymous"}
                    </div>
                    {campaign.founder_company && (
                      <div className="text-xs text-gray-500 flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {campaign.founder_company}
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Heart className="h-3 w-3 mr-1" />
                    {campaign.favorite_count || 0}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCampaigns = () => {
    const currentCampaigns = getCurrentPageCampaigns();

    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <CampaignSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto h-16 w-16 text-red-400">
            <SlidersHorizontal className="h-10 w-10 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Campaigns
          </h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => loadCampaigns(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (currentCampaigns.length === 0) {
      return (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="mx-auto h-16 w-16 text-gray-400">
            <Filter className="h-10 w-10 mx-auto" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No campaigns found
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            {searchTerm || selectedCategory !== "All Categories" || selectedFilter !== "All Campaigns"
              ? "No campaigns match your current filters. Try adjusting your search or filters."
              : "No campaigns available at the moment. Check back later."}
          </p>
          
          {(searchTerm || selectedCategory !== "All Categories" || selectedFilter !== "All Campaigns") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All Categories");
                setSelectedFilter("All Campaigns");
                updateURLParams({ search: null, category: null, filter: null });
              }}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      );
    }

    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onFavoriteToggle={handleFavoriteToggle}
              onViewClick={handleViewClick}
            />
          ))}
        </div>
      );
    } else {
      return <EnhancedListView campaigns={currentCampaigns} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar variant="dashboard" />

      {/* Hero Section */}
      <div className="relative h-72 bg-gradient-to-r from-green-700 to-green-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-700 via-purple-600 to-green-500">
          <img
            src="/src/assets/featured-bg.png"
            alt="Background Pattern"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative max-w-7xl mx-4 px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-white mb-4">
              Discover Promising Startups
            </h1>
            <p className="text-lg text-green-100">
              Invest in the next generation of entrepreneurs.
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-8xl mx-8 sm:px-2 lg:px-1 py-8">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Explore Campaigns
            </h2>
            {/* Results Count */}
            {!loading && (
              <p className="text-gray-600 mt-1">
                {filteredCount > 0 ? (
                  <>
                    Showing {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, filteredCount)} of {filteredCount} campaigns
                    {(searchTerm || selectedCategory !== "All Categories" || selectedFilter !== "All Campaigns") && (
                      <span className="text-green-600 font-medium"> (filtered from {totalCampaigns} total)</span>
                    )}
                  </>
                ) : (
                  `No campaigns found${totalCampaigns > 0 ? ` (${totalCampaigns} total available)` : ''}`
                )}
              </p>
            )}
          </div>
        </div>

        {/* Enhanced Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="search"
                placeholder="Search campaigns, categories, or keywords..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 rounded-md"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap space-x-2">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleFilterChange(option.label)}
                  className={`px-3 py-2 text-sm rounded-md flex items-center transition-colors ${
                    selectedFilter === option.label
                      ? "bg-green-700 text-white font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {option.id === "goal-reached" && (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  {option.id === "featured" && (
                    <span className="h-4 w-4 mr-1">⭐</span>
                  )}
                  {option.label}
                  {selectedFilter === option.label && filteredCount > 0 && (
                    <span className="ml-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {filteredCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* View Mode and Sort */}
            <div className="flex space-x-3 ml-auto">
              {/* View Mode Toggle */}
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 rounded-l-md border ${
                    viewMode === "grid"
                      ? "bg-gray-100 text-gray-800 border-gray-300"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 rounded-r-md border-t border-r border-b ${
                    viewMode === "list"
                      ? "bg-gray-100 text-gray-800 border-gray-300"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 flex items-center text-sm"
                  onClick={() =>
                    document
                      .getElementById("sortDropdown")
                      .classList.toggle("hidden")
                  }
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortBy}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>
                <div
                  id="sortDropdown"
                  className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden"
                >
                  {["Date Posted", "Most Funded", "End Date"].map((option) => (
                    <button
                      key={option}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setSortBy(option);
                        document
                          .getElementById("sortDropdown")
                          .classList.add("hidden");
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || selectedCategory !== "All Categories" || selectedFilter !== "All Campaigns") && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{searchTerm}"
                <button
                  onClick={clearSearch}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {selectedCategory !== "All Categories" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Category: {selectedCategory}
                <button
                  onClick={() => handleCategoryChange("All Categories")}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {selectedFilter !== "All Campaigns" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Filter: {selectedFilter}
                <button
                  onClick={() => handleFilterChange("All Campaigns")}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All Categories");
                setSelectedFilter("All Campaigns");
                updateURLParams({ search: null, category: null, filter: null });
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex gap-8">
          {/* Left Sidebar - Categories */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <CategoryFilter />

            {isAuthenticated() && (
              <div className="bg-white rounded-lg shadow-sm my-4 p-4 mt-4">
                <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link
                    to="/my-campaigns?tab=viewed"
                    className="flex items-center text-sm text-gray-700 py-2 hover:text-green-600"
                  >
                    <Eye className="h-4 w-4 mr-2" /> Recently Viewed
                  </Link>
                  <Link
                    to="/my-campaigns?tab=favorites"
                    className="flex items-center text-sm text-gray-700 py-2 hover:text-green-600"
                  >
                    <Heart className="h-4 w-4 mr-2" /> Favorites
                  </Link>
                  {isFounder && (
                    <>
                      <Link
                        to="/my-campaigns?tab=created"
                        className="flex items-center text-sm text-gray-700 py-2 hover:text-green-600"
                      >
                        <PenLine className="h-4 w-4 mr-2" /> My Campaigns
                      </Link>
                      <Link
                        to="/my-campaigns?tab=drafts"
                        className="flex items-center text-sm text-gray-700 py-2 hover:text-green-600"
                      >
                        <FileText className="h-4 w-4 mr-2" /> My Drafts
                      </Link>
                    </>
                  )}
                  {isInvestor && (
                    <Link
                      to="/my-campaigns?tab=funded"
                      className="flex items-center text-sm text-gray-700 py-2 hover:text-green-600"
                    >
                      <DollarSign className="h-4 w-4 mr-2" /> Funded Projects
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Campaign Content */}
          <div className="flex-1">
            {renderCampaigns()}

            {/* Pagination */}
            <PaginationControls />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;