import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { buildApiUrl, buildImageUrl } from "../config/apiUrl";
import UnifiedNavbar from "../components/layout/Navbars";
import Footer from "../components/layout/Footer";
import CampaignCard from "../components/ui/CampaignCard";
import CampaignService from "../services/CampaignService";
import { CustomNav } from "../hooks/CustomNavigation";
import {
  Search, Grid, List, ChevronDown, CheckCircle, Filter,
  Eye, Heart, PenLine, DollarSign, FileText, ArrowUpDown,
  X, SlidersHorizontal, MapPin, Building, Star, Sparkles,
  TrendingUp, Plus, ChevronLeft, ChevronRight,
  Zap, Palette, Users, Leaf, LayoutGrid,
} from "lucide-react";

// ── Skeleton ─────────────────────────────────────────────────────────────────
const CampaignSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
    <div className="h-48 bg-gradient-to-r from-gray-100 to-gray-200 w-full" />
    <div className="p-5 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 bg-gray-100 rounded-full w-1/4" />
        <div className="h-4 bg-gray-100 rounded-full w-1/5" />
      </div>
      <div className="h-6 bg-gray-100 rounded w-3/4" />
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-2 bg-gray-100 rounded-full" />
      <div className="grid grid-cols-3 gap-3 pt-1">
        {[0,1,2].map(i => <div key={i} className="h-8 bg-gray-100 rounded" />)}
      </div>
    </div>
  </div>
);

