import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
  X,
  LogIn,
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  CheckCircle2,
  ShieldAlert,
  RefreshCcw,
  KeyRound,
  ArrowLeft,
  Send
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth.js';
import { forgotPassword } from '../../services/authService.js';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import Toast from '../common/Toast.jsx';
import EmailVerificationModal from '../common/EmailVerificationModal.jsx';

// ── animation presets ────────────────────────────────────────
const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -12 },
  visible: { opacity: 1, scale: 1, y: 0 }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 32 },
  visible: { opacity: 1, scale: 1, y: 0 }
};

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 })
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================
// CODE ALREADY USED — inline warning card
// ============================================================
function CodeAlreadyUsed({ employeeCode, onClose, onSwitchToLogin }) {
  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-[2rem] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="relative z-10 mx-5 w-full max-w-[300px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#1a1f2e] to-[#0f1219] shadow-2xl"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="h-[3px] w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
        <div className="px-6 pb-6 pt-7">
          <div className="mb-4 flex justify-center">
            <div className="relative flex items-center justify-center">
              <motion.span className="absolute h-[70px] w-[70px] rounded-full bg-amber-500/10"
                animate={{ scale: [1, 1.45, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2.6, repeat: Infinity }} />
              <motion.span className="absolute h-[50px] w-[50px] rounded-full bg-amber-500/15"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.6, delay: 0.5, repeat: Infinity }} />
              <div className="relative z-10 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-amber-600/40">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}>
                  <ShieldAlert className="h-6 w-6 text-white" strokeWidth={2.5} />
                </motion.div>
              </div>
            </div>
          </div>
          <h3 className="mb-1.5 text-center text-[16px] font-extrabold tracking-tight text-white">
            Code Already Registered
          </h3>
          <p className="mb-4 text-center text-[11px] leading-relaxed text-slate-400">
            This biometric code has already been used to create an account.
          </p>
          <div className="mb-4 flex items-center justify-center gap-2.5 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-2.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-amber-400/60">Code</span>
            <span className="font-mono text-[14px] font-extrabold text-amber-300">{employeeCode}</span>
          </div>
          <div className="mb-5 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">What this means</p>
            <ul className="space-y-2">
              {[
                'Each biometric code is single-use only',
                'An account already exists for this code',
                'Log in using your registered credentials',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[11px] text-slate-300">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[9px] font-bold text-amber-400">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={onSwitchToLogin}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-amber-500/25 transition hover:from-amber-500 hover:to-orange-600 active:scale-[0.97]">
              <LogIn size={14} />Go to Login
            </button>
            <button type="button" onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-[12px] font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-[0.97]">
              <RefreshCcw size={12} />Try a Different Code
            </button>
          </div>
          <p className="mt-4 text-center text-[10px] leading-relaxed text-slate-600">
            Forgot your password or need a new code?<br />Contact your administrator.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// FORGOT PASSWORD — inline view (mode === 'forgot')
// ============================================================
function ForgotPasswordView({ onBack, onSuccess }) {
  const [email, setEmail]       = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !emailPattern.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
      onSuccess?.(email.trim());
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Sent state ──
  if (sent) {
    return (
      <motion.div
        key="forgot-sent"
        className="flex flex-col items-center py-2 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* animated mail icon */}
        <div className="relative mb-5 flex items-center justify-center">
          <motion.span
            className="absolute h-20 w-20 rounded-full bg-blue-500/15"
            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity }} />
          <motion.span
            className="absolute h-14 w-14 rounded-full bg-blue-500/20"
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.2, delay: 0.4, repeat: Infinity }} />
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-600/30">
            <Send className="h-7 w-7 text-white" strokeWidth={2} />
          </div>
        </div>

        <h3 className="mb-1 text-[17px] font-extrabold tracking-tight text-white">
          Check Your Email
        </h3>
        <p className="mb-5 max-w-[260px] text-[11px] leading-relaxed text-slate-400">
          We've sent a password reset link to
          <span className="ml-1 font-semibold text-white">{email}</span>.
          Click the link to set a new password.
        </p>

        <div className="mb-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">What's next</p>
          <ul className="space-y-1.5">
            {[
              'Open the email in your inbox',
              'Click "Reset Password" link',
              'Set your new password',
              'Return and log in',
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-2.5 text-[11px] text-slate-300">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[9px] font-bold text-blue-400">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        <p className="mb-4 text-[10px] text-slate-500">
          Didn't receive it? Check your spam folder.
        </p>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-300 transition hover:text-white"
        >
          <ArrowLeft size={13} />
          Back to Login
        </button>
      </motion.div>
    );
  }

  // ── Form state ──
  return (
    <motion.div
      key="forgot-form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22 }}
    >
      {/* Icon */}
      <div className="mb-4 flex justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white shadow-xl shadow-slate-950/20 ring-1 ring-white/20 backdrop-blur-xl">
          <KeyRound size={18} />
        </div>
      </div>

      {/* Header */}
      <div className="mb-3 text-center">
        <h2 className="text-lg font-extrabold tracking-tight text-white">Forgot Password?</h2>
        <p className="mt-0.5 text-[10px] leading-relaxed text-slate-400">
          Enter your registered email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          id="forgot-email"
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          error={error}
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send Reset Link
        </Button>
      </form>

      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 mx-auto text-[12px] font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={13} />
          Back to Login
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================
// AUTH MODAL
// ============================================================
export default function AuthModal({ mode, onClose, onSwitchMode }) {
  const navigate = useNavigate();
  const { signIn, signUp, verifyEmployeeCode } = useAuth();

  // mode can be: 'login' | 'signup' | 'forgot'
  const [view, setView] = useState(mode);

  const [form, setForm] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors]                     = useState({});
  const [toast, setToast]                       = useState({ visible: false, type: 'info', title: '', message: '' });
  const [loading, setLoading]                   = useState(false);
  const [verifyingCode, setVerifyingCode]       = useState(false);
  const [employeeVerified, setEmployeeVerified] = useState(false);
  const [employeeInfo, setEmployeeInfo]         = useState(null);
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email verification modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [verifiedEmail, setVerifiedEmail]   = useState('');

  // Code already used inline warning
  const [showCodeWarning, setShowCodeWarning] = useState(false);
  const [usedCode, setUsedCode]               = useState('');

  // Sync view with mode prop
  useEffect(() => { setView(mode); }, [mode]);

  // Reset form on view change
  useEffect(() => {
    setForm({ employeeCode: '', fullName: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    hideToast();
    setLoading(false);
    setVerifyingCode(false);
    setEmployeeVerified(false);
    setEmployeeInfo(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowCodeWarning(false);
    setUsedCode('');
  }, [view]);

  // ── Toast helpers ──
  const showToast = (type, message, title = '') =>
    setToast({ visible: true, type, title, message });
  const hideToast = () =>
    setToast(prev => ({ ...prev, visible: false }));

  // ── Field change ──
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev }; delete next[field]; return next;
    });
    if (toast.visible) hideToast();
  };

  // ── Verify employee code ──
  const handleVerifyEmployeeCode = async () => {
    const code = form.employeeCode.trim();
    if (!code) { setErrors({ employeeCode: 'Enter your employee biometric code.' }); return; }

    setErrors({});
    hideToast();
    setEmployeeInfo(null);
    setEmployeeVerified(false);
    setVerifyingCode(true);

    try {
      const employee = await verifyEmployeeCode(code);
      if (!employee) {
        setErrors({ employeeCode: 'Invalid employee code or this code has already been used.' });
        return;
      }
      setEmployeeVerified(true);
      setEmployeeInfo(employee);
      setForm(prev => ({
        ...prev,
        employeeCode: employee.employee_code || code,
        fullName:     employee.full_name || '',
        email:        employee.email || ''
      }));
      showToast('success', 'Employee code verified successfully!', 'Employee Code Verified');
    } catch (error) {
      setEmployeeVerified(false);
      setEmployeeInfo(null);
      const msg = error?.message || '';
      if (msg.toLowerCase().includes('already used') || msg.toLowerCase().includes('already been used')) {
        setUsedCode(code);
        setShowCodeWarning(true);
      } else {
        setErrors({ employeeCode: msg || 'Unable to verify employee code.' });
      }
    } finally {
      setVerifyingCode(false);
    }
  };

  // ── Validation ──
  const validate = () => {
    const e = {};
    if (view === 'signup') {
      if (!form.employeeCode.trim()) e.employeeCode = 'Enter your employee biometric code.';
      if (!employeeVerified)         e.employeeCode = 'Verify your employee code before creating an account.';
      if (!form.fullName || form.fullName.trim().length < 2) e.fullName = 'Enter your full name.';
    }
    if (!form.email || !emailPattern.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.password || form.password.length < 8)    e.password = 'Password must be at least 8 characters.';
    if (view === 'signup') {
      if (!form.confirmPassword)                               e.confirmPassword = 'Confirm your password.';
      else if (form.password !== form.confirmPassword)         e.confirmPassword = 'Passwords do not match.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit (login / signup) ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    hideToast();
    if (!validate()) {
      showToast('error', 'Please fix the errors in the form before submitting.', 'Validation Error');
      return;
    }
    setLoading(true);
    try {
      if (view === 'login') {
        await signIn({ email: form.email.trim(), password: form.password });
        showToast('success', 'You have successfully logged in. Redirecting...', 'Login Successful');
        onClose();
        navigate('/dashboard');
        return;
      }
      await signUp({
        email:        form.email.trim(),
        password:     form.password,
        fullName:     form.fullName.trim(),
        employeeCode: form.employeeCode.trim()
      });
      setVerifiedEmail(form.email.trim());
      setShowEmailModal(true);
      setForm({ employeeCode: '', fullName: '', email: '', password: '', confirmPassword: '' });
      setEmployeeVerified(false);
      setEmployeeInfo(null);
    } catch (error) {
      showToast('error', error?.message || 'Something went wrong. Please try again.', 'Authentication Error');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──
  return (
    <>
      {/* Email verification modal */}
      <EmailVerificationModal
        isOpen={showEmailModal}
        onClose={() => { setShowEmailModal(false); setVerifiedEmail(''); setView('login'); onSwitchMode('login'); }}
        email={verifiedEmail}
      />

      {/* Toast */}
      <Toast
        type={toast.type} title={toast.title} message={toast.message}
        visible={toast.visible} onClose={hideToast}
        duration={5000} pauseOnHover position="top-right"
      />

      <AnimatePresence>
        {mode && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-4 backdrop-blur-xl overflow-y-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {/* Auth modal card */}
            <motion.div
              className="relative w-full max-w-[380px] my-4 overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-3xl ring-1 ring-white/10"
              variants={modalVariants}
              initial="hidden" animate="visible" exit="hidden"
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >

              {/* Code already used overlay */}
              <AnimatePresence>
                {showCodeWarning && (
                  <CodeAlreadyUsed
                    employeeCode={usedCode}
                    onClose={() => { setShowCodeWarning(false); setUsedCode(''); }}
                    onSwitchToLogin={() => { setShowCodeWarning(false); setUsedCode(''); setView('login'); onSwitchMode('login'); }}
                  />
                )}
              </AnimatePresence>

              {/* Close button */}
              {(view === 'login' || view === 'forgot') && (
                <button
                  type="button" onClick={onClose} aria-label="Close modal"
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-slate-200 shadow-sm backdrop-blur-xl transition hover:bg-white/20 hover:text-slate-50"
                >
                  <X size={16} />
                </button>
              )}

              <div className="pb-1.5">

                {/* ── FORGOT PASSWORD VIEW ── */}
                <AnimatePresence mode="wait">
                  {view === 'forgot' && (
                    <motion.div
                      key="forgot"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                    >
                      <ForgotPasswordView
                        onBack={() => { setView('login'); onSwitchMode('login'); }}
                        onSuccess={() => {/* sent state handled inside ForgotPasswordView */}}
                      />
                    </motion.div>
                  )}

                  {/* ── LOGIN / SIGNUP VIEW ── */}
                  {(view === 'login' || view === 'signup') && (
                    <motion.div
                      key={view}
                      initial={{ opacity: 0, x: view === 'login' ? -30 : 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: view === 'login' ? -30 : 30 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                    >
                      {/* Header */}
                      <div className="flex flex-col items-center gap-0.5 pb-2 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white shadow-xl shadow-slate-950/20 ring-1 ring-white/20 backdrop-blur-xl">
                          {view === 'signup' ? <Fingerprint size={20} /> : <LogIn size={16} />}
                        </div>
                        <h2 className="text-lg font-extrabold tracking-tight text-white">
                          {view === 'login' ? 'Welcome Back' : 'Employee Sign Up'}
                        </h2>
                        {view === 'signup' && (
                          <p className="max-w-[280px] text-[10px] leading-3 text-slate-300 mb-1">
                            Enter your assigned employee biometric code to register your account.
                          </p>
                        )}
                      </div>

                      {/* Form */}
                      <form onSubmit={handleSubmit} className="space-y-2">

                        {/* Employee code */}
                        {view === 'signup' && (
                          <div className="flex flex-col gap-0.5">
                            <label htmlFor="employeeCode" className="text-xs font-medium text-white">
                              Employee Biometric Code
                            </label>
                            <div className="flex gap-2">
                              <div className="min-w-0 flex-1">
                                <Input
                                  id="employeeCode" label="" type="text" icon={Fingerprint}
                                  placeholder="e.g. EMP-10001" value={form.employeeCode}
                                  disabled={employeeVerified || verifyingCode}
                                  onChange={(e) => {
                                    handleChange('employeeCode', e.target.value.toUpperCase());
                                    setEmployeeVerified(false);
                                    setEmployeeInfo(null);
                                  }}
                                  error={errors.employeeCode}
                                />
                              </div>
                              {!employeeVerified && (
                                <button type="button" onClick={handleVerifyEmployeeCode}
                                  disabled={verifyingCode || !form.employeeCode.trim()}
                                  className="mt-[1px] h-[40px] shrink-0 rounded-2xl bg-red-600 px-2.5 text-[11px] font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                                  {verifyingCode ? 'Checking...' : 'Verify'}
                                </button>
                              )}
                            </div>

                            {/* Verified badge */}
                            {employeeVerified && employeeInfo && (
                              <div className="mt-0.5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <CheckCircle2 size={14} className="text-emerald-400" />
                                  <p className="text-xs font-semibold text-emerald-300">Employee Verified</p>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-[10px] text-emerald-200/70 font-medium">Employee:</span>
                                    <span className="text-xs font-semibold text-white">{employeeInfo.full_name}</span>
                                  </div>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-[10px] text-emerald-200/70 font-medium">Position:</span>
                                    <span className="text-xs font-semibold text-white">{employeeInfo.position}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Full name */}
                        {view === 'signup' && (
                          <Input id="fullName" label="Full Name" icon={Users}
                            placeholder="Enter your full name" value={form.fullName}
                            disabled={employeeVerified}
                            className={employeeVerified ? '!text-slate-500' : ''}
                            onChange={(e) => handleChange('fullName', e.target.value)}
                            error={errors.fullName} />
                        )}

                        {/* Email */}
                        <Input id="email" label="Email Address" type="email" icon={Mail}
                          placeholder="you@example.com" value={form.email}
                          disabled={view === 'signup' && employeeVerified}
                          readOnly={view === 'signup' && employeeVerified}
                          className={view === 'signup' && employeeVerified ? '!bg-slate-100/50 !text-slate-600 !cursor-not-allowed' : ''}
                          onChange={(e) => handleChange('email', e.target.value)}
                          error={errors.email} />

                        {/* Password */}
                        <Input id="password" label="Password"
                          type={showPassword ? 'text' : 'password'} icon={Lock}
                          placeholder="Enter your password" value={form.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          error={errors.password}
                          suffix={
                            <button type="button" onClick={() => setShowPassword(p => !p)}
                              className="text-slate-400 transition hover:text-slate-700"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}>
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          } />

                        {/* Confirm password */}
                        {view === 'signup' && (
                          <Input id="confirmPassword" label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'} icon={Lock}
                            placeholder="Re-enter your password" value={form.confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            error={errors.confirmPassword}
                            suffix={
                              <button type="button" onClick={() => setShowConfirmPassword(p => !p)}
                                className="text-slate-400 transition hover:text-slate-700"
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            } />
                        )}

                        {/* Submit */}
                        <div className="pt-1">
                          <Button type="submit" loading={loading}
                            disabled={view === 'signup' && !employeeVerified}
                            className="w-full rounded-3xl bg-red-600 px-6 py-2 text-sm text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
                            {view === 'login' ? 'Login' : 'Create Account'}
                          </Button>
                        </div>

                        {/* Signup notice */}
                        {view === 'signup' && (
                          <p className="px-2 text-center text-[10px] leading-3 text-slate-400">
                            Your employee code determines your registered position. You cannot select or change the position during signup.
                          </p>
                        )}

                        {/* Forgot password link */}
                        {view === 'login' && (
                          <div className="pt-0.5 text-right text-xs">
                            <button type="button"
                              onClick={() => setView('forgot')}
                              className="font-medium text-slate-300 transition hover:text-white">
                              Forgot password?
                            </button>
                          </div>
                        )}

                      </form>

                      {/* Mode switch */}
                      <div className="mt-2 text-center text-xs text-slate-500">
                        {view === 'login' ? (
                          <>
                            Don&apos;t have an account?{' '}
                            <button type="button" onClick={() => { setView('signup'); onSwitchMode('signup'); }}
                              className="font-semibold text-red-600 hover:text-red-700">Sign up</button>
                          </>
                        ) : (
                          <>
                            Already have an account?{' '}
                            <button type="button" onClick={() => { setView('login'); onSwitchMode('login'); }}
                              className="font-semibold text-red-600 hover:text-red-700">Login</button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
