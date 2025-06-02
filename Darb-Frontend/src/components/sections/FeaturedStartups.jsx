// src/components/sections/FeaturedStartups.jsx - FIXED with horizontal scrolling

import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomNav } from '../../hooks/CustomNavigation';
import CampaignCard from '../ui/CampaignCard';
import CampaignService from '../../services/campaignService';
import { useAuth } from '../../context/AuthContext';

const FeaturedStartups = () => {
  const navigate = CustomNav();
  const { isAuthenticated } = useAuth();
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Fetch featured campaigns
  useEffect(() => {
    const fetchFeaturedCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get more campaigns for scrolling (6-9 campaigns)
        const campaigns = await CampaignService.getFeaturedCampaigns(9);
        setFeaturedCampaigns(campaigns);
      } catch (error) {
        console.error('Error fetching featured campaigns:', error);
        setError('Failed to load featured campaigns');
        setFeaturedCampaigns([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedCampaigns();
  }, []);

  // Handle scroll functionality
  useEffect(() => {
    const container = document.getElementById('featured-campaigns-container');
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
  }, [featuredCampaigns]);

  // Scroll functions
  const scrollLeft = () => {
    const container = document.getElementById('featured-campaigns-container');
    if (container) {
      container.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('featured-campaigns-container');
    if (container) {
      container.scrollBy({ left: 400, behavior: 'smooth' });
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

  return (
    <section className="relative py-24">
      {/* Background Image and Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-green-800/90" />
        <img 
          src="/src/assets/featured-bg.png" 
          alt="Background Pattern" 
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Featured Startups
          </h2>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Discover innovative Nigerian startups that are shaping the future
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          </div>
        ) : error ? (
          // Error state
          <div className="text-center">
            <p className="text-white text-lg mb-4">{error}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 
                      px-8 py-3 rounded-full transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>Browse All Startups</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        ) : featuredCampaigns.length === 0 ? (
          // Empty state
          <div className="text-center">
            <p className="text-white text-lg mb-8">No featured campaigns available at the moment.</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 
                      px-8 py-3 rounded-full transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>Browse All Startups</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        ) : (
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
              id="featured-campaigns-container"
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-12"
              style={{
                scrollbarWidth: 'none', /* Firefox */
                msOverflowStyle: 'none',  /* Internet Explorer 10+ */
              }}
            >
              {featuredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex-none w-80" // Fixed width for consistent sizing
                >
                  <CampaignCard
                    campaign={campaign}
                    size="featured"
                    onFavoriteToggle={handleFavoriteToggle}
                    onViewClick={handleViewClick}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View all button */}
        {featuredCampaigns.length > 0 && (
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 
                      px-8 py-3 rounded-full transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>View All Campaigns</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        )}
      </div>

      {/* FIXED: Hide scrollbar styles */}
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

export default FeaturedStartups;