// src/components/sections/UserCampaignsSection.jsx - FIXED with horizontal scrolling

import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import CampaignCard from "../ui/CampaignCard";
import { CustomNav } from "../../hooks/CustomNavigation";
import CampaignService from "../../services/campaignService";

const UserCampaignsSection = () => {
  const { user, isAuthenticated } = useAuth();
  const [viewedCampaigns, setViewedCampaigns] = useState([]);
  const [favoriteCampaigns, setFavoriteCampaigns] = useState([]);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState("viewed");
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const navigate = CustomNav();

  useEffect(() => {
    loadCampaigns();
  }, [user, isAuthenticated]);

  // Handle scroll functionality
  useEffect(() => {
    const container = document.getElementById('user-campaigns-container');
    if (container) {
      const updateScrollButtons = () => {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
          container.scrollLeft < container.scrollWidth - container.clientWidth
        );
      };

      container.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons(); // Initial check

      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, [activeTab]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      console.log('Loading campaigns for UserCampaignsSection');
      
      // Load more campaigns for better scrolling experience (6-9 campaigns)
      const viewed = await CampaignService.getAllCampaigns({ limit: 9 });
      setViewedCampaigns(viewed.slice(0, 9)); // Show up to 9 for scrolling

      // Load other data based on authentication
      if (isAuthenticated() && user) {
        try {
          // Load favorites
          const favorites = await CampaignService.getFavoriteCampaigns();
          setFavoriteCampaigns(favorites.slice(0, 9));
        } catch (error) {
          console.error('Error loading favorites:', error);
        }

        // Load user-specific campaigns based on type
        if (user.userType === "founder") {
          try {
            const created = await CampaignService.getCreatedCampaigns();
            setUserCampaigns(created.all?.slice(0, 9) || []);
          } catch (error) {
            console.error('Error loading created campaigns:', error);
          }
        } else if (user.userType === "investor") {
          try {
            const funded = await CampaignService.getFundedCampaigns();
            setUserCampaigns(funded.slice(0, 9) || []);
          } catch (error) {
            console.error('Error loading funded campaigns:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading campaigns for UserCampaignsSection:', error);
    } finally {
      setLoading(false);
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    const container = document.getElementById('user-campaigns-container');
    if (container) {
      container.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('user-campaigns-container');
    if (container) {
      container.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  // Dynamically determine which tabs to show based on user state
  const getTabs = () => {
    // Start with viewed tab that works for all users
    const tabs = [{ id: "viewed", label: "Recently Viewed" }];

    // Add favorites tab for authenticated users
    if (isAuthenticated()) {
      tabs.push({ id: "favorites", label: "Favorites" });

      // Add user type specific tab
      if (user?.userType === "founder") {
        tabs.push({ id: "created", label: "Your Campaigns" });
      } else if (user?.userType === "investor") {
        tabs.push({ id: "funded", label: "Funded Campaigns" });
      }
    }

    return tabs;
  };

  const getActiveCampaigns = () => {
    switch (activeTab) {
      case "viewed":
        return viewedCampaigns;
      case "favorites":
        return favoriteCampaigns;
      case "created":
      case "funded":
        return userCampaigns;
      default:
        return [];
    }
  };

  const handleFavoriteToggle = async (campaignId) => {
    if (!isAuthenticated()) {
      alert('Please log in to save campaigns');
      return false;
    }
    
    try {
      return await CampaignService.toggleFavorite(campaignId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };

  const handleViewClick = async (campaignId) => {
    try {
      await CampaignService.trackView(campaignId);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const tabs = getTabs();
  const activeCampaigns = getActiveCampaigns();

  return (
    <section className="relative py-24">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-green-800/90" />
        <img
          src="/src/assets/featured-bg.png"
          alt="Background Pattern"
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            {isAuthenticated()
              ? "Your Campaign Journey"
              : "Recently Viewed Campaigns"}
          </h2>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            {isAuthenticated()
              ? `Track your interactions, favorites, and ${
                  user?.userType === "founder" ? "created" : "funded"
                } campaigns all in one place.`
              : "Campaigns you've viewed recently will appear here. Sign in to save your favorites."}
          </p>

          {/* Login prompt for unauthenticated users */}
          {!isAuthenticated() && (
            <button
              onClick={() => navigate("/login")}
              className="mt-4 px-6 py-2 bg-white text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
            >
              Sign in to track favorites
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 mb-8 inline-flex items-center justify-center space-x-1 mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-2 px-6 rounded-lg font-medium text-sm transition-all duration-200
                ${
                  activeTab === tab.id
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-white hover:bg-white/10"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Campaign Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
          ) : activeCampaigns.length > 0 ? (
            // FIXED: Horizontal scrollable container
            <div className="relative">
              {/* Scroll buttons */}
              {canScrollLeft && (
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full shadow-lg transition-all"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              
              {canScrollRight && (
                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full shadow-lg transition-all"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}

              {/* FIXED: Scrollable campaigns container */}
              <div
                id="user-campaigns-container"
                className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-12"
                style={{
                  scrollbarWidth: 'none', /* Firefox */
                  msOverflowStyle: 'none',  /* Internet Explorer 10+ */
                }}
              >
                {activeCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex-none w-80" // Fixed width for consistent sizing
                  >
                    <CampaignCard
                      campaign={campaign}
                      size="default"
                      onFavoriteToggle={handleFavoriteToggle}
                      onViewClick={handleViewClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 text-center">
              <p className="text-white text-lg">
                {activeTab === "viewed" && "No campaigns viewed yet"}
                {activeTab === "favorites" && "No favorite campaigns yet"}
                {activeTab === "created" &&
                  "You haven't created any campaigns yet"}
                {activeTab === "funded" &&
                  "You haven't funded any campaigns yet"}
              </p>
              <p className="text-green-100 mt-2">
                {activeTab === "viewed" &&
                  "Explore our campaigns to get started!"}
                {activeTab === "favorites" &&
                  "Save campaigns you like to find them here"}
                {activeTab === "created" && (
                  <button
                    onClick={() => navigate("/pages/CreateCampaign")}
                    className="mt-4 px-6 py-2 bg-white text-purple-600 rounded-full hover:bg-purple-50 transition-colors"
                  >
                    Create your first campaign
                  </button>
                )}
                {activeTab === "funded" && "Invest in campaigns you believe in"}
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/my-campaigns")}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 
                     px-8 py-3 rounded-full transition-colors flex items-center space-x-2 mx-auto"
          >
            <span>View Campaigns</span>
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>

      {/* Hide scrollbar styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -webkit-overflow-scrolling: touch;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default UserCampaignsSection;