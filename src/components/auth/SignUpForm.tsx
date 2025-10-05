'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, User, Recycle, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SignUpFormProps {
  onBack: () => void;
  onSignUpSuccess?: () => void; // optional parent callback
}

export default function SignUpForm({ onBack, onSignUpSuccess }: SignUpFormProps) {
  /* ---------- form state ---------- */
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen' as 'citizen' | 'collector' | 'admin',
    phone: '',
    location: '',
    organization: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [showPwConf, setShowPwConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* NEW: success banner */
  const [mailSent, setMailSent] = useState(false);

  /* ---------- submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMailSent(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be ≥ 6 characters');
      setLoading(false);
      return;
    }

    try {
      /* 1. auth user */
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: formData.role,
            phone: formData.phone,
            location: formData.location,
            organization: formData.organization
          }
        }
      });
      if (signUpError) throw signUpError;

      /* 2. profile row (RLS: auth.uid() = id) */
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user!.id,
        full_name: formData.name,
        role: formData.role,
        phone: formData.phone,
        location: formData.location,
        organization: formData.organization,
        approved: false
      });
      if (profileError) throw profileError;

      /* 3. show banner + optional parent callback */
      setMailSent(true);
      onSignUpSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- helpers ---------- */
  const roleIcon = (r: string) =>
    r === 'citizen' ? <User className="w-5 h-5" /> :
    r === 'collector' ? <Recycle className="w-5 h-5" /> :
    <Shield className="w-5 h-5" />;

  const roleColor = (r: string) =>
    r === 'citizen' ? 'border-blue-500 bg-blue-50 text-blue-700' :
    r === 'collector' ? 'border-green-500 bg-green-50 text-green-700' :
    'border-purple-500 bg-purple-50 text-purple-700';

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">RR</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Join RiverRevive</h2>
          <p className="text-gray-600 mt-2">Create your account to help clean our rivers</p>
        </div>

        {/*  ✅  success banner  */}
        {mailSent && (
          <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
            ✅ Check your email to confirm your account.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/*  role cards  */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Your Role</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'citizen', label: 'Citizen', desc: 'Report waste locations' },
                { id: 'collector', label: 'Garbage Collector', desc: 'Participate in cleaning' },
                { id: 'admin', label: 'Municipal Admin', desc: 'Manage operations' }
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role.id as any })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.role === role.id ? roleColor(role.id) : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">{roleIcon(role.id)}</div>
                  <h3 className="font-medium">{role.label}</h3>
                  <p className="text-xs mt-1 opacity-75">{role.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/*  inputs  */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPwConf ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwConf((s) => !s)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPwConf ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="City, State"
              />
            </div>
          </div>

          {(formData.role === 'collector' || formData.role === 'admin') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.role === 'admin' ? 'Municipal Corporation/Department' : 'Organization/Company'}
              </label>
              <input
                type="text"
                required
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={formData.role === 'admin' ? 'e.g., Delhi Municipal Corporation' : 'e.g., Green Clean Services'}
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> All registrations require admin approval. You will receive an email notification once your account is verified and approved.
          </p>
        </div>
      </div>
    </div>
  );
}