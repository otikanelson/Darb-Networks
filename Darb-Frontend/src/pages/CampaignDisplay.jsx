import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Share2,
  MapPin,
  Calendar,
  Eye,
  Users,
  DollarSign,
  Target,
  Clock,
  ArrowLeft,
  Edit,
  Play,
  ExternalLink,
  MessageSquare,
  Star,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Building,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CampaignCard from '../components/ui/CampaignCard';
import InvestmentModal from '../components/ui/InvestmentModal';

const CampaignDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Campaign state
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [relatedCampaigns, setRelatedCampaigns] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);


  // Load campaign data
  useEffect(() => {
    if (id) {
      loadCampaign();
      loadRelatedCampaigns();
    }
  }, [id]);

  // Track view when component loads
  useEffect(() => {
    if (id && isAuthenticated()) {
      trackView();
    }
  }, [id, isAuthenticated]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log(`👀 Loading campaign ${id} with headers:`, headers);

      const response = await fetch(`/api/campaigns/${id}`, { headers });
      
      console.log('📡 Campaign API Response Status:', response.status);
      console.log('📡 Campaign API Response Headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Campaign API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📦 Full Campaign API Result:', result);
      
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to load campaign');
      }

      // Enhanced data processing
      const campaignData = result.data;
      
      // Normalize field names (handle different field naming conventions)
      const normalizedCampaign = {
        id: campaignData.id,
        title: campaignData.title,
        description: campaignData.description,
        category: campaignData.category,
        location: campaignData.location,
        
        // Handle different naming conventions for amounts (prioritize camelCase from API)
        target_amount: campaignData.targetAmount || campaignData.target_amount || 0,
        current_amount: campaignData.currentAmount || campaignData.current_amount || 0,
        minimum_investment: campaignData.minimumInvestment || campaignData.minimum_investment || 0,
        
        // Handle creator/founder data (prioritize creator object)
        founder_id: campaignData.creator?.id || campaignData.founder_id || campaignData.founderId,
        founder_name: campaignData.creator?.fullName || campaignData.creator?.name || campaignData.founder_name || campaignData.founderName || 'Unknown Creator',
        founder_company: campaignData.creator?.companyName || campaignData.founder_company || campaignData.founderCompany,
        founder_avatar: campaignData.creator?.profileImageUrl || campaignData.creator?.avatar || campaignData.founder_avatar || campaignData.founderAvatar,
        founder_email: campaignData.creator?.email || campaignData.founder_email,
        
        // Handle different naming conventions for stats (prioritize camelCase from API)
        view_count: campaignData.viewCount || campaignData.view_count || 0,
        favorite_count: campaignData.favoriteCount || campaignData.favorite_count || 0,
        investor_count: campaignData.investorCount || campaignData.investor_count || 0,
        
        // Status and features (prioritize camelCase from API)
        status: campaignData.status,
        is_featured: campaignData.isFeatured || campaignData.is_featured || false,
        
        // Content (prioritize camelCase from API)
        problem_statement: campaignData.problemStatement || campaignData.problem_statement,
        solution: campaignData.solution,
        business_plan: campaignData.businessPlan || campaignData.business_plan,
        video_url: campaignData.videoUrl || campaignData.video_url,
        main_image_url: campaignData.mainImageUrl || campaignData.main_image_url,
        
        // Timestamps (prioritize camelCase from API)
        created_at: campaignData.createdAt || campaignData.created_at,
        updated_at: campaignData.updatedAt || campaignData.updated_at,
        approved_at: campaignData.approvedAt || campaignData.approved_at,
        submitted_at: campaignData.submittedAt || campaignData.submitted_at,
        rejected_at: campaignData.rejectedAt || campaignData.rejected_at,
        
        // Additional fields
        days_left: campaignData.daysLeft || campaignData.days_left || 30,
        isFavorited: campaignData.isFavorited || false,
        can_edit: campaignData.canEdit || false,
        admin_comments: campaignData.adminComments || campaignData.admin_comments
      };

      console.log('✅ Normalized Campaign Data:', normalizedCampaign);
      setCampaign(normalizedCampaign);
      setIsFavorited(normalizedCampaign.isFavorited);

    } catch (error) {
      console.error('❌ Error loading campaign:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedCampaigns = async () => {
    try {
      const response = await fetch(`/api/campaigns?limit=3`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📦 Related Campaigns Result:', result);
        
        if (result.success && result.data) {
          const filtered = result.data
            .filter(c => c.id !== parseInt(id))
            .slice(0, 3);
          setRelatedCampaigns(filtered);
        }
      }
    } catch (error) {
      console.error('❌ Error loading related campaigns:', error);
    }
  };

  const trackView = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/campaigns/${id}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ View tracked successfully');
      }
    } catch (error) {
      console.error('❌ Error tracking view:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated()) {
      alert('Please log in to save campaigns');
      return;
    }

    setFavoriteLoading(true);
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api/campaigns/${id}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          setIsFavorited(result.data.isFavorited);
          
          setCampaign(prev => ({
            ...prev,
            favorite_count: result.data.favoriteCount || prev.favorite_count
          }));
        }
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = () => {
    const campaignUrl = `${window.location.origin}/campaign/${id}`;
    
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

  // Investment handlers
  const handleInvestClick = () => {
    if (!isAuthenticated()) {
      alert('Please log in to invest in campaigns');
      navigate('/login');
      return;
    }

    if (user?.userType?.toLowerCase() === 'founder' && user?.id === campaign?.founder_id) {
      alert('You cannot invest in your own campaign');
      return;
    }

    setShowInvestmentModal(true);
  };

  const handleInvestmentSuccess = () => {
    loadCampaign();
    alert('Investment successful! Check your email for confirmation.');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const calculateProgress = () => {
    if (!campaign?.target_amount || campaign.target_amount === 0) return 0;
    return Math.min((campaign.current_amount / campaign.target_amount) * 100, 100);
  };

  const getDaysLeft = () => {
    return campaign?.days_left || 30;
  };

  const getStatusBadge = () => {
    if (!campaign) return null;

    const progress = calculateProgress();
    const daysLeft = getDaysLeft();

    if (progress >= 100) {
      return (
        <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <CheckCircle className="h-4 w-4 mr-1" />
          Fully Funded
        </div>
      );
    }

    if (daysLeft <= 0) {
      return (
        <div className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
          <Clock className="h-4 w-4 mr-1" />
          Campaign Ended
        </div>
      );
    }

    if (campaign.is_featured) {
      return (
        <div className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          <Star className="h-4 w-4 mr-1" />
          Featured
        </div>
      );
    }

    return (
      <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
        <TrendingUp className="h-4 w-4 mr-1" />
        Active
      </div>
    );
  };

  const canEdit = () => {
    return isAuthenticated() && 
           user?.id === campaign?.founder_id && 
           ['draft', 'rejected'].includes(campaign?.status);
  };

  const canInvest = () => {
    if (!isAuthenticated()) return false;
    if (user?.id === campaign?.founder_id) return false;
    if (campaign?.status !== 'approved') return false;
    if (calculateProgress() >= 100) return false;
    if (getDaysLeft() <= 0) return false;
    return true;
  };

  const getImageUrl = () => {
    const imageUrl = campaign?.main_image_url || campaign?.mainImageUrl;
    
    console.log('🖼️ Campaign image URL:', imageUrl);
    
    if (!imageUrl) {
      console.log('🖼️ No image URL found, using placeholder');
      return '/placeholder-campaign.jpg';
    }
    
    // If it's already a full URL, use it as-is
    if (imageUrl.startsWith('http')) {
      console.log('🖼️ Using full URL:', imageUrl);
      return imageUrl;
    }
    
    // If it starts with /uploads or similar, prepend the API base
    if (imageUrl.startsWith('/uploads') || imageUrl.startsWith('/media')) {
      const fullUrl = `http://localhost:5000${imageUrl}`;
      console.log('🖼️ Constructed API URL:', fullUrl);
      return fullUrl;
    }
    
    // For other relative paths
    const fullUrl = `http://localhost:5000/api${imageUrl}`;
    console.log('🖼️ Constructed full URL:', fullUrl);
    return fullUrl;
  };

  const getCreatorAvatarUrl = () => {
    const avatarUrl = campaign?.founder_avatar || campaign?.creator?.profileImageUrl;
    
    console.log('👤 Creator avatar URL:', avatarUrl);
    
    if (!avatarUrl) {
      console.log('👤 No avatar URL found');
      return null;
    }
    
    // If it's already a full URL, use it as-is
    if (avatarUrl.startsWith('http')) {
      console.log('👤 Using full avatar URL:', avatarUrl);
      return avatarUrl;
    }
    
    // If it starts with /uploads or similar, prepend the API base
    if (avatarUrl.startsWith('/uploads') || avatarUrl.startsWith('/media')) {
      const fullUrl = `http://localhost:5000${avatarUrl}`;
      console.log('👤 Constructed avatar API URL:', fullUrl);
      return fullUrl;
    }
    
    // For other relative paths
    const fullUrl = `http://localhost:5000/api${avatarUrl}`;
    console.log('👤 Constructed full avatar URL:', fullUrl);
    return fullUrl;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">About This Campaign</h3>
              <p className="text-gray-700 leading-relaxed">
                {campaign?.description || 'No description available'}
              </p>
            </div>

            {campaign?.problem_statement && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Problem Statement</h3>
                <p className="text-gray-700 leading-relaxed">{campaign.problem_statement}</p>
              </div>
            )}

            {campaign?.solution && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Solution</h3>
                <p className="text-gray-700 leading-relaxed">{campaign.solution}</p>
              </div>
            )}

            {campaign?.video_url && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Campaign Video</h3>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  <div className="aspect-video flex items-center justify-center">
                    <button
                      onClick={() => setShowVideoModal(true)}
                      className="flex items-center justify-center w-20 h-20 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                    >
                      <Play className="h-8 w-8 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'business-plan':
        return (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Plan</h3>
            {campaign?.business_plan ? (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {campaign.business_plan}
                </p>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>Business plan details not provided yet.</p>
              </div>
            )}
          </div>
        );

      case 'updates':
        return (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Campaign Updates</h3>
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No updates posted yet.</p>
              <p className="text-sm">Updates from the campaign creator will appear here.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Other Campaigns
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-orange-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Campaign Data</h1>
          <p className="text-gray-600 mb-8">Campaign data could not be loaded</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-4"
          >
            Reload Page
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Other Campaigns
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        <div className="relative bg-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="relative h-80 md:h-96 overflow-hidden">
              <img
                src={getImageUrl()}
                alt={campaign.title}
                className="w-full h-full object-contain bg-gray-900"
                onError={(e) => {
                  e.target.src = '/placeholder-campaign.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                      {campaign.category}
                    </span>
                    {getStatusBadge()}
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-2">{campaign.title}</h1>
                  <div className="flex items-center text-white/90">
                    <MapPin className="h-4 w-4 mr-2" />
                    {campaign.location}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleFavoriteToggle}
                  disabled={favoriteLoading}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                    isFavorited 
                      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? 'Saved' : 'Save'}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>

                {canEdit() && (
                  <button
                    onClick={() => navigate(`/edit-campaign/${campaign.id}`)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Campaign
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {campaign.view_count || 0} views
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {campaign.favorite_count || 0} saves
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'business-plan', label: 'Business Plan' },
                  { id: 'updates', label: 'Updates' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-green-600 text-green-700'
                        : 'border-transparent text-gray-500 hover:text-green-700 hover:border-green-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              {renderTabContent()}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Funding Progress */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(campaign.current_amount || 0)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {Math.round(calculateProgress())}% funded
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  of {formatCurrency(campaign.target_amount || 0)} goal
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000 relative"
                    style={{ width: `${calculateProgress()}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{campaign.investor_count || 0}</div>
                  <div className="text-sm text-gray-600">Investors</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{getDaysLeft()}</div>
                  <div className="text-sm text-gray-600">Days Left</div>
                </div>
              </div>

              {/* Investment Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Minimum Investment</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(campaign.minimum_investment || 0)}
                  </span>
                </div>
              </div>

              {/* Investment Button */}
              {canInvest() ? (
                <button 
                  onClick={handleInvestClick}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <DollarSign className="h-5 w-5 mr-2" />
                  Invest Now
                </button>
              ) : (
                <div className="w-full py-3 px-4 rounded-lg font-semibold text-center bg-gray-100 text-gray-500">
                  {!isAuthenticated() ? 'Login to Invest' : 
                   user?.id === campaign?.founder_id ? 'Your Campaign' :
                   calculateProgress() >= 100 ? 'Fully Funded' :
                   getDaysLeft() <= 0 ? 'Campaign Ended' :
                   campaign?.status !== 'approved' ? 'Not Available' : 'Cannot Invest'}
                </div>
              )}

              {isAuthenticated() && user?.userType?.toLowerCase() === 'investor' && canInvest() && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  Secure payments powered by Paystack
                </p>
              )}
            </div>

            {/* Creator Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Creator</h3>
              
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                  {getCreatorAvatarUrl() ? (
                    <img
                      src={getCreatorAvatarUrl()}
                      alt={campaign.founder_name}
                      className="h-full w-full object-cover"
                      onLoad={() => console.log('✅ Creator avatar loaded successfully')}
                      onError={(e) => {
                        console.error('❌ Creator avatar failed to load:', getCreatorAvatarUrl());
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="h-full w-full flex items-center justify-center text-gray-600 font-medium"
                    style={{ display: getCreatorAvatarUrl() ? 'none' : 'flex' }}
                  >
                    {campaign.founder_name?.charAt(0) || 'A'}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{campaign.founder_name || 'Unknown Creator'}</h4>
                  {campaign.founder_company && (
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Building className="h-3 w-3 mr-1" />
                      {campaign.founder_company}
                    </p>
                  )}
                  
                  <div className="mt-3 space-y-2">
                    <button className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center justify-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Creator
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="text-gray-900">{campaign.category || 'General'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="text-gray-900">{campaign.location || 'Not specified'}</span>
                </div>
                
                {campaign.approved_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved</span>
                    <span className="text-gray-900">
                      {new Date(campaign.approved_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Campaigns */}
        {relatedCampaigns.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">More Campaigns You Might Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCampaigns.map((relatedCampaign) => (
                <CampaignCard
                  key={relatedCampaign.id}
                  campaign={relatedCampaign}
                  onFavoriteToggle={handleFavoriteToggle}
                  showActions={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Investment Modal */}
      {campaign && (
        <InvestmentModal
          isOpen={showInvestmentModal}
          onClose={() => setShowInvestmentModal(false)}
          campaign={campaign}
          onInvestmentSuccess={handleInvestmentSuccess}
        />
      )}

      {/* Video Modal */}
      {showVideoModal && campaign?.video_url && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-3xl font-bold"
            >
              ×
            </button>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={campaign.video_url.includes('youtube.com') 
                  ? campaign.video_url.replace('watch?v=', 'embed/') 
                  : campaign.video_url}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                title="Campaign Video"
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CampaignDisplay;