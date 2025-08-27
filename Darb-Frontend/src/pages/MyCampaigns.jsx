import { Edit, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UnifiedNavbar from "../components/layout/Navbars";
import Footer from "../components/layout/Footer";
import CampaignCard from "../components/ui/CampaignCard";
import CampaignService from "../services/CampaignService";
import {
  Eye,
  Heart,
  PenLine,
  DollarSign,
  Bookmark,
  Plus,
  FileText,
  Clock,
  AlertTriangle,
  RefreshCw,
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react";

const MyCampaigns = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Campaign data state
  const [campaignData, setCampaignData] = useState({
    viewed: [],
    favorites: [],
    created: { drafts: [], submitted: [], approved: [], rejected: [], all: [] },
    funded: [],
  });

  // UI state
  const [activeTab, setActiveTab] = useState("viewed");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Redirect non-authenticated users to login
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: "/my-campaigns" } });
    }
  }, [isAuthenticated, navigate]);

  // Set default tab based on user type and location state
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
      window.history.replaceState({}, document.title);
    } else if (user?.userType?.toLowerCase() === "founder") {
      setActiveTab("created");
    } else if (user?.userType?.toLowerCase() === "investor") {
      setActiveTab("funded");
    }
  }, [location, user]);

  // Load all campaign data
  useEffect(() => {
    if (isAuthenticated() && user) {
      loadAllCampaignData();
    }
  }, [user, isAuthenticated]);

  // Handle refresh from location state
  useEffect(() => {
    if (location.state?.refresh && isAuthenticated()) {
      window.history.replaceState({}, document.title);
      loadAllCampaignData(true);
    }
  }, [location.state?.refresh, isAuthenticated]);

  const handleDeleteCampaign = async (campaignId, campaignTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${campaignTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `http://localhost:5000/api/campaigns/${campaignId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Refresh the campaigns data
        loadAllCampaignData(true);
        alert("Campaign deleted successfully");
      } else {
        const result = await response.json();
        alert(result.message || "Failed to delete campaign");
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      alert("Failed to delete campaign");
    }
  };

  const loadAllCampaignData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      if (forceRefresh) {
        setRefreshing(true);
      }

      console.log("📊 Loading all campaign data for user:", user?.id);

      const data = await CampaignService.getAllMyCampaignsData(user);
      setCampaignData(data);

      console.log("✅ Campaign data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading campaign data:", error);
      setError(
        "Some campaign data could not be loaded. Please try refreshing."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFavoriteToggle = async (campaignId) => {
    try {
      const result = await CampaignService.toggleFavoriteCampaign(
        campaignId,
        user.id
      );

      // Refresh favorites data
      const updatedFavorites = await CampaignService.getFavoriteCampaigns(
        user.id
      );
      setCampaignData((prev) => ({ ...prev, favorites: updatedFavorites }));

      return result;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      return false;
    }
  };

  // Get tabs based on user type
  const getTabs = () => {
    const isFounder = user?.userType?.toLowerCase() === "founder";
    const isInvestor = user?.userType?.toLowerCase() === "investor";

    const tabs = [
      { id: "viewed", label: "Recently Viewed", icon: Eye },
      { id: "favorites", label: "Favorites", icon: Heart },
    ];

    if (isFounder) {
      tabs.push(
        { id: "created", label: "My Campaigns", icon: PenLine },
        { id: "drafts", label: "Drafts", icon: FileText },
        { id: "submitted", label: "Under Review", icon: Clock },
        { id: "approved", label: "Published", icon: CheckCircle },
        { id: "rejected", label: "Rejected", icon: XCircle }
      );
    }

    if (isInvestor) {
      tabs.push({ id: "funded", label: "Funded Campaigns", icon: DollarSign });
    }

    return tabs;
  };

  // Get active campaigns based on selected tab
  const getActiveCampaigns = () => {
    switch (activeTab) {
      case "viewed":
        return campaignData.viewed;
      case "favorites":
        return campaignData.favorites;
      case "created":
        return campaignData.created?.all || [];
      case "drafts":
        return campaignData.created?.drafts || [];
      case "submitted":
        return campaignData.created?.submitted || [];
      case "approved":
        return campaignData.created?.approved || [];
      case "rejected":
        return campaignData.created?.rejected || [];
      case "funded":
        return campaignData.funded;
      default:
        return [];
    }
  };

  // Get placeholder content for empty states
  const getPlaceholderContent = () => {
    const isFounder = user?.userType?.toLowerCase() === "founder";

    switch (activeTab) {
      case "viewed":
        return {
          icon: Eye,
          title: "No viewed campaigns yet",
          message: "Browse campaigns to keep track of ones you've viewed",
          action: {
            text: "Browse Campaigns",
            onClick: () => navigate("/dashboard"),
          },
        };
      case "favorites":
        return {
          icon: Bookmark,
          title: "No favorite campaigns yet",
          message: "Save campaigns you're interested in for later",
          action: {
            text: "Browse Campaigns",
            onClick: () => navigate("/dashboard"),
          },
        };
      case "created":
        return {
          icon: PenLine,
          title: "No campaigns created yet",
          message: "Start creating your first campaign to raise funds",
          action: {
            text: "Create a Campaign",
            onClick: () => navigate("/pages/CreateCampaign"),
          },
        };
      case "drafts":
        return {
          icon: FileText,
          title: "No draft campaigns",
          message: "Your draft campaigns will appear here",
          action: {
            text: "Create a Campaign",
            onClick: () => navigate("/pages/CreateCampaign"),
          },
        };
      case "submitted":
        return {
          icon: Clock,
          title: "No campaigns under review",
          message: "Campaigns you've submitted for approval will appear here",
          action: isFounder
            ? {
                text: "Create a Campaign",
                onClick: () => navigate("/pages/CreateCampaign"),
              }
            : null,
        };
      case "approved":
        return {
          icon: CheckCircle,
          title: "No published campaigns",
          message: "Your approved campaigns will appear here",
          action: isFounder
            ? {
                text: "Create a Campaign",
                onClick: () => navigate("/pages/CreateCampaign"),
              }
            : null,
        };
      case "rejected":
        return {
          icon: XCircle,
          title: "No rejected campaigns",
          message:
            "If any campaigns are rejected, they'll appear here with feedback",
          action: isFounder
            ? {
                text: "Create a Campaign",
                onClick: () => navigate("/pages/CreateCampaign"),
              }
            : null,
        };
      case "funded":
        return {
          icon: DollarSign,
          title: "No campaigns funded yet",
          message: "Invest in campaigns you believe in",
          action: {
            text: "Find Campaigns",
            onClick: () => navigate("/dashboard"),
          },
        };
      default:
        return {
          icon: Eye,
          title: "No campaigns to show",
          message: "Something went wrong",
          action: {
            text: "Go to Dashboard",
            onClick: () => navigate("/dashboard"),
          },
        };
    }
  };

  // Get status color for campaign cards
  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    loadAllCampaignData(true);
  };

  // Get stats for the header
  const getStats = () => {
    const isFounder = user?.userType?.toLowerCase() === "founder";

    if (isFounder) {
      return {
        total: campaignData.created?.all?.length || 0,
        drafts: campaignData.created?.drafts?.length || 0,
        published: campaignData.created?.approved?.length || 0,
        pending: campaignData.created?.submitted?.length || 0,
      };
    } else {
      return {
        viewed: campaignData.viewed?.length || 0,
        favorites: campaignData.favorites?.length || 0,
        funded: campaignData.funded?.length || 0,
      };
    }
  };

  const tabs = getTabs();
  const activeCampaigns = getActiveCampaigns();
  const placeholder = getPlaceholderContent();
  const stats = getStats();
  const isFounder = user?.userType?.toLowerCase() === "founder";

  if (!isAuthenticated()) {
    return null; // Redirect happens in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar variant="dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Campaigns</h1>
              <p className="text-gray-600 mt-1">
                {isFounder
                  ? "Manage your campaigns and track their progress"
                  : "Track your investment activity and saved campaigns"}
              </p>
            </div>

            <div className="flex space-x-4">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>

              {/* Create Campaign Button - Only for Founders */}
              {isFounder && (
                <button
                  onClick={() => navigate("/pages/CreateCampaign")}
                  className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Campaign</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {isFounder ? (
              <>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gray-600">Total Campaigns</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </div>
                  <div className="text-sm text-gray-600">Under Review</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.published}
                  </div>
                  <div className="text-sm text-gray-600">Published</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-gray-600">
                    {stats.drafts}
                  </div>
                  <div className="text-sm text-gray-600">Drafts</div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.viewed}
                  </div>
                  <div className="text-sm text-gray-600">Viewed</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.favorites}
                  </div>
                  <div className="text-sm text-gray-600">Favorites</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.funded}
                  </div>
                  <div className="text-sm text-gray-600">Funded</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-2xl font-bold text-gray-600">-</div>
                  <div className="text-sm text-gray-600">Portfolio Value</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Retry
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const count = getActiveCampaigns().length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-1 flex items-center space-x-2 border-b-2 font-medium text-sm whitespace-nowrap
                    ${
                      activeTab === tab.id
                        ? "border-green-600 text-green-700"
                        : "border-transparent text-gray-500 hover:text-green-700 hover:border-green-300"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && count > 0 && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-700 border-t-transparent"></div>
          </div>
        ) : activeCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCampaigns.map((campaign) => (
              <div key={campaign.id} className="relative group">
                {/* Campaign Card */}
                <div
                  onClick={() => navigate(`/campaign/${campaign.id}`)}
                  className="cursor-pointer"
                >
                  <CampaignCard
                    campaign={campaign}
                    onFavoriteToggle={handleFavoriteToggle}
                    showActions={true}
                  />
                </div>

                {/* Status Badge for Founder's Campaigns */}
                {isFounder && campaign.status && (
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        campaign.status
                      )}`}
                    >
                      {campaign.status === "draft" && (
                        <FileText className="h-3 w-3 mr-1" />
                      )}
                      {campaign.status === "submitted" && (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {campaign.status === "approved" && (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      )}
                      {campaign.status === "rejected" && (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {campaign.status.charAt(0).toUpperCase() +
                        campaign.status.slice(1)}
                    </span>
                  </div>
                )}

                {/* Action Buttons for Editable Campaigns */}
                {isFounder &&
                  (campaign.status === "draft" ||
                    campaign.status === "rejected") && (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="flex space-x-2">
                        {/* Edit Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/edit-campaign/${campaign.id}`);
                          }}
                          className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                          title="Edit Campaign"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        {/* Delete Button (only for drafts) */}
                        {campaign.status === "draft" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCampaign(campaign.id, campaign.title);
                            }}
                            className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                            title="Delete Draft"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                {/* Admin Comments Badge for Rejected Campaigns */}
                {isFounder &&
                  campaign.status === "rejected" &&
                  campaign.adminComments && (
                    <div className="absolute top-12 left-3 z-10">
                      <div className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded-md max-w-xs">
                        <div className="font-medium">Admin Feedback:</div>
                        <div className="truncate">{campaign.adminComments}</div>
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {React.createElement(placeholder.icon, {
                className: "h-8 w-8 text-gray-400",
              })}
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {placeholder.title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              {placeholder.message}
            </p>
            {placeholder.action && (
              <div className="mt-6">
                <button
                  onClick={placeholder.action.onClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent 
                           rounded-md shadow-sm text-sm font-medium text-white bg-green-700 
                           hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 
                           focus:ring-green-500"
                >
                  {isFounder &&
                    activeTab !== "viewed" &&
                    activeTab !== "favorites" && (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                  {placeholder.action.text}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyCampaigns;
