'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Recycle, Shield, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SignUpFormProps {
  onBack: () => void;
  onSignUpSuccess?: () => void;
}

export default function SignUpForm({ onBack, onSignUpSuccess }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen' as 'citizen' | 'collector' | 'admin',
    phone: '',
    location: '',
    organization: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showPwConf, setShowPwConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mailSent, setMailSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMailSent(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: formData.role,
            phone_number: formData.phone,
            location: formData.location,
            organization: formData.organization,
          },
        },
      });

      if (signUpError) throw signUpError;

      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: authData.user!.id,
          full_name: formData.name,
          role: formData.role,
          phone_number: formData.phone,
          location: formData.location,
          organization: formData.organization,
          email: formData.email,
          approved: false,
          status: 'pending_approval',
          points: 0,
        },
        {
          onConflict: 'id',
        },
      );

      if (profileError) throw profileError;

      setMailSent(true);
      onSignUpSuccess?.();
    } catch (submitError: any) {
      setError(submitError.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roleIcon = (role: string) =>
    role === 'citizen' ? <User className="w-5 h-5" /> :
    role === 'collector' ? <Recycle className="w-5 h-5" /> :
    <Shield className="w-5 h-5" />;

  const roleColor = (role: string) =>
    role === 'citizen' ? 'border-blue-500 bg-blue-50 text-blue-700' :
    role === 'collector' ? 'border-green-500 bg-green-50 text-green-700' :
    'border-purple-500 bg-purple-50 text-purple-700';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">RR</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Join RiverRevive</h2>
          <p className="text-gray-600 mt-2">
            Create your account to help clean land-based waste hotspots
          </p>
        </div>

        {mailSent && (
          <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
            Check your email to confirm your account.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Your Role</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { id: 'citizen', label: 'Citizen', desc: 'Report waste locations' },
                { id: 'collector', label: 'Garbage Collector', desc: 'Volunteer for cleanup events' },
                { id: 'admin', label: 'Municipal Admin', desc: 'Manage scheduling and verification' },
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role.id as typeof formData.role })}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
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
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
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
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((value) => !value)}
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
                  onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwConf((value) => !value)}
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
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
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
                onChange={(event) => setFormData({ ...formData, location: event.target.value })}
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
                onChange={(event) => setFormData({ ...formData, organization: event.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={
                  formData.role === 'admin'
                    ? 'e.g., Kolkata Municipal Corporation'
                    : 'e.g., Green Clean Services'
                }
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
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
            <strong>Note:</strong> All registrations require admin approval. You will receive an email
            notification once your account is verified and approved.
          </p>
        </div>
      </div>
    </div>
  );
}
