import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../../config/supabase.js';
import { resetPassword } from '../../services/authService.js';

// ── Password strength calculator ────────────────────────────
function getStrength(pw) {
  let score = 0;
  if (!pw) return { score: 0, label: '', color: '' };
  if (pw.length >= 8)            score++;
  if (pw.length >= 12)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;

  const levels = [
    { label: '',          color: '' },
    { label: 'Weak',      color: 'bg-red-500' },
    { label: 'Fair',      color: 'bg-orange-500' },
    { label: 'Good',      color: 'bg-yellow-500' },
    { label: 'Strong',    color: 'bg-emerald-500' },
    { label: 'Very strong', color: 'bg-emerald-400' },
  ];
  return { score, ...levels[Math.min(score, 5)] };
}

// ── Requirement row ──────────────────────────────────────────
function Requirement({ met, label }) {
  return (
    <motion.li
      className="flex items-center gap-2 text-[11px]"
      animate={{ opacity: met ? 1 : 0.45 }}
      transition={{ duration: 0.2 }}
    >
      <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${met ? 'bg-emerald-500' : 'bg-white/10'}`}>
        {met && <CheckCircle size={9} className="text-white" strokeWidth={3} />}
      </span>
      <span className={met ? 'text-slate-200' : 'text-slate-500'}>{label}</span>
    </motion.li>
  );
}

// ── PasswordInput ─────────────────────────────────────────────
function PasswordInput({ id, label, value, onChange, show, onToggle, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-slate-300">{label}</label>
      <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 transition-colors ${error ? 'border-red-500/60 bg-red-500/5' : 'border-white/15 bg-white/8 focus-within:border-white/30'}`}>
        <Lock size={15} className="shrink-0 text-slate-400" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          autoComplete={id === 'new-password' ? 'new-password' : 'new-password'}
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
        />
        <button type="button" onClick={onToggle}
          className="shrink-0 text-slate-500 transition hover:text-slate-300"
          aria-label={show ? 'Hide' : 'Show'}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && (
        <motion.p
          className="flex items-center gap-1 text-[11px] text-red-400"
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
          <AlertCircle size={11} />{error}
        </motion.p>
      )}
    </div>
  );
}

