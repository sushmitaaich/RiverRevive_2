import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Droplets } from 'lucide-react';

interface ViewEventsProps {
  onBack: () => void;
}

export default function ViewEvents({ onBack }: ViewEventsProps) {
  const [filter, setFilter] = useState('all');

  const events = [
    {
      id: 1,
      title: 'Yamuna River Cleaning Drive',
      location: 'Yamuna River, Delhi Gate',
      date: '2024-01-20',
      time: '09:00 AM',
      status: 'upcoming',
      volunteers: 15,
      maxVolunteers: 25,
      description: 'Large-scale cleaning operation using AI-powered drones',
      estimatedWaste: '200kg',
      duration: '4 hours'
    },
    {
      id: 2,
      title: 'Ganges Ghat Restoration',
      location: 'Har Ki Pauri, Haridwar',
      date: '2024-01-18',
      time: '06:30 AM',
      status: 'ongoing',
      volunteers: 22,
      maxVolunteers: 30,
      description: 'Comprehensive cleaning and waste segregation',
      estimatedWaste: '150kg',
      duration: '6 hours'
    },
    {
      id: 3,
      title: 'Sabarmati Riverfront Cleanup',
      location: 'Sabarmati Riverfront, Ahmedabad',
      date: '2024-01-15',
      time: '07:00 AM',
      status: 'completed',
      volunteers: 18,
      maxVolunteers: 20,
      description: 'Successful drone-assisted waste collection',
      estimatedWaste: '180kg',
      duration: '5 hours'
    },
    {
      id: 4,
      title: 'Krishna River Conservation',
      location: 'Krishna River, Vijayawada',
      date: '2024-01-22',
      time: '08:00 AM',
      status: 'upcoming',
      volunteers: 8,
      maxVolunteers: 15,
      description: 'Focus on plastic waste removal and segregation',
      estimatedWaste: '120kg',
      duration: '3 hours'
    }
  ];

  const filteredEvents = events.filter(event => 
    filter === 'all' || event.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Cleaning Events</h1>
        <p className="text-gray-600 mt-2">View ongoing and upcoming river cleaning activities</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex space-x-4 mb-4">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'ongoing', label: 'Ongoing' },
            { id: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin size={16} className="mr-2" />
                  <span className="text-sm">{event.location}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar size={16} className="mr-2" />
                  <span className="text-sm">{event.date} at {event.time}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-2" />
                  <span className="text-sm">Duration: {event.duration}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{event.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-blue-600">{event.volunteers}/{event.maxVolunteers}</p>
                <p className="text-xs text-gray-500">Volunteers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Droplets className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm font-medium text-green-600">{event.estimatedWaste}</p>
                <p className="text-xs text-gray-500">Est. Waste</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-purple-600">{event.duration}</p>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
            </div>

            {event.status === 'upcoming' && (
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Join Event
              </button>
            )}
            {event.status === 'ongoing' && (
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                View Live Updates
              </button>
            )}
            {event.status === 'completed' && (
              <button className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors">
                View Results
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}