import React, { useState } from 'react';
import { ArrowLeft, Camera, Calendar, Play, Pause, AlertTriangle, CheckCircle } from 'lucide-react';

interface AdminSurveillanceProps {
  onBack: () => void;
}

export default function AdminSurveillance({ onBack }: AdminSurveillanceProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ward-12');

  const locations = [
    { id: 'ward-12', name: 'Industrial Ward 12, Delhi', status: 'active', lastPatrol: '2 hours ago' },
    { id: 'market-b', name: 'Market Cluster B, Varanasi', status: 'scheduled', lastPatrol: '6 hours ago' },
    { id: 'transfer-east', name: 'Transfer Station East, Ahmedabad', status: 'completed', lastPatrol: '1 day ago' },
    { id: 'dump-zone', name: 'Peri-urban Dump Zone, Vijayawada', status: 'active', lastPatrol: '4 hours ago' },
  ];

  const patrolHistory = [
    {
      id: 1,
      location: 'Industrial Ward 12, Delhi',
      date: '2024-01-18',
      time: '14:30',
      status: 'completed',
      findings: 'Garbage detected - 3 locations',
      action: 'Cleaning scheduled',
    },
    {
      id: 2,
      location: 'Market Cluster B, Varanasi',
      date: '2024-01-18',
      time: '09:15',
      status: 'completed',
      findings: 'No significant waste found',
      action: 'Routine monitoring',
    },
    {
      id: 3,
      location: 'Transfer Station East, Ahmedabad',
      date: '2024-01-17',
      time: '16:45',
      status: 'completed',
      findings: 'Drowning risk area identified',
      action: 'Safety alert issued',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSchedulePatrol = () => {
    if (selectedDate && selectedLocation) {
      alert(`Drone patrol scheduled for ${selectedDate} at ${locations.find((l) => l.id === selectedLocation)?.name}`);
      setSelectedDate('');
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
        <p className="rr-page-kicker">Surveillance</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Admin Surveillance Control</h1>
        <p className="mt-4 max-w-3xl text-emerald-50/90">
          Manage drone patrols and safety monitoring systems.
        </p>
      </div>

      <div className="rr-card mb-6 p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Drone Patrol Scheduler</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Select Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="rr-input"
            >
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Schedule Date & Time</label>
            <input
              type="datetime-local"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rr-input"
            />
          </div>
          <div className="flex items-end">
            <button onClick={handleSchedulePatrol} className="rr-btn-primary w-full">
              <Calendar size={16} />
              Schedule Patrol
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rr-card p-6">
          <h3 className="mb-4 text-xl font-bold text-gray-900">Live Drone Feeds</h3>
          <div className="space-y-4">
            {locations.slice(0, 2).map((location) => (
              <div key={location.id} className="rr-card-muted p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <Camera className="mr-2 h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">{location.name}</span>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(location.status)}`}>
                    {location.status.toUpperCase()}
                  </span>
                </div>
                <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-white/80">
                  <div className="text-center">
                    <Camera className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Live Feed</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
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

        <div className="rr-card p-6">
          <h3 className="mb-4 text-xl font-bold text-gray-900">Safety Alerts & Detection</h3>
          <div className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="mb-2 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Drowning Risk Detected</span>
              </div>
              <p className="text-sm text-red-700">Industrial Ward 12, Delhi - Person in distress detected</p>
              <p className="mt-1 text-xs text-red-600">2 minutes ago</p>
              <button className="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700">
                Dispatch Emergency
              </button>
            </div>

            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <div className="mb-2 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Garbage Accumulation</span>
              </div>
              <p className="text-sm text-yellow-700">Transfer Station East - Large waste deposit detected</p>
              <p className="mt-1 text-xs text-yellow-600">15 minutes ago</p>
              <button className="mt-2 rounded bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700">
                Schedule Cleanup
              </button>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="mb-2 flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Area Clear</span>
              </div>
              <p className="text-sm text-green-700">Peri-urban Dump Zone - No issues detected</p>
              <p className="mt-1 text-xs text-green-600">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rr-card p-6">
        <h3 className="mb-4 text-xl font-bold text-gray-900">Patrol History & Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-emerald-100">
                <th className="px-4 py-3 text-left font-medium text-gray-900">Location</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Date & Time</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Findings</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Action Taken</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patrolHistory.map((patrol) => (
                <tr key={patrol.id} className="border-b border-emerald-50">
                  <td className="px-4 py-4">{patrol.location}</td>
                  <td className="px-4 py-4">
                    {patrol.date} {patrol.time}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(patrol.status)}`}>
                      {patrol.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4">{patrol.findings}</td>
                  <td className="px-4 py-4">{patrol.action}</td>
                  <td className="px-4 py-4">
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
