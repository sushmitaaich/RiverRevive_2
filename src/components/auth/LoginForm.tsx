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
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-white font-bold text-xl">RR</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome to RiverRevive</h2>
        <p className="text-gray-600 mt-2">
          {selectedRole ? `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}` : 'Sign in to your account'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
        <div className="space-y-1 text-xs">
          <p className={selectedRole === 'citizen' ? 'font-bold text-blue-600' : ''}>
            <strong>Citizen:</strong> citizen@riverrevive.gov / citizen123
          </p>
          <p className={selectedRole === 'collector' ? 'font-bold text-green-600' : ''}>
            <strong>Collector:</strong> collector@riverrevive.gov / collector123
          </p>
          <p className={selectedRole === 'admin' ? 'font-bold text-purple-600' : ''}>
            <strong>Admin:</strong> admin@riverrevive.gov / admin123
          </p>
        </div>
      </div>
    </div>
  );
}