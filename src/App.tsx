import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import Header from './components/Header';
import CitizenDashboard from './components/dashboard/CitizenDashboard';
import CollectorDashboard from './components/dashboard/CollectorDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import Gallery from './components/Gallery';
import { supabase } from './lib/supabase';

(window as any).supabase = supabase; // debug only

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'collector' | 'admin' | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // src/App.tsx
  // Remove misplaced JSX. If you intend to use routing, import and use Routes/Route inside your render logic.
  // Example import (add at the top if needed):
  // import { Routes, Route, Navigate } from 'react-router-dom';
  // import EmailConfirmed from './components/auth/EmailConfirmed';

  /* Fetch profile once user logs in */
  useEffect(() => {
    if (!user) return;
    setLoadingProfile(true);
    supabase
      .from('profiles')
      .select('role, full_name, approved, status')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error('Profile fetch:', error);
        else setProfile(data);
        setLoadingProfile(false);
      });
  }, [user]);

  /* ----------  NOT LOGGED IN  ---------- */
  if (!user) {
    if (showSignUp)
      return (
        <SignUpForm
          onBack={() => setShowSignUp(false)}
          onSignUpSuccess={() => {
            setShowSignUp(false);
            setShowLogin(false);
          }}
        />
      );

    if (!showLogin)
      return (
        <LandingPage
          onRoleSelect={(role) => {
            setSelectedRole(role);
            setShowLogin(true);
          }}
          onSignUp={() => setShowSignUp(true)}
        />
      );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <button
            onClick={() => setShowLogin(false)}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Back to role selection
          </button>
          <LoginForm selectedRole={selectedRole} />
        </div>
      </div>
    );
  }

  /* ----------  LOADING PROFILE  ---------- */
  if (loadingProfile || !profile)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading your dashboard...
      </div>
    );

  /* ----------  ROLE-BASED DASHBOARD  ---------- */
  const renderDashboard = () => {
    const role = profile.role?.toLowerCase();
    if (role === 'admin') return <AdminDashboard />;
    if (role === 'collector') return <CollectorDashboard />;
    return <CitizenDashboard />; // fallback
  };

  const renderCurrentPage = () => {
    if (currentPage === 'gallery') return <Gallery />;
    return renderDashboard(); // dashboard by default
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>{renderCurrentPage()}</main>

      {/* Floating nav buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className={`p-3 rounded-full shadow-lg transition-all ${
            currentPage === 'dashboard'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
          title="Dashboard"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </button>

        <button
          onClick={() => setCurrentPage('gallery')}
          className={`p-3 rounded-full shadow-lg transition-all ${
            currentPage === 'gallery'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
          title="Gallery"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;