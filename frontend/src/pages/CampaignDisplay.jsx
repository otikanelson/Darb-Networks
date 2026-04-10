import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { buildImageUrl, buildApiUrl } from "../config/apiUrl";
import {
  Heart, Share2, MapPin, Calendar, Eye, Users, DollarSign,
  Clock, ArrowLeft, Edit, Play, Star, CheckCircle, AlertTriangle,
  TrendingUp, Building, Mail, BarChart2, Shield, Lightbulb,
  Target, BookOpen, Award, ChevronRight, ExternalLink, Copy, Check,
} from "lucide-react";
import UnifiedNavbar from "../components/layout/Navbars";
import Footer from "../components/layout/Footer";
import CampaignCard from "../components/ui/CampaignCard";
import InvestmentModal from "../components/ui/InvestmentModal";

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "NGN",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n || 0);

const progress = (current, target) =>
  target > 0 ? Math.min((current / target) * 100, 100) : 0;

// Renders a long text block with a heading
const Section = ({ icon: Icon, title, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-5 w-5 text-green-600 flex-shrink-0" />}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
      {children}
    </div>
  </div>
);

const Divider = () => <hr className="border-gray-100" />;

// ─── main component ───────────────────────────────────────────────────────────
const CampaignDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [relatedCampaigns, setRelatedCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (id) { loadCampaign(); loadRelated(); } }, [id]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(buildApiUrl(`/campaigns/${id}`), { headers });
      if (!res.ok) throw new Error("Failed to load campaign");
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Failed to load campaign");
      setCampaign(result.data);
      setIsFavorited(result.data.isFavorited || false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRelated = async () => {
    try {
      const res = await fetch(buildApiUrl(`/campaigns/${id}/related?limit=3`));
      if (res.ok) {
        const result = await res.json();
        if (result.success) setRelatedCampaigns(result.data || []);
      }
    } catch { /* non-critical */ }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated()) { navigate("/login"); return; }
    setFavoriteLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(buildApiUrl(`/campaigns/${id}/favorite`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setIsFavorited(result.data.isFavorited);
          setCampaign((p) => ({ ...p, favoriteCount: result.data.favoriteCount ?? p.favoriteCount }));
        }
      }
    } catch { /* silent */ } finally { setFavoriteLoading(false); }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/campaign/${id}`;
    if (navigator.share) {
      navigator.share({ title: campaign.title, url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canInvest = () =>
    isAuthenticated() &&
    user?.id !== campaign?.creator?.id &&
    campaign?.status === "approved" &&
    progress(campaign.currentAmount, campaign.targetAmount) < 100 &&
    (campaign.daysRemaining ?? 1) > 0;

  const canEdit = () =>
    isAuthenticated() &&
    user?.id === campaign?.creator?.id &&
    ["draft", "rejected"].includes(campaign?.status);

  const imageUrl = () => {
    const u = campaign?.mainImageUrl;
    if (!u) return "/assets/placeholder-campaign.jpg";
    if (u.startsWith("http")) return u;
    return buildImageUrl(u);
  };

  const avatarUrl = () => {
    const u = campaign?.creator?.profileImageUrl;
    if (!u) return null;
    if (u.startsWith("http")) return u;
    return buildImageUrl(u);
  };

  const pct = campaign ? Math.round(progress(campaign.currentAmount, campaign.targetAmount)) : 0;
  const daysLeft = campaign?.daysRemaining ?? campaign?.durationDays ?? 0;

  // ── tabs config ──────────────────────────────────────────────────────────
  const tabs = [
    { id: "overview",    label: "Overview" },
    { id: "details",     label: "Business Details" },
    { id: "team",        label: "Team & Risks" },
  ];

  // ── tab content ──────────────────────────────────────────────────────────
  const renderTab = () => {
    if (!campaign) return null;
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8">
            <Section icon={BookOpen} title="About This Campaign">
              {campaign.description}
            </Section>
            {campaign.problemStatement && (
              <><Divider /><Section icon={AlertTriangle} title="The Problem">
                {campaign.problemStatement}
              </Section></>
            )}
            {campaign.solution && (
              <><Divider /><Section icon={Lightbulb} title="Our Solution">
                {campaign.solution}
              </Section></>
            )}
            {campaign.competitiveAdvantage && (
              <><Divider /><Section icon={Award} title="Competitive Advantage">
                {campaign.competitiveAdvantage}
              </Section></>
            )}
            {campaign.videoUrl && (
              <><Divider />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-600" /> Pitch Video
                  </h3>
                  <a
                    href={campaign.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Watch Video <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </>
            )}
          </div>
        );

      case "details":
        return (
          <div className="space-y-8">
            {campaign.marketAnalysis && (
              <Section icon={BarChart2} title="Market Analysis">
                {campaign.marketAnalysis}
              </Section>
            )}
            {campaign.businessPlan && (
              <><Divider /><Section icon={Target} title="Business Plan">
                {campaign.businessPlan}
              </Section></>
            )}
            {campaign.financialProjections && (
              <><Divider /><Section icon={TrendingUp} title="Financial Projections">
                {campaign.financialProjections}
              </Section></>
            )}
            {!campaign.marketAnalysis && !campaign.businessPlan && !campaign.financialProjections && (
              <div className="text-center py-12 text-gray-400">
                <Building className="mx-auto h-12 w-12 mb-3" />
                <p>Business details not provided yet.</p>
              </div>
            )}
          </div>
        );

      case "team":
        return (
          <div className="space-y-8">
            {campaign.teamInformation && (
              <Section icon={Users} title="Team Information">
                {campaign.teamInformation}
              </Section>
            )}
            {campaign.risksAndChallenges && (
              <><Divider /><Section icon={Shield} title="Risks & Challenges">
                {campaign.risksAndChallenges}
              </Section></>
            )}
            {!campaign.teamInformation && !campaign.risksAndChallenges && (
              <div className="text-center py-12 text-gray-400">
                <Users className="mx-auto h-12 w-12 mb-3" />
                <p>Team details not provided yet.</p>
              </div>
            )}
          </div>
        );

      default: return null;
    }
  };

  // ── loading / error states ───────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar variant="display" />
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
      </div>
      <Footer />
    </div>
  );

  if (error || !campaign) return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar variant="display" />
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h1>
        <p className="text-gray-500 mb-8">{error}</p>
        <button onClick={() => navigate("/dashboard")}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
          Browse Campaigns
        </button>
      </div>
      <Footer />
    </div>
  );

  // ── main render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar variant="display" />

      {/* ── Hero image ── */}
      <div className="relative w-full h-72 md:h-[420px] bg-gray-900 overflow-hidden">
        <img
          src={imageUrl()}
          alt={campaign.title}
          className="w-full h-full object-cover opacity-80"
          onError={(e) => { e.target.src = "/assets/placeholder-campaign.jpg"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* back button */}
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition">
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* badges + title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-medium">
              {campaign.category}
            </span>
            {campaign.isFeatured && (
              <span className="flex items-center gap-1 px-3 py-1 bg-yellow-400/90 text-yellow-900 rounded-full text-xs font-semibold">
                <Star className="h-3 w-3" /> Featured
              </span>
            )}
            {campaign.isUrgent && (
              <span className="px-3 py-1 bg-red-500/90 text-white rounded-full text-xs font-semibold">
                Urgent
              </span>
            )}
            {pct >= 100 && (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-500/90 text-white rounded-full text-xs font-semibold">
                <CheckCircle className="h-3 w-3" /> Fully Funded
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight max-w-3xl">
            {campaign.title}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-white/80 text-sm">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{campaign.location}</span>
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{campaign.viewCount?.toLocaleString() || 0} views</span>
            <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{campaign.favoriteCount || 0} saves</span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Left: tabs + content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* action row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2">
                <button onClick={handleFavorite} disabled={favoriteLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
                    isFavorited
                      ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}>
                  <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                  {isFavorited ? "Saved" : "Save"}
                </button>
                <button onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
                  {copied ? "Copied!" : "Share"}
                </button>
                {canEdit() && (
                  <button onClick={() => navigate(`/edit-campaign/${campaign.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    <Edit className="h-4 w-4" /> Edit
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                {campaign.investorCount || 0} investors
              </div>
            </div>

            {/* tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex gap-0">
                {tabs.map((t) => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                      activeTab === t.id
                        ? "border-green-600 text-green-700"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* tab body */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
              {renderTab()}
            </div>

            {/* ── Related campaigns ── */}
            {relatedCampaigns.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Campaigns</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {relatedCampaigns.map((c) => (
                    <CampaignCard key={c.id} campaign={c} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: sidebar ── */}
          <div className="space-y-5">

            {/* funding card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-4">
              {/* amounts */}
              <div className="mb-1">
                <span className="text-3xl font-bold text-gray-900">{fmt(campaign.currentAmount)}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                raised of <span className="font-semibold text-gray-700">{fmt(campaign.targetAmount)}</span> goal
              </p>

              {/* progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mb-5">{pct}% funded</p>

              {/* stats row */}
              <div className="grid grid-cols-3 gap-3 mb-5 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900">{campaign.investorCount || 0}</div>
                  <div className="text-xs text-gray-500">Investors</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900">{daysLeft}</div>
                  <div className="text-xs text-gray-500">Days Left</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-gray-900">{campaign.favoriteCount || 0}</div>
                  <div className="text-xs text-gray-500">Saves</div>
                </div>
              </div>

              {/* investment details */}
              <div className="space-y-2 text-sm mb-5">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Min. Investment</span>
                  <span className="font-semibold text-gray-900">{fmt(campaign.minimumInvestment)}</span>
                </div>
                {campaign.maximumInvestment && (
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Max. Investment</span>
                    <span className="font-semibold text-gray-900">{fmt(campaign.maximumInvestment)}</span>
                  </div>
                )}
                {campaign.endDate && (
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Deadline</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(campaign.endDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA */}
              {canInvest() ? (
                <button onClick={() => setShowInvestmentModal(true)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
                  <DollarSign className="h-5 w-5" /> Invest Now
                </button>
              ) : (
                <div className="w-full py-3 rounded-lg font-semibold text-center bg-gray-100 text-gray-400 text-sm">
                  {!isAuthenticated() ? "Log in to Invest"
                    : user?.id === campaign?.creator?.id ? "Your Campaign"
                    : pct >= 100 ? "Fully Funded"
                    : daysLeft <= 0 ? "Campaign Ended"
                    : campaign?.status !== "approved" ? "Not Yet Open"
                    : "Cannot Invest"}
                </div>
              )}
              {canInvest() && (
                <p className="text-xs text-gray-400 text-center mt-2">Secure payments via Paystack</p>
              )}
            </div>

            {/* creator card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Campaign Creator</h3>
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {avatarUrl() ? (
                    <img src={avatarUrl()} alt={campaign.creator?.fullName}
                      className="h-full w-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <span className="text-gray-600 font-semibold text-lg">
                      {campaign.creator?.fullName?.charAt(0) || "?"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-gray-900 truncate">{campaign.creator?.fullName || "Unknown"}</p>
                    {campaign.creator?.isVerified && (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  {campaign.creator?.company && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <Building className="h-3 w-3" />{campaign.creator.company}
                    </p>
                  )}
                  {campaign.creator?.bio && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-3">{campaign.creator.bio}</p>
                  )}
                  {campaign.creator?.website && (
                    <a href={campaign.creator.website} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline mt-2">
                      <ExternalLink className="h-3 w-3" /> Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* campaign meta card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Campaign Info</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Category", value: campaign.category },
                  { label: "Location", value: campaign.location },
                  { label: "Status", value: campaign.status?.charAt(0).toUpperCase() + campaign.status?.slice(1) },
                  campaign.approvedAt && { label: "Approved", value: new Date(campaign.approvedAt).toLocaleDateString("en-NG") },
                  campaign.startDate && { label: "Start Date", value: new Date(campaign.startDate).toLocaleDateString("en-NG") },
                  campaign.endDate && { label: "End Date", value: new Date(campaign.endDate).toLocaleDateString("en-NG") },
                  { label: "Duration", value: `${campaign.durationDays || campaign.totalDurationDays || "—"} days` },
                  { label: "Posted", value: new Date(campaign.createdAt).toLocaleDateString("en-NG") },
                ].filter(Boolean).map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900 text-right max-w-[55%] truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* admin comments (if rejected) */}
            {campaign.adminComments && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                <p className="font-semibold text-amber-800 mb-1">Admin Feedback</p>
                <p className="text-amber-700">{campaign.adminComments}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {showInvestmentModal && (
        <InvestmentModal
          campaign={campaign}
          onClose={() => setShowInvestmentModal(false)}
          onSuccess={() => { setShowInvestmentModal(false); loadCampaign(); }}
        />
      )}
    </div>
  );
};

export default CampaignDisplay;
