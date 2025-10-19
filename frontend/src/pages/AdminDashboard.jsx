import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Eye,
  DollarSign,
  TrendingUp,
  Filter,
  Search,
  AlertCircle,
} from "lucide-react";
import UnifiedNavbar from "../components/layout/Navbars";
import Footer from "../components/layout/Footer";

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check admin access
  useEffect(() => {
    console.log("🔐 Checking admin access:", {
      user,
      isAuthenticated: isAuthenticated(),
    });
    if (!isAuthenticated() || user?.userType !== "admin") {
      console.log("❌ Access denied, redirecting to dashboard");
      navigate("/dashboard");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("submitted");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load dashboard stats
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Load campaigns when filter changes
  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter, searchTerm]);

  const fetchDashboardStats = async () => {
    try {
      console.log("📊 Fetching dashboard stats...");
      const token = localStorage.getItem("authToken");
      console.log("🔑 Using token:", token ? "Token exists" : "No token");

      const response = await fetch(
        "http://localhost:5000/api/admin/dashboard-stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📊 Stats response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("📊 Stats data:", result);
        setStats(result.data);
      } else {
        const errorData = await response.text();
        console.error("❌ Stats fetch failed:", response.status, errorData);
        setError(`Failed to load stats: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setCampaignsLoading(true);
      setError(""); // Clear previous errors

      console.log("📋 Fetching campaigns with filter:", statusFilter);

      const token = localStorage.getItem("authToken");
      const params = new URLSearchParams({
        status: statusFilter,
        ...(searchTerm && { search: searchTerm }),
      });

      const url = `http://localhost:5000/api/admin/campaigns?${params}`;
      console.log("📋 Requesting URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📋 Campaigns response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("📋 Campaigns data:", result);

        if (result.success && result.data) {
          setCampaigns(result.data);
          console.log(`✅ Loaded ${result.data.length} campaigns`);
        } else {
          console.warn("⚠️ Unexpected response format:", result);
          setCampaigns([]);
        }
      } else {
        const errorData = await response.text();
        console.error("❌ Campaigns fetch failed:", response.status, errorData);
        setError(`Failed to load campaigns: ${response.status} - ${errorData}`);
        setCampaigns([]);
      }
    } catch (error) {
      console.error("❌ Error fetching campaigns:", error);
      setError(`Network error: ${error.message}`);
      setCampaigns([]);
    } finally {
      setCampaignsLoading(false);
    }
  };

  const handleApproveCampaign = async (
    campaignId,
    comments = "",
    isFeatured = false
  ) => {
    try {
      console.log(`✅ Approving campaign ${campaignId}`);
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:5000/api/admin/campaigns/${campaignId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comments, isFeatured }),
        }
      );

      if (response.ok) {
        setSuccess("Campaign approved successfully");
        fetchCampaigns();
        fetchDashboardStats();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const result = await response.json();
        setError(result.message || "Failed to approve campaign");
      }
    } catch (error) {
      console.error("❌ Error approving campaign:", error);
      setError("Failed to approve campaign");
    }
  };

  const handleRejectCampaign = async (campaignId, comments) => {
    if (!comments.trim()) {
      setError("Rejection reason is required");
      return;
    }

    try {
      console.log(`❌ Rejecting campaign ${campaignId}`);
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:5000/api/admin/campaigns/${campaignId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comments }),
        }
      );

      if (response.ok) {
        setSuccess("Campaign rejected successfully");
        fetchCampaigns();
        fetchDashboardStats();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const result = await response.json();
        setError(result.message || "Failed to reject campaign");
      }
    } catch (error) {
      console.error("❌ Error rejecting campaign:", error);
      setError("Failed to reject campaign");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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

  const getStatusIcon = (status) => {
    switch (status) {
      case "submitted":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Add debug info section for development
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV !== "development") return null;

    return (
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-2">🔧 Debug Info</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <div>User Type: {user?.userType}</div>
          <div>Is Authenticated: {isAuthenticated() ? "Yes" : "No"}</div>
          <div>Status Filter: {statusFilter}</div>
          <div>Campaigns Count: {campaigns.length}</div>
          <div>Loading: {campaignsLoading ? "Yes" : "No"}</div>
          <div>Error: {error || "None"}</div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated() || user?.userType !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar variant="admin" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage campaigns, users, and platform settings
          </p>
        </div>

        {/* Debug Info (only in development)
        {renderDebugInfo()} */}

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        {/* {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
            <button 
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )} */}

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow-sm border animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pending Review
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.statusCounts?.submitted || 0}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Approved
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.statusCounts?.approved || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {(stats.userCounts?.founder || 0) +
                        (stats.userCounts?.investor || 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Target
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(stats.fundingStats?.total_target || 0)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          )
        )}

        {/* Campaign Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Campaign Management
              </h2>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    console.log("🔄 Changing filter to:", e.target.value);
                    setStatusFilter(e.target.value);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="draft">Drafts</option>
                </select>

                {/* Refresh Button */}
                <button
                  onClick={() => {
                    console.log("🔄 Manual refresh triggered");
                    fetchCampaigns();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Campaign List */}
          <div className="p-6">
            {campaignsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-4 animate-pulse"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No campaigns found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {statusFilter === "submitted"
                    ? "No campaigns pending review"
                    : statusFilter === "all"
                    ? "No campaigns exist yet"
                    : `No campaigns with ${statusFilter} status`}
                </p>
                <div className="mt-4 text-xs text-gray-400">
                  Current filter: {statusFilter} | Campaigns loaded:{" "}
                  {campaigns.length}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <CampaignReviewCard
                    key={campaign.id}
                    campaign={campaign}
                    onApprove={handleApproveCampaign}
                    onReject={handleRejectCampaign}
                    formatCurrency={formatCurrency}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Campaign Review Card Component - keeping the same as before
const CampaignReviewCard = ({
  campaign,
  onApprove,
  onReject,
  formatCurrency,
  getStatusColor,
  getStatusIcon,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const handleApprove = async (isFeatured = false) => {
    setApproveLoading(true);
    await onApprove(campaign.id, "", isFeatured);
    setApproveLoading(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;

    setRejectLoading(true);
    await onReject(campaign.id, rejectReason);
    setRejectLoading(false);
    setShowRejectModal(false);
    setRejectReason("");
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {campaign.title}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  campaign.status
                )}`}
              >
                {getStatusIcon(campaign.status)}
                <span className="ml-1 capitalize">{campaign.status}</span>
              </span>
              {campaign.is_featured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Founder:</span>{" "}
                {campaign.founder_name}
                {campaign.founder_company && (
                  <span className="block text-gray-500">
                    {campaign.founder_company}
                  </span>
                )}
              </div>
              <div>
                <span className="font-medium">Category:</span>{" "}
                {campaign.category}
                <span className="block text-gray-500">{campaign.location}</span>
              </div>
              <div>
                <span className="font-medium">Target:</span>{" "}
                {formatCurrency(campaign.target_amount)}
                <span className="block text-gray-500">
                  Min: {formatCurrency(campaign.minimum_investment)}
                </span>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>
                  <Eye className="h-4 w-4 inline mr-1" />
                  {campaign.view_count || 0} views
                </span>
                <span>
                  Created: {new Date(campaign.created_at).toLocaleDateString()}
                </span>
                {campaign.submitted_at && (
                  <span>
                    Submitted:{" "}
                    {new Date(campaign.submitted_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {campaign.admin_comments && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  Admin Comments:
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {campaign.admin_comments}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showDetails ? "Hide Details" : "View Details"}
          </button>

          {campaign.status === "submitted" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(false)}
                disabled={approveLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center text-sm"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {approveLoading ? "Approving..." : "Approve"}
              </button>

              <button
                onClick={() => handleApprove(true)}
                disabled={approveLoading}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center text-sm"
              >
                <Star className="h-4 w-4 mr-1" />
                Approve & Feature
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </button>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-600 text-sm">{campaign.description}</p>
            </div>

            {campaign.problem_statement && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Problem Statement
                </h4>
                <p className="text-gray-600 text-sm">
                  {campaign.problem_statement}
                </p>
              </div>
            )}

            {campaign.solution && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Solution</h4>
                <p className="text-gray-600 text-sm">{campaign.solution}</p>
              </div>
            )}

            {campaign.business_plan && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Business Plan
                </h4>
                <p className="text-gray-600 text-sm">
                  {campaign.business_plan}
                </p>
              </div>
            )}

            {campaign.main_image_url && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Campaign Image
                </h4>
                <img
                  src={`http://localhost:5000${campaign.main_image_url}`}
                  alt="Campaign"
                  className="max-w-md rounded-lg border border-gray-200"
                />
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Founder Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {campaign.founder_email}
                </div>
                {campaign.founder_phone && (
                  <div>
                    <span className="font-medium">Phone:</span>{" "}
                    {campaign.founder_phone}
                  </div>
                )}
                {campaign.founder_company && (
                  <div>
                    <span className="font-medium">Company:</span>{" "}
                    {campaign.founder_company}
                  </div>
                )}
                {campaign.founder_address && (
                  <div>
                    <span className="font-medium">Address:</span>{" "}
                    {campaign.founder_address}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reject Campaign
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this campaign. This will
                be shared with the founder.
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="Enter rejection reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || rejectLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {rejectLoading ? "Rejecting..." : "Reject Campaign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
