import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import Header from './components/Header';
import CitizenDashboard from './components/dashboard/CitizenDashboard';
import CollectorDashboard from './components/dashboard/CollectorDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import Gallery from './components/Gallery';
import ProfilePage from './components/ProfilePage';
import { supabase } from './lib/supabase';

(window as any).supabase = supabase;

type AppPage = 'dashboard' | 'gallery' | 'profile';

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = React.useState<AppPage>('dashboard');
  const [showLogin, setShowLogin] = React.useState(false);
  const [showSignUp, setShowSignUp] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<
    'citizen' | 'collector' | 'admin' | null
  >(null);

  if (!user) {
    if (showSignUp) {
      return (
        <SignUpForm
          onBack={() => setShowSignUp(false)}
          onSignUpSuccess={() => {
            setShowSignUp(false);
            setShowLogin(false);
          }}
        />
      );
    }

    if (!showLogin) {
      return (
        <LandingPage
          onRoleSelect={(role) => {
            setSelectedRole(role);
            setShowLogin(true);
          }}
          onSignUp={() => setShowSignUp(true)}
        />
      );
    }

    return (
      <div className="rr-app-shell flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <button
            onClick={() => setShowLogin(false)}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/70 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm backdrop-blur-sm transition hover:bg-white/90"
          >
            <span aria-hidden="true">&lt;-</span>
            <span>Back to role selection</span>
          </button>
          <LoginForm selectedRole={selectedRole} />
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    if (currentPage === 'gallery') return <Gallery />;
    if (currentPage === 'profile') return <ProfilePage />;

    if (user.role === 'citizen') return <CitizenDashboard />;
    if (user.role === 'collector') return <CollectorDashboard />;
    return <AdminDashboard />;
  };

  return (
    <div className="rr-app-shell">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col space-y-3 rounded-[2rem] border border-white/70 bg-white/72 p-3 shadow-[0_22px_52px_rgba(10,49,42,0.16)] backdrop-blur-xl">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`rounded-full p-3 shadow-lg transition-all ${
              currentPage === 'dashboard'
                ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white'
                : 'bg-white/90 text-slate-600 hover:bg-white'
            }`}
            title="Dashboard"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7h7v7H3V7zm11 0h7v4h-7V7zM3 17h7v4H3v-4zm11-2h7v6h-7v-6z"
              />
            </svg>
          </button>
          <button
            onClick={() => setCurrentPage('gallery')}
            className={`rounded-full p-3 shadow-lg transition-all ${
              currentPage === 'gallery'
                ? 'bg-gradient-to-br from-cyan-600 to-teal-600 text-white'
                : 'bg-white/90 text-slate-600 hover:bg-white'
            }`}
            title="Gallery"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setCurrentPage('profile')}
            className={`rounded-full p-3 shadow-lg transition-all ${
              currentPage === 'profile'
                ? 'bg-gradient-to-br from-slate-700 to-slate-600 text-white'
                : 'bg-white/90 text-slate-600 hover:bg-white'
            }`}
            title="Profile"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A10.97 10.97 0 0112 15c2.61 0 5.01.91 6.879 2.432M15 9a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
      <main className="pb-10">{renderCurrentPage()}</main>
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
