import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Eye, EyeOff,
  User, Mail, Phone, Building, MapPin, CreditCard, Lock, CheckCircle, XCircle
} from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ── Validation helpers ──────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NIGERIAN_FULL_RE = /^\+234[789][01]\d{8}$/;   // +234 7xx/8xx/9xx – 13 chars total
const BVN_RE   = /^\d{11}$/;
const NIN_RE   = /^\d{11}$/;
const CAC_RE   = /^(RC|BN|IT)\d{5,7}$/i;            // RC123456 / BN12345 / IT12345

const passwordStrength = (pw) => {
  const checks = {
    length:    pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number:    /\d/.test(pw),
    special:   /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
};

// Normalise Nigerian phone → +234XXXXXXXXXX
const normalisePhone = (raw) => {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('234')) return '+' + digits;
  if (digits.startsWith('0'))   return '+234' + digits.slice(1);
  if (digits.length > 0)        return '+234' + digits;
  return raw;
};

// ── Field-level error component ─────────────────────────────────────────────
const FieldError = ({ msg }) =>
  msg ? <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><XCircle className="h-3 w-3" />{msg}</p> : null;

// ── Password strength bar ────────────────────────────────────────────────────
const StrengthBar = ({ score }) => {
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-primary-500'];
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`h-1.5 flex-1   transition-all ${i <= score ? colors[score-1] : 'bg-gray-200'}`} />
        ))}
      </div>
      {score > 0 && <p className={`text-xs ${score < 3 ? 'text-red-500' : score < 5 ? 'text-yellow-600' : 'text-primary-600'}`}>{labels[score-1]}</p>}
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const recaptchaRef = useRef(null);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    userType: 'founder',
    fullName: '',
    email: '',
    phoneNumber: '+234',
    nin: '',
    bvn: '',
    cacNumber: '',
    accountNumber: '',
    bankName: '',
    companyName: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  // ── Input change handler ──────────────────────────────────────────────────
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    let processed = value;

    if (name === 'phoneNumber') {
      // Keep +234 prefix, only allow digits after it
      const digits = value.replace(/\D/g, '');
      if (digits.startsWith('234')) {
        processed = '+' + digits.slice(0, 13); // +234 + 9 digits
      } else if (digits.startsWith('0')) {
        processed = '+234' + digits.slice(1, 11);
      } else {
        processed = '+234' + digits.slice(0, 10);
      }
      // Never let user clear the prefix
      if (!processed.startsWith('+234')) processed = '+234';
    }

    if (name === 'bvn' || name === 'nin') {
      processed = value.replace(/\D/g, '').slice(0, 11);
    }

    if (name === 'accountNumber') {
      processed = value.replace(/\D/g, '').slice(0, 10);
    }

    if (name === 'cacNumber') {
      processed = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, [name]: processed }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  // ── Per-step validation ───────────────────────────────────────────────────
  const validateStep = (s) => {
    const errs = {};

    if (s === 1) {
      if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
      if (!formData.email) {
        errs.email = 'Email is required';
      } else if (!EMAIL_RE.test(formData.email)) {
        errs.email = 'Enter a valid email address (e.g. name@domain.com)';
      }
      const phone = formData.phoneNumber;
      if (phone === '+234' || phone.length < 14) {
        errs.phoneNumber = 'Enter a valid Nigerian number (+234 followed by 10 digits)';
      } else if (!NIGERIAN_FULL_RE.test(phone)) {
        errs.phoneNumber = 'Number must start with 070, 080, 081, 090 or 091';
      }
    }

    if (s === 2) {
      if (formData.userType === 'founder' && !formData.companyName.trim())
        errs.companyName = 'Company name is required for founders';

      if (!formData.bvn) {
        errs.bvn = 'BVN is required';
      } else if (!BVN_RE.test(formData.bvn)) {
        errs.bvn = 'BVN must be exactly 11 digits';
      }

      if (!formData.nin) {
        errs.nin = 'NIN is required';
      } else if (!NIN_RE.test(formData.nin)) {
        errs.nin = 'NIN must be exactly 11 digits';
      }

      if (formData.userType === 'founder' && formData.cacNumber && !CAC_RE.test(formData.cacNumber))
        errs.cacNumber = 'CAC format: RC123456, BN12345, or IT12345';

      if (!formData.address.trim()) {
        errs.address = 'Address is required';
      } else if (formData.address.trim().length < 8) {
        errs.address = 'Address must be at least 8 characters';
      }
    }

    if (s === 3) {
      if (!formData.bankName) errs.bankName = 'Select your bank';
      if (!formData.accountNumber || formData.accountNumber.length !== 10)
        errs.accountNumber = 'Account number must be exactly 10 digits';

      const { checks, score } = passwordStrength(formData.password);
      if (!formData.password) {
        errs.password = 'Password is required';
      } else if (score < 4) {
        errs.password = 'Password is too weak — see requirements below';
      }
      if (!formData.confirmPassword) {
        errs.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
      if (!captchaToken) errs.captcha = 'Please complete the CAPTCHA';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep(s => s + 1); };
  const prevStep = () => setStep(s => s - 1);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    setIsSubmitting(true);
    try {
      await register({ ...formData, captchaToken });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 1: Account Details ───────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-5">
      {/* Account type */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Account Type</h3>
        <div className="grid grid-cols-2 gap-4">
          {['founder', 'investor'].map(type => (
            <button key={type} type="button"
              className={`flex flex-col items-center justify-center py-5 px-4 rounded-lg border-2 transition-all ${
                formData.userType === type
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-600'
              }`}
              onClick={() => handleInputChange({ target: { name: 'userType', value: type } })}
            >
              {type === 'founder' ? <Building className="h-8 w-8 mb-2" /> : <CreditCard className="h-8 w-8 mb-2" />}
              <span className="font-medium capitalize">{type}</span>
              <p className="text-xs mt-1 text-center">
                {type === 'founder' ? 'Create campaigns & raise funds' : 'Fund promising startups'}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
            className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 ${fieldErrors.fullName ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="Enter your full name" />
        </div>
        <FieldError msg={fieldErrors.fullName} />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input type="email" name="email" value={formData.email} onChange={handleInputChange}
            className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 ${fieldErrors.email ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="name@example.com" />
        </div>
        <FieldError msg={fieldErrors.email} />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange}
            className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 font-mono ${fieldErrors.phoneNumber ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="+2348012345678" maxLength={14} />
        </div>
        <p className="mt-1 text-xs text-gray-400">Nigerian format: +234 followed by 10 digits</p>
        <FieldError msg={fieldErrors.phoneNumber} />
      </div>
    </div>
  );

  // ── Step 2: Verification ──────────────────────────────────────────────────
  const renderStep2 = () => (
    <div className="space-y-5">
      {formData.userType === 'founder' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 ${fieldErrors.companyName ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="Your registered company name" />
          </div>
          <FieldError msg={fieldErrors.companyName} />
        </div>
      )}

      {/* BVN */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">BVN <span className="text-gray-400 font-normal">(Bank Verification Number)</span></label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input type="text" name="bvn" value={formData.bvn} onChange={handleInputChange}
            inputMode="numeric" maxLength={11}
            className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 font-mono tracking-widest ${fieldErrors.bvn ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="11-digit BVN" />
        </div>
        <p className="mt-1 text-xs text-gray-400">{formData.bvn.length}/11 digits</p>
        <FieldError msg={fieldErrors.bvn} />
      </div>

      {/* NIN */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">NIN <span className="text-gray-400 font-normal">(National Identification Number)</span></label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input type="text" name="nin" value={formData.nin} onChange={handleInputChange}
            inputMode="numeric" maxLength={11}
            className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 font-mono tracking-widest ${fieldErrors.nin ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="11-digit NIN" />
        </div>
        <p className="mt-1 text-xs text-gray-400">{formData.nin.length}/11 digits</p>
        <FieldError msg={fieldErrors.nin} />
      </div>

      {/* CAC (founders only) */}
      {formData.userType === 'founder' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CAC Number <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input type="text" name="cacNumber" value={formData.cacNumber} onChange={handleInputChange}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 font-mono ${fieldErrors.cacNumber ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="RC123456 / BN12345 / IT12345" maxLength={10} />
          </div>
          <p className="mt-1 text-xs text-gray-400">Format: RC, BN, or IT followed by 5–7 digits</p>
          <FieldError msg={fieldErrors.cacNumber} />
        </div>
      )}

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
          <textarea name="address" value={formData.address} onChange={handleInputChange} rows={3}
            className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 resize-none ${fieldErrors.address ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="Enter your full residential address" />
        </div>
        <p className="mt-1 text-xs text-gray-400">{formData.address.length} chars (min 8)</p>
        <FieldError msg={fieldErrors.address} />
      </div>
    </div>
  );

  // ── Step 3: Security ──────────────────────────────────────────────────────
  const renderStep3 = () => {
    const { checks, score } = passwordStrength(formData.password);
    return (
      <div className="space-y-5">
        {/* Bank */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
          <select name="bankName" value={formData.bankName} onChange={handleInputChange}
            className={`block w-full pl-3 pr-10 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 ${fieldErrors.bankName ? 'border-red-400' : 'border-gray-300'}`}>
            <option value="">Select your bank</option>
            {['Access Bank','GT Bank','First Bank','Zenith Bank','UBA','Fidelity Bank','Sterling Bank','Polaris Bank','Wema Bank','Keystone Bank','Other'].map(b => (
              <option key={b} value={b.toLowerCase().replace(/\s/g,'')}>{b}</option>
            ))}
          </select>
          <FieldError msg={fieldErrors.bankName} />
        </div>

        {/* Account number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange}
              inputMode="numeric" maxLength={10}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 font-mono tracking-widest ${fieldErrors.accountNumber ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="10-digit account number" />
          </div>
          <p className="mt-1 text-xs text-gray-400">{formData.accountNumber.length}/10 digits</p>
          <FieldError msg={fieldErrors.accountNumber} />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange}
              className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 ${fieldErrors.password ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="Create a strong password" />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {formData.password && <StrengthBar score={score} />}
          {/* Requirements checklist */}
          <ul className="mt-2 space-y-1">
            {[
              { key: 'length',    label: 'At least 8 characters' },
              { key: 'uppercase', label: 'One uppercase letter' },
              { key: 'lowercase', label: 'One lowercase letter' },
              { key: 'number',    label: 'One number' },
              { key: 'special',   label: 'One special character (!@#$…)' },
            ].map(({ key, label }) => (
              <li key={key} className={`flex items-center gap-1.5 text-xs ${checks[key] ? 'text-primary-600' : 'text-gray-400'}`}>
                {checks[key] ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {label}
              </li>
            ))}
          </ul>
          <FieldError msg={fieldErrors.password} />
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange}
              className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="Repeat your password" />
            <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="mt-1 text-xs text-primary-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Passwords match</p>
          )}
          <FieldError msg={fieldErrors.confirmPassword} />
        </div>

        {/* reCAPTCHA */}
        <div>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
            onChange={token => { setCaptchaToken(token); setFieldErrors(prev => ({ ...prev, captcha: '' })); }}
            onExpired={() => setCaptchaToken(null)}
          />
          <FieldError msg={fieldErrors.captcha} />
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-primary-700 to-primary-900 p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-800/95 to-primary-900/90" />
        <img src="/assets/featured-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <img src="/assets/Logo.png" alt="Logo" className="h-16 w-auto mb-12" />
            <h1 className="text-4xl font-bold text-white mb-6">Join our community</h1>
            <p className="text-primary-100 text-lg max-w-md">
              {formData.userType === 'founder'
                ? 'Create your campaign and connect with investors who believe in your vision.'
                : 'Discover promising Nigerian startups and be part of their success story.'}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
            <p className="text-white italic">
              "I've invested in three startups through this platform, and the milestone-based funding gives me confidence that my investments are being put to good use."
            </p>
            <div className="flex items-center mt-4">
              <div className="h-10 w-10   bg-primary-500 flex items-center justify-center text-white font-semibold mr-3">JO</div>
              <div>
                <p className="text-white font-medium">Johnson Oladele</p>
                <p className="text-primary-200 text-sm">Angel Investor</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16 overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-2 text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Sign in</Link>
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute left-0 top-5 w-full h-1 bg-gray-200 rounded">
                <div className="h-1 bg-primary-500 rounded transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }} />
              </div>
              <div className="relative flex justify-between">
                {[1, 2, 3].map(n => (
                  <div key={n} className={`w-10 h-10   flex items-center justify-center border-2 transition-all duration-300 ${
                    step >= n ? 'bg-primary-500 text-white border-primary-500' : 'bg-white border-gray-300 text-gray-500'
                  }`}>{n}</div>
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Account Details</span>
              <span>Verification</span>
              <span>Security</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button type="button" onClick={prevStep}
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all">
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={nextStep}
                  className={`${step > 1 ? '' : 'ml-auto'} flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all`}>
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting}
                  className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>Complete Registration <ChevronRight className="h-4 w-4 ml-2" /></>
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-500">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy-policy" className="text-primary-600 hover:text-primary-500">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
