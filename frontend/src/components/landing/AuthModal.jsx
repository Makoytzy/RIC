import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, LogIn, Users, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -12 },
  visible: { opacity: 1, scale: 1, y: 0 }
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthModal({ mode, onClose, onSwitchMode }) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', position: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setForm({ fullName: '', email: '', password: '', confirmPassword: '', position: '' });
    setErrors({});
    setStatus('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [mode]);

  const validate = () => {
    const nextErrors = {};
    if (!form.email || !emailPattern.test(form.email)) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!form.password || form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }
    if (mode === 'signup') {
      if (!form.fullName || form.fullName.trim().length < 2) {
        nextErrors.fullName = 'Enter your full name';
      }
      if (!form.position) {
        nextErrors.position = 'Select a position';
      }
      if (form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = 'Passwords must match';
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!validate()) return;
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn({ email: form.email, password: form.password });
        onClose();
        navigate('/dashboard');
      } else {
        await signUp({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          position: form.position,
        });
        setStatus('Account created successfully. Please sign in.');
        setForm({ fullName: '', email: '', password: '', confirmPassword: '', position: '' });
        setTimeout(() => onSwitchMode('login'), 1200);
      }
    } catch (err) {
      setStatus(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-3xl ring-1 ring-white/10"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-slate-200 shadow-sm backdrop-blur-xl transition hover:bg-white/20 hover:text-slate-50"
            >
              <X size={16} />
            </button>
            <div className="pb-3">

            <div className="flex flex-col items-center gap-1.5 pb-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white shadow-xl shadow-slate-950/20 ring-1 ring-white/20 backdrop-blur-xl">
                <LogIn size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
              {mode === 'signup' && (
                <Input
                  id="fullName"
                  label="Full Name"
                  icon={Users}
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  error={errors.fullName}
                />
              )}
              <Input
                id="email"
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
              />
              <Input
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-slate-400 transition hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              {mode === 'login' && (
                <div className="text-right text-sm pb-2">
                  <button
                    type="button"
                    className="font-medium text-slate-300 transition hover:text-white"
                    onClick={() => {}}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              {mode === 'signup' && (
                <Input
                  id="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  error={errors.confirmPassword}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="text-slate-400 transition hover:text-slate-700"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
              )}
              {mode === 'signup' && (
                <div className="flex flex-col gap-1">
                  <label htmlFor="position" className="text-sm font-medium text-slate-200">
                    Position
                  </label>
                  <select
                    id="position"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10 backdrop-blur-sm"
                  >
                    <option value="" className="bg-slate-950 text-slate-100">
                      Select Position
                    </option>
                    <option value="admin" className="bg-slate-950 text-slate-100">Admin</option>
                    <option value="manager" className="bg-slate-950 text-slate-100">Manager</option>
                    <option value="operational_staff" className="bg-slate-950 text-slate-100">Operational Staff</option>
                    <option value="warehouse_staff" className="bg-slate-950 text-slate-100">Warehouse Staff</option>
                    <option value="sales_staff" className="bg-slate-950 text-slate-100">Sales Staff</option>
                  </select>
                  {errors.position && <span className="text-xs text-rose-400">{errors.position}</span>}
                </div>
              )}

              {status && (
                <div className={`rounded-3xl px-4 py-3 text-sm ${status.toLowerCase().includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {status}
                </div>
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full rounded-3xl bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700 px-6 py-3 mt-4"
              >
                {mode === 'login' ? 'Login' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-2 text-center text-sm text-slate-500">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onSwitchMode('signup')}
                    className="font-semibold text-red-600 hover:text-red-700"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onSwitchMode('login')}
                    className="font-semibold text-red-600 hover:text-red-700"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
