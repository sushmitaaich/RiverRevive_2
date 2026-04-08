import { useEffect, useMemo, useState } from 'react';
import { Award, Calendar, MapPin, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCleanupEvents, fetchUserReports, subscribeToCleanupUpdates } from '../../lib/cleanup';
import ReportWaste from '../ReportWaste';
import ViewEvents from '../ViewEvents';
import FloodForecast from '../FloodForecast';
import type { CleaningEvent, GarbageReport } from '../../types';

function resolveEventImage(event: CleaningEvent) {
  return event.beforeUrl || event.report?.mlAnnotatedImageUrl || event.report?.images[0] || '';
}

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'report-waste' | 'view-events' | 'flood-forecast'>('dashboard');
  const [reports, setReports] = useState<GarbageReport[]>([]);
  const [events, setEvents] = useState<CleaningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const completedReports = useMemo(
    () => reports.filter((report) => report.status === 'completed').length,
    [reports],
  );

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
        <h1 className="text-3xl font-bold text-slate-900">Citizen Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Report land waste hotspots and follow each cleanup event from verification to completion.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <p className="text-slate-500 text-sm">Reports Submitted</p>
              <p className="text-3xl font-bold text-blue-600">{reports.length}</p>
            </div>
            <Upload className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Sites Cleaned</p>
              <p className="text-3xl font-bold text-violet-600">{completedReports}</p>
            </div>
            <MapPin className="w-12 h-12 text-violet-500" />
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
            <p className="text-sm text-slate-600">Upload a geotagged land-waste photo</p>
          </button>

          <button
            onClick={() => setCurrentView('view-events')}
            className="p-5 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-colors text-center"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-medium text-slate-900 mb-1">View Events</h3>
            <p className="text-sm text-slate-600">Track upcoming and completed cleanups</p>
          </button>

          <button
            onClick={() => setCurrentView('flood-forecast')}
            className="p-5 bg-sky-50 rounded-2xl hover:bg-sky-100 transition-colors text-center"
          >
            <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="font-medium text-slate-900 mb-1">Flood Forecast</h3>
            <p className="text-sm text-slate-600">Keep an eye on area risk conditions</p>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8">
        <div className="bg-white rounded-3xl shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">My Recent Reports</h2>

          {loading ? (
            <p className="text-slate-500">Loading your reports...</p>
          ) : reports.length === 0 ? (
            <p className="text-slate-500">Your submitted reports will appear here.</p>
          ) : (
            <div className="space-y-4">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-slate-400 mr-3" />
                    <div>
                      <p className="font-medium text-slate-900">{report.address}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(report.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      report.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : report.status === 'ongoing'
                          ? 'bg-amber-100 text-amber-800'
                          : report.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : report.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-700'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Upcoming Events</h2>

          {events.filter((event) => event.status === 'upcoming').length === 0 ? (
            <p className="text-slate-500">Newly scheduled cleanup events will appear here.</p>
          ) : (
            <div className="space-y-4">
              {events
                .filter((event) => event.status === 'upcoming')
                .slice(0, 4)
                .map((event) => (
                  <div key={event.id} className="rounded-2xl border border-slate-200 p-4">
                    {resolveEventImage(event) ? (
                      <img
                        src={resolveEventImage(event)}
                        alt={`Cleanup event for ${event.report?.address || 'reported site'}`}
                        className="w-full h-40 object-cover rounded-2xl border border-slate-200 mb-4"
                      />
                    ) : null}
                    <p className="font-medium text-slate-900">
                      {event.report?.address || 'Cleanup event'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(event.scheduledAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-600 mt-2">
                      {event.location || event.report?.address || 'Location pending'}
                    </p>
                    <p className="text-sm text-slate-600 mt-2">
                      {event.volunteerCount}/{event.requiredVolunteers} volunteers registered
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
