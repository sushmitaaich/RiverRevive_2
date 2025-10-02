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

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [showLogin, setShowLogin] = React.useState(false);
  const [showSignUp, setShowSignUp] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<'citizen' | 'collector' | 'admin' | null>(null);

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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        if (user.role === 'citizen') return <CitizenDashboard />;
        if (user.role === 'collector') return <CollectorDashboard />;
        if (user.role === 'admin') return <AdminDashboard />;
        break;
      case 'gallery':
        return <Gallery />;
      default:
        return user.role === 'citizen' ? <CitizenDashboard /> : 
               user.role === 'collector' ? <CollectorDashboard /> : 
               <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`p-3 rounded-full shadow-lg transition-all ${
              currentPage === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            title="Dashboard"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentPage('gallery')}
            className={`p-3 rounded-full shadow-lg transition-all ${
              currentPage === 'gallery' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            title="Gallery"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
      <main>{renderCurrentPage()}</main>
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