import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  UserCircle2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchCleanupEvents,
  fetchPointTransactions,
  fetchUserReports,
  subscribeToCleanupUpdates,
} from '../lib/cleanup';
import type { CleaningEvent, GarbageReport, PointTransaction } from '../types';

function resolveEventImage(event: CleaningEvent) {
  return event.beforeUrl || event.report?.mlAnnotatedImageUrl || event.report?.images[0] || '';
}

function statusClasses(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'ongoing':
      return 'bg-amber-100 text-amber-800';
    case 'scheduled':
    case 'upcoming':
      return 'bg-blue-100 text-blue-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<GarbageReport[]>([]);
  const [events, setEvents] = useState<CleaningEvent[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const [nextReports, nextEvents, nextTransactions] = await Promise.all([
          fetchUserReports(user.id),
          fetchCleanupEvents(),
          fetchPointTransactions(user.id),
        ]);

        if (!active) return;

        setReports(nextReports);
        setEvents(nextEvents);
        setTransactions(nextTransactions);
      } catch (loadError: any) {
        if (!active) return;
        setError(loadError.message ?? 'Unable to load profile data.');
      } finally {
        if (active) {
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
  }, [user]);

  const myVolunteerEvents = useMemo(() => {
    if (!user) return [];

    return events.filter((event) => event.volunteers.some((volunteer) => volunteer.collectorId === user.id));
  }, [events, user]);

  if (!user) {
    return null;
  }

  return (
    <div className="rr-page">
      <div className="rr-card overflow-hidden border border-white/80 mb-8">
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-600 px-8 py-10 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
                <UserCircle2 className="h-9 w-9" />
              </div>
              <div>
                <p className="rr-page-kicker">Personal Hub</p>
                <h1 className="mt-4 text-3xl font-bold">{user.name}</h1>
                <p className="capitalize text-emerald-50">{user.role} profile</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-emerald-50">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.location || 'Location not added yet'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    {user.approved ? 'Approved account' : 'Pending approval'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:min-w-[280px]">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm text-emerald-50/80">Total points</p>
                <p className="text-3xl font-bold">{user.points}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm text-emerald-50/80">Reports submitted</p>
                <p className="text-3xl font-bold">{reports.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-100 bg-emerald-50/60 px-8 py-6">
          <p className="text-sm text-slate-600">
            This page reflects the live status of your land-based cleanup reports, scheduled events,
            and awarded points from Supabase.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rr-card p-8 text-slate-600">Loading profile data...</div>
      ) : (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-8">
            <section className="rr-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Submitted Reports</h2>
                <span className="text-sm text-slate-500">{reports.length} total</span>
              </div>

              {reports.length === 0 ? (
                <p className="text-slate-500">
                  No reports submitted yet. Once you upload a cleanup report, it will appear here with
                  verification and event progress.
                </p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="rr-card-muted p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{report.address}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Submitted on {new Date(report.createdAt).toLocaleString()}
                          </p>
                          <p className="mt-3 text-sm text-slate-600">{report.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(report.status)}`}>
                            {report.status}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              report.metadataStatus === 'verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : report.metadataStatus === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            metadata {report.metadataStatus}
                          </span>
                        </div>
                      </div>

                      {report.cleanupEventId && report.status !== 'rejected' && (
                        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                          Your report has been scheduled as a cleanup event.
                        </div>
                      )}

                      {report.verificationNotes && <p className="mt-4 text-sm text-slate-600">{report.verificationNotes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {(user.role === 'collector' || user.role === 'citizen') && (
              <section className="rr-card p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Participation & Upcoming Work</h2>
                  <span className="text-sm text-slate-500">{myVolunteerEvents.length} events</span>
                </div>

                {myVolunteerEvents.length === 0 ? (
                  <p className="text-slate-500">Volunteer registrations and assigned cleanup work will appear here.</p>
                ) : (
                  <div className="space-y-4">
                    {myVolunteerEvents.map((event) => (
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
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{event.report?.address || 'Cleanup event'}</p>
                            <p className="mt-1 text-sm text-slate-500">{new Date(event.scheduledAt).toLocaleString()}</p>
                            <p className="mt-2 text-sm text-slate-600">
                              {event.location || event.report?.address || 'Location pending'}
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                        {event.eventNotes && <p className="mt-3 text-sm text-slate-600">{event.eventNotes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          <div className="space-y-8">
            <section className="rr-card p-6">
              <h2 className="mb-6 text-xl font-bold text-slate-900">Points History</h2>

              {transactions.length === 0 ? (
                <p className="text-slate-500">
                  Points will appear here once a cleanup event is completed and rewards are distributed.
                </p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-start gap-3 rounded-2xl bg-emerald-50/75 px-4 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                        <Award className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">{transaction.note || transaction.transactionType}</p>
                            <p className="mt-1 text-xs text-slate-500">{new Date(transaction.createdAt).toLocaleString()}</p>
                          </div>
                          <span className="text-sm font-bold text-emerald-700">+{transaction.points}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rr-card p-6">
              <h2 className="mb-6 text-xl font-bold text-slate-900">Account Snapshot</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Clock3 className="h-5 w-5 text-sky-600" />
                  <span>Status: {user.status || 'active'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Calendar className="h-5 w-5 text-amber-600" />
                  <span>
                    {transactions.length
                      ? `Last points update: ${new Date(transactions[0].createdAt).toLocaleDateString()}`
                      : 'No points updates yet'}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
