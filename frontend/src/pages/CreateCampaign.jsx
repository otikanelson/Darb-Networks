import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { buildApiUrl } from '../config/apiUrl';
import {
  Save, Send, Upload, AlertCircle, Check, DollarSign,
  MapPin, Building, FileText, Image as ImageIcon, Video,
  Loader, ChevronRight, ChevronLeft, Calendar, X
} from "lucide-react";
import UnifiedNavbar from "../components/layout/Navbars";
import Footer from "../components/layout/Footer";

// Step indicator component
const StepIndicator = ({ currentStep, steps }) => (
  <div className="flex items-center justify-center mb-8">
    {steps.map((step, index) => {
      const stepNum = index + 1;
      const isCompleted = stepNum < currentStep;
      const isActive = stepNum === currentStep;
      return (
        <React.Fragment key={stepNum}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
              ${isCompleted ? 'bg-green-600 text-white' : isActive ? 'bg-green-700 text-white ring-4 ring-green-100' : 'bg-gray-200 text-gray-500'}`}>
              {isCompleted ? <Check className="h-5 w-5" /> : stepNum}
            </div>
            <span className={`mt-1 text-xs font-medium ${isActive ? 'text-green-700' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`h-0.5 w-16 mx-2 mb-4 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const STEPS = ['Basics', 'Story', 'Financials', 'Media', 'Milestones'];

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  React.useEffect(() => {
    if (!isAuthenticated()) { navigate("/login"); return; }
    if (user?.userType !== "founder") { navigate("/dashboard"); return; }
  }, [isAuthenticated, user, navigate]);

  const [formData, setFormData] = useState({
    title: "", description: "", category: "", location: "",
    targetAmount: "", minimumInvestment: "", endDate: "",
    problemStatement: "", solution: "", marketAnalysis: "",
    competitiveAdvantage: "", teamInformation: "", risksAndChallenges: "",
    financialProjections: "", businessPlan: "", videoUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [milestones, setMilestones] = useState([
    { title: "", description: "", targetAmount: "", timeline: "" }
  ]);

  const categories = [
    "Technology", "Healthcare", "Education", "Fintech", "Energy & Green Tech",
    "Agriculture", "Real Estate", "E-commerce", "Transportation",
    "Food & Beverages", "Logistics", "Manufacturing", "Fashion",
    "Clean Energy", "Media & Entertainment", "Other",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleMainImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setErrors(p => ({ ...p, mainImage: "Max 10MB" })); return; }
    if (!file.type.startsWith('image/')) { setErrors(p => ({ ...p, mainImage: "Images only" })); return; }
    setMainImage(file);
    setMainImagePreview(URL.createObjectURL(file));
    setErrors(p => ({ ...p, mainImage: null }));
  };

  const handleGalleryImages = (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter(f => f.size <= 10 * 1024 * 1024 && f.type.startsWith('image/'));
    const previews = valid.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setGalleryImages(prev => [...prev, ...previews].slice(0, 5));
  };

  const removeGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index, field, value) => {
    setMilestones(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const addMilestone = () => {
    if (milestones.length < 5)
      setMilestones(prev => [...prev, { title: "", description: "", targetAmount: "", timeline: "" }]);
  };

  const removeMilestone = (index) => {
    if (milestones.length > 1)
      setMilestones(prev => prev.filter((_, i) => i !== index));
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value);
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.category) newErrors.category = "Category is required";
      if (!formData.location.trim()) newErrors.location = "Location is required";
      if (!formData.description.trim()) newErrors.description = "Description is required";
      if (formData.description.trim().length < 50) newErrors.description = "Description must be at least 50 characters";
    }
    if (step === 3) {
      if (!formData.targetAmount) newErrors.targetAmount = "Target amount is required";
      if (!formData.minimumInvestment) newErrors.minimumInvestment = "Minimum investment is required";
      if (formData.targetAmount && parseFloat(formData.targetAmount) <= 0) newErrors.targetAmount = "Must be greater than 0";
      if (formData.minimumInvestment && parseFloat(formData.minimumInvestment) > parseFloat(formData.targetAmount))
        newErrors.minimumInvestment = "Cannot exceed target amount";
    }
    if (step === 4) {
      if (!mainImage && !mainImagePreview) newErrors.mainImage = "A cover image is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(s => Math.min(s + 1, STEPS.length));
  };

  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

  const submitCampaign = async (isDraft = false) => {
    if (!isDraft && !validateStep(currentStep)) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const payload = {
        title: formData.title, description: formData.description,
        category: formData.category, location: formData.location,
        targetAmount: formData.targetAmount, minimumInvestment: formData.minimumInvestment,
        endDate: formData.endDate, problemStatement: formData.problemStatement,
        solution: formData.solution, marketAnalysis: formData.marketAnalysis,
        competitiveAdvantage: formData.competitiveAdvantage,
        teamInformation: formData.teamInformation,
        risksAndChallenges: formData.risksAndChallenges,
        financialProjections: formData.financialProjections,
        businessPlan: formData.businessPlan, videoUrl: formData.videoUrl,
        isDraft,
      };

      const res = await fetch(buildApiUrl('/campaigns'), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Failed to save campaign");

      const campaignId = result.data.id;

      // Upload main image
      if (mainImage) {
        const fd = new FormData();
        fd.append("campaignImage", mainImage);
        await fetch(buildApiUrl(`/campaigns/${campaignId}/image`), {
          method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd,
        });
      }

      setSuccess(isDraft ? "Draft saved!" : "Campaign submitted for review!");
      setTimeout(() => navigate("/my-campaigns"), 1500);
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"}`;

  const textareaClass = (field) =>
    `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none ${errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar variant="dashboard" />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-1">Create Campaign</h1>
          <p className="text-green-100 text-sm">Tell investors your story — step by step.</p>
        </div>

        <StepIndicator currentStep={currentStep} steps={STEPS} />

        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
            <Check className="h-5 w-5 mr-2 flex-shrink-0" />{success}
          </div>
        )}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />{errors.general}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* ── STEP 1: Basics ── */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Building className="h-5 w-5 text-green-700" />
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Title <span className="text-red-500">*</span>
                </label>
                <input type="text" name="title" value={formData.title}
                  onChange={handleInputChange} className={inputClass('title')}
                  placeholder="e.g. AgroSmart — AI-powered farm management for smallholders" />
                <div className="flex justify-between mt-1">
                  {errors.title ? <p className="text-sm text-red-500">{errors.title}</p> : <span />}
                  <span className="text-xs text-gray-400">{formData.title.length}/100</span>
                </div>
              </div>

              {/* Category + Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select name="category" value={formData.category}
                    onChange={handleInputChange} className={inputClass('category')}>
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <input type="text" name="location" value={formData.location}
                      onChange={handleInputChange}
                      className={`${inputClass('location')} pl-10`}
                      placeholder="e.g. Lagos, Nigeria" />
                  </div>
                  {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  A concise pitch — this appears on campaign cards. Make it compelling.
                </p>
                <textarea name="description" value={formData.description}
                  onChange={handleInputChange} rows={4}
                  className={textareaClass('description')}
                  placeholder="Describe your startup in 2–3 sentences. What do you do, who is it for, and why now?" />
                <div className="flex justify-between mt-1">
                  {errors.description ? <p className="text-sm text-red-500">{errors.description}</p> : <span />}
                  <span className={`text-xs ${formData.description.length < 50 ? 'text-red-400' : 'text-gray-400'}`}>
                    {formData.description.length} / min 50
                  </span>
                </div>
              </div>

              {/* Campaign End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign End Date
                </label>
                <p className="text-xs text-gray-500 mb-2">Leave blank for a 90-day default.</p>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input type="date" name="endDate" value={formData.endDate}
                    onChange={handleInputChange}
                    min={new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Story ── */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-green-700" />
                <h2 className="text-xl font-semibold text-gray-900">Your Story</h2>
              </div>
              <p className="text-sm text-gray-500 -mt-4">
                Help investors understand the full picture. All fields are optional but the more you share, the more trust you build.
              </p>

              {[
                { name: 'problemStatement', label: 'Problem Statement', placeholder: "What problem are you solving? Include data, market research, and real user pain points." },
                { name: 'solution', label: 'Your Solution', placeholder: "How does your product/service solve this? What makes your approach unique?" },
                { name: 'marketAnalysis', label: 'Market Analysis', placeholder: "How big is the market? Who are your target customers? What's the growth potential?" },
                { name: 'competitiveAdvantage', label: 'Competitive Advantage', placeholder: "Who are your competitors? What sets you apart — technology, team, timing, distribution?" },
                { name: 'teamInformation', label: 'Team', placeholder: "Who is behind this? Highlight relevant experience, past wins, and why this team can execute." },
                { name: 'risksAndChallenges', label: 'Risks & Challenges', placeholder: "Be honest about the risks. Investors appreciate transparency — what could go wrong and how will you handle it?" },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <textarea name={name} value={formData[name]} onChange={handleInputChange}
                    rows={4} className={textareaClass(name)} placeholder={placeholder} />
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 3: Financials ── */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="h-5 w-5 text-green-700" />
                <h2 className="text-xl font-semibold text-gray-900">Financial Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Funding Goal (NGN) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" name="targetAmount" value={formData.targetAmount}
                    onChange={handleInputChange} min="0" step="1000"
                    className={inputClass('targetAmount')} placeholder="e.g. 5000000" />
                  {formData.targetAmount && <p className="mt-1 text-xs text-green-700 font-medium">{formatCurrency(formData.targetAmount)}</p>}
                  {errors.targetAmount && <p className="mt-1 text-sm text-red-500">{errors.targetAmount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Investment (NGN) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" name="minimumInvestment" value={formData.minimumInvestment}
                    onChange={handleInputChange} min="0" step="1000"
                    className={inputClass('minimumInvestment')} placeholder="e.g. 50000" />
                  {formData.minimumInvestment && <p className="mt-1 text-xs text-green-700 font-medium">{formatCurrency(formData.minimumInvestment)}</p>}
                  {errors.minimumInvestment && <p className="mt-1 text-sm text-red-500">{errors.minimumInvestment}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Financial Projections</label>
                <p className="text-xs text-gray-500 mb-2">Revenue forecasts, break-even timeline, ROI expectations for investors.</p>
                <textarea name="financialProjections" value={formData.financialProjections}
                  onChange={handleInputChange} rows={5} className={textareaClass('financialProjections')}
                  placeholder="Year 1: ₦X revenue, Year 2: ₦Y... Include assumptions and methodology." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Plan Summary</label>
                <textarea name="businessPlan" value={formData.businessPlan}
                  onChange={handleInputChange} rows={5} className={textareaClass('businessPlan')}
                  placeholder="Business model, go-to-market strategy, revenue streams, growth plan..." />
              </div>
            </div>
          )}

          {/* ── STEP 4: Media ── */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <ImageIcon className="h-5 w-5 text-green-700" />
                <h2 className="text-xl font-semibold text-gray-900">Media</h2>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">This is the main image shown on campaign cards. PNG or JPG, max 10MB.</p>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${errors.mainImage ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-green-400'}`}>
                  {mainImagePreview ? (
                    <div className="relative inline-block">
                      <img src={mainImagePreview} alt="Cover" className="max-h-56 mx-auto rounded-lg object-cover" />
                      <button type="button" onClick={() => { setMainImage(null); setMainImagePreview(null); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <span className="text-sm font-medium text-gray-700">Click to upload cover image</span>
                      <span className="block text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleMainImage} />
                    </label>
                  )}
                </div>
                {errors.mainImage && <p className="mt-1 text-sm text-red-500">{errors.mainImage}</p>}
              </div>

              {/* Gallery */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images (optional)</label>
                <p className="text-xs text-gray-500 mb-2">Up to 5 additional images — product shots, team photos, prototypes.</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                  {galleryImages.map((img, i) => (
                    <div key={i} className="relative aspect-square">
                      <img src={img.preview} alt="" className="w-full h-full object-cover rounded-lg" />
                      <button type="button" onClick={() => removeGalleryImage(i)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {galleryImages.length < 5 && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors">
                      <div className="text-center">
                        <Upload className="h-5 w-5 text-gray-400 mx-auto" />
                        <span className="text-xs text-gray-400 mt-1 block">Add</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryImages} />
                    </label>
                  )}
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pitch Video URL (optional)</label>
                <div className="relative">
                  <Video className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input type="url" name="videoUrl" value={formData.videoUrl}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://youtube.com/watch?v=..." />
                </div>
                <p className="mt-1 text-xs text-gray-400">YouTube or Vimeo links work best.</p>
              </div>
            </div>
          )}

          {/* ── STEP 5: Milestones ── */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-green-700" />
                <h2 className="text-xl font-semibold text-gray-900">Funding Milestones</h2>
              </div>
              <p className="text-sm text-gray-500">
                Break your funding goal into stages. Each milestone shows investors exactly how their money will be used.
              </p>

              {milestones.map((m, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-5 space-y-4 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Milestone {i + 1}</span>
                    {milestones.length > 1 && (
                      <button type="button" onClick={() => removeMilestone(i)}
                        className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1">
                        <X className="h-3 w-3" /> Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                      <input type="text" value={m.title}
                        onChange={e => handleMilestoneChange(i, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g. MVP Launch" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Target Amount (NGN)</label>
                      <input type="number" value={m.targetAmount}
                        onChange={e => handleMilestoneChange(i, 'targetAmount', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g. 2000000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description / Deliverables</label>
                    <textarea value={m.description}
                      onChange={e => handleMilestoneChange(i, 'description', e.target.value)}
                      rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      placeholder="What will be achieved at this milestone?" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Timeline</label>
                    <input type="text" value={m.timeline}
                      onChange={e => handleMilestoneChange(i, 'timeline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g. Month 1–3" />
                  </div>
                </div>
              ))}

              {milestones.length < 5 && (
                <button type="button" onClick={addMilestone}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors">
                  + Add Milestone
                </button>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
            <button type="button" onClick={currentStep === 1 ? () => navigate('/dashboard') : prevStep}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <ChevronLeft className="h-4 w-4" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            <div className="flex gap-3">
              <button type="button" onClick={() => submitCampaign(true)} disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50">
                <Save className="h-4 w-4" />
                Save Draft
              </button>

              {currentStep < STEPS.length ? (
                <button type="button" onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-sm font-medium">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" onClick={() => submitCampaign(false)} disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-sm font-medium disabled:opacity-50">
                  {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {loading ? 'Submitting...' : 'Submit for Review'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateCampaign;