// ============================================================
// RESET PASSWORD PAGE
// ============================================================
export default function ResetPassword() {
  const navigate = useNavigate();

  // States
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [showPw, setShowPw]             = useState(false);
  const [showCf, setShowCf]             = useState(false);
  const [errors, setErrors]             = useState({});
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);
  const [countdown, setCountdown]       = useState(5);

  const strength = getStrength(password);

  // ── Detect Supabase recovery session from URL hash ──
  useEffect(() => {
    // Supabase embeds #access_token=...&type=recovery in the URL
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
        setSessionError('');
      }
    });

    // Also check current session in case listener fires before mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    // If no recovery event fires within 3 seconds and no session
    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setSessionError('Invalid or expired reset link. Please request a new one.');
        }
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // ── Countdown redirect after success ──
  useEffect(() => {
    if (!success) return;
    const t = setInterval(() => {
      setCountdown(n => {
        if (n <= 1) { clearInterval(t); navigate('/'); }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [success, navigate]);

  // ── Validate ──
  const validate = () => {
    const e = {};
    if (!password)            e.password = 'Enter a new password.';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (!confirm)             e.confirm = 'Confirm your new password.';
    else if (password !== confirm) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await resetPassword(password);
      setSuccess(true);
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to reset password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Invalid link screen ──
  if (sessionError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-sm rounded-3xl border border-red-500/20 bg-gradient-to-b from-slate-900 to-slate-950 p-8 text-center shadow-2xl">
          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-extrabold text-white">Link Expired</h2>
          <p className="mb-6 text-sm leading-relaxed text-slate-400">{sessionError}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full rounded-2xl bg-red-600 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-red-700">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950 px-4">
        <motion.div
          className="w-full max-w-sm rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-slate-900 to-slate-950 p-8 text-center shadow-2xl"
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative flex items-center justify-center">
              <motion.span
                className="absolute h-24 w-24 rounded-full bg-emerald-500/10"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity }} />
              <motion.span
                className="absolute h-16 w-16 rounded-full bg-emerald-500/15"
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.2, delay: 0.4, repeat: Infinity }} />
              <motion.div
                className="relative z-10 flex h-18 w-18 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 p-4 shadow-xl shadow-emerald-600/30"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 180, damping: 14 }}
              >
                <ShieldCheck className="h-9 w-9 text-white" strokeWidth={2} />
              </motion.div>
            </div>
          </div>

          <motion.h2
            className="mb-2 text-2xl font-extrabold text-white"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            Password Reset!
          </motion.h2>

          <motion.p
            className="mb-6 text-sm leading-relaxed text-slate-400"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            Your password has been updated successfully. You can now log in with your new password.
          </motion.p>

          {/* Countdown ring */}
          <motion.div
            className="mb-4 flex flex-col items-center gap-1"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <span className="text-3xl font-extrabold text-emerald-400">{countdown}</span>
            <span className="text-[11px] text-slate-500">Redirecting to home…</span>
          </motion.div>

          <motion.button
            onClick={() => navigate('/')}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-600 hover:to-green-700"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            Go to Home Now
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── Loading / waiting for session ──
  if (!sessionReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="h-10 w-10 rounded-full border-2 border-white/10 border-t-red-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
          <p className="text-sm text-slate-400">Verifying reset link…</p>
        </div>
      </div>
    );
  }

  // ── Reset form ──
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950 px-4 py-8 overflow-y-auto">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-red-600/8 blur-[120px]" />
      </div>

      <motion.div
        className="relative w-full max-w-[400px] overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-b from-slate-900/95 to-slate-950/95 shadow-[0_32px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        initial={{ opacity: 0, scale: 0.93, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Red top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-red-500 via-rose-400 to-red-500" />

        <div className="px-8 pb-8 pt-8">

          {/* Icon */}
          <div className="mb-5 flex justify-center">
            <div className="relative flex items-center justify-center">
              <motion.span
                className="absolute h-[72px] w-[72px] rounded-full bg-red-600/10"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity }} />
              <div className="relative z-10 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-xl shadow-red-600/30">
                <KeyRoundIcon />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6 text-center">
            <h1 className="text-xl font-extrabold tracking-tight text-white">Set New Password</h1>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-400">
              Choose a strong password to secure your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* New password */}
            <PasswordInput
              id="new-password"
              label="New Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
              show={showPw}
              onToggle={() => setShowPw(p => !p)}
              error={errors.password}
            />

            {/* Strength bar */}
            {password.length > 0 && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-white/10'}`} />
                    ))}
                  </div>
                  {strength.label && (
                    <span className="ml-2 text-[10px] font-semibold text-slate-400">{strength.label}</span>
                  )}
                </div>
                {/* Requirements */}
                <ul className="grid grid-cols-2 gap-1 pt-1">
                  <Requirement met={password.length >= 8}        label="8+ characters" />
                  <Requirement met={/[A-Z]/.test(password)}      label="Uppercase letter" />
                  <Requirement met={/[0-9]/.test(password)}      label="Number" />
                  <Requirement met={/[^A-Za-z0-9]/.test(password)} label="Special character" />
                </ul>
              </motion.div>
            )}

            {/* Confirm password */}
            <PasswordInput
              id="confirm-password"
              label="Confirm Password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })); }}
              show={showCf}
              onToggle={() => setShowCf(p => !p)}
              error={errors.confirm}
            />

            {/* Match indicator */}
            <AnimatePresence>
              {confirm.length > 0 && (
                <motion.p
                  className={`flex items-center gap-1.5 text-[11px] font-medium ${password === confirm ? 'text-emerald-400' : 'text-slate-500'}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <span className={`h-1.5 w-1.5 rounded-full ${password === confirm ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  {password === confirm ? 'Passwords match' : 'Passwords do not match yet'}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit error */}
            {errors.submit && (
              <motion.div
                className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5"
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
                <p className="text-[11px] leading-relaxed text-red-300">{errors.submit}</p>
              </motion.div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:from-red-700 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <motion.span
                    className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                  Updating Password…
                </>
              ) : (
                <>
                  <ShieldCheck size={15} />
                  Reset Password
                </>
              )}
            </button>

          </form>

          <p className="mt-5 text-center text-[10px] leading-relaxed text-slate-600">
            Having trouble?{' '}
            <button onClick={() => navigate('/')} className="text-slate-400 underline-offset-2 hover:underline hover:text-slate-300 transition">
              Return to home
            </button>
          </p>

        </div>
      </motion.div>
    </div>
  );
}

// inline icon to avoid import cycle issues
function KeyRoundIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
      <circle cx="16.5" cy="7.5" r=".5" fill="white" />
    </svg>
  );
}
