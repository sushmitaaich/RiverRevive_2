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
    <div className="rr-page">
      <div className="rr-page-hero mb-8">
        <p className="rr-page-kicker">Impact Storyboard</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Cleanup Success Gallery</h1>
        <p className="mt-4 max-w-3xl text-emerald-50/90">
          Completed land cleanup events appear here after municipal admins close them out.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rr-card p-8 text-slate-600">Loading gallery...</div>
      ) : events.length === 0 ? (
        <div className="rr-card p-8 text-slate-600">
          Completed events with before/after photos will appear once admins update the event details.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                className="rr-card cursor-pointer overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(10,49,42,0.16)]"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="grid grid-cols-2">
                  <div className="relative bg-slate-100">
                    {beforeImage ? (
                      <img src={beforeImage} alt="Before cleanup" className="h-48 w-full object-cover" />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center text-sm text-slate-400">
                        Before photo pending
                      </div>
                    )}
                    <div className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-medium text-white">
                      Before
                    </div>
                  </div>
                  <div className="relative bg-slate-100">
                    {afterImage ? (
                      <img src={afterImage} alt="After cleanup" className="h-48 w-full object-cover" />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center text-sm text-slate-400">
                        After photo pending
                      </div>
                    )}
                    <div className="absolute left-2 top-2 rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white">
                      After
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-2 flex items-center text-slate-600">
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">{event.report?.address || 'Cleanup site'}</span>
                  </div>

                  <div className="mb-4 flex items-center text-slate-600">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/80 bg-white/92 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedEvent.report?.address || 'Cleanup event'}</h2>
                  <p className="text-slate-600">{new Date(selectedEvent.scheduledAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-2xl text-slate-400 transition hover:text-slate-600">
                  <span className="sr-only">Close</span>
                  x
                </button>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 font-medium text-slate-900">Before Cleanup</h3>
                  {selectedEvent.beforeUrl || selectedEvent.report?.images[0] ? (
                    <div className="rr-image-frame">
                      <img
                        src={selectedEvent.beforeUrl || selectedEvent.report?.images[0]}
                        alt="Before cleanup"
                        className="h-64 w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      Before photo pending
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="mb-3 font-medium text-slate-900">After Cleanup</h3>
                  {selectedEvent.afterUrl ? (
                    <div className="rr-image-frame">
                      <img src={selectedEvent.afterUrl} alt="After cleanup" className="h-64 w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      After photo pending
                    </div>
                  )}
                </div>
              </div>

              <div className="rr-card-muted grid grid-cols-1 gap-4 rounded-[1.75rem] p-6 md:grid-cols-4">
                <div className="text-center">
                  <div className="mb-2 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{selectedEvent.volunteerCount}</p>
                  <p className="text-sm text-slate-600">Volunteers</p>
                </div>
                <div className="text-center">
                  <div className="mb-2 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {Object.values(selectedEvent.wasteKg || {}).reduce((sum, value) => sum + (Number(value) || 0), 0)}
                    kg
                  </p>
                  <p className="text-sm text-slate-600">Waste Cleared</p>
                </div>
                <div className="text-center">
                  <div className="mb-2 flex items-center justify-center">
                    <Award className="h-6 w-6 text-violet-600" />
                  </div>
                  <p className="text-2xl font-bold text-violet-600">{selectedEvent.pointsDistributed}</p>
                  <p className="text-sm text-slate-600">Points Distributed</p>
                </div>
                <div className="text-center">
                  <div className="mb-2 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {selectedEvent.completedAt ? new Date(selectedEvent.completedAt).toLocaleDateString() : 'Closed'}
                  </p>
                  <p className="text-sm text-slate-600">Completed On</p>
                </div>
              </div>

              {selectedEvent.completionNotes && (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
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
