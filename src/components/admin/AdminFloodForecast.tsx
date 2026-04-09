import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, Bell, MapPin, Send } from 'lucide-react';

interface AdminFloodForecastProps {
  onBack: () => void;
}

export default function AdminFloodForecast({ onBack }: AdminFloodForecastProps) {
  const [selectedLocation, setSelectedLocation] = useState('delhi');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlertForm, setShowAlertForm] = useState(false);

  const locations = [
    { id: 'delhi', name: 'Delhi - Industrial Ward 12', risk: 'high', currentLevel: 205.8, warningLevel: 205.33, dangerLevel: 206.0 },
    { id: 'varanasi', name: 'Varanasi - Market Cluster B', risk: 'low', currentLevel: 58.2, warningLevel: 60.0, dangerLevel: 61.5 },
    { id: 'ahmedabad', name: 'Ahmedabad - Transfer Station East', risk: 'high', currentLevel: 87.9, warningLevel: 88.0, dangerLevel: 89.5 },
    { id: 'vijayawada', name: 'Vijayawada - Peri-urban Dump Zone', risk: 'medium', currentLevel: 12.4, warningLevel: 14.0, dangerLevel: 15.5 },
  ];

  const currentData = locations.find((loc) => loc.id === selectedLocation) || locations[0];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
    <div className="rr-page">
      <div className="rr-page-hero mb-8">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        <p className="rr-page-kicker">Command Center</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Admin Flood Forecast Control</h1>
        <p className="mt-4 max-w-3xl text-emerald-50/90">
          Monitor site access risk and send alerts to all app users.
        </p>
      </div>

      <div className="mb-6 rounded-[1.75rem] border border-red-200 bg-red-50/92 p-6 shadow-[0_18px_40px_rgba(127,29,29,0.12)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-900">Emergency Alert System</h2>
          </div>
          <button
            onClick={() => setShowAlertForm(!showAlertForm)}
            className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
          >
            <Bell size={16} className="mr-2" />
            Send Alert
          </button>
        </div>

        {showAlertForm && (
          <div className="mt-4">
            <textarea
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              placeholder="Enter emergency alert message for all users..."
              className="rr-input"
              rows={3}
            />
            <div className="mt-3 flex justify-end space-x-2">
              <button onClick={() => setShowAlertForm(false)} className="rr-btn-secondary">
                Cancel
              </button>
              <button onClick={handleSendAlert} className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-white transition hover:bg-red-700">
                <Send size={16} className="mr-2" />
                Send to All Users
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {locations.map((location) => (
          <div
            key={location.id}
            onClick={() => setSelectedLocation(location.id)}
            className={`cursor-pointer rounded-[1.5rem] border-2 p-4 transition-all ${
              selectedLocation === location.id
                ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                : 'rr-card'
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <MapPin size={16} className="text-gray-600" />
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${getRiskColor(location.risk)}`}>
                {location.risk.toUpperCase()}
              </span>
            </div>
            <p className="mb-1 text-sm font-medium text-gray-900">{location.name}</p>
            <p className="text-lg font-bold text-blue-600">{location.currentLevel}m</p>
            <p className="text-xs text-gray-500">Warning: {location.warningLevel}m</p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rr-card p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Current Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Current Level</span>
              <span className="font-bold text-blue-600">{currentData.currentLevel}m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Warning Level</span>
              <span className="font-bold text-yellow-600">{currentData.warningLevel}m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Danger Level</span>
              <span className="font-bold text-red-600">{currentData.dangerLevel}m</span>
            </div>
            <div className="border-t border-emerald-100 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Risk Level</span>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getRiskColor(currentData.risk)}`}>
                  {currentData.risk.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rr-card p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Monitoring Controls</h3>
          <div className="space-y-3">
            <button className="rr-btn-primary w-full">Update Risk Metric</button>
            <button className="w-full rounded-xl bg-green-600 py-3 text-white transition hover:bg-green-700">
              Schedule Monitoring
            </button>
            <button className="w-full rounded-xl bg-purple-600 py-3 text-white transition hover:bg-purple-700">
              Generate Report
            </button>
            <button className="w-full rounded-xl bg-orange-600 py-3 text-white transition hover:bg-orange-700">
              Weather Integration
            </button>
          </div>
        </div>

        <div className="rr-card p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Alert History</h3>
          <div className="space-y-3">
            <div className="rounded-xl bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">High Flood Risk Alert</p>
              <p className="text-xs text-red-600">Industrial Ward 12 - 2 hours ago</p>
            </div>
            <div className="rounded-xl bg-yellow-50 p-3">
              <p className="text-sm font-medium text-yellow-800">Weather Warning</p>
              <p className="text-xs text-yellow-600">Heavy rainfall expected - 6 hours ago</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <p className="text-sm font-medium text-blue-800">System Update</p>
              <p className="text-xs text-blue-600">Monitoring resumed - 1 day ago</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rr-card p-6">
        <h3 className="mb-4 text-xl font-bold text-gray-900">Active Monitoring Locations</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-100">
                <th className="px-4 py-3 text-left font-medium text-gray-900">Location</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Current Level</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Last Updated</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id} className="border-b border-emerald-50">
                  <td className="px-4 py-4">{location.name}</td>
                  <td className="px-4 py-4 font-medium">{location.currentLevel}m</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getRiskColor(location.risk)}`}>
                      {location.risk.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600">5 min ago</td>
                  <td className="px-4 py-4">
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
