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
    <header className="sticky top-0 z-50 border-b border-white/55 bg-white/70 shadow-[0_16px_38px_rgba(10,49,42,0.08)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button onClick={() => onNavigate('dashboard')} className="flex items-center text-left">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 shadow-[0_12px_24px_rgba(15,124,104,0.24)]">
              <span className="text-sm font-bold text-white">RR</span>
            </div>
            <div>
              <h1 className="font-sans text-xl font-bold text-slate-900">RiverRevive</h1>
              <p className="text-xs text-emerald-800/80">Clean and green operations hub</p>
            </div>
          </button>

          <div className="hidden items-center space-x-8 md:flex">
            <nav className="flex space-x-2 rounded-full border border-white/70 bg-white/60 p-1.5 shadow-sm backdrop-blur-sm">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-100/80 bg-emerald-50/85 px-3 py-2 text-sm text-emerald-800 sm:flex">
              <Bell size={16} />
              <span>{user.points} points</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown((value) => !value)}
                className="flex items-center space-x-2 text-slate-700 transition hover:text-emerald-700"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
                  <User size={16} className="text-emerald-700" />
                </div>
                <span className="hidden font-medium sm:block">{user.name}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 py-2 shadow-[0_22px_48px_rgba(10,49,42,0.16)] backdrop-blur-xl">
                  <div className="border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50 to-cyan-50 px-4 py-4">
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-sm capitalize text-slate-500">{user.role}</p>
                    <p className="mt-1 text-sm font-medium text-emerald-700">{user.points} points</p>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('dashboard');
                      setShowDropdown(false);
                    }}
                    className="flex w-full items-center px-4 py-3 text-left text-slate-700 transition hover:bg-emerald-50/70"
                  >
                    <LayoutDashboard size={16} className="mr-2" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setShowDropdown(false);
                    }}
                    className="flex w-full items-center px-4 py-3 text-left text-slate-700 transition hover:bg-emerald-50/70"
                  >
                    <UserCircle2 size={16} className="mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={async () => {
                      setShowDropdown(false);
                      await logout();
                    }}
                    className="flex w-full items-center px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setShowMobileMenu((value) => !value)} className="text-slate-600 md:hidden">
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {showMobileMenu && (
        <div className="border-t border-white/60 bg-white/82 backdrop-blur-xl md:hidden">
          <nav className="space-y-2 px-4 py-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setShowMobileMenu(false);
                }}
                className={`block w-full rounded-2xl px-4 py-3 text-left ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                    : 'text-slate-600 hover:bg-emerald-50/80'
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
