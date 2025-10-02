import { useState } from 'react';
import { Calendar, MapPin, Users, Award } from 'lucide-react';

interface CleaningEvent {
  id: number;
  location: string;
  date: string;
  beforeImage: string;
  afterImage: string;
  wasteCollected: number;
  volunteers: number;
  pointsDistributed: number;
}

export default function Gallery() {
  const [selectedEvent, setSelectedEvent] = useState<CleaningEvent | null>(null);
  
  const cleaningEvents: CleaningEvent[] = [
    {
      id: 1,
      location: 'Yamuna River, Delhi',
      date: '2024-01-15',
      beforeImage: 'https://images.pexels.com/photos/2547565/pexels-photo-2547565.jpeg?auto=compress&cs=tinysrgb&w=500',
      afterImage: 'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&cs=tinysrgb&w=500',
      wasteCollected: 45,
      volunteers: 12,
      pointsDistributed: 360
    },
    {
      id: 2,
      location: 'Ganges Ghat, Varanasi',
      date: '2024-01-12',
      beforeImage: 'https://images.pexels.com/photos/3968056/pexels-photo-3968056.jpeg?auto=compress&cs=tinysrgb&w=500',
      afterImage: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=500',
      wasteCollected: 62,
      volunteers: 18,
      pointsDistributed: 540
    },
    {
      id: 3,
      location: 'Sabarmati Riverfront, Ahmedabad',
      date: '2024-01-10',
      beforeImage: 'https://images.pexels.com/photos/2547565/pexels-photo-2547565.jpeg?auto=compress&cs=tinysrgb&w=500',
      afterImage: 'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&cs=tinysrgb&w=500',
      wasteCollected: 38,
      volunteers: 15,
      pointsDistributed: 450
    },
    {
      id: 4,
      location: 'Krishna River, Vijayawada',
      date: '2024-01-08',
      beforeImage: 'https://images.pexels.com/photos/3968056/pexels-photo-3968056.jpeg?auto=compress&cs=tinysrgb&w=500',
      afterImage: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=500',
      wasteCollected: 52,
      volunteers: 20,
      pointsDistributed: 600
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cleaning Success Gallery</h1>
        <p className="text-gray-600 mt-2">See the impact of our river cleaning efforts across India</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cleaningEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedEvent(event)}
          >
            <div className="relative">
              <div className="grid grid-cols-2">
                <div className="relative">
                  <img 
                    src={event.beforeImage} 
                    alt="Before cleaning"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Before
                  </div>
                </div>
                <div className="relative">
                  <img 
                    src={event.afterImage} 
                    alt="After cleaning"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    After
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin size={16} className="mr-1" />
                <span className="text-sm">{event.location}</span>
              </div>
              
              <div className="flex items-center text-gray-600 mb-4">
                <Calendar size={16} className="mr-1" />
                <span className="text-sm">{event.date}</span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-blue-600">{event.wasteCollected}kg</p>
                  <p className="text-xs text-gray-500">Waste Collected</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{event.volunteers}</p>
                  <p className="text-xs text-gray-500">Volunteers</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600">{event.pointsDistributed}</p>
                  <p className="text-xs text-gray-500">Points Given</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.location}</h2>
                  <p className="text-gray-600">{selectedEvent.date}</p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Before Cleaning</h3>
                  <img 
                    src={selectedEvent.beforeImage} 
                    alt="Before cleaning"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">After Cleaning</h3>
                  <img 
                    src={selectedEvent.afterImage} 
                    alt="After cleaning"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{selectedEvent.volunteers}</p>
                  <p className="text-sm text-gray-600">Volunteers Participated</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{selectedEvent.wasteCollected}kg</p>
                  <p className="text-sm text-gray-600">Total Waste Collected</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{selectedEvent.pointsDistributed}</p>
                  <p className="text-sm text-gray-600">Points Distributed</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">6</p>
                  <p className="text-sm text-gray-600">Hours Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}