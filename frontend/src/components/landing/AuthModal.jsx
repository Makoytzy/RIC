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
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setForm({ fullName: '', email: '', password: '' });
    setErrors({});
    setStatus('');
    setShowPassword(false);
  }, [mode]);

  const validate = () => {
    const nextErrors = {};
    if (!form.email || !emailPattern.test(form.email)) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!form.password || form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters';
    }
    if (mode === 'signup' && (!form.fullName || form.fullName.trim().length < 2)) {
      nextErrors.fullName = 'Enter your full name';
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
        await signUp(form);
        setStatus('Account created successfully. Please sign in.');
        setForm({ fullName: '', email: '', password: '' });
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
            className="relative w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-3xl ring-1 ring-white/10"
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

            <div className="flex flex-col items-center gap-4 pb-5 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-white shadow-xl shadow-slate-950/20 ring-1 ring-white/20 backdrop-blur-xl">
                <LogIn size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="mt-2 text-sm text-slate-200/80">
                  {mode === 'login'
                    ? 'Sign in to your account to continue'
                    : 'Create your account to manage your inventory access'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="relative">
                <Input
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[42px] text-slate-400 transition hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {status && (
                <div className={`rounded-3xl px-4 py-3 text-sm ${status.toLowerCase().includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {status}
                </div>
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full rounded-3xl bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700"
              >
                {mode === 'login' ? 'Login' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4">
              <div className="flex justify-end text-sm text-slate-500">
                <button
                  type="button"
                  onClick={() => onSwitchMode('forgot')}
                  className="font-semibold text-slate-500 transition hover:text-red-600"
                >
                  Forgot password?
                </button>
              </div>

              <p className="mt-4 text-center text-sm text-slate-500">
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
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
