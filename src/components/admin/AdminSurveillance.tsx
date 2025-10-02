import React, { useState } from 'react';
import { ArrowLeft, Camera, Calendar, MapPin, Play, Pause, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface AdminSurveillanceProps {
  onBack: () => void;
}

export default function AdminSurveillance({ onBack }: AdminSurveillanceProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('yamuna-delhi');
  const [patrolStatus, setPatrolStatus] = useState('scheduled');

  const locations = [
    { id: 'yamuna-delhi', name: 'Yamuna River, Delhi', status: 'active', lastPatrol: '2 hours ago' },
    { id: 'ganges-varanasi', name: 'Ganges River, Varanasi', status: 'scheduled', lastPatrol: '6 hours ago' },
    { id: 'sabarmati-ahmedabad', name: 'Sabarmati River, Ahmedabad', status: 'completed', lastPatrol: '1 day ago' },
    { id: 'krishna-vijayawada', name: 'Krishna River, Vijayawada', status: 'active', lastPatrol: '4 hours ago' }
  ];

  const patrolHistory = [
    {
      id: 1,
      location: 'Yamuna River, Delhi',
      date: '2024-01-18',
      time: '14:30',
      status: 'completed',
      findings: 'Garbage detected - 3 locations',
      action: 'Cleaning scheduled'
    },
    {
      id: 2,
      location: 'Ganges River, Varanasi',
      date: '2024-01-18',
      time: '09:15',
      status: 'completed',
      findings: 'No significant waste found',
      action: 'Routine monitoring'
    },
    {
      id: 3,
      location: 'Sabarmati River, Ahmedabad',
      date: '2024-01-17',
      time: '16:45',
      status: 'completed',
      findings: 'Drowning risk area identified',
      action: 'Safety alert issued'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSchedulePatrol = () => {
    if (selectedDate && selectedLocation) {
      alert(`Drone patrol scheduled for ${selectedDate} at ${locations.find(l => l.id === selectedLocation)?.name}`);
      setSelectedDate('');
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Surveillance Control</h1>
        <p className="text-gray-600 mt-2">Manage drone patrols and safety monitoring systems</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Drone Patrol Scheduler</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date & Time</label>
            <input
              type="datetime-local"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSchedulePatrol}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              <Calendar size={16} className="mr-2" />
              Schedule Patrol
            </button>
          </div>
        </div>
      </div>

      {/* Live Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Live Drone Feeds</h3>
          <div className="space-y-4">
            {locations.slice(0, 2).map((location) => (
              <div key={location.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Camera className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">{location.name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(location.status)}`}>
                    {location.status.toUpperCase()}
                  </span>
                </div>
                <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center mb-3">
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Live Feed</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last patrol: {location.lastPatrol}</span>
                  <div className="flex space-x-2">
                    <button className="text-green-600 hover:text-green-800">
                      <Play size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Pause size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Safety Alerts & Detection</h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <span className="font-medium text-red-800">Drowning Risk Detected</span>
              </div>
              <p className="text-sm text-red-700">Yamuna River, Delhi - Person in distress detected</p>
              <p className="text-xs text-red-600 mt-1">2 minutes ago</p>
              <button className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                Dispatch Emergency
              </button>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">Garbage Accumulation</span>
              </div>
              <p className="text-sm text-yellow-700">Sabarmati River - Large waste deposit detected</p>
              <p className="text-xs text-yellow-600 mt-1">15 minutes ago</p>
              <button className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                Schedule Cleanup
              </button>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Area Clear</span>
              </div>
              <p className="text-sm text-green-700">Krishna River - No issues detected</p>
              <p className="text-xs text-green-600 mt-1">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patrol History */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Patrol History & Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date & Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Findings</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Action Taken</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patrolHistory.map((patrol) => (
                <tr key={patrol.id} className="border-b border-gray-100">
                  <td className="py-4 px-4">{patrol.location}</td>
                  <td className="py-4 px-4">{patrol.date} {patrol.time}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patrol.status)}`}>
                      {patrol.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4">{patrol.findings}</td>
                  <td className="py-4 px-4">{patrol.action}</td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      <button className="text-green-600 hover:text-green-800 text-sm">Report</button>
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