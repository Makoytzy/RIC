import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp(form);
      navigate('/login', { state: { justRegistered: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/95 p-10 shadow-2xl shadow-slate-900/20 backdrop-blur-xl">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-inner shadow-red-200/50">
          <ShieldCheck size={32} />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">Create account</h1>
          <p className="mt-3 text-sm text-slate-500">Start your account to manage inventory access</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input
            id="fullName"
            label="Full name"
            icon={User}
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            id="email"
            label="Email Address"
            type="email"
            icon={Mail}
            required
            ref={emailRef}
            value={form.email}
            autoComplete="email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            icon={Lock}
            required
            minLength={8}
            value={form.password}
            autoComplete="new-password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <Button
            type="submit"
            loading={loading}
            className="w-full rounded-3xl bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700"
          >
            Create account
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
