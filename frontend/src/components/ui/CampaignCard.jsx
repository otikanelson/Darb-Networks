import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Share2, 
  Clock, 
  Eye, 
  MapPin, 
  User,
  Star,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { buildImageUrl } from '../../config/apiUrl';

const CampaignCard = ({ 
  campaign, 
  showActions = true, 
  size = 'default', // 'default', 'compact', 'featured'
  showStatus = true,
  onFavoriteToggle,
  onViewClick 
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Handle card click to view campaign
  const handleCardClick = () => {
    if (onViewClick) {
      onViewClick(campaign.id);
    }
    // Track view and navigate
    navigate(`/campaign/${campaign.id}`);
  };

  // Handle favorite toggle
  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated()) {
      alert('Please log in to save campaigns');
      return;
    }

    setIsLoading(true);
    try {
      if (onFavoriteToggle) {
        const result = await onFavoriteToggle(campaign.id);
        setIsFavorited(result);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle share
  const handleShare = (e) => {
    e.stopPropagation();
    
    const campaignUrl = `${window.location.origin}/campaign/${campaign.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: campaign.description,
        url: campaignUrl
      });
    } else {
      navigator.clipboard.writeText(campaignUrl);
      alert('Campaign link copied to clipboard!');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Calculate funding percentage
  const fundingPercentage = () => {
    const current = Number(campaign.current_amount || 0);
    const target = Number(campaign.target_amount || 1);
    return Math.min(Math.round((current / target) * 100), 100);
  };

  // Get days left (placeholder calculation)
  const getDaysLeft = () => {
    // This would typically come from campaign end date
    return campaign.days_left || 30;
  };

  // Get main image URL with enhanced error handling
  const getImageUrl = () => {
    // Handle edge cases: empty strings, null, undefined, whitespace-only strings
    if (campaign.main_image_url && 
        typeof campaign.main_image_url === 'string' && 
        campaign.main_image_url.trim() !== '') {
      try {
        return buildImageUrl(campaign.main_image_url);
      } catch (error) {
        console.error('Error building image URL for campaign:', campaign.id, error);
        return '/placeholder-campaign.jpg';
      }
    }
    return '/placeholder-campaign.jpg';
  };

  // Get YouTube video ID from URL
  const getYouTubeVideoId = () => {
    if (!campaign.video_url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = campaign.video_url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeVideoId();

  // Handle hover for video autoplay
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoId) {
      // Delay showing video slightly for better UX
      setTimeout(() => setShowVideo(true), 300);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowVideo(false);
  };

  // Get status badge
  const getStatusBadge = () => {
    if (!showStatus) return null;

    const status = campaign.status;
    const isExpired = getDaysLeft() <= 0;
    const isFunded = fundingPercentage() >= 100;

    if (isExpired && !isFunded) {
      return (
        <div className="absolute top-2 right-2 bg-gray-900 text-white px-1.5 py-0.5 text-[10px] font-medium rounded flex items-center">
          <Clock className="h-2.5 w-2.5 mr-0.5" />
          EXPIRED
        </div>
      );
    }

    if (isFunded) {
      return (
        <div className="absolute top-2 right-2 bg-green-600 text-white px-1.5 py-0.5 text-[10px] font-medium rounded flex items-center">
          <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
          FUNDED
        </div>
      );
    }

    if (campaign.is_featured) {
      return (
        <div className="absolute top-2 right-2 bg-yellow-600 text-white px-1.5 py-0.5 text-[10px] font-medium rounded flex items-center">
          <Star className="h-2.5 w-2.5 mr-0.5" />
          FEATURED
        </div>
      );
    }

    if (status === 'draft') {
      return (
        <div className="absolute top-2 right-2 bg-gray-600 text-white px-1.5 py-0.5 text-[10px] font-medium rounded">
          DRAFT
        </div>
      );
    }

    if (status === 'submitted') {
      return (
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-1.5 py-0.5 text-[10px] font-medium rounded flex items-center">
          <Clock className="h-2.5 w-2.5 mr-0.5" />
          PENDING
        </div>
      );
    }

    if (status === 'rejected') {
      return (
        <div className="absolute top-2 right-2 bg-red-600 text-white px-1.5 py-0.5 text-[10px] font-medium rounded flex items-center">
          <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
          REJECTED
        </div>
      );
    }

    return null;
  };

  // Get card classes based on size
  const getCardClasses = () => {
    const baseClasses = "bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-200 transition-all duration-300 cursor-pointer group";
    
    switch (size) {
      case 'compact':
        return `${baseClasses} max-w-sm`;
      case 'featured':
        return `${baseClasses} max-w-md transform hover:scale-[1.02]`;
      default:
        return baseClasses;
    }
  };

  // Get image height based on size
  const getImageHeight = () => {
    switch (size) {
      case 'compact': return 'h-32';
      case 'featured': return 'h-44';
      default: return 'h-40';
    }
  };

  return (
    <div 
      className={getCardClasses()} 
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Campaign Image/Video */}
      <div className={`relative ${getImageHeight()} w-full overflow-hidden`}>
        {/* Image - always show as background */}
        <img 
          src={getImageUrl()}
          alt={campaign.title}
          className={`w-full h-full object-cover transition-all duration-300 ${
            showVideo && videoId ? 'opacity-0' : 'opacity-100 group-hover:scale-105'
          }`}
          onError={(e) => {
            // Enhanced error handling with logging and robust fallback
            console.warn('Campaign image failed to load:', {
              campaignId: campaign.id,
              campaignTitle: campaign.title,
              attemptedUrl: e.target.src
            });
            
            // Prevent infinite loop if placeholder also fails
            if (e.target.src !== '/placeholder-campaign.jpg' && 
                !e.target.src.endsWith('/placeholder-campaign.jpg')) {
              e.target.src = '/placeholder-campaign.jpg';
            } else {
              // Placeholder also failed, hide image gracefully
              e.target.style.display = 'none';
              console.error('Placeholder image also failed to load for campaign:', campaign.id);
            }
          }}
        />

        {/* YouTube Video - show on hover if available */}
        {videoId && showVideo && (
          <div className="absolute inset-0 w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}`}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={campaign.title}
            />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Status Badge */}
        {getStatusBadge()}
        
        {/* Action Buttons */}
        {showActions && (
          <div className="absolute py-4 top-2 left-2 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleFavoriteClick}
              disabled={isLoading}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
            >
              <Heart 
                className={`h-3.5 w-3.5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
            >
              <Share2 className="h-3.5 w-3.5 text-gray-600" />
            </button>
          </div>
        )}
        
        {/* Days Left Indicator */}
        {getDaysLeft() > 0 && (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-gray-900 px-1.5 py-0.5 text-[10px] font-medium rounded flex items-center">
            <Calendar className="h-2.5 w-2.5 mr-0.5" />
            {getDaysLeft()} DAYS LEFT
          </div>
        )}
      </div>
      
      {/* Campaign Content */}
      <div className="p-3">
        {/* Category & Location */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
            {campaign.category}
          </span>
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="h-3 w-3 mr-1" />
            {campaign.location}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-green-700 transition-colors">
          {campaign.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {campaign.description}
        </p>

        {/* Progress Section */}
        <div className="mb-3">
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 relative"
              style={{ width: `${fundingPercentage()}%` }}
            >
              {/* Shimmer effect for active campaigns */}
              {fundingPercentage() > 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              )}
            </div>
          </div>
          
          {/* Funding Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs font-bold text-gray-900">
                {formatCurrency(campaign.current_amount || 0)}
              </div>
              <div className="text-[10px] text-gray-500">raised</div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">
                {fundingPercentage()}%
              </div>
              <div className="text-[10px] text-gray-500">funded</div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">
                {campaign.view_count || 0}
              </div>
              <div className="text-[10px] text-gray-500 flex items-center justify-center">
                <Eye className="h-2.5 w-2.5 mr-0.5" />
                views
              </div>
            </div>
          </div>
        </div>

        {/* Target Amount */}
        <div className="bg-gray-50 rounded-lg p-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-medium text-gray-600">Target Amount</span>
            <span className="text-xs font-bold text-gray-900">
              {formatCurrency(campaign.target_amount)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-0.5">
            <span className="text-[10px] font-medium text-gray-600">Min Investment</span>
            <span className="text-[10px] text-gray-700">
              {formatCurrency(campaign.minimum_investment)}
            </span>
          </div>
        </div>
        
        {/* Founder Info */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center">
            <div className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium text-xs overflow-hidden">
              {campaign.founder_avatar || campaign.founderAvatar ? (
                <img 
                  src={
                    // Handle different possible avatar field names and URL formats
                    (() => {
                      const avatarUrl = campaign.founder_avatar || campaign.founderAvatar;
                      if (!avatarUrl) return null;
                      
                      // If it's already a full URL, use it as is
                      if (avatarUrl.startsWith('http')) {
                        return avatarUrl;
                      }
                      
                      // If it starts with /, assume it's a server path
                      if (avatarUrl.startsWith('/')) {
                        return buildImageUrl(avatarUrl);
                      }
                      
                      // Otherwise, construct the full path
                      return buildImageUrl(`/uploads/profiles/${avatarUrl}`);
                    })()
                  }
                  alt={campaign.founder_name || campaign.founderName || 'Founder'}
                  className="h-full w-full object-cover rounded-full"
                  onError={(e) => {
                    // If image fails to load, hide it and show initials
                    e.target.style.display = 'none';
                    e.target.parentNode.querySelector('.founder-initials').style.display = 'flex';
                  }}
                />
              ) : null}
              
              {/* Fallback initials - always present but hidden if image loads */}
              <span 
                className={`founder-initials text-gray-600 font-medium text-xs ${
                  campaign.founder_avatar || campaign.founderAvatar ? 'hidden' : 'flex'
                } items-center justify-center h-full w-full`}
              >
                {(campaign.founder_name || campaign.founderName || 'Anonymous').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-2">
              <div className="text-xs font-medium text-gray-900">
                {campaign.founder_name || campaign.founderName || 'Anonymous'}
              </div>
              {(campaign.founder_company || campaign.founderCompany) && (
                <div className="text-[10px] text-gray-500">
                  {campaign.founder_company || campaign.founderCompany}
                </div>
              )}
            </div>
          </div>
          
          {/* Trending Indicator */}
          {(campaign.view_count || campaign.viewCount || 0) > 100 && (
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;