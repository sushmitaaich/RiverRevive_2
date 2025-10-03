import { useState } from 'react';
import { User, Recycle, Shield, ChevronRight } from 'lucide-react';
//import bgImage from '../assets/Drone_background_home.jpg';

interface LandingPageProps {
  onRoleSelect: (role: 'citizen' | 'collector' | 'admin') => void;
  onSignUp: () => void;
}

export default function LandingPage({ onRoleSelect, onSignUp }: LandingPageProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleClick = (role: 'citizen' | 'collector' | 'admin') => {
    setSelectedRole(role);
    setTimeout(() => {
      onRoleSelect(role);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#a5c3d7]"
      style = {{
        paddingTop: '0rem', /* 48px */
        paddingBottom: '3rem' /* 48px */
      }}
      > 
      {/* Hero Section with Background Image */}
      <div 
        className="relative min-h-[60vh] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('./Drone_background_home.jpg')`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Header */}
        <header className="relative z-10 flex justify-between items-center p-6 max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-white" 
                style={{ fontFamily: "'Dancing Script', cursive" }}
                >   RiverRevive </h1>
            <p
                className="text-blue-100 text-sm"
            >
                Clean Rivers, Healthy Ecosystems
            </p>
          </div>
          <button 
            onClick={onSignUp}
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
          >
            Sign Up
          </button>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 pt-16 pb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join the River Revival Movement
          </h2>
          <p className="text-blue-100 text-lg max-w-3xl mx-auto leading-relaxed">
            Help detect, segregate and clean river waste through AI-powered technology. 
            Connect with your community for a cleaner environment.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 bg-[#a5c3d7]">

        {/* Choose Your Role Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Choose Your Role
          </h3>
          
          <div className="space-y-4 max-w-md mx-auto">
            {/* Citizen Role */}
            <button
              onClick={() => handleRoleClick('citizen')}
              className={`w-full flex items-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border-2 ${
                selectedRole === 'citizen' ? 'border-blue-500 scale-105' : 'border-transparent'
              }`}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900">Citizen</h4>
                <p className="text-sm text-gray-600">Report waste locations and earn points</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Garbage Collector Role */}
            <button
              onClick={() => handleRoleClick('collector')}
              className={`w-full flex items-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border-2 ${
                selectedRole === 'collector' ? 'border-green-500 scale-105' : 'border-transparent'
              }`}
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <Recycle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900">Garbage Collector</h4>
                <p className="text-sm text-gray-600">Participate in cleaning activities</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Municipal Admin Role */}
            <button
              onClick={() => handleRoleClick('admin')}
              className={`w-full flex items-center p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border-2 ${
                selectedRole === 'admin' ? 'border-purple-500 scale-105' : 'border-transparent'
              }`}
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900">Municipal Admin</h4>
                <p className="text-sm text-gray-600">Manage operations and rewards</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Our Impact Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Our Impact</h3>
          
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">342</div>
              <div className="text-sm text-gray-600">Rivers Cleaned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">15.2K</div>
              <div className="text-sm text-gray-600">Waste Collected (Kg)</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">8.7K</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-[#f9fafb] py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-3 text-lg">Report</h4>
              <p className="text-gray-600">Waste photos with locations are reported for cleaning</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-xl">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-3 text-lg">Deploy</h4>
              <p className="text-gray-600">AI-powered drones' detection and collection of waste</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-3 text-lg">Clean</h4>
              <p className="text-gray-600">Collectors' segregation and disposal of waste at recycling units</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
