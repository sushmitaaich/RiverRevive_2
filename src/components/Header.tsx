import { useState } from 'react';
import { Bell, Menu, X, User, LogOut, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">RR</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RiverRevive</h1>
                <p className="text-xs text-gray-500">Government of India Initiative</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-6">
              <a href="#dashboard" className="text-gray-600 hover:text-blue-600 font-medium">Dashboard</a>
              <a href="#reports" className="text-gray-600 hover:text-blue-600 font-medium">Reports</a>
              <a href="#events" className="text-gray-600 hover:text-blue-600 font-medium">Events</a>
              <a href="#gallery" className="text-gray-600 hover:text-blue-600 font-medium">Gallery</a>
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-blue-600 relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </button>
            
            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-blue-600" />
                </div>
                <span className="hidden sm:block font-medium">{user.name}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                    <div className="flex items-center mt-1">
                      <Award size={14} className="text-green-600 mr-1" />
                      <span className="text-sm font-medium text-green-600">{user.points} points</span>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center">
                    <User size={16} className="mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-gray-600"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="px-4 py-2 space-y-2">
            <a href="#dashboard" className="block py-2 text-gray-600 hover:text-blue-600">Dashboard</a>
            <a href="#reports" className="block py-2 text-gray-600 hover:text-blue-600">Reports</a>
            <a href="#events" className="block py-2 text-gray-600 hover:text-blue-600">Events</a>
            <a href="#gallery" className="block py-2 text-gray-600 hover:text-blue-600">Gallery</a>
          </nav>
        </div>
      )}
    </header>
  );
}