import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, LogIn, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -12 },
  visible: { opacity: 1, scale: 1, y: 0 }
};

export default function AuthModal({ mode, onClose, onSwitchMode }) {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn({ email: form.email, password: form.password });
        onClose();
        navigate('/dashboard');
      } else {
        await signUp(form);
        setForm({ fullName: '', email: '', password: '' });
        setError('Account created. Please sign in.');
        onSwitchMode('login');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b1220] p-8 shadow-2xl shadow-black/80"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white">
                  {mode === 'login' ? 'Sign in to Red Indian Customs' : 'Create your account'}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {mode === 'login'
                    ? 'Use your credentials to access the inventory portal.'
                    : 'Register now and request access to the platform.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/5 p-3 text-slate-200 hover:bg-white/10"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <Input
                  id="fullName"
                  label="Full name"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              )}
              <Input
                id="email"
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                id="password"
                label="Password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="grid gap-4 sm:grid-cols-2">
                <Button type="submit" loading={loading} className="w-full">
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                </Button>
                <button
                  type="button"
                  onClick={() => onSwitchMode(mode === 'login' ? 'signup' : 'login')}
                  className="w-full rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#3B82F6]/40"
                >
                  {mode === 'login' ? 'Switch to Sign up' : 'Switch to Login'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-sm text-slate-500">
              Need help? Reach out to our support team or check your login details before continuing.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
