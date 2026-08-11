import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';

const POSITION_OPTIONS = [
  { value: '', label: 'Select Position' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'operational_staff', label: 'Operational Staff' },
  { value: 'warehouse_staff', label: 'Warehouse Staff' },
  { value: 'sales_staff', label: 'Sales Staff' },
];

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', position: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!form.email.trim()) nextErrors.email = 'Email address is required';
    if (!form.password || form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords must match';
    if (!form.position) nextErrors.position = 'Select your position';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setErrors({});
    if (!validate()) return;
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
            error={errors.fullName}
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
            error={errors.email}
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
            error={errors.password}
          />
          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            icon={Lock}
            required
            value={form.confirmPassword}
            autoComplete="new-password"
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="position" className="text-sm font-medium text-slate-700">
              Position
            </label>
            <select
              id="position"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {POSITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} disabled={!option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.position && <span className="text-xs text-red-600">{errors.position}</span>}
          </div>
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
