import { useEffect, useMemo, useState } from 'react';
import { Award, Calendar, CheckCircle, MapPin, Upload, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchCleanupEvents,
  fetchUserReports,
  registerCollectorForEvent,
  removeCollectorRegistration,
  subscribeToCleanupUpdates,
} from '../../lib/cleanup';
import ReportWaste from '../ReportWaste';
import ViewEvents from '../ViewEvents';
import FloodForecast from '../FloodForecast';
import type { CleaningEvent, GarbageReport } from '../../types';

function resolveEventImage(event: CleaningEvent) {
  return event.beforeUrl || event.report?.mlAnnotatedImageUrl || event.report?.images[0] || '';
}

export default function CollectorDashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'report-waste' | 'view-events' | 'flood-forecast'>('dashboard');
  const [reports, setReports] = useState<GarbageReport[]>([]);
  const [events, setEvents] = useState<CleaningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingEventId, setPendingEventId] = useState('');

  useEffect(() => {
    if (!user) return undefined;

    let active = true;

    const load = async () => {
      try {
        setError('');
        const [nextReports, nextEvents] = await Promise.all([
          fetchUserReports(user.id),
          fetchCleanupEvents(),
        ]);

        if (!active) return;
        setReports(nextReports);
        setEvents(nextEvents);
        setLoading(false);
      } catch (loadError: any) {
        if (!active) return;
        setError(loadError.message ?? 'Unable to load dashboard data.');
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
  }, [user]);

  const myRegisteredEvents = useMemo(
    () => events.filter((event) => event.volunteers.some((volunteer) => volunteer.collectorId === user?.id)),
    [events, user],
  );

  const completedParticipations = useMemo(
    () => myRegisteredEvents.filter((event) => event.status === 'completed'),
    [myRegisteredEvents],
  );

  const openEvents = useMemo(() => events.filter((event) => event.status === 'upcoming'), [events]);

  const handleVolunteerToggle = async (event: CleaningEvent) => {
    if (!user) return;

    try {
      setPendingEventId(event.id);
      const alreadyRegistered = event.volunteers.some((volunteer) => volunteer.collectorId === user.id);

      if (alreadyRegistered) {
        await removeCollectorRegistration(event.id, user.id);
      } else {
        await registerCollectorForEvent({ eventId: event.id, collector: user });
      }
    } catch (actionError: any) {
      setError(actionError.message ?? 'Unable to update volunteer status.');
    } finally {
      setPendingEventId('');
    }
  };

  if (currentView === 'report-waste') {
    return <ReportWaste onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'view-events') {
    return <ViewEvents onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'flood-forecast') {
    return <FloodForecast onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="rr-page">
      <div className="rr-page-hero mb-8">
        <p className="rr-page-kicker">Collector Workspace</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Collector Dashboard</h1>
        <p className="mt-4 max-w-3xl text-emerald-50/90">
          Volunteer for live land cleanup drives, track participation, and submit new waste reports.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rr-stat-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Points</p>
              <p className="text-3xl font-bold text-emerald-600">{user?.points ?? 0}</p>
            </div>
            <Award className="h-12 w-12 text-emerald-500" />
          </div>
        </div>

        <div className="rr-stat-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">My Reports</p>
              <p className="text-3xl font-bold text-blue-600">{reports.length}</p>
            </div>
            <Upload className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="rr-stat-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Registered Events</p>
              <p className="text-3xl font-bold text-violet-600">{myRegisteredEvents.length}</p>
            </div>
            <Users className="h-12 w-12 text-violet-500" />
          </div>
        </div>

        <div className="rr-stat-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Completed Events</p>
              <p className="text-3xl font-bold text-amber-600">{completedParticipations.length}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-amber-500" />
          </div>
        </div>
      </div>

      <div className="rr-card mb-8 p-6">
        <h2 className="mb-6 text-xl font-bold text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            onClick={() => setCurrentView('report-waste')}
            className="rr-card-muted p-5 text-center transition hover:-translate-y-0.5"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
              <Upload className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mb-1 font-medium text-slate-900">Report Waste</h3>
            <p className="text-sm text-slate-600">Submit a new land-waste report</p>
          </button>

          <button
            onClick={() => setCurrentView('view-events')}
            className="rr-card-muted p-5 text-center transition hover:-translate-y-0.5"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
              <Calendar className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="mb-1 font-medium text-slate-900">View Events</h3>
            <p className="text-sm text-slate-600">Browse all cleanup timelines</p>
          </button>

          <button
            onClick={() => setCurrentView('flood-forecast')}
            className="rr-card-muted p-5 text-center transition hover:-translate-y-0.5"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100">
              <MapPin className="h-6 w-6 text-sky-600" />
            </div>
            <h3 className="mb-1 font-medium text-slate-900">Flood Forecast</h3>
            <p className="text-sm text-slate-600">Watch conditions around cleanup zones</p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rr-card p-6">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Available Cleanup Events</h2>

          {loading ? (
            <p className="text-slate-500">Loading events...</p>
          ) : openEvents.length === 0 ? (
            <p className="text-slate-500">No upcoming cleanup events are open for registration.</p>
          ) : (
            <div className="space-y-4">
              {openEvents.map((event) => {
                const alreadyRegistered = event.volunteers.some((volunteer) => volunteer.collectorId === user?.id);

                return (
                  <div key={event.id} className="rr-card-muted p-4">
                    {resolveEventImage(event) ? (
                      <div className="rr-image-frame mb-4">
                        <img
                          src={resolveEventImage(event)}
                          alt={`Cleanup event for ${event.report?.address || 'reported site'}`}
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-900">{event.report?.address || 'Cleanup event'}</p>
                        <p className="mt-1 text-sm text-slate-500">{new Date(event.scheduledAt).toLocaleString()}</p>
                        <p className="mt-2 text-sm text-slate-600">
                          {event.location || event.report?.address || 'Location pending'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {event.volunteerCount}/{event.requiredVolunteers} volunteers registered
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-emerald-700">+{event.volunteerPoints || 0} pts</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleVolunteerToggle(event)}
                      disabled={pendingEventId === event.id}
                      className={`w-full rounded-2xl px-4 py-3 text-sm transition-colors ${
                        alreadyRegistered
                          ? 'bg-slate-700 text-white hover:bg-slate-800'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:brightness-105'
                      } disabled:opacity-60`}
                    >
                      {pendingEventId === event.id
                        ? 'Updating...'
                        : alreadyRegistered
                          ? 'Withdraw Registration'
                          : 'Volunteer'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rr-card p-6">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Recent Activities</h2>

          {completedParticipations.length === 0 ? (
            <p className="text-slate-500">Completed participation records will appear here.</p>
          ) : (
            <div className="space-y-4">
              {completedParticipations.slice(0, 5).map((event) => (
                <div key={event.id} className="rounded-2xl border border-emerald-100/80 bg-white/75 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="mr-3 h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="font-medium text-slate-900">{event.report?.address || 'Cleanup event'}</p>
                        <p className="text-sm text-slate-500">{new Date(event.scheduledAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="font-medium text-emerald-700">+{event.volunteerPoints} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
