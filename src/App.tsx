import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'gallery'>('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'collector' | 'admin' | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  /* ----------  TOKEN-HASH HANDLER (email confirmation)  ---------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenHash = params.get('token_hash');
    const type = params.get('type');
    if (tokenHash && type === 'email') {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' })
        .then(() => navigate('/login', { replace: true }))
        .catch(console.error);
    }
  }, [location.search, navigate]);

  /* ----------  FETCH PROFILE AFTER LOGIN  ---------- */
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
    if (location.pathname === '/login') return <LoginForm selectedRole={selectedRole} />;
    if (location.pathname === '/signup') return <SignUpForm onBack={() => navigate('/')} onSignUpSuccess={() => navigate('/login')} />;
    return (
      <LandingPage
        onRoleSelect={(role) => {
          setSelectedRole(role);
          navigate('/login');
        }}
        onSignUp={() => navigate('/signup')}
      />
    );
  }

  /* ----------  LOADING / UNAPPROVED  ---------- */
  if (loadingProfile || !profile)
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading dashboard...</div>;

  if (!profile.approved || profile.status !== 'approved')
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Your account is pending admin approval.</div>;

  /* ----------  ROLE-BASED DASHBOARD  ---------- */
  const role = profile.role?.toLowerCase();
  const Dashboard = role === 'admin' ? AdminDashboard : role === 'collector' ? CollectorDashboard : CitizenDashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/gallery" element={<Gallery />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>

      {/* Floating nav buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
        <button
          onClick={() => navigate('/dashboard')}
          className={`p-3 rounded-full shadow-lg transition-all ${
            location.pathname === '/dashboard'
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
          onClick={() => navigate('/gallery')}
          className={`p-3 rounded-full shadow-lg transition-all ${
            location.pathname === '/gallery'
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
      <Routes>
        <Route path="/login" element={<AppContent />} />
        <Route path="/signup" element={<AppContent />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;