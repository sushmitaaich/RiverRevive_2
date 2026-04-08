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
    () =>
      events.filter((event) =>
        event.volunteers.some((volunteer) => volunteer.collectorId === user?.id),
      ),
    [events, user],
  );

  const completedParticipations = useMemo(
    () => myRegisteredEvents.filter((event) => event.status === 'completed'),
    [myRegisteredEvents],
  );

  const openEvents = useMemo(
    () => events.filter((event) => event.status === 'upcoming'),
    [events],
  );

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Collector Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Volunteer for live land cleanup drives, track participation, and submit new waste reports.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Total Points</p>
              <p className="text-3xl font-bold text-emerald-600">{user?.points ?? 0}</p>
            </div>
            <Award className="w-12 h-12 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">My Reports</p>
              <p className="text-3xl font-bold text-blue-600">{reports.length}</p>
            </div>
            <Upload className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Registered Events</p>
              <p className="text-3xl font-bold text-violet-600">{myRegisteredEvents.length}</p>
            </div>
            <Users className="w-12 h-12 text-violet-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Completed Events</p>
              <p className="text-3xl font-bold text-amber-600">{completedParticipations.length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-amber-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setCurrentView('report-waste')}
            className="p-5 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors text-center"
          >
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-medium text-slate-900 mb-1">Report Waste</h3>
            <p className="text-sm text-slate-600">Submit a new land-waste report</p>
          </button>

          <button
            onClick={() => setCurrentView('view-events')}
            className="p-5 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-colors text-center"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-medium text-slate-900 mb-1">View Events</h3>
            <p className="text-sm text-slate-600">Browse all cleanup timelines</p>
          </button>

          <button
            onClick={() => setCurrentView('flood-forecast')}
            className="p-5 bg-sky-50 rounded-2xl hover:bg-sky-100 transition-colors text-center"
          >
            <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="font-medium text-slate-900 mb-1">Flood Forecast</h3>
            <p className="text-sm text-slate-600">Watch conditions around cleanup zones</p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8">
        <div className="bg-white rounded-3xl shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Available Cleanup Events</h2>

          {loading ? (
            <p className="text-slate-500">Loading events...</p>
          ) : openEvents.length === 0 ? (
            <p className="text-slate-500">No upcoming cleanup events are open for registration.</p>
          ) : (
            <div className="space-y-4">
              {openEvents.map((event) => {
                const alreadyRegistered = event.volunteers.some(
                  (volunteer) => volunteer.collectorId === user?.id,
                );

                return (
                  <div key={event.id} className="rounded-2xl border border-slate-200 p-4">
                    {resolveEventImage(event) ? (
                      <img
                        src={resolveEventImage(event)}
                        alt={`Cleanup event for ${event.report?.address || 'reported site'}`}
                        className="w-full h-40 object-cover rounded-2xl border border-slate-200 mb-4"
                      />
                    ) : null}
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {event.report?.address || 'Cleanup event'}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {new Date(event.scheduledAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-600 mt-2">
                          {event.location || event.report?.address || 'Location pending'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {event.volunteerCount}/{event.requiredVolunteers} volunteers registered
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-emerald-700">
                          +{event.volunteerPoints || 0} pts
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleVolunteerToggle(event)}
                      disabled={pendingEventId === event.id}
                      className={`w-full px-4 py-3 rounded-2xl text-sm transition-colors ${
                        alreadyRegistered
                          ? 'bg-slate-700 text-white hover:bg-slate-800'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
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

        <div className="bg-white rounded-3xl shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activities</h2>

          {completedParticipations.length === 0 ? (
            <p className="text-slate-500">Completed participation records will appear here.</p>
          ) : (
            <div className="space-y-4">
              {completedParticipations.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                    <div>
                      <p className="font-medium text-slate-900">
                        {event.report?.address || 'Cleanup event'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(event.scheduledAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-emerald-700 font-medium">+{event.volunteerPoints} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
