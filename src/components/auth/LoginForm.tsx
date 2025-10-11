import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
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
    setError('');
    setLoading(true);

    try {
      // 🧩 1️⃣ Login using Supabase Auth
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        console.error('Auth error:', signInError);
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }

      const user = signInData?.user;
      if (!user) {
        setError('Login failed. Please try again.');
        setLoading(false);
        return;
      }

      // 🧩 2️⃣ Fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // 🧩 3️⃣ If profile doesn’t exist, create one
      if (fetchError || !existingProfile) {
        const role = selectedRole || 'citizen';
        const { error: insertError } = await supabase.from('profiles').insert([
          {
            id: user.id,
            full_name: user.user_metadata?.full_name || '',
            email: user.email,
            role: role.toLowerCase(),
            phone_number: '',
            location: '',
            organization: '',
            status: 'approved', // ✅ automatically approved
            approved: true,
          },
        ]);

        if (insertError) {
          console.error('Profile insert error:', insertError);
          setError('Profile creation failed.');
          setLoading(false);
          return;
        }

        alert(`Welcome, ${role}! Your account is now active.`);
        window.location.href = '/';
        return;
      }

      // 🧩 4️⃣ If profile exists but is pending — auto-approve now
      if (!existingProfile.approved || existingProfile.status !== 'approved') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ approved: true, status: 'approved' })
          .eq('id', user.id);

        if (updateError) {
          console.error('Auto-approve error:', updateError);
          setError('Account approval failed.');
          setLoading(false);
          return;
        }
      }

      // ✅ 5️⃣ Success — login complete
      alert(`Welcome back, ${existingProfile.full_name || 'User'}!`);
      window.location.href = '/'; // Let App.tsx load correct dashboard
    } catch (err) {
      console.error('Login error:', err);
      setError('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">
        Sign In to RiverRevive
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-12"
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

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}