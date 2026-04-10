// CampaignEditor

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl, buildImageUrl } from '../../config/apiUrl';
import RichEditor from './RichEditor';
import {
  ChevronLeft, ChevronRight, Check, AlertCircle, Save,
  Send, X, Upload, Plus, Trash2, Image as ImageIcon,
  DollarSign, MapPin, Building, Calendar, Info,
} from 'lucide-react';

// ─── categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Audio','Tools','Education','Energy & Green Tech','Fashion & Wearables',
  'Food & Beverages','Health & Fitness','Home','Phones & Accessories',
  'Productivity','Transportation','Travel & Outdoors','Art','Comics',
  'Dance & Theater','Film','Music','Photography','Podcasts, Blogs & Vlogs',
  'Tabletop Games','Video Games','TV series & Shows','Writing & Publishing',
  'Culture','Environment','Human Rights','Local Businesses','Wellness',
];

// ─── step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 'basics',
    title: 'Campaign Basics',
    subtitle: 'Set the foundation — what your campaign is called, where it fits, and who it\'s for.',
    hint: 'Your title and description are the first things investors see. Make them clear and compelling. The description appears on campaign cards across the platform.',
  },
  {
    id: 'problem',
    title: 'The Problem',
    subtitle: 'Describe the real-world problem your startup is solving.',
    hint: 'Investors need to understand the pain point before they can appreciate your solution. Be specific — use data, real examples, and explain who is affected and how severely.',
  },
  {
    id: 'solution',
    title: 'Your Solution',
    subtitle: 'Explain what you\'ve built and how it solves the problem.',
    hint: 'Walk investors through your product or service. Explain how it works, what makes it different, and why your approach is the right one. Avoid jargon — write as if explaining to a smart non-expert.',
  },
  {
    id: 'market',
    title: 'Market & Competition',
    subtitle: 'Show investors the size of the opportunity and your edge.',
    hint: 'Cover your Total Addressable Market (TAM), who your competitors are, and what gives you a sustainable competitive advantage. Use numbers where possible.',
  },
  {
    id: 'business',
    title: 'Business Plan & Financials',
    subtitle: 'How you make money and where this investment goes.',
    hint: 'Describe your revenue model, pricing, and how you plan to use the funds raised. Include financial projections — even rough ones show investors you\'ve thought it through.',
  },
  {
    id: 'team',
    title: 'Team & Risks',
    subtitle: 'Who is building this, and what could go wrong.',
    hint: 'Investors back people as much as ideas. Introduce your team\'s relevant experience. Then honestly address the key risks and how you plan to mitigate them — this builds trust.',
  },
  {
    id: 'media',
    title: 'Media & Images',
    subtitle: 'Add visuals that bring your campaign to life.',
    hint: 'A strong cover image is essential — it appears on every campaign card. Add gallery images to show your product, team, or traction. You can also add video URLs (YouTube, Vimeo, etc.).',
  },
  {
    id: 'funding',
    title: 'Funding Details',
    subtitle: 'Set your financial targets and campaign timeline.',
    hint: 'Your target amount should reflect what you actually need to hit your next milestone. Set a realistic minimum investment that doesn\'t exclude smaller investors.',
  },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtNGN = (v) => {
  const n = parseFloat(String(v).replace(/,/g, ''));
  if (isNaN(n)) return v;
  return n.toLocaleString('en-NG');
};

const stripHtml = (html) => html?.replace(/<[^>]*>/g, '').trim() || '';

