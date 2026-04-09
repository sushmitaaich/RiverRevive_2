'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Recycle, Shield, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SignUpFormProps {
  onBack: () => void;
  onSignUpSuccess?: () => void;
}

export default function SignUpForm({ onBack, onSignUpSuccess }: SignUpFormProps) {
  const { register } = useAuth();
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
      await register(
        {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
          location: formData.location,
          organization: formData.organization,
        },
        formData.password,
      );

      setMailSent(true);
      onSignUpSuccess?.();
    } catch (submitError: any) {
      setError(submitError.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roleIcon = (role: string) =>
    role === 'citizen' ? <User className="h-5 w-5" /> : role === 'collector' ? <Recycle className="h-5 w-5" /> : <Shield className="h-5 w-5" />;

  const roleColor = (role: string) =>
    role === 'citizen'
      ? 'border-blue-500 bg-blue-50 text-blue-700'
      : role === 'collector'
        ? 'border-green-500 bg-green-50 text-green-700'
        : 'border-purple-500 bg-purple-50 text-purple-700';

  return (
    <div className="rr-app-shell flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        <div className="rr-card rounded-[2rem] p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-emerald-600 to-teal-600 shadow-[0_18px_34px_rgba(15,124,104,0.2)]">
              <span className="text-xl font-bold text-white">RR</span>
            </div>
            <p className="rr-page-kicker !bg-emerald-600/10 !text-emerald-900 !border-emerald-200/80">
              Create Account
            </p>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Join RiverRevive</h2>
            <p className="mt-2 text-gray-600">
              Create your account to help clean land-based waste hotspots
            </p>
          </div>

          {mailSent && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">
              Check your email to confirm your account.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">Select Your Role</label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {[
                  { id: 'citizen', label: 'Citizen', desc: 'Report waste locations' },
                  { id: 'collector', label: 'Garbage Collector', desc: 'Volunteer for cleanup events' },
                  { id: 'admin', label: 'Municipal Admin', desc: 'Manage scheduling and verification' },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.id as typeof formData.role })}
                    className={`rounded-[1.4rem] border-2 p-4 transition-all ${
                      formData.role === role.id
                        ? `${roleColor(role.id)} shadow-md`
                        : 'border-emerald-100/80 bg-white/80 hover:border-emerald-200'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-center">{roleIcon(role.id)}</div>
                    <h3 className="font-medium">{role.label}</h3>
                    <p className="mt-1 text-xs opacity-75">{role.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="rr-input"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  className="rr-input"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                    className="rr-input pr-12"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-emerald-700"
                  >
                    {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPwConf ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
                    className="rr-input pr-12"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwConf((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-emerald-700"
                  >
                    {showPwConf ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                  className="rr-input"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(event) => setFormData({ ...formData, location: event.target.value })}
                  className="rr-input"
                  placeholder="City, State"
                />
              </div>
            </div>

            {(formData.role === 'collector' || formData.role === 'admin') && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {formData.role === 'admin' ? 'Municipal Corporation/Department' : 'Organization/Company'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(event) => setFormData({ ...formData, organization: event.target.value })}
                  className="rr-input"
                  placeholder={
                    formData.role === 'admin'
                      ? 'e.g., Kolkata Municipal Corporation'
                      : 'e.g., Green Clean Services'
                  }
                />
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button type="button" onClick={onBack} className="rr-btn-secondary flex-1">
                Back
              </button>
              <button type="submit" disabled={loading} className="rr-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> All registrations require admin approval. You will receive an email
              notification once your account is verified and approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
