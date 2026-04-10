// CampaignDisplay

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { useAuth } from "../context/AuthContext";
import { buildImageUrl, buildApiUrl } from "../config/apiUrl";
import DOMPurify from "dompurify";
import {
  Heart, Share2, MapPin, Eye, Users, DollarSign, Clock,
  ArrowLeft, Edit, Play, Star, CheckCircle, AlertTriangle,
  TrendingUp, Building, BarChart2, Shield, Lightbulb,
  Target, BookOpen, Award, ExternalLink, Check, ChevronLeft,
  ChevronRight, X, Zap, Flag,
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

const pct = (cur, tgt) => (tgt > 0 ? Math.min((cur / tgt) * 100, 100) : 0);

// Safely render HTML from rich editor OR plain text
const RichContent = ({ html, className = "" }) => {
  if (!html) return null;
  const isHtml = /<[a-z][\s\S]*>/i.test(html);
  if (isHtml) {
    return (
      <div
        className={`prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-a:text-green-600 ${className}`}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
      />
    );
  }
  return (
    <p className={`text-gray-700 leading-relaxed whitespace-pre-wrap text-sm ${className}`}>
      {html}
    </p>
  );
};

// Section block with icon + title
const Section = ({ icon: Icon, title, children, accent = false }) => (
  <div className={`rounded-2xl p-6 md:p-8 ${accent ? "bg-green-50 border border-green-100" : "bg-white border border-gray-100"} shadow-sm`}>
    <div className="flex items-center gap-2 mb-4">
      {Icon && <div className={`p-2 rounded-lg ${accent ? "bg-green-100" : "bg-gray-100"}`}><Icon className={`h-4 w-4 ${accent ? "text-green-700" : "text-gray-600"}`} /></div>}
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

// Stat pill
const Stat = ({ label, value, sub }) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    {sub && <div className="text-xs text-gray-400">{sub}</div>}
    <div className="text-xs text-gray-500 mt-0.5">{label}</div>
  </div>
);

// ─── Image gallery lightbox ───────────────────────────────────────────────────
const Gallery = ({ images }) => {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  if (!images?.length) return null;

  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {images.slice(0, 6).map((src, i) => (
          <button key={i} onClick={() => { setIdx(i); setOpen(true); }}
            className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 hover:opacity-90 transition">
            <img src={src} alt={`gallery-${i}`} className="w-full h-full object-cover" />
            {i === 5 && images.length > 6 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold text-lg">
                +{images.length - 6}
              </div>
            )}
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <button onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <img src={images[idx]} alt="" className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full">
            <ChevronRight className="h-6 w-6" />
          </button>
          <button onClick={() => setOpen(false)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full">
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {idx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

// ─── Video embed helper ───────────────────────────────────────────────────────
const VideoEmbed = ({ url }) => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);

  if (ytMatch) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}`}
          className="w-full h-full" allowFullScreen
          title="Campaign video"
        />
      </div>
    );
  }
  if (vimeoMatch) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          className="w-full h-full" allowFullScreen
          title="Campaign video"
        />
      </div>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 text-sm font-medium transition">
      <Play className="h-4 w-4" /> Watch Video <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
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

  // Track when the funding card scrolls out of view
  const { ref: fundingCardRef, inView: fundingCardInView } = useInView({ threshold: 0.2 });

  useEffect(() => { if (id) { loadCampaign(); loadRelated(); } }, [id]);

  const loadCampaign = async () => {
    try {
      setLoading(true); setError(null);
      const token = localStorage.getItem("authToken");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(buildApiUrl(`/campaigns/${id}`), { headers });
      if (!res.ok) throw new Error("Failed to load campaign");
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Failed to load campaign");
      setCampaign(result.data);
      setIsFavorited(result.data.isFavorited || false);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const loadRelated = async () => {
    try {
      const res = await fetch(buildApiUrl(`/campaigns/${id}/related?limit=3`));
      if (res.ok) { const r = await res.json(); if (r.success) setRelatedCampaigns(r.data || []); }
    } catch { /* silent */ }
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
        const r = await res.json();
        if (r.success) { setIsFavorited(r.data.isFavorited); setCampaign(p => ({ ...p, favoriteCount: r.data.favoriteCount ?? p.favoriteCount })); }
      }
    } catch { /* silent */ } finally { setFavoriteLoading(false); }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/campaign/${id}`;
    if (navigator.share) { navigator.share({ title: campaign.title, url }); }
    else { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  if (!campaign) return null;

  const progress = pct(campaign.currentAmount, campaign.targetAmount);
  const daysLeft = campaign.daysRemaining ?? campaign.durationDays ?? 0;

  const canInvest = () =>
    isAuthenticated() &&
    user?.id !== campaign?.creator?.id &&
    campaign?.status === "approved" &&
    progress < 100 &&
    daysLeft > 0;

  const canEdit = () =>
    isAuthenticated() &&
    user?.id === campaign?.creator?.id &&
    ["draft", "rejected"].includes(campaign?.status);

  const heroImg = () => {
    const u = campaign.mainImageUrl;
    if (!u) return "/assets/placeholder-campaign.jpg";
    return u.startsWith("http") ? u : buildImageUrl(u);
  };

  const avatarUrl = () => {
    const u = campaign.creator?.profileImageUrl;
    if (!u) return null;
    return u.startsWith("http") ? u : buildImageUrl(u);
  };

  // Parse multiple video URLs (comma-separated from editor)
  const videoUrls = campaign.videoUrl
    ? campaign.videoUrl.split(",").map(v => v.trim()).filter(Boolean)
    : [];

  // Gallery images (future: from campaign_images table; for now use mainImageUrl as fallback)
  const galleryImages = campaign.galleryImages || [];

  // ── tabs ──────────────────────────────────────────────────────────────────
  const TABS = [
    { id: "overview",   label: "Overview" },
    { id: "market",     label: "Market & Competition" },
    { id: "business",   label: "Business & Financials" },
    { id: "team",       label: "Team & Risks" },
    ...(campaign.milestones?.length ? [{ id: "milestones", label: "Milestones" }] : []),
    ...(videoUrls.length || galleryImages.length ? [{ id: "media", label: "Media" }] : []),
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {campaign.description && (
              <Section icon={BookOpen} title="About This Campaign">
                <RichContent html={campaign.description} />
              </Section>
            )}
            {campaign.problemStatement && (
              <Section icon={AlertTriangle} title="The Problem">
                <RichContent html={campaign.problemStatement} />
              </Section>
            )}
            {campaign.solution && (
              <Section icon={Lightbulb} title="Our Solution" accent>
                <RichContent html={campaign.solution} />
              </Section>
            )}
            {campaign.competitiveAdvantage && (
              <Section icon={Award} title="Competitive Advantage">
                <RichContent html={campaign.competitiveAdvantage} />
              </Section>
            )}
            {!campaign.description && !campaign.problemStatement && !campaign.solution && (
              <div className="text-center py-16 text-gray-400">
                <BookOpen className="mx-auto h-12 w-12 mb-3 opacity-40" />
                <p>No overview content yet.</p>
              </div>
            )}
          </div>
        );

      case "market":
        return (
          <div className="space-y-6">
            {campaign.marketAnalysis && (
              <Section icon={BarChart2} title="Market Analysis">
                <RichContent html={campaign.marketAnalysis} />
              </Section>
            )}
            {campaign.competitiveAdvantage && (
              <Section icon={Award} title="Competitive Advantage">
                <RichContent html={campaign.competitiveAdvantage} />
              </Section>
            )}
            {!campaign.marketAnalysis && !campaign.competitiveAdvantage && (
              <div className="text-center py-16 text-gray-400">
                <BarChart2 className="mx-auto h-12 w-12 mb-3 opacity-40" />
                <p>Market details not provided yet.</p>
              </div>
            )}
          </div>
        );

      case "business":
        return (
          <div className="space-y-6">
            {campaign.businessPlan && (
              <Section icon={Target} title="Business Plan">
                <RichContent html={campaign.businessPlan} />
              </Section>
            )}
            {campaign.financialProjections && (
              <Section icon={TrendingUp} title="Financial Projections" accent>
                <RichContent html={campaign.financialProjections} />
              </Section>
            )}
            {!campaign.businessPlan && !campaign.financialProjections && (
              <div className="text-center py-16 text-gray-400">
                <Target className="mx-auto h-12 w-12 mb-3 opacity-40" />
                <p>Business details not provided yet.</p>
              </div>
            )}
          </div>
        );

      case "team":
        return (
          <div className="space-y-6">
            {campaign.teamInformation && (
              <Section icon={Users} title="The Team">
                <RichContent html={campaign.teamInformation} />
              </Section>
            )}
            {campaign.risksAndChallenges && (
              <Section icon={Shield} title="Risks & Challenges">
                <RichContent html={campaign.risksAndChallenges} />
              </Section>
            )}
            {!campaign.teamInformation && !campaign.risksAndChallenges && (
              <div className="text-center py-16 text-gray-400">
                <Users className="mx-auto h-12 w-12 mb-3 opacity-40" />
                <p>Team details not provided yet.</p>
              </div>
            )}
          </div>
        );

      case "milestones":
        return (
          <div className="space-y-4">
            {campaign.milestones?.length ? (
              <>
                {/* Progress summary */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>{campaign.milestones.filter(m => m.status === 'completed').length} of {campaign.milestones.length} milestones completed</span>
                  <span className="font-medium text-green-600">
                    {Math.round((campaign.milestones.filter(m => m.status === 'completed').length / campaign.milestones.length) * 100)}%
                  </span>
                </div>

                {campaign.milestones.map((m, i) => {
                  const isCompleted = m.status === 'completed';
                  const isActive = m.status === 'active';
                  const pctFunded = m.targetAmount > 0
                    ? Math.min(Math.round((m.currentAmount / m.targetAmount) * 100), 100)
                    : 0;

                  return (
                    <div key={m.id}
                      className={`rounded-2xl border p-5 transition-all ${
                        isCompleted ? 'bg-green-50 border-green-200' :
                        isActive    ? 'bg-blue-50 border-blue-200' :
                                      'bg-white border-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Step indicator */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5 ${
                          isCompleted ? 'bg-green-600 text-white' :
                          isActive    ? 'bg-blue-600 text-white' :
                                        'bg-gray-100 text-gray-500'
                        }`}>
                          {isCompleted ? <CheckCircle className="h-4 w-4" /> : i + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                            <h4 className="font-semibold text-gray-900">{m.title}</h4>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              isCompleted ? 'bg-green-100 text-green-700' :
                              isActive    ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-500'
                            }`}>
                              {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                            </span>
                          </div>

                          {m.description && (
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{m.description}</p>
                          )}

                          {/* Funding bar */}
                          {m.targetAmount > 0 && (
                            <div className="mb-3">
                              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                                  style={{ width: `${pctFunded}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(m.currentAmount || 0)} raised</span>
                                <span>Target: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(m.targetAmount)}</span>
                              </div>
                            </div>
                          )}

                          {/* Meta */}
                          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                            {m.targetDate && (
                              <span className="flex items-center gap-1">
                                <Flag className="h-3 w-3" />
                                Target: {new Date(m.targetDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                            {m.completedAt && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                Completed: {new Date(m.completedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Flag className="mx-auto h-12 w-12 mb-3 opacity-40" />
                <p>No milestones defined for this campaign.</p>
              </div>
            )}
          </div>
        );

      case "media":
        return (
          <div className="space-y-6">
            {videoUrls.length > 0 && (
              <Section icon={Play} title="Videos">
                <div className="space-y-4">
                  {videoUrls.map((url, i) => <VideoEmbed key={i} url={url} />)}
                </div>
              </Section>
            )}
            {galleryImages.length > 0 && (
              <Section icon={Award} title="Gallery">
                <Gallery images={galleryImages} />
              </Section>
            )}
          </div>
        );

      default: return null;
    }
  };

  // ── loading / error ────────────────────────────────────────────────────────
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
        <button onClick={() => navigate("/dashboard")} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">Browse Campaigns</button>
      </div>
      <Footer />
    </div>
  );

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar variant="display" />

      {/* ── Hero ── */}
      <div className="relative w-full h-64 md:h-[460px] bg-gray-900 overflow-hidden">
        <img src={heroImg()} alt={campaign.title}
          className="w-full h-full object-cover opacity-75"
          onError={(e) => { e.target.src = "/assets/placeholder-campaign.jpg"; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs font-medium border border-white/20">
                {campaign.category}
              </span>
              {campaign.isFeatured && (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-400/90 text-yellow-900 rounded-full text-xs font-semibold">
                  <Star className="h-3 w-3" /> Featured
                </span>
              )}
              {campaign.isUrgent && (
                <span className="flex items-center gap-1 px-3 py-1 bg-red-500/90 text-white rounded-full text-xs font-semibold">
                  <Zap className="h-3 w-3" /> Urgent
                </span>
              )}
              {progress >= 100 && (
                <span className="flex items-center gap-1 px-3 py-1 bg-green-500/90 text-white rounded-full text-xs font-semibold">
                  <CheckCircle className="h-3 w-3" /> Fully Funded
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight max-w-4xl mb-3">
              {campaign.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{campaign.location}</span>
              <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{(campaign.viewCount || 0).toLocaleString()} views</span>
              <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" />{campaign.favoriteCount || 0} saves</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{campaign.investorCount || 0} investors</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT: content ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* action bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleFavorite} disabled={favoriteLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${isFavorited ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                  <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                  {isFavorited ? "Saved" : "Save"}
                </button>
                <button onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
                  {copied ? "Copied!" : "Share"}
                </button>
                {canEdit() && (
                  <button onClick={() => navigate(`/edit-campaign/${campaign.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                    <Edit className="h-4 w-4" /> Edit Campaign
                  </button>
                )}
              </div>
            </div>

            {/* tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex overflow-x-auto border-b border-gray-100">
                {TABS.map((t) => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`flex-shrink-0 px-5 py-3.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                      activeTab === t.id
                        ? "border-green-600 text-green-700 bg-green-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="p-6 md:p-8">
                {renderTab()}
              </div>
            </div>

            {/* related */}
            {relatedCampaigns.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">More Like This</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {relatedCampaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: sidebar ── */}
          <div className="space-y-4">

            {/* funding card */}
            <div ref={fundingCardRef} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="mb-1">
                <span className="text-3xl font-bold text-gray-900">{fmt(campaign.currentAmount)}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                raised of <span className="font-semibold text-gray-800">{fmt(campaign.targetAmount)}</span> goal
              </p>

              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-700"
                  style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-gray-400 mb-5">{Math.round(progress)}% funded</p>

              <div className="grid grid-cols-3 gap-2 mb-5 py-4 border-y border-gray-50">
                <Stat value={campaign.investorCount || 0} label="Investors" />
                <Stat value={daysLeft} label="Days Left" />
                <Stat value={campaign.favoriteCount || 0} label="Saves" />
              </div>

              <div className="space-y-2.5 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Min. Investment</span>
                  <span className="font-semibold text-gray-900">{fmt(campaign.minimumInvestment)}</span>
                </div>
                {campaign.maximumInvestment && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Max. Investment</span>
                    <span className="font-semibold text-gray-900">{fmt(campaign.maximumInvestment)}</span>
                  </div>
                )}
                {campaign.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Deadline</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(campaign.endDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                )}
              </div>

              {canInvest() ? (
                <button onClick={() => setShowInvestmentModal(true)}
                  className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-sm">
                  <DollarSign className="h-5 w-5" /> Invest Now
                </button>
              ) : (
                <div className="w-full py-3.5 rounded-xl font-semibold text-center bg-gray-100 text-gray-400 text-sm">
                  {!isAuthenticated() ? "Log in to Invest"
                    : user?.id === campaign?.creator?.id ? "Your Campaign"
                    : progress >= 100 ? "Fully Funded"
                    : daysLeft <= 0 ? "Campaign Ended"
                    : campaign?.status !== "approved" ? "Not Yet Open"
                    : "Cannot Invest"}
                </div>
              )}
              {canInvest() && <p className="text-xs text-gray-400 text-center mt-2">Secure payments via Paystack</p>}
            </div>

            {/* creator card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Campaign Creator</p>
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                  {avatarUrl() ? (
                    <img src={avatarUrl()} alt={campaign.creator?.fullName} className="h-full w-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <span className="text-gray-600 font-bold text-xl">{campaign.creator?.fullName?.charAt(0) || "?"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-gray-900 truncate">{campaign.creator?.fullName || "Unknown"}</p>
                    {campaign.creator?.isVerified && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
                  </div>
                  {campaign.creator?.company && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <Building className="h-3 w-3" />{campaign.creator.company}
                    </p>
                  )}
                  {campaign.creator?.bio && (
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-4">{campaign.creator.bio}</p>
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

            {/* campaign meta */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Campaign Details</p>
              <div className="space-y-2.5 text-sm">
                {[
                  { label: "Category", value: campaign.category },
                  { label: "Location", value: campaign.location },
                  { label: "Status", value: campaign.status?.charAt(0).toUpperCase() + campaign.status?.slice(1) },
                  campaign.approvedAt && { label: "Approved", value: new Date(campaign.approvedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) },
                  campaign.startDate && { label: "Start Date", value: new Date(campaign.startDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) },
                  campaign.endDate && { label: "End Date", value: new Date(campaign.endDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) },
                  { label: "Duration", value: `${campaign.durationDays || campaign.totalDurationDays || "—"} days` },
                  { label: "Posted", value: new Date(campaign.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) },
                ].filter(Boolean).map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900 text-right max-w-[55%] truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* admin feedback */}
            {campaign.adminComments && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm">
                <p className="font-semibold text-amber-800 mb-1">Admin Feedback</p>
                <p className="text-amber-700 leading-relaxed">{campaign.adminComments}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* ── Sticky invest bar — appears when funding card scrolls out of view ── */}
      {canInvest() && !fundingCardInView && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{campaign.title}</p>
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-green-600">{Math.round(progress)}% funded</span>
                {' · '}{fmt(campaign.currentAmount)} raised
              </p>
            </div>
            <button
              onClick={() => setShowInvestmentModal(true)}
              className="flex-shrink-0 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-full transition-all hover:scale-105 shadow-md shadow-green-200"
            >
              <DollarSign className="h-4 w-4" />
              Invest Now
            </button>
          </div>
        </div>
      )}

      {showInvestmentModal && (
        <InvestmentModal
          isOpen={showInvestmentModal}
          campaign={campaign}
          onClose={() => setShowInvestmentModal(false)}
          onInvestmentSuccess={() => { setShowInvestmentModal(false); loadCampaign(); }}
        />
      )}
    </div>
  );
};

export default CampaignDisplay;
