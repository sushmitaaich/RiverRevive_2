import React, { useState } from 'react';
import { Users, MapPin, TrendingUp, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AdminFloodForecast from '../admin/AdminFloodForecast';
import AdminWaterQuality from '../admin/AdminWaterQuality';
import AdminSurveillance from '../admin/AdminSurveillance';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentView, setCurrentView] = useState('dashboard');

  if (currentView === 'flood-forecast') {
    return <AdminFloodForecast onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'water-quality') {
    return <AdminWaterQuality onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'surveillance') {
    return <AdminSurveillance onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Municipal Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage river cleaning operations across your jurisdiction</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'reports', label: 'Reports' },
            { id: 'workers', label: 'Workers' },
            { id: 'assignments', label: 'Assignments' },
            { id: 'analytics', label: 'Analytics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Reports</p>
                  <p className="text-3xl font-bold text-blue-600">156</p>
                </div>
                <AlertCircle className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Workers</p>
                  <p className="text-3xl font-bold text-green-600">42</p>
                </div>
                <Users className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Locations Cleaned</p>
                  <p className="text-3xl font-bold text-purple-600">89</p>
                </div>
                <CheckCircle className="w-12 h-12 text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending Reviews</p>
                  <p className="text-3xl font-bold text-orange-600">23</p>
                </div>
                <Clock className="w-12 h-12 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Water Management Systems */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Water Management Systems</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setCurrentView('flood-forecast')}
                className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Flood Forecast</h3>
                <p className="text-sm text-gray-600">AI-based water level prediction</p>
              </button>

              <button
                onClick={() => setCurrentView('water-quality')}
                className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-center"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Water Quality Monitoring</h3>
                <p className="text-sm text-gray-600">Regular quality assessments</p>
              </button>

              <button
                onClick={() => setCurrentView('surveillance')}
                className="p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors text-center"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Surveillance</h3>
                <p className="text-sm text-gray-600">Drone patrols & monitoring</p>
              </button>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Pending Reports</h2>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    reporter: 'Raj Kumar',
                    location: 'Yamuna River, Sector 18',
                    submitted: '2 hours ago',
                    priority: 'high'
                  },
                  {
                    id: 2,
                    reporter: 'Priya Singh',
                    location: 'Hindon Canal, Vaishali',
                    submitted: '4 hours ago',
                    priority: 'medium'
                  },
                  {
                    id: 3,
                    reporter: 'Amit Sharma',
                    location: 'Gomti Riverbank',
                    submitted: '6 hours ago',
                    priority: 'low'
                  }
                ].map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        report.priority === 'high' ? 'bg-red-500' :
                        report.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{report.location}</p>
                        <p className="text-sm text-gray-500">By {report.reporter} • {report.submitted}</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Scheduled Cleanings</h2>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    location: 'Yamuna River, Delhi Gate',
                    date: 'Today, 9:00 AM',
                    workers: 5,
                    status: 'in-progress'
                  },
                  {
                    id: 2,
                    location: 'Sabarmati Riverfront',
                    date: 'Tomorrow, 7:00 AM',
                    workers: 8,
                    status: 'scheduled'
                  },
                  {
                    id: 3,
                    location: 'Ganga Ghat, Haridwar',
                    date: 'Jan 19, 6:30 AM',
                    workers: 12,
                    status: 'scheduled'
                  }
                ].map((cleaning) => (
                  <div key={cleaning.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{cleaning.location}</p>
                        <p className="text-sm text-gray-500">{cleaning.date} • {cleaning.workers} workers assigned</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cleaning.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {cleaning.status === 'in-progress' ? 'In Progress' : 'Scheduled'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">All Reports Management</h2>
            <div className="flex space-x-2">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>All Status</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>All Priority</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Reporter</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Submitted</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    location: 'Yamuna River, Sector 18',
                    reporter: 'Raj Kumar',
                    priority: 'High',
                    status: 'Pending',
                    submitted: '2 hours ago'
                  },
                  {
                    location: 'Hindon Canal, Vaishali',
                    reporter: 'Priya Singh',
                    priority: 'Medium',
                    status: 'Approved',
                    submitted: '4 hours ago'
                  },
                  {
                    location: 'Gomti Riverbank',
                    reporter: 'Amit Sharma',
                    priority: 'Low',
                    status: 'In Progress',
                    submitted: '6 hours ago'
                  }
                ].map((report, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-4">{report.location}</td>
                    <td className="py-4 px-4">{report.reporter}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.priority === 'High' ? 'bg-red-100 text-red-800' :
                        report.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {report.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
                        report.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{report.submitted}</td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                        <button className="text-green-600 hover:text-green-800 text-sm">Assign</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}