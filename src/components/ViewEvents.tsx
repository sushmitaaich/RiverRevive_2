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
    <div className="rr-page">
      <div className="rr-page-hero mb-8">
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        <p className="rr-page-kicker">Live Operations</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Cleanup Events</h1>
        <p className="mt-4 max-w-3xl text-emerald-50/90">
          View upcoming, ongoing, and completed land cleanup drives from the live database.
        </p>
      </div>

      <div className="rr-toolbar mb-6 p-6">
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
              className={`rr-tab ${filter === tab.id ? 'rr-tab-active' : ''}`}
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
        <div className="rr-card p-8 text-slate-600">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="rr-card p-8 text-slate-600">No cleanup events match this filter yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredEvents.map((event) => {
            const alreadyRegistered =
              !!user && event.volunteers.some((volunteer) => volunteer.collectorId === user.id);

            return (
              <div key={event.id} className="rr-card p-6">
                {resolveEventImage(event) ? (
                  <div className="rr-image-frame mb-4">
                    <img
                      src={resolveEventImage(event)}
                      alt={`Cleanup event for ${event.report?.address || 'reported site'}`}
                      className="h-52 w-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900">
                      {event.report?.address || 'Cleanup event'}
                    </h3>
                    <div className="mb-2 flex items-center text-slate-600">
                      <MapPin size={16} className="mr-2" />
                      <span className="text-sm">
                        {event.location || event.report?.address || 'Location will appear after report linkage'}
                      </span>
                    </div>
                    <div className="mb-2 flex items-center text-slate-600">
                      <Calendar size={16} className="mr-2" />
                      <span className="text-sm">{new Date(event.scheduledAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Clock size={16} className="mr-2" />
                      <span className="text-sm">
                        Reporter reward: {event.reporterPoints} pts - Volunteer reward: {event.volunteerPoints} pts
                      </span>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                {event.report?.description && <p className="mb-4 text-slate-600">{event.report.description}</p>}

                {event.eventNotes && <div className="rr-card-muted mb-4 px-4 py-3 text-sm text-slate-600">{event.eventNotes}</div>}

                <div className="mb-4 grid grid-cols-3 gap-4">
                  <div className="rr-card-muted p-3 text-center">
                    <div className="mb-1 flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm font-semibold text-blue-700">
                      {event.volunteerCount}/{event.requiredVolunteers}
                    </p>
                    <p className="text-xs text-slate-500">Volunteers</p>
                  </div>
                  <div className="rr-card-muted p-3 text-center">
                    <div className="mb-1 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="text-sm font-semibold text-amber-700">{event.status}</p>
                    <p className="text-xs text-slate-500">Stage</p>
                  </div>
                  <div className="rr-card-muted p-3 text-center">
                    <div className="mb-1 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-emerald-700">{event.report?.density || 'medium'}</p>
                    <p className="text-xs text-slate-500">Density</p>
                  </div>
                </div>

                {user?.role === 'collector' && event.status === 'upcoming' && (
                  <button
                    onClick={() => handleVolunteerToggle(event)}
                    disabled={pendingEventId === event.id}
                    className={`w-full rounded-2xl py-3 transition-colors ${
                      alreadyRegistered
                        ? 'bg-slate-700 text-white hover:bg-slate-800'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:brightness-105'
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
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
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
