import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchCleanupEvents,
  registerCollectorForEvent,
  removeCollectorRegistration,
  subscribeToCleanupUpdates,
} from '../lib/cleanup';
import type { CleaningEvent } from '../types';

interface ViewEventsProps {
  onBack: () => void;
}

function statusClasses(status: string) {
  switch (status) {
    case 'upcoming':
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'ongoing':
      return 'bg-amber-100 text-amber-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function resolveEventImage(event: CleaningEvent) {
  return event.beforeUrl || event.report?.mlAnnotatedImageUrl || event.report?.images[0] || '';
}

export default function ViewEvents({ onBack }: ViewEventsProps) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [events, setEvents] = useState<CleaningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingEventId, setPendingEventId] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setError('');
        const nextEvents = await fetchCleanupEvents();
        if (active) {
          setEvents(nextEvents);
          setLoading(false);
        }
      } catch (loadError: any) {
        if (active) {
          setError(loadError.message ?? 'Unable to load cleanup events.');
          setLoading(false);
        }
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

  const filteredEvents = useMemo(
    () => events.filter((event) => filter === 'all' || event.status === filter),
    [events, filter],
  );

  const handleVolunteerToggle = async (event: CleaningEvent) => {
    if (!user || user.role !== 'collector') return;

    try {
      setPendingEventId(event.id);
      const alreadyRegistered = event.volunteers.some((volunteer) => volunteer.collectorId === user.id);

      if (alreadyRegistered) {
        await removeCollectorRegistration(event.id, user.id);
      } else {
        await registerCollectorForEvent({ eventId: event.id, collector: user });
      }
    } catch (actionError: any) {
      setError(actionError.message ?? 'Unable to update volunteer registration.');
    } finally {
      setPendingEventId('');
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
        <h1 className="text-3xl font-bold text-slate-900">Cleanup Events</h1>
        <p className="text-slate-600 mt-2">
          View upcoming, ongoing, and completed land cleanup drives from the live database.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'ongoing', label: 'Ongoing' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-4 py-2 rounded-full font-medium ${
                filter === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl bg-white p-8 shadow-md text-slate-600">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 shadow-md text-slate-600">
          No cleanup events match this filter yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => {
            const alreadyRegistered = !!user &&
              event.volunteers.some((volunteer) => volunteer.collectorId === user.id);

            return (
              <div key={event.id} className="bg-white rounded-3xl shadow-md p-6 border border-slate-100">
                {resolveEventImage(event) ? (
                  <img
                    src={resolveEventImage(event)}
                    alt={`Cleanup event for ${event.report?.address || 'reported site'}`}
                    className="w-full h-52 object-cover rounded-2xl border border-slate-200 mb-4"
                  />
                ) : null}
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {event.report?.address || 'Cleanup event'}
                    </h3>
                    <div className="flex items-center text-slate-600 mb-2">
                      <MapPin size={16} className="mr-2" />
                      <span className="text-sm">
                        {event.location || event.report?.address || 'Location will appear after report linkage'}
                      </span>
                    </div>
                    <div className="flex items-center text-slate-600 mb-2">
                      <Calendar size={16} className="mr-2" />
                      <span className="text-sm">
                        {new Date(event.scheduledAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Clock size={16} className="mr-2" />
                      <span className="text-sm">
                        Reporter reward: {event.reporterPoints} pts • Volunteer reward: {event.volunteerPoints} pts
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                {event.report?.description && (
                  <p className="text-slate-600 mb-4">{event.report.description}</p>
                )}

                {event.eventNotes && (
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 mb-4">
                    {event.eventNotes}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-blue-700">
                      {event.volunteerCount}/{event.requiredVolunteers}
                    </p>
                    <p className="text-xs text-slate-500">Volunteers</p>
                  </div>
                  <div className="text-center rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-sm font-semibold text-amber-700">{event.status}</p>
                    <p className="text-xs text-slate-500">Stage</p>
                  </div>
                  <div className="text-center rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center justify-center mb-1">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-emerald-700">
                      {event.report?.density || 'medium'}
                    </p>
                    <p className="text-xs text-slate-500">Density</p>
                  </div>
                </div>

                {user?.role === 'collector' && event.status === 'upcoming' && (
                  <button
                    onClick={() => handleVolunteerToggle(event)}
                    disabled={pendingEventId === event.id}
                    className={`w-full py-3 rounded-2xl transition-colors ${
                      alreadyRegistered
                        ? 'bg-slate-700 text-white hover:bg-slate-800'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    } disabled:opacity-60`}
                  >
                    {pendingEventId === event.id
                      ? 'Updating...'
                      : alreadyRegistered
                        ? 'Withdraw Registration'
                        : 'Volunteer for Event'}
                  </button>
                )}

                {event.status === 'completed' && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
                    This event has been completed and reflected in the gallery and points history.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
