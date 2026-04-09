import { useState } from 'react';
import { User, Recycle, Shield, ChevronRight, Brain, MapPinned, Gauge, LayoutDashboard } from 'lucide-react';

interface LandingPageProps {
  onRoleSelect: (role: 'citizen' | 'collector' | 'admin') => void;
  onSignUp: () => void;
}

export default function LandingPage({ onRoleSelect, onSignUp }: LandingPageProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const futureDirections = [
    {
      title: 'Backend ML Integration',
      description:
        'A garbage-detection model can be deployed in the backend so each eligible report is automatically screened after submission.',
      icon: Brain,
      accent: 'bg-cyan-100 text-cyan-700',
    },
    {
      title: 'Two-Step Report Verification',
      description:
        'After the browser location and photo metadata are matched, the uploaded image can be checked to confirm whether garbage is actually present and how intense the dump is.',
      icon: MapPinned,
      accent: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: 'Type And Priority Prediction',
      description:
        'If waste is detected, the model can estimate the garbage type and intensity so the system can assign a response priority level automatically.',
      icon: Gauge,
      accent: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Verified Reports For Admins',
      description:
        'Reports that pass verification can be forwarded to the municipal admin dashboard along with location details and assigned priority for faster action.',
      icon: LayoutDashboard,
      accent: 'bg-violet-100 text-violet-700',
    },
  ];

  const handleRoleClick = (role: 'citizen' | 'collector' | 'admin') => {
    setSelectedRole(role);
    setTimeout(() => {
      onRoleSelect(role);
    }, 200);
  };

  return (
    <div
      className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f6fbf7_0%,#dcefe3_34%,#eff7f2_68%,#0c2422_100%)]"
      style={{
        paddingTop: '0rem',
        paddingBottom: '3rem',
      }}
    >
      {/* Hero Section with Background Image */}
      <div className="relative min-h-[68vh] overflow-hidden">
        <img
          src="/landing-hero-sustainability.jpg"
          alt="Aerial view of a green riverfront city"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(4,22,18,0.84)_0%,rgba(8,61,51,0.58)_52%,rgba(24,133,109,0.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-[#dcefe3]/55 to-[#dcefe3]" />

        {/* Header */}
        <header className="relative z-10 flex justify-between items-center p-6 max-w-6xl mx-auto">
          <div>
            <h1
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              RiverRevive
            </h1>
            <p className="text-emerald-100 text-sm">Cleaner Streets, Healthier Communities</p>
          </div>
          <button
            onClick={onSignUp}
            className="rounded-full bg-emerald-500 px-6 py-2 text-white shadow-lg shadow-emerald-950/20 transition-colors hover:bg-emerald-600"
          >
            Sign Up
          </button>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 pb-24 pt-16 text-center md:pt-24">
          <p className="mx-auto inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium tracking-[0.18em] text-emerald-50 backdrop-blur-sm">
            CLEAN AND GREEN COMMUNITIES
          </p>
          <h2 className="mt-6 text-4xl font-bold text-white md:text-5xl">
            Join the Cleanup Movement
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-emerald-50/90">
            Help detect, verify, and clean land-based waste through AI-assisted reporting,
            coordinated volunteers, and municipal action.
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-14 max-w-5xl px-6">
        <div className="rounded-[2rem] border border-white/70 bg-white/88 px-6 py-12 shadow-[0_24px_80px_rgba(16,54,45,0.18)] backdrop-blur-sm md:px-10">

          {/* Choose Your Role Section */}
          <div className="mb-12">
            <h3 className="mb-8 text-center text-2xl font-bold text-gray-900">
              Choose Your Role
            </h3>

            <div className="space-y-4 max-w-md mx-auto">
              {/* Citizen Role */}
              <button
                onClick={() => handleRoleClick('citizen')}
                className={`w-full flex items-center rounded-2xl border-2 bg-white/95 p-4 shadow-md transition-all duration-200 hover:shadow-lg ${
                  selectedRole === 'citizen' ? 'scale-105 border-blue-500' : 'border-transparent'
                }`}
              >
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900">Citizen</h4>
                  <p className="text-sm text-gray-600">Report waste locations and earn points</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>

              {/* Garbage Collector Role */}
              <button
                onClick={() => handleRoleClick('collector')}
                className={`w-full flex items-center rounded-2xl border-2 bg-white/95 p-4 shadow-md transition-all duration-200 hover:shadow-lg ${
                  selectedRole === 'collector' ? 'scale-105 border-green-500' : 'border-transparent'
                }`}
              >
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <Recycle className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900">Garbage Collector</h4>
                  <p className="text-sm text-gray-600">Participate in cleaning activities</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>

              {/* Municipal Admin Role */}
              <button
                onClick={() => handleRoleClick('admin')}
                className={`w-full flex items-center rounded-2xl border-2 bg-white/95 p-4 shadow-md transition-all duration-200 hover:shadow-lg ${
                  selectedRole === 'admin' ? 'scale-105 border-purple-500' : 'border-transparent'
                }`}
              >
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900">Municipal Admin</h4>
                  <p className="text-sm text-gray-600">Manage operations and rewards</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Our Impact Section */}
          <div className="mb-4 text-center">
            <h3 className="mb-8 text-2xl font-bold text-gray-900">Our Impact</h3>

            <div className="mx-auto grid max-w-md grid-cols-3 gap-8">
              <div>
                <div className="mb-2 text-3xl font-bold text-blue-600">342</div>
                <div className="text-sm text-gray-600">Zones Cleaned</div>
              </div>
              <div>
                <div className="mb-2 text-3xl font-bold text-green-600">15.2K</div>
                <div className="text-sm text-gray-600">Waste Collected (Kg)</div>
              </div>
              <div>
                <div className="mb-2 text-3xl font-bold text-purple-600">8.7K</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-[linear-gradient(180deg,#eff7f2_0%,#e0eee5_100%)] py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-3 text-lg">Report</h4>
              <p className="text-gray-600">Waste photos with browser location are submitted for verification</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-xl">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-3 text-lg">Deploy</h4>
              <p className="text-gray-600">Municipal admins verify reports and schedule live cleanup events</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-3 text-lg">Clean</h4>
              <p className="text-gray-600">Collectors and volunteers complete the cleanup and earn points</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[linear-gradient(135deg,#081c1b_0%,#10443b_52%,#0f6b5c_100%)] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200">
              Future Directions
            </p>
            <h3 className="text-3xl md:text-4xl font-bold text-white mt-3">
              The next phase is an AI-assisted verification pipeline
            </h3>
            <p className="text-slate-300 mt-4 leading-relaxed">
              After the webpage is fully implemented, RiverRevive can evolve from location-based
              reporting into an intelligent screening system that verifies, prioritizes, and routes
              valid garbage reports to municipal admins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {futureDirections.map(({ title, description, icon: Icon, accent }) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${accent}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-semibold text-white mt-5">{title}</h4>
                <p className="text-slate-300 mt-3 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