// ─── sub-components ───────────────────────────────────────────────────────────
const StepSidebar = ({ steps, current }) => (
  <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 bg-white border-r border-gray-100 min-h-screen px-6 py-10">
    <div className="mb-10">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
        Step {current + 1} of {steps.length}
      </div>
      <h2 className="text-2xl font-bold text-gray-900 leading-snug">{steps[current].title}</h2>
      <p className="text-sm text-gray-500 mt-2 leading-relaxed">{steps[current].subtitle}</p>
    </div>

    <div className="space-y-1">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-green-50' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${
              done ? 'bg-green-600 text-white' : active ? 'bg-green-700 text-white ring-2 ring-green-200' : 'bg-gray-100 text-gray-400'
            }`}>
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={`text-sm ${active ? 'font-semibold text-green-800' : done ? 'text-gray-600' : 'text-gray-400'}`}>
              {s.title}
            </span>
          </div>
        );
      })}
    </div>

    <div className="mt-auto pt-8">
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-green-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${((current + 1) / steps.length) * 100}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2">{Math.round(((current + 1) / steps.length) * 100)}% complete</p>
    </div>
  </aside>
);

const HintBox = ({ text }) => (
  <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
    <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
    <p className="text-sm text-blue-700 leading-relaxed">{text}</p>
  </div>
);

const FieldLabel = ({ children, required }) => (
  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
    {children}{required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const FieldError = ({ msg }) =>
  msg ? <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{msg}</p> : null;

const inputCls = (err) =>
  `w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900 ${err ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`;

// ─── ImageUploadZone ──────────────────────────────────────────────────────────
const ImageUploadZone = ({ label, hint, value, onChange, onRemove, multiple = false }) => {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) onChange(multiple ? files : files[0]);
  }, [onChange, multiple]);

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}

      {/* existing / preview images */}
      {value && !multiple && (
        <div className="relative mb-3 inline-block">
          <img src={typeof value === 'string' ? value : URL.createObjectURL(value)}
            alt="preview" className="h-40 w-auto rounded-xl object-cover border border-gray-200" />
          <button type="button" onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {value.map((item, i) => (
            <div key={i} className="relative">
              <img src={typeof item === 'string' ? item : URL.createObjectURL(item)}
                alt={`img-${i}`} className="h-28 w-28 rounded-xl object-cover border border-gray-200" />
              <button type="button" onClick={() => onRemove(i)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* drop zone */}
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
      >
        <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
        <span className="text-sm text-gray-500">Drag & drop or <span className="text-green-600 font-medium">browse</span></span>
        <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 10 MB each</span>
        <input type="file" className="hidden" accept="image/*" multiple={multiple}
          onChange={(e) => {
            const files = Array.from(e.target.files);
            onChange(multiple ? files : files[0]);
            e.target.value = '';
          }} />
      </label>
    </div>
  );
};

// ─── VideoList ────────────────────────────────────────────────────────────────
const VideoList = ({ videos, onChange }) => {
  const add = () => onChange([...videos, '']);
  const update = (i, v) => { const a = [...videos]; a[i] = v; onChange(a); };
  const remove = (i) => onChange(videos.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {videos.map((url, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => update(i, e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className={inputCls(false) + ' flex-1'}
          />
          <button type="button" onClick={() => remove(i)}
            className="p-3 text-red-500 hover:bg-red-50 rounded-xl border border-gray-200 transition">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add}
        className="flex items-center gap-2 text-sm text-green-700 font-medium hover:text-green-800 transition">
        <Plus className="h-4 w-4" /> Add video URL
      </button>
    </div>
  );
};

// ─── CampaignEditor (main export) ────────────────────────────────────────────
/**
 * Props:
 *   mode: 'create' | 'edit'
 *   initialData: object (for edit mode, pre-populated campaign data)
 *   campaignId: string (for edit mode)
 */
const CampaignEditor = ({ mode = 'create', initialData = {}, campaignId }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── form state ──────────────────────────────────────────────────────────
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
    targetAmount: initialData.targetAmount || '',
    minimumInvestment: initialData.minimumInvestment || '',
    maximumInvestment: initialData.maximumInvestment || '',
    endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
  });

  // ── media state ─────────────────────────────────────────────────────────
  const [mainImage, setMainImage] = useState(
    initialData.mainImageUrl || null
  );
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryImages, setGalleryImages] = useState(
    initialData.galleryImages || []
  );
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [videos, setVideos] = useState(
    initialData.videoUrl
      ? [initialData.videoUrl]
      : ['']
  );

  // ── field helpers ───────────────────────────────────────────────────────
  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: null }));
    setGlobalError('');
  };

  // ── validation per step ─────────────────────────────────────────────────
  const validate = (stepIdx) => {
    const e = {};
    if (stepIdx === 0) {
      if (!form.title.trim()) e.title = 'Campaign title is required';
      else if (form.title.length < 10) e.title = 'Title must be at least 10 characters';
      if (!form.category) e.category = 'Please select a category';
      if (!form.location.trim()) e.location = 'Location is required';
      if (!stripHtml(form.description)) e.description = 'Description is required';
      else if (stripHtml(form.description).length < 50) e.description = 'Description must be at least 50 characters';
    }
    if (stepIdx === 1) {
      if (!stripHtml(form.problemStatement)) e.problemStatement = 'Problem statement is required';
    }
    if (stepIdx === 2) {
      if (!stripHtml(form.solution)) e.solution = 'Solution is required';
    }
    if (stepIdx === 7) {
      if (!form.targetAmount) e.targetAmount = 'Target amount is required';
      else if (parseFloat(String(form.targetAmount).replace(/,/g, '')) < 100000)
        e.targetAmount = 'Minimum target is ₦100,000';
      if (!form.minimumInvestment) e.minimumInvestment = 'Minimum investment is required';
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length) { setErrors(e); setGlobalError('Please fix the errors above before continuing.'); return; }
    setErrors({});
    setGlobalError('');
    setStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => { setStep(s => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // ── build payload ───────────────────────────────────────────────────────
  const buildPayload = (isDraft) => ({
    title: form.title,
    description: form.description,
    category: form.category,
    location: form.location,
    problemStatement: form.problemStatement,
    solution: form.solution,
    marketAnalysis: form.marketAnalysis,
    competitiveAdvantage: form.competitiveAdvantage,
    businessPlan: form.businessPlan,
    financialProjections: form.financialProjections,
    teamInformation: form.teamInformation,
    risksAndChallenges: form.risksAndChallenges,
    targetAmount: parseFloat(String(form.targetAmount).replace(/,/g, '')) || 0,
    minimumInvestment: parseFloat(String(form.minimumInvestment).replace(/,/g, '')) || 0,
    maximumInvestment: form.maximumInvestment
      ? parseFloat(String(form.maximumInvestment).replace(/,/g, ''))
      : null,
    videoUrl: videos.filter(Boolean).join(','),
    endDate: form.endDate || null,
    isDraft,
  });

  // ── upload image helper ─────────────────────────────────────────────────
  const uploadImage = async (file, cId) => {
    const token = localStorage.getItem('authToken');
    const fd = new FormData();
    fd.append('campaignImage', file);
    const res = await fetch(buildApiUrl(`/campaigns/${cId}/image`), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const result = await res.json();
    return result.success ? result.data.imageUrl : null;
  };

  // ── save / submit ───────────────────────────────────────────────────────
  const save = async (isDraft) => {
    // Full validation before submit
    if (!isDraft) {
      const allErrors = {};
      [0, 1, 2, 7].forEach(i => Object.assign(allErrors, validate(i)));
      if (Object.keys(allErrors).length) {
        setErrors(allErrors);
        setGlobalError('Some required fields are missing. Please review all steps.');
        return;
      }
    }

    isDraft ? setSaving(true) : setSubmitting(true);
    setGlobalError('');

    try {
      const token = localStorage.getItem('authToken');
      const payload = buildPayload(isDraft);

      let cId = campaignId;
      let res;

      if (mode === 'create') {
        res = await fetch(buildApiUrl('/campaigns'), {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(buildApiUrl(`/campaigns/${cId}`), {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Save failed');

      cId = result.data?.id || cId;

      // Upload main image if a new file was selected
      if (mainImageFile && cId) {
        await uploadImage(mainImageFile, cId);
      }

      // Upload gallery images
      for (const file of galleryFiles) {
        if (cId) await uploadImage(file, cId);
      }

      navigate(isDraft ? '/my-campaigns' : `/campaign/${cId}`);
    } catch (err) {
      setGlobalError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  // ── render step content ─────────────────────────────────────────────────
  const renderStep = () => {
    const s = STEPS[step];

    switch (s.id) {
      // ── STEP 0: Basics ──────────────────────────────────────────────────
      case 'basics':
        return (
          <div className="space-y-8">
            <HintBox text={s.hint} />

            <div>
              <FieldLabel required>Campaign Title</FieldLabel>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                className={inputCls(errors.title)}
                placeholder="Give your campaign a clear, memorable name" maxLength={100} />
              <div className="flex justify-between mt-1">
                <FieldError msg={errors.title} />
                <span className="text-xs text-gray-400">{form.title.length}/100</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FieldLabel required>Category</FieldLabel>
                <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls(errors.category)}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <FieldError msg={errors.category} />
              </div>
              <div>
                <FieldLabel required>Location</FieldLabel>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                    className={inputCls(errors.location) + ' pl-10'}
                    placeholder="e.g. Lagos, Nigeria" />
                </div>
                <FieldError msg={errors.location} />
              </div>
            </div>

            <div>
              <FieldLabel required>Short Description</FieldLabel>
              <p className="text-xs text-gray-500 mb-2">This appears on campaign cards — keep it under 200 characters and make every word count.</p>
              <RichEditor value={form.description} onChange={v => set('description', v)}
                placeholder="Describe your startup in 2–3 sentences. What do you do, who is it for, and why now?"
                minHeight={160} />
              <FieldError msg={errors.description} />
            </div>
          </div>
        );

      // ── STEP 1: Problem ─────────────────────────────────────────────────
      case 'problem':
        return (
          <div className="space-y-6">
            <HintBox text={s.hint} />
            <div>
              <FieldLabel required>Problem Statement</FieldLabel>
              <RichEditor value={form.problemStatement} onChange={v => set('problemStatement', v)}
                placeholder="Describe the problem in detail. Who faces it? How big is it? What are the consequences of it going unsolved?"
                minHeight={400} />
              <FieldError msg={errors.problemStatement} />
            </div>
          </div>
        );

      // ── STEP 2: Solution ────────────────────────────────────────────────
      case 'solution':
        return (
          <div className="space-y-6">
            <HintBox text={s.hint} />
            <div>
              <FieldLabel required>Your Solution</FieldLabel>
              <RichEditor value={form.solution} onChange={v => set('solution', v)}
                placeholder="Explain your product or service. How does it work? What makes it different from existing alternatives?"
                minHeight={400} />
              <FieldError msg={errors.solution} />
            </div>
          </div>
        );

      // ── STEP 3: Market ──────────────────────────────────────────────────
      case 'market':
        return (
          <div className="space-y-8">
            <HintBox text={s.hint} />
            <div>
              <FieldLabel>Market Analysis</FieldLabel>
              <RichEditor value={form.marketAnalysis} onChange={v => set('marketAnalysis', v)}
                placeholder="Describe your target market, its size, growth rate, and key trends. Who are your customers?"
                minHeight={300} />
            </div>
            <div>
              <FieldLabel>Competitive Advantage</FieldLabel>
              <RichEditor value={form.competitiveAdvantage} onChange={v => set('competitiveAdvantage', v)}
                placeholder="What makes you different from competitors? What moats do you have or plan to build?"
                minHeight={250} />
            </div>
          </div>
        );

      // ── STEP 4: Business ────────────────────────────────────────────────
      case 'business':
        return (
          <div className="space-y-8">
            <HintBox text={s.hint} />
            <div>
              <FieldLabel>Business Plan</FieldLabel>
              <RichEditor value={form.businessPlan} onChange={v => set('businessPlan', v)}
                placeholder="Describe your revenue model, go-to-market strategy, and how you plan to use the funds raised."
                minHeight={300} />
            </div>
            <div>
              <FieldLabel>Financial Projections</FieldLabel>
              <RichEditor value={form.financialProjections} onChange={v => set('financialProjections', v)}
                placeholder="Share your revenue and growth projections for the next 1–3 years. Include key assumptions."
                minHeight={250} />
            </div>
          </div>
        );

      // ── STEP 5: Team ────────────────────────────────────────────────────
      case 'team':
        return (
          <div className="space-y-8">
            <HintBox text={s.hint} />
            <div>
              <FieldLabel>Team Information</FieldLabel>
              <RichEditor value={form.teamInformation} onChange={v => set('teamInformation', v)}
                placeholder="Introduce your founding team. Include relevant experience, past achievements, and why you're the right people to execute this."
                minHeight={300} />
            </div>
            <div>
              <FieldLabel>Risks & Challenges</FieldLabel>
              <RichEditor value={form.risksAndChallenges} onChange={v => set('risksAndChallenges', v)}
                placeholder="What are the biggest risks to your success? How do you plan to mitigate them? Honesty here builds investor trust."
                minHeight={250} />
            </div>
          </div>
        );

      // ── STEP 6: Media ───────────────────────────────────────────────────
      case 'media':
        return (
          <div className="space-y-8">
            <HintBox text={s.hint} />

            <ImageUploadZone
              label="Cover Image"
              hint="This is the main image shown on campaign cards. Use a high-quality image that represents your product or brand."
              value={mainImageFile ? mainImageFile : mainImage}
              onChange={(file) => { setMainImageFile(file); setMainImage(URL.createObjectURL(file)); }}
              onRemove={() => { setMainImageFile(null); setMainImage(null); }}
            />

            <ImageUploadZone
              label="Gallery Images"
              hint="Add up to 8 additional images — product shots, team photos, traction screenshots, etc."
              value={[
                ...galleryImages,
                ...galleryFiles,
              ]}
              onChange={(files) => {
                const newFiles = files.slice(0, Math.max(0, 8 - galleryImages.length - galleryFiles.length));
                setGalleryFiles(p => [...p, ...newFiles].slice(0, 8));
              }}
              onRemove={(i) => {
                const totalExisting = galleryImages.length;
                if (i < totalExisting) {
                  setGalleryImages(p => p.filter((_, idx) => idx !== i));
                } else {
                  setGalleryFiles(p => p.filter((_, idx) => idx !== (i - totalExisting)));
                }
              }}
              multiple
            />

            <div>
              <FieldLabel>Video URLs</FieldLabel>
              <p className="text-xs text-gray-500 mb-3">Add YouTube, Vimeo, or any other video links. Your pitch video, product demo, etc.</p>
              <VideoList videos={videos} onChange={setVideos} />
            </div>
          </div>
        );

      // ── STEP 7: Funding ─────────────────────────────────────────────────
      case 'funding':
        return (
          <div className="space-y-6">
            <HintBox text={s.hint} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FieldLabel required>Target Amount (₦)</FieldLabel>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input type="text" value={form.targetAmount}
                    onChange={e => set('targetAmount', e.target.value)}
                    onBlur={e => set('targetAmount', fmtNGN(e.target.value))}
                    className={inputCls(errors.targetAmount) + ' pl-10'}
                    placeholder="e.g. 5,000,000" />
                </div>
                <FieldError msg={errors.targetAmount} />
              </div>

              <div>
                <FieldLabel required>Minimum Investment (₦)</FieldLabel>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input type="text" value={form.minimumInvestment}
                    onChange={e => set('minimumInvestment', e.target.value)}
                    onBlur={e => set('minimumInvestment', fmtNGN(e.target.value))}
                    className={inputCls(errors.minimumInvestment) + ' pl-10'}
                    placeholder="e.g. 50,000" />
                </div>
                <FieldError msg={errors.minimumInvestment} />
              </div>

              <div>
                <FieldLabel>Maximum Investment (₦) <span className="text-gray-400 font-normal text-xs">optional</span></FieldLabel>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input type="text" value={form.maximumInvestment}
                    onChange={e => set('maximumInvestment', e.target.value)}
                    onBlur={e => set('maximumInvestment', fmtNGN(e.target.value))}
                    className={inputCls(false) + ' pl-10'}
                    placeholder="Leave blank for no cap" />
                </div>
              </div>

              <div>
                <FieldLabel>Campaign End Date <span className="text-gray-400 font-normal text-xs">optional</span></FieldLabel>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input type="date" value={form.endDate}
                    onChange={e => set('endDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={inputCls(false) + ' pl-10'} />
                </div>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StepSidebar steps={STEPS} current={step} />

      <main className="flex-1 flex flex-col">
        {/* mobile step indicator */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="text-xs text-gray-500">Step {step + 1}/{STEPS.length}</div>
          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
            <div className="bg-green-600 h-1.5 rounded-full transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <div className="text-xs font-medium text-gray-700">{STEPS[step].title}</div>
        </div>

        <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-8 py-10">
          {/* page heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{STEPS[step].title}</h1>
            <p className="text-gray-500 mt-1 text-sm">{STEPS[step].subtitle}</p>
          </div>

          {/* global error — always visible at top */}
          {globalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{globalError}</p>
            </div>
          )}

          {/* step content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {renderStep()}
          </div>

          {/* navigation */}
          <div className="flex items-center justify-between mt-8 gap-4">
            <button type="button" onClick={back} disabled={step === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>

            <div className="flex items-center gap-3">
              {/* Save as draft — always available */}
              <button type="button" onClick={() => save(true)} disabled={saving || submitting}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition">
                {saving ? <span className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                Save Draft
              </button>

              {isLastStep ? (
                <button type="button" onClick={() => save(false)} disabled={saving || submitting}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 disabled:opacity-50 transition shadow-sm">
                  {submitting ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
                  {mode === 'edit' ? 'Submit for Approval' : 'Submit Campaign'}
                </button>
              ) : (
                <button type="button" onClick={next}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-700 text-white font-semibold hover:bg-green-800 transition shadow-sm">
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CampaignEditor;
