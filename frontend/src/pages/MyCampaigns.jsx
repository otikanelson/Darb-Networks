import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import UnifiedNavbar from "../components/layout/Navbars";
import Footer from "../components/layout/Footer";
import { buildApiUrl } from "../config/apiUrl";
import CampaignCard from "../components/ui/CampaignCard";
import CampaignService from "../services/CampaignService";
import toast from "react-hot-toast";
import {
  Eye, Heart, PenLine, DollarSign, Bookmark, Plus, FileText,
  Clock, AlertTriangle, RefreshCw, CheckCircle, XCircle,
  Edit, Trash2, Sparkles, TrendingUp, LayoutGrid,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  draft: { bg: "bg-gray-100 text-gray-700", dot: "bg-gray-400", icon: FileText },
  submitted: { bg: "bg-amber-100 text-amber-700", dot: "bg-amber-400", icon: Clock },
  approved: { bg: "bg-primary-100 text-primary-700", dot: "bg-primary-500", icon: CheckCircle },
  rejected: { bg: "bg-red-100 text-red-700", dot: "bg-red-500", icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.draft;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1   text-xs font-semibold ${s.bg}`}>
      <span className={`w-1.5 h-1.5   ${s.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Animated counter
const AnimCount = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0;
    const step = Math.ceil(value / 20);
    const t = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(start);
      if (start >= value) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [value]);
  return <span>{display}</span>;
};

const MyCampaigns = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [campaignData, setCampaignData] = useState({
    viewed: [], favorites: [],
    created: { drafts: [], submitted: [], approved: [], rejected: [], all: [] },
    funded: [],
  });
  const [activeTab, setActiveTab] = useState("viewed");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isFounder = user?.userType?.toLowerCase() === "founder";
  const isInvestor = user?.userType?.toLowerCase() === "investor";

  useEffect(() => {
    if (!isAuthenticated()) navigate("/login", { state: { from: "/my-campaigns" } });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (location.state?.tab) { setActiveTab(location.state.tab); window.history.replaceState({}, document.title); }
    else if (isFounder) setActiveTab("created");
    else if (isInvestor) setActiveTab("funded");
  }, [location, user]);

  useEffect(() => {
    if (isAuthenticated() && user) loadAll();
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (location.state?.refresh && isAuthenticated()) {
      window.history.replaceState({}, document.title);
      loadAll(true);
    }
  }, [location.state?.refresh]);

  const loadAll = async (force = false) => {
    try {
      setLoading(true);
      if (force) setRefreshing(true);
      const data = await CampaignService.getAllMyCampaignsData(user);
      setCampaignData(data);
    } catch {
      toast.error("Some data could not be loaded. Please refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(buildApiUrl(`/campaigns/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { loadAll(true); toast.success("Campaign deleted"); }
      else { const r = await res.json(); toast.error(r.message || "Delete failed"); }
    } catch { toast.error("Delete failed"); }
  };

  const handleFavoriteToggle = async (campaignId) => {
    try {
      const result = await CampaignService.toggleFavoriteCampaign(campaignId, user.id);
      const updated = await CampaignService.getFavoriteCampaigns(user.id);
      setCampaignData(p => ({ ...p, favorites: updated }));
      return result;
    } catch { return false; }
  };

  // ── tabs ──────────────────────────────────────────────────────────────────
  const TABS = [
    { id: "viewed", label: "Recently Viewed", icon: Eye, count: campaignData.viewed?.length },
    { id: "favorites", label: "Favorites", icon: Heart, count: campaignData.favorites?.length },
    ...(isFounder ? [
      { id: "created", label: "All Campaigns", icon: LayoutGrid, count: campaignData.created?.all?.length },
      { id: "drafts", label: "Drafts", icon: FileText, count: campaignData.created?.drafts?.length },
      { id: "submitted", label: "Under Review", icon: Clock, count: campaignData.created?.submitted?.length },
      { id: "approved", label: "Published", icon: CheckCircle, count: campaignData.created?.approved?.length },
      { id: "rejected", label: "Rejected", icon: XCircle, count: campaignData.created?.rejected?.length },
    ] : []),
    ...(isInvestor ? [
      { id: "funded", label: "Funded", icon: DollarSign, count: campaignData.funded?.length },
    ] : []),
  ];

  const getActiveCampaigns = () => {
    switch (activeTab) {
      case "viewed": return campaignData.viewed;
      case "favorites": return campaignData.favorites;
      case "created": return campaignData.created?.all || [];
      case "drafts": return campaignData.created?.drafts || [];
      case "submitted": return campaignData.created?.submitted || [];
      case "approved": return campaignData.created?.approved || [];
      case "rejected": return campaignData.created?.rejected || [];
      case "funded": return campaignData.funded;
      default: return [];
    }
  };

  const EMPTY = {
    viewed: { icon: Eye, title: "No viewed campaigns yet", msg: "Browse campaigns to keep track of ones you've seen.", cta: "Browse Campaigns", to: "/dashboard" },
    favorites: { icon: Bookmark, title: "No favourites yet", msg: "Save campaigns you're interested in for later.", cta: "Browse Campaigns", to: "/dashboard" },
    created: { icon: PenLine, title: "No campaigns yet", msg: "Start creating your first campaign to raise funds.", cta: "Create Campaign", to: "/pages/CreateCampaign" },
    drafts: { icon: FileText, title: "No drafts", msg: "Your saved drafts will appear here.", cta: "Create Campaign", to: "/pages/CreateCampaign" },
    submitted: { icon: Clock, title: "Nothing under review", msg: "Campaigns you've submitted for approval will appear here.", cta: null },
    approved: { icon: CheckCircle, title: "No published campaigns", msg: "Your approved campaigns will appear here.", cta: null },
    rejected: { icon: XCircle, title: "No rejected campaigns", msg: "Rejected campaigns with admin feedback will appear here.", cta: null },
    funded: { icon: DollarSign, title: "No funded campaigns yet", msg: "Invest in campaigns you believe in.", cta: "Find Campaigns", to: "/dashboard" },
  };

  const stats = isFounder
    ? [
      { label: "Total", value: campaignData.created?.all?.length || 0, color: "text-gray-900" },
      { label: "Under Review", value: campaignData.created?.submitted?.length || 0, color: "text-amber-600" },
      { label: "Published", value: campaignData.created?.approved?.length || 0, color: "text-primary-600" },
      { label: "Drafts", value: campaignData.created?.drafts?.length || 0, color: "text-gray-500" },
    ]
    : [
      { label: "Viewed", value: campaignData.viewed?.length || 0, color: "text-blue-600" },
      { label: "Favourites", value: campaignData.favorites?.length || 0, color: "text-red-500" },
      { label: "Funded", value: campaignData.funded?.length || 0, color: "text-primary-600" },
      { label: "Portfolio", value: "—", color: "text-gray-400" },
    ];

  const campaigns = getActiveCampaigns();
  const empty = EMPTY[activeTab] || EMPTY.viewed;

  if (!isAuthenticated()) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar variant="campaigns" />

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden bg-gray-900 h-52">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/85 to-primary-900/60" />
        <motion.div
          animate={{ y: [0, -12, 0], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-6 right-24 w-56 h-56 bg-primary-500   blur-3xl pointer-events-none"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary-400" />
              <span className="text-primary-400 text-xs font-semibold uppercase tracking-widest">
                {isFounder ? "Founder Hub" : "Investor Hub"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">My Campaigns</h1>
            <p className="text-gray-400 text-sm mt-1">
              {isFounder ? "Manage your campaigns and track their progress" : "Track your investment activity and saved campaigns"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
            className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full"
          >
              <button onClick={() => loadAll(true)} disabled={refreshing}
                className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-medium border border-white/20 transition-all disabled:opacity-50 w-full md:w-auto">
                <RefreshCw className={`h-3.5 w-3.5 md:h-4 md:w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
              {isFounder && (
                <button onClick={() => navigate("/pages/CreateCampaign")}
                  className="flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-primary-500 hover:bg-primary-400 text-white text-xs md:text-sm font-bold transition-all hover:scale-105 shadow-lg shadow-primary-900/30 w-full md:w-auto">
                  <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" /> New Campaign
                </button>
              )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <div className={`text-3xl font-extrabold ${s.color} leading-none mb-1`}>
                {typeof s.value === "number" ? <AnimCount value={s.value} /> : s.value}
              </div>
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 flex-wrap mb-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2   text-sm font-medium transition-all ${active
                    ? "bg-primary-600 text-white shadow-md shadow-primary-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-700"
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5   font-semibold ${active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full  h-12 w-12 border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : campaigns.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {campaigns.map((campaign, i) => (
                <motion.div key={campaign.id} layout
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="relative group"
                >
                  <CampaignCard campaign={campaign} onFavoriteToggle={handleFavoriteToggle} showActions />

                  {/* Status badge */}
                  {isFounder && campaign.status && (
                    <div className="absolute top-3 left-3 z-10">
                      <StatusBadge status={campaign.status} />
                    </div>
                  )}

                  {/* Edit / delete actions */}
                  {isFounder && ["draft", "rejected"].includes(campaign.status) && (
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button onClick={e => { e.stopPropagation(); navigate(`/edit-campaign/${campaign.id}`); }}
                        className="p-2 bg-blue-600 text-white   shadow-lg hover:bg-blue-700 transition-colors" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      {campaign.status === "draft" && (
                        <button onClick={e => { e.stopPropagation(); handleDelete(campaign.id, campaign.title); }}
                          className="p-2 bg-red-600 text-white   shadow-lg hover:bg-red-700 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Admin feedback chip for rejected */}
                  {isFounder && campaign.status === "rejected" && campaign.adminComments && (
                    <div className="absolute top-12 left-3 z-10 max-w-[200px]">
                      <div className="bg-red-50 border border-red-200 text-red-700 px-2.5 py-1.5 text-xs rounded-xl shadow-sm">
                        <span className="font-semibold block mb-0.5">Admin feedback</span>
                        <span className="line-clamp-2">{campaign.adminComments}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              {React.createElement(empty.icon, { className: "h-8 w-8 text-gray-400" })}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{empty.title}</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">{empty.msg}</p>
            {empty.cta && (
              <button onClick={() => navigate(empty.to)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold   transition-all hover:scale-105">
                {empty.to?.includes("Create") && <Plus className="h-4 w-4" />}
                {empty.cta}
              </button>
            )}
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyCampaigns;
