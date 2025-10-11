import React, { useState } from 'react';
import { supabase } from '../../lib/supabase'; // <-- ensure this path is correct
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sign in with Supabase (v2)
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        console.error('signInError:', signInError);
        setError('Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      // signInData may contain session and/or user depending on environment
      // Prefer session?.user, then user
      const user =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (signInData as any)?.user ?? (signInData as any)?.session?.user;

      if (!user || !user.id) {
        console.error('No user returned from signIn:', signInData);
        setError('Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      // Fetch profile row by auth user id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('profile fetch error:', profileError);
        setError('Unable to fetch user profile. Please contact support.');
        setLoading(false);
        return;
      }

      // profileData now present
      // Check approval and status
      if (!profileData.approved || profileData.status === 'pending') {
        setError('Your account is pending admin approval. Please wait for confirmation.');
        setLoading(false);
        return;
      }

      if (profileData.status === 'rejected') {
        setError('Your registration was rejected. Please contact admin for details.');
        setLoading(false);
        return;
      }

      // SUCCESS - redirect or update app state as needed
      // Example simple redirect by role
      if (profileData.role === 'admin') {
        window.location.href = '/dashboard/admin';
      } else if (profileData.role === 'collector') {
        window.location.href = '/dashboard/collector';
      } else {
        window.location.href = '/dashboard/citizen';
      }

    } catch (err) {
      console.error('Unhandled login error:', err);
      setError('Login failed. Please try again later.');
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
          {selectedRole
            ? `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
            : 'Sign in to your account'}
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