// ── List-view card ────────────────────────────────────────────────────────────
const ListCard = ({ campaign, navigate, buildImageUrl, formatCurrency, calcPct }) => {
  const pct = calcPct(campaign.current_amount, campaign.target_amount);
  const imgSrc = campaign.main_image_url
    ? campaign.main_image_url.startsWith("http")
      ? campaign.main_image_url
      : buildImageUrl(campaign.main_image_url)
    : "/assets/placeholder-campaign.jpg";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      onClick={() => navigate(`/campaign/${campaign.id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary-200 hover:shadow-lg shadow-sm cursor-pointer flex transition-all duration-200"
    >
      <div className="w-52 h-44 flex-shrink-0 relative overflow-hidden">
        <img src={imgSrc} alt={campaign.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = "/assets/placeholder-campaign.jpg"; }} />
        {campaign.is_featured && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
            <Star className="h-3 w-3 fill-current" /> Featured
          </div>
        )}
      </div>
      <div className="flex-1 p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{campaign.category}</span>
            <h3 className="text-lg font-bold text-gray-900 mt-1.5 line-clamp-1">{campaign.title}</h3>
            <div className="flex items-center text-xs text-gray-400 mt-0.5 gap-1">
              <MapPin className="h-3 w-3" />{campaign.location}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-primary-600">{pct}%</div>
            <div className="text-xs text-gray-400">funded</div>
          </div>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{campaign.description}</p>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <motion.div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-semibold text-gray-800">{formatCurrency(campaign.current_amount || 0)}</span>
          <span>of {formatCurrency(campaign.target_amount)}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{campaign.view_count || 0}</span>
            <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{campaign.favorite_count || 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedFilter, setSelectedFilter] = useState("All Campaigns");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("Date Posted");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  const limit = 12;

  const { user, isAuthenticated } = useAuth();
  const navigate = CustomNav();
  const isFounder = user?.userType?.toLowerCase() === "founder";
  const isInvestor = user?.userType?.toLowerCase() === "investor";

  const categories = {
    "Tech & Innovation": ["Audio","Tools","Education","Energy & Green Tech","Fashion & Wearables","Food & Beverages","Health & Fitness","Home","Phones & Accessories","Productivity","Transportation","Travel & Outdoors"],
    "Creative Works": ["Art","Comics","Dance & Theater","Film","Music","Photography","Podcasts, Blogs & Vlogs","Tabletop Games","Video Games","TV series & Shows","Writing & Publishing"],
    "Community Projects": ["Culture","Environment","Human Rights","Local Businesses","Wellness"],
  };

  const filterOptions = [
    { id: "all",           label: "All Campaigns", icon: null },
    { id: "featured",      label: "Featured",      icon: <Star className="h-3.5 w-3.5" /> },
    { id: "goal-reached",  label: "Goal Reached",  icon: <CheckCircle className="h-3.5 w-3.5" /> },
    { id: "active",        label: "Active",        icon: <TrendingUp className="h-3.5 w-3.5" /> },
  ];

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "All Categories");
    setSelectedFilter(searchParams.get("filter") || "All Campaigns");
  }, [searchParams]);

  useEffect(() => { loadCampaigns(); }, []);

  useEffect(() => { applyFilters(); }, [campaigns, selectedCategory, selectedFilter, searchTerm, sortBy]);

  useEffect(() => { setCurrentPage(1); }, [selectedCategory, selectedFilter, searchTerm, sortBy]);

  const loadCampaigns = async () => {
    try {
      setLoading(true); setError(null);
      const response = await fetch(buildApiUrl("/campaigns"));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      const data = result.success ? result.data : result;
      setCampaigns(data || []);
      setTotalCampaigns(data?.length || 0);
    } catch (err) {
      setError("Failed to load campaigns. Please try again.");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let f = [...campaigns];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      f = f.filter(c => [c.title, c.description, c.category, c.founder_name, c.location].some(v => v?.toLowerCase().includes(q)));
    }
    if (selectedCategory !== "All Categories") {
      if (Object.keys(categories).includes(selectedCategory)) {
        const subs = categories[selectedCategory];
        f = f.filter(c => subs.includes(c.category));
      } else {
        f = f.filter(c => c.category === selectedCategory);
      }
    }
    switch (selectedFilter) {
      case "Goal Reached": f = f.filter(c => (c.current_amount||0) >= (c.target_amount||1)); break;
      case "Active":       f = f.filter(c => c.status === "approved" && (c.current_amount||0) < (c.target_amount||1)); break;
      case "Featured":     f = f.filter(c => c.is_featured || c.isFeatured); break;
    }
    switch (sortBy) {
      case "Most Funded": f.sort((a,b) => (b.current_amount||0) - (a.current_amount||0)); break;
      case "End Date":    f.sort((a,b) => new Date(a.created_at) - new Date(b.created_at)); break;
      default:            f.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }
    setFilteredCampaigns(f);
    setFilteredCount(f.length);
  };

  const updateURL = (updates) => {
    const p = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (!v || v === "All Categories" || v === "All Campaigns") p.delete(k);
      else p.set(k, v);
    });
    setSearchParams(p);
  };

  const clearAll = () => {
    setSearchTerm(""); setSelectedCategory("All Categories"); setSelectedFilter("All Campaigns");
    updateURL({ search: null, category: null, filter: null });
  };

  const fmt = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n || 0);
  const calcPct = (cur, tgt) => !tgt ? 0 : Math.min(Math.round((cur / tgt) * 100), 100);

  const paginated = filteredCampaigns.slice((currentPage - 1) * limit, currentPage * limit);
  const totalPages = Math.ceil(filteredCount / limit);
  const hasFilters = searchTerm || selectedCategory !== "All Categories" || selectedFilter !== "All Campaigns";

  const handleFavoriteToggle = async (id) => { try { return await CampaignService.toggleFavorite(id); } catch { return false; } };
  const handleViewClick = async (id) => { try { await CampaignService.trackView(id); } catch {} };

  // ── Sidebar category filter ─────────────────────────────────────────────────
  const groupIcons = {
    "Tech & Innovation": <Zap className="h-4 w-4" />,
    "Creative Works":    <Palette className="h-4 w-4" />,
    "Community Projects":<Users className="h-4 w-4" />,
  };

  const CategoryFilter = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-50">
        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary-600" /> Categories
        </h3>
      </div>

      {/* Scrollable list */}
      <div className="overflow-y-auto max-h-[calc(100vh-280px)] px-3 py-3 space-y-0.5">
        {/* All */}
        <button
          onClick={() => { setSelectedCategory("All Categories"); updateURL({ category: null }); }}
          className={`w-full text-left text-sm px-3 py-2 rounded-xl flex items-center gap-2.5 transition-all ${
            selectedCategory === "All Categories"
              ? "bg-primary-600 text-white font-semibold shadow-sm shadow-primary-200"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5 flex-shrink-0" />
          All Categories
        </button>

        {/* Groups */}
        {Object.entries(categories).map(([group, subs]) => {
          const isGroupActive = selectedCategory === group || subs.includes(selectedCategory);
          const isOpen = categoryMenuOpen === group;

          return (
            <div key={group}>
              <button
                onClick={() => {
                  setSelectedCategory(group);
                  updateURL({ category: group });
                  setCategoryMenuOpen(p => p === group ? null : group);
                }}
                className={`w-full text-left text-sm px-3 py-2 rounded-xl flex items-center justify-between gap-2 transition-all ${
                  isGroupActive
                    ? "text-primary-700 font-semibold bg-primary-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className={`flex-shrink-0 ${isGroupActive ? "text-primary-600" : "text-gray-400"}`}>
                    {groupIcons[group]}
                  </span>
                  {group}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary-600" : "text-gray-400"}`} />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 pl-3 border-l-2 border-gray-100 mt-0.5 mb-1 space-y-0.5">
                      {subs.map(cat => (
                        <button
                          key={cat}
                          onClick={() => { setSelectedCategory(cat); updateURL({ category: cat }); }}
                          className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                            selectedCategory === cat
                              ? "text-primary-700 font-semibold bg-primary-50"
                              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                          }`}
                        >
                          {selectedCategory === cat && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                          )}
                          {cat}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Pagination ──────────────────────────────────────────────────────────────
  const Pagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-2 mt-10">
        <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}
          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:border-primary-400 hover:text-primary-600 transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
          const pg = start + i;
          if (pg > totalPages) return null;
          return (
            <button key={pg} onClick={() => setCurrentPage(pg)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${currentPage === pg ? "bg-primary-600 text-white shadow-md shadow-primary-200" : "bg-white border border-gray-200 text-gray-600 hover:border-primary-400"}`}>
              {pg}
            </button>
          );
        })}
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-40 hover:border-primary-400 hover:text-primary-600 transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar variant="dashboard" />

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden bg-gray-900 h-64">
        <img src="/assets/featured-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-primary-900/60" />

        {/* Floating orbs */}
        <motion.div animate={{ y: [0, -14, 0], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-8 right-32 w-48 h-48 bg-primary-500 rounded-full blur-3xl pointer-events-none" />
        <motion.div animate={{ y: [0, 12, 0], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 right-64 w-32 h-32 bg-emerald-400 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary-400" />
              <span className="text-primary-400 text-sm font-semibold uppercase tracking-widest">Explore</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Discover Startups</h1>
            <p className="text-gray-400 text-base">
              {!loading && `${totalCampaigns} campaign${totalCampaigns !== 1 ? "s" : ""} live right now`}
            </p>
          </motion.div>


        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Search + filter bar ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="search" placeholder="Search campaigns, founders, categories…"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); updateURL({ search: e.target.value }); }}
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all" />
              {searchTerm && (
                <button onClick={() => { setSearchTerm(""); updateURL({ search: null }); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(opt => (
                <button key={opt.id}
                  onClick={() => { setSelectedFilter(opt.label); updateURL({ filter: opt.label }); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedFilter === opt.label
                      ? "bg-primary-600 text-white shadow-md shadow-primary-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {opt.icon}{opt.label}
                  {selectedFilter === opt.label && filteredCount > 0 && (
                    <span className="bg-white/25 text-white text-xs px-1.5 py-0.5 rounded-full">{filteredCount}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 ml-auto">
              {/* View toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                {[["grid", <Grid className="h-4 w-4" />], ["list", <List className="h-4 w-4" />]].map(([mode, icon]) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === mode ? "bg-white shadow text-primary-600" : "text-gray-500 hover:text-gray-700"}`}>
                    {icon}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="relative" ref={sortRef}>
                <button onClick={() => setSortOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 transition-colors">
                  <ArrowUpDown className="h-3.5 w-3.5" />{sortBy}<ChevronDown className="h-3.5 w-3.5" />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.97 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20">
                      {["Date Posted", "Most Funded", "End Date"].map(opt => (
                        <button key={opt} onClick={() => { setSortBy(opt); setSortOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === opt ? "text-primary-600 font-semibold bg-primary-50" : "text-gray-700 hover:bg-gray-50"}`}>
                          {opt}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Active filter chips ── */}
        <AnimatePresence>
          {hasFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-2 mb-5 overflow-hidden">
              <span className="text-xs text-gray-500 font-medium">Filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  "{searchTerm}" <button onClick={() => { setSearchTerm(""); updateURL({ search: null }); }}><X className="h-3 w-3" /></button>
                </span>
              )}
              {selectedCategory !== "All Categories" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                  {selectedCategory} <button onClick={() => { setSelectedCategory("All Categories"); updateURL({ category: null }); }}><X className="h-3 w-3" /></button>
                </span>
              )}
              {selectedFilter !== "All Campaigns" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                  {selectedFilter} <button onClick={() => { setSelectedFilter("All Campaigns"); updateURL({ filter: null }); }}><X className="h-3 w-3" /></button>
                </span>
              )}
              <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">Clear all</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main layout ── */}
        <div className="flex gap-7">
          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
            className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-8 space-y-4">
              <CategoryFilter />

            {isAuthenticated() && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Quick Links</h3>
                <div className="space-y-1">
                  {[
                    { to: "/my-campaigns?tab=favorites", icon: <Heart className="h-4 w-4" />, label: "Favorites" },
                    ...(isFounder ? [
                      { to: "/my-campaigns?tab=created", icon: <PenLine className="h-4 w-4" />, label: "My Campaigns" },
                      { to: "/my-campaigns?tab=drafts",  icon: <FileText className="h-4 w-4" />, label: "Drafts" },
                    ] : []),
                    ...(isInvestor ? [
                      { to: "/my-campaigns?tab=funded", icon: <DollarSign className="h-4 w-4" />, label: "Funded Projects" },
                    ] : []),
                  ].map(({ to, icon, label }) => (
                    <Link key={to} to={to}
                      className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-xl transition-colors">
                      {icon}{label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            </div>{/* end sticky */}
          </motion.div>

          {/* Campaign grid / list */}
          <div className="flex-1 min-w-0">
            {/* Result count */}
            {!loading && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-500 mb-4">
                {filteredCount > 0
                  ? `Showing ${Math.min(currentPage * limit, filteredCount)} of ${filteredCount} campaign${filteredCount !== 1 ? "s" : ""}${hasFilters ? ` (${totalCampaigns} total)` : ""}`
                  : `No campaigns found${totalCampaigns > 0 ? ` — ${totalCampaigns} total available` : ""}`}
              </motion.p>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <CampaignSkeleton key={i} />)}
              </div>
            ) : error ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <SlidersHorizontal className="h-10 w-10 text-red-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Couldn't load campaigns</h3>
                <p className="text-sm text-gray-500 mb-5">{error}</p>
                <button onClick={loadCampaigns} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors">
                  Try Again
                </button>
              </motion.div>
            ) : paginated.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <Filter className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No campaigns match</h3>
                <p className="text-sm text-gray-500 mb-5">Try adjusting your search or filters.</p>
                {hasFilters && (
                  <button onClick={clearAll} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors">
                    Clear Filters
                  </button>
                )}
              </motion.div>
            ) : viewMode === "grid" ? (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {paginated.map((campaign, i) => (
                    <motion.div key={campaign.id} layout
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}>
                      <CampaignCard campaign={campaign} onFavoriteToggle={handleFavoriteToggle} onViewClick={handleViewClick} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {paginated.map((campaign, i) => (
                    <ListCard key={campaign.id} campaign={campaign} navigate={navigate}
                      buildImageUrl={buildImageUrl} formatCurrency={fmt} calcPct={calcPct} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            <Pagination />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
