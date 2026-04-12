// CampaignEditor

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../../config/apiUrl';
import RichEditor from './RichEditor';
import toast from 'react-hot-toast';
import {
  ChevronLeft, ChevronRight, Check, AlertCircle, Save,
  Send, X, Plus, Trash2, Image as ImageIcon,
  DollarSign, MapPin, Calendar, Info, ArrowRight,
} from 'lucide-react';

// ─── data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Audio','Tools','Education','Energy & Green Tech','Fashion & Wearables',
  'Food & Beverages','Health & Fitness','Home','Phones & Accessories',
  'Productivity','Transportation','Travel & Outdoors','Art','Comics',
  'Dance & Theater','Film','Music','Photography','Podcasts, Blogs & Vlogs',
  'Tabletop Games','Video Games','TV series & Shows','Writing & Publishing',
  'Culture','Environment','Human Rights','Local Businesses','Wellness',
];

const STEPS = [
  {
    id: 'basics',
    label: 'Basics',
    title: 'Start with the essentials',
    description: 'Give your campaign a name, pick a category, and write a short pitch that hooks investors in the first sentence.',
    fields: ['title','category','location','description'],
  },
  {
    id: 'problem',
    label: 'The Problem',
    title: 'What problem are you solving?',
    description: 'Investors fund solutions to real problems. Be specific — use data, name who is affected, and show the cost of inaction.',
    fields: ['problemStatement'],
  },
  {
    id: 'solution',
    label: 'Solution',
    title: 'How do you solve it?',
    description: 'Walk investors through your product or service. Explain how it works and why your approach is the right one.',
    fields: ['solution'],
  },
  {
    id: 'market',
    label: 'Market',
    title: 'How big is the opportunity?',
    description: 'Show the size of your market, who your competitors are, and what gives you a lasting edge over them.',
    fields: ['marketAnalysis','competitiveAdvantage'],
  },
  {
    id: 'business',
    label: 'Business',
    title: 'How do you make money?',
    description: 'Describe your revenue model, go-to-market strategy, and where this investment goes. Add financial projections.',
    fields: ['businessPlan','financialProjections'],
  },
  {
    id: 'team',
    label: 'Team',
    title: 'Who is building this?',
    description: 'Investors back people as much as ideas. Introduce your team, and be honest about the risks you face. You can include contact details, images and references',
    fields: ['teamInformation','risksAndChallenges'],
  },
  {
    id: 'media',
    label: 'Media',
    title: 'Show, don\'t just tell',
    description: 'A great cover image and pitch video dramatically increase investor confidence. Add gallery images too.',
    fields: [],
  },
  {
    id: 'funding',
    label: 'Funding',
    title: 'Set your funding targets',
    description: 'How much do you need, and what\'s the minimum someone can invest? Set a deadline to create urgency.',
    fields: ['targetAmount','minimumInvestment'],
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const stripHtml = (h) => h?.replace(/<[^>]*>/g, '').trim() || '';
const fmtNum = (v) => {
  const n = parseFloat(String(v || '').replace(/,/g, ''));
  return isNaN(n) ? v : n.toLocaleString('en-NG');
};

// ─── tiny components ──────────────────────────────────────────────────────────
const Label = ({ children, required, sub }) => (
  <div className="mb-2">
    <label className="text-sm font-semibold text-gray-800">
      {children}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const Err = ({ msg }) => msg
  ? <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{msg}</p>
  : null;

const inp = (err) =>
  `w-full px-4 py-3 rounded-xl border outline-none transition-all text-gray-900 text-sm
   focus:ring-2 focus:ring-green-500 focus:border-transparent
   ${err ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`;

// ─── ImageUploadZone ──────────────────────────────────────────────────────────
const ImageUploadZone = ({ value, onChange, onRemove, multiple = false, compact = false }) => {
  const onDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) onChange(multiple ? files : files[0]);
  }, [onChange, multiple]);

  const src = (item) => typeof item === 'string' ? item : URL.createObjectURL(item);

  return (
    <div className="space-y-3">
      {/* previews */}
      {!multiple && value && (
        <div className="relative inline-block group">
          <img src={src(value)} alt="" className="h-48 w-auto max-w-full rounded-2xl object-cover border border-gray-100 shadow-sm" />
          <button type="button" onClick={onRemove}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition hover:bg-red-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((item, i) => (
            <div key={i} className="relative group">
              <img src={src(item)} alt="" className="h-24 w-24 rounded-xl object-cover border border-gray-100" />
              <button type="button" onClick={() => onRemove(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:bg-red-600">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* drop zone */}
      <label onDragOver={e => e.preventDefault()} onDrop={onDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all
          hover:border-green-400 hover:bg-green-50/50 group
          ${compact ? 'h-24' : 'h-40'}
          ${(!multiple && value) || (multiple && value?.length >= 8) ? 'border-gray-100 bg-gray-50' : 'border-gray-200 bg-white'}`}>
        <ImageIcon className="h-7 w-7 text-gray-300 group-hover:text-green-500 transition mb-1.5" />
        <span className="text-sm text-gray-400 group-hover:text-green-600 transition">
          Drop here or <span className="font-medium underline underline-offset-2">browse</span>
        </span>
        <span className="text-xs text-gray-300 mt-1">JPG, PNG, WebP · max 10 MB</span>
        <input type="file" className="hidden" accept="image/*" multiple={multiple}
          onChange={e => { onChange(multiple ? Array.from(e.target.files) : e.target.files[0]); e.target.value = ''; }} />
      </label>
    </div>
  );
};

// ─── VideoList ────────────────────────────────────────────────────────────────
const VideoList = ({ videos, onChange }) => {
  const update = (i, v) => { const a = [...videos]; a[i] = v; onChange(a); };
  const remove = (i) => onChange(videos.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-2.5">
      {videos.map((url, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input type="url" value={url} onChange={e => update(i, e.target.value)}
            placeholder="https://youtube.com/watch?v=…"
            className={inp(false) + ' flex-1'} />
          <button type="button" onClick={() => remove(i)}
            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-gray-200 transition flex-shrink-0">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...videos, ''])}
        className="flex items-center gap-1.5 text-sm text-green-600 font-medium hover:text-green-700 transition mt-1">
        <Plus className="h-4 w-4" /> Add another video
      </button>
    </div>
  );
};

// ─── CampaignEditor ───────────────────────────────────────────────────────────
const CampaignEditor = ({ mode = 'create', initialData = {}, campaignId }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || '',
    location: initialData.location || '',
    problemStatement: initialData.problemStatement || '',
    solution: initialData.solution || '',
    marketAnalysis: initialData.marketAnalysis || '',
    competitiveAdvantage: initialData.competitiveAdvantage || '',
    businessPlan: initialData.businessPlan || '',
    financialProjections: initialData.financialProjections || '',
    teamInformation: initialData.teamInformation || '',
    risksAndChallenges: initialData.risksAndChallenges || '',
    targetAmount: initialData.targetAmount ? String(initialData.targetAmount) : '',
    minimumInvestment: initialData.minimumInvestment ? String(initialData.minimumInvestment) : '',
    maximumInvestment: initialData.maximumInvestment ? String(initialData.maximumInvestment) : '',
    endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
  });

  const [mainImage, setMainImage] = useState(initialData.mainImageUrl || null);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryImages] = useState(initialData.galleryImages || []);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [videos, setVideos] = useState(
    initialData.videoUrl ? initialData.videoUrl.split(',').map(v => v.trim()).filter(Boolean) : ['']
  );
  const emptyMs = () => ({ title: '', description: '', amount: '', targetDate: '' });
  const [milestones, setMilestones] = useState(initialData.milestones?.length ? initialData.milestones : [emptyMs()]);

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: null }));
    setGlobalError('');
  };

  const validate = (idx) => {
    const e = {};
    if (idx === 0) {
      if (!form.title.trim()) e.title = 'Required';
      else if (form.title.length < 10) e.title = 'At least 10 characters';
      if (!form.category) e.category = 'Required';
      if (!form.location.trim()) e.location = 'Required';
      if (stripHtml(form.description).length < 50) e.description = 'At least 50 characters';
    }
    if (idx === 1 && !stripHtml(form.problemStatement)) e.problemStatement = 'Required';
    if (idx === 2 && !stripHtml(form.solution)) e.solution = 'Required';
    if (idx === 7) {
      const t = parseFloat(String(form.targetAmount).replace(/,/g, ''));
      if (!form.targetAmount || isNaN(t)) e.targetAmount = 'Required';
      else if (t < 100000) e.targetAmount = 'Minimum ₦100,000';
      if (!form.minimumInvestment) e.minimumInvestment = 'Required';
    }
    return e;
  };

  const goNext = () => {
    const e = validate(step);
    if (Object.keys(e).length) { setErrors(e); setGlobalError('Fix the highlighted fields to continue.'); return; }
    setErrors({}); setGlobalError('');
    setStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goBack = () => { setStep(s => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const payload = (isDraft) => ({
    title: form.title, description: form.description,
    category: form.category, location: form.location,
    problemStatement: form.problemStatement, solution: form.solution,
    marketAnalysis: form.marketAnalysis, competitiveAdvantage: form.competitiveAdvantage,
    businessPlan: form.businessPlan, financialProjections: form.financialProjections,
    teamInformation: form.teamInformation, risksAndChallenges: form.risksAndChallenges,
    targetAmount: parseFloat(String(form.targetAmount).replace(/,/g, '')) || 0,
    minimumInvestment: parseFloat(String(form.minimumInvestment).replace(/,/g, '')) || 0,
    maximumInvestment: form.maximumInvestment ? parseFloat(String(form.maximumInvestment).replace(/,/g, '')) : null,
    videoUrl: videos.filter(Boolean).join(','),
    endDate: form.endDate || null,
    milestones: milestones.filter(m => m.title.trim()),
    isDraft,
  });

  const uploadImg = async (file, cId, isGallery = false) => {
    const fd = new FormData(); fd.append('campaignImage', file);
    const url = isGallery 
      ? buildApiUrl(`/campaigns/${cId}/image?isGallery=true`)
      : buildApiUrl(`/campaigns/${cId}/image`);
    const r = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      body: fd,
    });
    return (await r.json()).data?.imageUrl;
  };

  const save = async (isDraft) => {
    console.log('💾 ===== CAMPAIGN EDITOR SAVE START =====');
    console.log('📝 Mode:', mode);
    console.log('📝 Campaign ID:', campaignId);
    console.log('📝 Is Draft:', isDraft);
    
    if (!isDraft) {
      const all = {};
      [0, 1, 2, 7].forEach(i => Object.assign(all, validate(i)));
      if (Object.keys(all).length) {
        console.log('❌ Validation errors:', all);
        setErrors(all);
        setGlobalError('Some required fields are missing. Please review all steps before submitting.');
        toast.error('Please fill in all required fields.');
        return;
      }
    }
    
    isDraft ? setSaving(true) : setSubmitting(true);
    setGlobalError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const p = payload(isDraft);
      
      console.log('📦 Payload:', JSON.stringify(p, null, 2));
      
      const url = mode === 'create' ? buildApiUrl('/campaigns') : buildApiUrl(`/campaigns/${campaignId}`);
      console.log('🌐 Request URL:', url);
      console.log('🌐 Request Method:', mode === 'create' ? 'POST' : 'PUT');
      
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      });
      
      console.log('📡 Response status:', res.status);
      console.log('📡 Response ok:', res.ok);
      
      const result = await res.json();
      console.log('📡 Response data:', JSON.stringify(result, null, 2));
      
      if (!res.ok || !result.success) {
        console.log('❌ Request failed!');
        throw new Error(result.message || result.error || 'Save failed');
      }
      
      const cId = result.data?.id || campaignId;
      console.log('✅ Campaign ID:', cId);
      console.log('📸 Gallery files to upload:', galleryFiles.length);
      
      if (mainImageFile && cId) {
        console.log('📸 Uploading main image...');
        await uploadImg(mainImageFile, cId, false);
      }
      
      for (let i = 0; i < galleryFiles.length; i++) {
        const f = galleryFiles[i];
        if (cId) {
          console.log(`📸 Uploading gallery image ${i + 1}/${galleryFiles.length}...`);
          await uploadImg(f, cId, true); // Pass true for gallery images
        }
      }
      
      console.log('✅ Save successful!');
      toast.success(isDraft ? 'Draft saved!' : 'Campaign submitted for review!');
      
      const navUrl = isDraft ? '/my-campaigns' : `/campaign/${cId}`;
      console.log('🧭 Navigating to:', navUrl);
      navigate(navUrl);
      
      console.log('💾 ===== CAMPAIGN EDITOR SAVE END =====');
    } catch (err) {
      console.error('❌ ===== CAMPAIGN EDITOR SAVE ERROR =====');
      console.error('❌ Error:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error stack:', err.stack);
      console.error('❌ ======================================');
      
      const msg = err.message || 'Something went wrong.';
      setGlobalError(msg);
      toast.error(msg);
    } finally { 
      setSaving(false); 
      setSubmitting(false); 
    }
  };

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  // ── step content ──────────────────────────────────────────────────────────
  const content = () => {
    switch (s.id) {

      case 'basics': return (
        <div className="space-y-7">
          <div>
            <Label required sub="This is the headline investors see first — make it specific and compelling.">Campaign Title</Label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              className={inp(errors.title)} maxLength={100}
              placeholder="e.g. SwiftPay — Instant cross-border remittance for West Africa" />
            <div className="flex justify-between mt-1.5">
              <Err msg={errors.title} />
              <span className="text-xs text-gray-300 ml-auto">{form.title.length}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Category</Label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className={inp(errors.category)}>
                <option value="">Pick one…</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <Err msg={errors.category} />
            </div>
            <div>
              <Label required>Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-300" />
                <input value={form.location} onChange={e => set('location', e.target.value)}
                  className={inp(errors.location) + ' pl-10'} placeholder="Lagos, Nigeria" />
              </div>
              <Err msg={errors.location} />
            </div>
          </div>

          <div>
            <Label required sub="2–3 sentences shown on campaign cards. Hook investors immediately.">Short Description</Label>
            <RichEditor value={form.description} onChange={v => set('description', v)}
              placeholder="What does your startup do, who is it for, and why now?" minHeight={180} />
            <Err msg={errors.description} />
          </div>
        </div>
      );

      case 'problem': return (
        <div>
          <Label required sub="Use data and real examples. Name who is affected and what it costs them.">Problem Statement</Label>
          <RichEditor value={form.problemStatement} onChange={v => set('problemStatement', v)}
            placeholder="Describe the problem in depth. Who faces it? How widespread is it? What happens if it goes unsolved?" minHeight={480} />
          <Err msg={errors.problemStatement} />
        </div>
      );

      case 'solution': return (
        <div>
          <Label required sub="Explain how your product works and why your approach is better than alternatives.">Your Solution</Label>
          <RichEditor value={form.solution} onChange={v => set('solution', v)}
            placeholder="Walk investors through your product or service. How does it work? What makes it different?" minHeight={480} />
          <Err msg={errors.solution} />
        </div>
      );

      case 'market': return (
        <div className="space-y-8">
          <div>
            <Label sub="Market size, growth rate, target customers, and key trends.">Market Analysis</Label>
            <RichEditor value={form.marketAnalysis} onChange={v => set('marketAnalysis', v)}
              placeholder="How big is your market? Who are your customers? What trends are driving demand?" minHeight={320} />
          </div>
          <div>
            <Label sub="What makes you hard to copy? Patents, network effects, exclusive partnerships, etc.">Competitive Advantage</Label>
            <RichEditor value={form.competitiveAdvantage} onChange={v => set('competitiveAdvantage', v)}
              placeholder="Who are your competitors and why will you win against them?" minHeight={280} />
          </div>
        </div>
      );

      case 'business': return (
        <div className="space-y-8">
          <div>
            <Label sub="Revenue model, pricing, go-to-market strategy, and how funds will be used.">Business Plan</Label>
            <RichEditor value={form.businessPlan} onChange={v => set('businessPlan', v)}
              placeholder="How do you make money? What's your pricing? How will you spend the funds raised?" minHeight={320} />
          </div>
          <div>
            <Label sub="Year 1–3 revenue projections with key assumptions.">Financial Projections</Label>
            <RichEditor value={form.financialProjections} onChange={v => set('financialProjections', v)}
              placeholder="Share your revenue and growth projections. Include the assumptions behind the numbers." minHeight={280} />
          </div>
        </div>
      );

      case 'team': return (
        <div className="space-y-8">
          <div>
            <Label sub="Relevant experience, past wins, and why you're the right team for this.">Team Information</Label>
            <RichEditor value={form.teamInformation} onChange={v => set('teamInformation', v)}
              placeholder="Introduce your founding team. What makes you uniquely qualified to execute this?" minHeight={320} />
          </div>
          <div>
            <Label sub="Be honest — investors respect founders who've thought through what could go wrong.">Risks & Challenges</Label>
            <RichEditor value={form.risksAndChallenges} onChange={v => set('risksAndChallenges', v)}
              placeholder="What are the biggest risks? How do you plan to mitigate them?" minHeight={280} />
          </div>
        </div>
      );

      case 'media': return (
        <div className="space-y-8">
          <div>
            <Label sub="Shown on every campaign card. High-quality, relevant to your product.">Cover Image</Label>
            <ImageUploadZone
              value={mainImageFile || mainImage}
              onChange={f => { setMainImageFile(f); setMainImage(URL.createObjectURL(f)); }}
              onRemove={() => { setMainImageFile(null); setMainImage(null); }}
            />
          </div>
          <div>
            <Label sub="Product shots, team photos, traction screenshots — up to 8 images.">Gallery Images</Label>
            <ImageUploadZone
              multiple
              compact
              value={[...galleryImages, ...galleryFiles]}
              onChange={files => {
                console.log('📸 Gallery files selected:', files);
                setGalleryFiles(p => {
                  const newFiles = [...p, ...files].slice(0, 8);
                  console.log('📸 Updated gallery files:', newFiles.length);
                  return newFiles;
                });
              }}
              onRemove={i => {
                console.log('🗑️ Removing gallery image at index:', i);
                if (i < galleryImages.length) return;
                setGalleryFiles(p => p.filter((_, idx) => idx !== i - galleryImages.length));
              }}
            />
          </div>
          <div>
            <Label sub="YouTube, Vimeo, or any direct video link. Pitch video, product demo, etc.">Video Links</Label>
            <VideoList videos={videos} onChange={setVideos} />
          </div>
        </div>
      );

      case 'funding': return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label required sub="Total amount you need to raise.">Target Amount (₦)</Label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400 text-sm font-medium">₦</span>
                <input value={form.targetAmount}
                  onChange={e => set('targetAmount', e.target.value)}
                  onBlur={e => set('targetAmount', fmtNum(e.target.value))}
                  className={inp(errors.targetAmount) + ' pl-8'} placeholder="5,000,000" />
              </div>
              <Err msg={errors.targetAmount} />
            </div>
            <div>
              <Label required sub="Smallest amount an investor can contribute.">Minimum Investment (₦)</Label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400 text-sm font-medium">₦</span>
                <input value={form.minimumInvestment}
                  onChange={e => set('minimumInvestment', e.target.value)}
                  onBlur={e => set('minimumInvestment', fmtNum(e.target.value))}
                  className={inp(errors.minimumInvestment) + ' pl-8'} placeholder="50,000" />
              </div>
              <Err msg={errors.minimumInvestment} />
            </div>
            <div>
              <Label sub="Optional cap per investor.">Maximum Investment (₦)</Label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400 text-sm font-medium">₦</span>
                <input value={form.maximumInvestment}
                  onChange={e => set('maximumInvestment', e.target.value)}
                  onBlur={e => set('maximumInvestment', fmtNum(e.target.value))}
                  className={inp(false) + ' pl-8'} placeholder="No cap" />
              </div>
            </div>
            <div>
              <Label sub="When does this campaign close?">Campaign Deadline</Label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-300" />
                <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={inp(false) + ' pl-10'} />
              </div>
            </div>
          </div>

          {/* milestones */}
          <div className="pt-4 border-t border-gray-100">
            <Label sub="Break your goal into stages. Investors see exactly how their money will be used.">Funding Milestones</Label>
            <div className="space-y-3 mt-3">
              {milestones.map((m, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Milestone {i + 1}</span>
                    {milestones.length > 1 && (
                      <button type="button" onClick={() => setMilestones(p => p.filter((_, idx) => idx !== i))}
                        className="text-gray-300 hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <input value={m.title}
                        onChange={e => setMilestones(p => p.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))}
                        className={inp(false)} placeholder="Milestone title, e.g. MVP Launch" />
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-400 text-sm">₦</span>
                      <input value={m.amount}
                        onChange={e => setMilestones(p => p.map((x, idx) => idx === i ? { ...x, amount: e.target.value } : x))}
                        className={inp(false) + ' pl-8'} placeholder="Amount" />
                    </div>
                    <input type="date" value={m.targetDate}
                      onChange={e => setMilestones(p => p.map((x, idx) => idx === i ? { ...x, targetDate: e.target.value } : x))}
                      className={inp(false)} />
                    <div className="col-span-2">
                      <textarea value={m.description} rows={2}
                        onChange={e => setMilestones(p => p.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))}
                        className={inp(false) + ' resize-none'} placeholder="What will be delivered at this milestone?" />
                    </div>
                  </div>
                </div>
              ))}
              {milestones.length < 8 && (
                <button type="button" onClick={() => setMilestones(p => [...p, emptyMs()])}
                  className="flex items-center gap-2 text-sm text-green-600 font-medium hover:text-green-700 transition w-full justify-center py-3 border-2 border-dashed border-gray-200 rounded-2xl hover:border-green-300 hover:bg-green-50/50">
                  <Plus className="h-4 w-4" /> Add milestone
                </button>
              )}
            </div>
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── top progress bar ── */}
      <div className="h-1 bg-gray-100 fixed top-0 left-0 right-0 z-50">
        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex flex-1 pt-1">
        {/* ── left sidebar ── */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 bg-white border-r border-gray-100 min-h-screen px-5 py-10 sticky top-0 h-screen overflow-y-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
              {mode === 'edit' ? 'Editing Campaign' : 'New Campaign'}
            </p>
            <p className="text-xs text-gray-400">{pct}% complete</p>
          </div>

          <nav className="space-y-0.5 flex-1">
            {STEPS.map((st, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <button key={st.id} type="button"
                  onClick={() => { if (i < step) { setStep(i); window.scrollTo({ top: 0 }); } }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                    ${active ? 'bg-green-50 text-green-800' : done ? 'text-gray-600 hover:bg-gray-50 cursor-pointer' : 'text-gray-300 cursor-default'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all
                    ${done ? 'bg-green-500 text-white' : active ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-300'}`}>
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium ${active ? 'text-green-800' : ''}`}>{st.label}</span>
                </button>
              );
            })}
          </nav>

          {/* save draft shortcut */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => save(true)} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition disabled:opacity-40">
              {saving ? <span className="h-3.5 w-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save draft
            </button>
          </div>
        </aside>

        {/* ── main content ── */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* mobile step bar */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-1 z-40">
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{step + 1}/{STEPS.length}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">{s.label}</span>
          </div>

          <div className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10 lg:py-14">
            {/* step heading */}
            <div className="mb-8">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-2">
                Step {step + 1} of {STEPS.length} · {s.label}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{s.title}</h1>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-lg">{s.description}</p>
            </div>

            {/* global error */}
            {globalError && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{globalError}</p>
              </div>
            )}

            {/* step content */}
            <div>{content()}</div>

            {/* navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
              <button type="button" onClick={goBack} disabled={step === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-0 transition text-sm font-medium">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>

              <div className="flex items-center gap-3">
                {/* mobile save draft */}
                <button type="button" onClick={() => save(true)} disabled={saving}
                  className="lg:hidden flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition">
                  {saving ? <span className="h-3.5 w-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Draft
                </button>

                {isLast ? (
                  <button type="button" onClick={() => save(false)} disabled={submitting || saving}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition shadow-sm text-sm">
                    {submitting
                      ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Send className="h-4 w-4" />}
                    {mode === 'edit' ? 'Submit for Approval' : 'Submit Campaign'}
                  </button>
                ) : (
                  <button type="button" onClick={goNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition shadow-sm text-sm">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CampaignEditor;
