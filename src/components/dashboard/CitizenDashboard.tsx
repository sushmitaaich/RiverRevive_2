import React, { useState } from 'react';
import { Upload, MapPin, Award, Camera, Send, AlertCircle, Calendar, Droplets, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ReportWaste from '../ReportWaste';
import ViewEvents from '../ViewEvents';
import FloodForecast from '../FloodForecast';
import WaterQuality from '../WaterQuality';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  // ...existing code...
  const [showReportForm, setShowReportForm] = useState(false);
  // ...existing code...
  const [reportData, setReportData] = useState({
    location: '',
    description: '',
    image: null as File | null
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReportData({ ...reportData, image: e.target.files[0] });
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle report submission
    alert('Report submitted successfully! Our team will verify and process it.');
    setShowReportForm(false);
    setReportData({ location: '', description: '', image: null });
  };

  if (currentView === 'report-waste') {
    return <ReportWaste onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'view-events') {
    return <ViewEvents onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'flood-forecast') {
    return <FloodForecast onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'water-quality') {
    return <WaterQuality onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Citizen Dashboard</h1>
        <p className="text-gray-600 mt-2">Help keep our rivers clean by reporting garbage locations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Points</p>
              <p className="text-3xl font-bold text-green-600">{user?.points}</p>
            </div>
            <Award className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Reports Submitted</p>
              <p className="text-3xl font-bold text-blue-600">12</p>
            </div>
            <Upload className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Locations Cleaned</p>
              <p className="text-3xl font-bold text-purple-600">8</p>
            </div>
            <MapPin className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setCurrentView('report-waste')}
            className="p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors text-center"
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Report Waste</h3>
            <p className="text-sm text-gray-600">Upload photos & earn points</p>
          </button>

          <button
            onClick={() => setCurrentView('view-events')}
            className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-center"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">View Events</h3>
            <p className="text-sm text-gray-600">See cleaning activities</p>
          </button>

          <button
            onClick={() => setCurrentView('flood-forecast')}
            className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Droplets className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Flood Forecast</h3>
            <p className="text-sm text-gray-600">AI-based water level monitoring</p>
          </button>

          <button
            onClick={() => setCurrentView('water-quality')}
            className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Water Quality</h3>
            <p className="text-sm text-gray-600">Verified monitoring reports</p>
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">My Recent Reports</h2>
        <div className="space-y-4">
          {[
            { id: 1, location: 'Yamuna River, Delhi', status: 'completed', points: 25, date: '2024-01-15' },
            { id: 2, location: 'Ganges Ghat, Varanasi', status: 'in-progress', points: 0, date: '2024-01-12' },
            { id: 3, location: 'Sabarmati Riverfront', status: 'pending', points: 0, date: '2024-01-10' }
          ].map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{report.location}</p>
                  <p className="text-sm text-gray-500">{report.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  report.status === 'completed' ? 'bg-green-100 text-green-800' :
                  report.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
                {report.points > 0 && (
                  <span className="text-green-600 font-medium">+{report.points} pts</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}