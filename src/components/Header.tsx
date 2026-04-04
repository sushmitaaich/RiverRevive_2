import { useMemo, useState } from 'react';
import { Bell, LayoutDashboard, LogOut, Menu, User, UserCircle2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type HeaderPage = 'dashboard' | 'gallery' | 'profile';

interface HeaderProps {
  currentPage: HeaderPage;
  onNavigate: (page: HeaderPage) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navItems = useMemo(
    () => [
      { id: 'dashboard' as const, label: 'Dashboard' },
      { id: 'gallery' as const, label: 'Gallery' },
      { id: 'profile' as const, label: 'Profile' },
    ],
    [],
  );

  if (!user) return null;

  return (
    <header className="bg-white/95 backdrop-blur shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center text-left"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-cyan-600 rounded-xl flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">RR</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">RiverRevive</h1>
              <p className="text-xs text-slate-500">Land Cleanup Operations</p>
            </div>
          </button>

          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <Bell size={16} />
              <span>{user.points} points</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown((value) => !value)}
                className="flex items-center space-x-2 text-slate-700 hover:text-emerald-700"
              >
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-emerald-700" />
                </div>
                <span className="hidden sm:block font-medium">{user.name}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-lg border border-slate-200 py-2 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500 capitalize">{user.role}</p>
                    <p className="text-sm font-medium text-emerald-700 mt-1">{user.points} points</p>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('dashboard');
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 flex items-center"
                  >
                    <LayoutDashboard size={16} className="mr-2" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 flex items-center"
                  >
                    <UserCircle2 size={16} className="mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={async () => {
                      setShowDropdown(false);
                      await logout();
                    }}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowMobileMenu((value) => !value)}
              className="md:hidden text-slate-600"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <nav className="px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setShowMobileMenu(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-xl ${
                  currentPage === item.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
