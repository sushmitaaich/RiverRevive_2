import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, Droplets, TrendingUp, MapPin, Calendar, Bell, Users, Send } from 'lucide-react';

interface AdminFloodForecastProps {
  onBack: () => void;
}

export default function AdminFloodForecast({ onBack }: AdminFloodForecastProps) {
  const [selectedLocation, setSelectedLocation] = useState('delhi');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlertForm, setShowAlertForm] = useState(false);

  const locations = [
    { id: 'delhi', name: 'Delhi - Yamuna River', risk: 'high', currentLevel: 205.8, warningLevel: 205.33, dangerLevel: 206.0 },
    { id: 'varanasi', name: 'Varanasi - Ganges River', risk: 'low', currentLevel: 58.2, warningLevel: 60.0, dangerLevel: 61.5 },
    { id: 'ahmedabad', name: 'Ahmedabad - Sabarmati River', risk: 'high', currentLevel: 87.9, warningLevel: 88.0, dangerLevel: 89.5 },
    { id: 'vijayawada', name: 'Vijayawada - Krishna River', risk: 'medium', currentLevel: 12.4, warningLevel: 14.0, dangerLevel: 15.5 }
  ];

  const currentData = locations.find(loc => loc.id === selectedLocation) || locations[0];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSendAlert = () => {
    if (alertMessage.trim()) {
      alert(`Alert sent to all users: ${alertMessage}`);
      setAlertMessage('');
      setShowAlertForm(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Admin Flood Forecast Control</h1>
        <p className="text-gray-600 mt-2">Monitor water levels and send alerts to all app users</p>
      </div>

      {/* Alert Control Panel */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
            <h2 className="text-xl font-bold text-red-900">Emergency Alert System</h2>
          </div>
          <button
            onClick={() => setShowAlertForm(!showAlertForm)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <Bell size={16} className="mr-2 inline" />
            Send Alert
          </button>
        </div>
        
        {showAlertForm && (
          <div className="mt-4">
            <textarea
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              placeholder="Enter emergency alert message for all users..."
              className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
              rows={3}
            />
            <div className="flex justify-end mt-3 space-x-2">
              <button
                onClick={() => setShowAlertForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendAlert}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
              >
                <Send size={16} className="mr-2" />
                Send to All Users
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Location Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {locations.map((location) => (
          <div
            key={location.id}
            onClick={() => setSelectedLocation(location.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedLocation === location.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <MapPin size={16} className="text-gray-600" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(location.risk)}`}>
                {location.risk.toUpperCase()}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">{location.name}</p>
            <p className="text-lg font-bold text-blue-600">{location.currentLevel}m</p>
            <p className="text-xs text-gray-500">Warning: {location.warningLevel}m</p>
          </div>
        ))}
      </div>

      {/* Detailed Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Current Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Level</span>
              <span className="font-bold text-blue-600">{currentData.currentLevel}m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Warning Level</span>
              <span className="font-bold text-yellow-600">{currentData.warningLevel}m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Danger Level</span>
              <span className="font-bold text-red-600">{currentData.dangerLevel}m</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Risk Level</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(currentData.risk)}`}>
                  {currentData.risk.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monitoring Controls</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Update Water Level
            </button>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
              Schedule Monitoring
            </button>
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
              Generate Report
            </button>
            <button className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700">
              Weather Integration
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Alert History</h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-800">High Water Level Alert</p>
              <p className="text-xs text-red-600">Yamuna River - 2 hours ago</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">Weather Warning</p>
              <p className="text-xs text-yellow-600">Heavy rainfall expected - 6 hours ago</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">System Update</p>
              <p className="text-xs text-blue-600">Monitoring resumed - 1 day ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts Dashboard */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Active Monitoring Locations</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Current Level</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Last Updated</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id} className="border-b border-gray-100">
                  <td className="py-4 px-4">{location.name}</td>
                  <td className="py-4 px-4 font-medium">{location.currentLevel}m</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(location.risk)}`}>
                      {location.risk.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">5 min ago</td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Monitor</button>
                      <button className="text-red-600 hover:text-red-800 text-sm">Alert</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}