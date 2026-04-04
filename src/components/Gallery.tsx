import { useEffect, useState } from 'react';
import { Award, Calendar, MapPin, Users } from 'lucide-react';
import { fetchCleanupEvents, subscribeToCleanupUpdates } from '../lib/cleanup';
import type { CleaningEvent } from '../types';

export default function Gallery() {
  const [selectedEvent, setSelectedEvent] = useState<CleaningEvent | null>(null);
  const [events, setEvents] = useState<CleaningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setError('');
        const nextEvents = await fetchCleanupEvents();
        if (!active) return;
        setEvents(nextEvents.filter((event) => event.status === 'completed'));
        setLoading(false);
      } catch (loadError: any) {
        if (!active) return;
        setError(loadError.message ?? 'Unable to load completed cleanup events.');
        setLoading(false);
      }
    };

    void load();
    const unsubscribe = subscribeToCleanupUpdates(() => {
      void load();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Cleanup Success Gallery</h1>
        <p className="text-slate-600 mt-2">
          Completed land cleanup events appear here after municipal admins close them out.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl bg-white p-8 shadow-md text-slate-600">Loading gallery...</div>
      ) : events.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 shadow-md text-slate-600">
          Completed events with before/after photos will appear once admins update the event details.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => {
            const beforeImage = event.beforeUrl || event.report?.images[0] || '';
            const afterImage = event.afterUrl || '';
            const totalWaste = Object.values(event.wasteKg || {}).reduce(
              (sum, value) => sum + (Number(value) || 0),
              0,
            );

            return (
              <div
                key={event.id}
                className="bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-slate-100"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="grid grid-cols-2">
                  <div className="relative bg-slate-100">
                    {beforeImage ? (
                      <img src={beforeImage} alt="Before cleanup" className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-slate-400 text-sm">
                        Before photo pending
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Before
                    </div>
                  </div>
                  <div className="relative bg-slate-100">
                    {afterImage ? (
                      <img src={afterImage} alt="After cleanup" className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center text-slate-400 text-sm">
                        After photo pending
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-1 rounded text-xs font-medium">
                      After
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center text-slate-600 mb-2">
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">{event.report?.address || 'Cleanup site'}</span>
                  </div>

                  <div className="flex items-center text-slate-600 mb-4">
                    <Calendar size={16} className="mr-1" />
                    <span className="text-sm">{new Date(event.scheduledAt).toLocaleDateString()}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600">{totalWaste}kg</p>
                      <p className="text-xs text-slate-500">Waste Cleared</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-600">{event.volunteerCount}</p>
                      <p className="text-xs text-slate-500">Volunteers</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-violet-600">{event.pointsDistributed}</p>
                      <p className="text-xs text-slate-500">Points Given</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedEvent.report?.address || 'Cleanup event'}
                  </h2>
                  <p className="text-slate-600">
                    {new Date(selectedEvent.scheduledAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Before Cleanup</h3>
                  {selectedEvent.beforeUrl || selectedEvent.report?.images[0] ? (
                    <img
                      src={selectedEvent.beforeUrl || selectedEvent.report?.images[0]}
                      alt="Before cleanup"
                      className="w-full h-64 object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-full h-64 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      Before photo pending
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">After Cleanup</h3>
                  {selectedEvent.afterUrl ? (
                    <img
                      src={selectedEvent.afterUrl}
                      alt="After cleanup"
                      className="w-full h-64 object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-full h-64 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      After photo pending
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-2xl">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{selectedEvent.volunteerCount}</p>
                  <p className="text-sm text-slate-600">Volunteers</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {Object.values(selectedEvent.wasteKg || {}).reduce(
                      (sum, value) => sum + (Number(value) || 0),
                      0,
                    )}
                    kg
                  </p>
                  <p className="text-sm text-slate-600">Waste Cleared</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="w-6 h-6 text-violet-600" />
                  </div>
                  <p className="text-2xl font-bold text-violet-600">
                    {selectedEvent.pointsDistributed}
                  </p>
                  <p className="text-sm text-slate-600">Points Distributed</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {selectedEvent.completedAt
                      ? new Date(selectedEvent.completedAt).toLocaleDateString()
                      : 'Closed'}
                  </p>
                  <p className="text-sm text-slate-600">Completed On</p>
                </div>
              </div>

              {selectedEvent.completionNotes && (
                <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
                  {selectedEvent.completionNotes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
