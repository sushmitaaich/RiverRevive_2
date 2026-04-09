import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  selectedRole?: 'citizen' | 'collector' | 'admin' | null;
}

export default function LoginForm({ selectedRole }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rr-card mx-auto max-w-md p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-emerald-600 to-teal-600 shadow-[0_18px_34px_rgba(15,124,104,0.2)]">
          <span className="text-xl font-bold text-white">RR</span>
        </div>
        <p className="rr-page-kicker !bg-emerald-600/10 !text-emerald-900 !border-emerald-200/80">
          Sign In
        </p>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Welcome to RiverRevive</h2>
        <p className="mt-2 text-gray-600">
          {selectedRole
            ? `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
            : 'Sign in to your account'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rr-input"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rr-input pr-12"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-emerald-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="rr-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="rr-card-muted mt-6 p-4">
        <p className="mb-2 text-sm font-medium text-slate-700">Demo Credentials</p>
        <div className="space-y-1 text-xs">
          <p className={selectedRole === 'citizen' ? 'font-bold text-blue-600' : 'text-slate-600'}>
            <strong>Citizen:</strong> citizen@riverrevive.gov / citizen123
          </p>
          <p className={selectedRole === 'collector' ? 'font-bold text-green-600' : 'text-slate-600'}>
            <strong>Collector:</strong> collector@riverrevive.gov / collector123
          </p>
          <p className={selectedRole === 'admin' ? 'font-bold text-purple-600' : 'text-slate-600'}>
            <strong>Admin:</strong> admin@riverrevive.gov / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
