import React from 'react';
import { MapPin, Users, Award, Calendar, Truck, CheckCircle, Upload, Droplets, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ReportWaste from '../ReportWaste';
import ViewEvents from '../ViewEvents';
import FloodForecast from '../FloodForecast';
import WaterQuality from '../WaterQuality';

export default function CollectorDashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = React.useState('dashboard');

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
        <h1 className="text-3xl font-bold text-gray-900">Collector Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your cleaning assignments and volunteer for nearby events</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <p className="text-gray-500 text-sm">Events Participated</p>
              <p className="text-3xl font-bold text-blue-600">18</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Waste Collected</p>
              <p className="text-3xl font-bold text-purple-600">245kg</p>
            </div>
            <Truck className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">This Month</p>
              <p className="text-3xl font-bold text-orange-600">12</p>
            </div>
            <Calendar className="w-12 h-12 text-orange-500" />
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

      {/* Available Events */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Available Cleaning Events</h2>
        <div className="space-y-4">
          {[
            {
              id: 1,
              location: 'Yamuna River, Sector 15',
              distance: '2.3 km',
              points: 35,
              date: '2024-01-18',
              time: '09:00 AM',
              volunteers: 3,
              maxVolunteers: 8
            },
            {
              id: 2,
              location: 'Hindon River, Ghaziabad',
              distance: '5.7 km',
              points: 45,
              date: '2024-01-19',
              time: '07:00 AM',
              volunteers: 2,
              maxVolunteers: 6
            },
            {
              id: 3,
              location: 'Gomti River, Lucknow',
              distance: '12.1 km',
              points: 50,
              date: '2024-01-20',
              time: '06:30 AM',
              volunteers: 1,
              maxVolunteers: 10
            }
          ].map((event) => (
            <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">{event.location}</h3>
                    <p className="text-sm text-gray-500">{event.distance} from your location</p>
                    <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">+{event.points} points</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600">
                  <Users size={16} className="mr-1" />
                  {event.volunteers}/{event.maxVolunteers} volunteers
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  Volunteer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h2>
        <div className="space-y-4">
          {[
            {
              id: 1,
              location: 'Krishna River, Vijayawada',
              date: '2024-01-15',
              status: 'completed',
              points: 30,
              wasteCollected: '15kg'
            },
            {
              id: 2,
              location: 'Narmada River, Indore',
              date: '2024-01-12',
              status: 'completed',
              points: 25,
              wasteCollected: '12kg'
            },
            {
              id: 3,
              location: 'Kaveri River, Mysore',
              date: '2024-01-10',
              status: 'completed',
              points: 40,
              wasteCollected: '18kg'
            }
          ].map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{activity.location}</p>
                  <p className="text-sm text-gray-500">{activity.date} • {activity.wasteCollected} waste collected</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-green-600 font-medium">+{activity.points} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}