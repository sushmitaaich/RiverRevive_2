import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Clock,
  ImageOff,
  MapPin,
  Plus,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  addManualVolunteer,
  completeCleanupEvent,
  fetchAllReports,
  fetchCleanupEvents,
  markEventOngoing,
  requestBackendReportVerification,
  scheduleCleanupEvent,
  subscribeToCleanupUpdates,
} from '../../lib/cleanup';
import AdminFloodForecast from '../admin/AdminFloodForecast';
import AdminSurveillance from '../admin/AdminSurveillance';
import type { CleaningEvent, GarbageReport } from '../../types';

type AdminTab = 'overview' | 'reports' | 'events';

function resolveReportImage(report: GarbageReport) {
  return report.mlAnnotatedImageUrl || report.images[0] || '';
}

function resolveEventImage(event: CleaningEvent) {
  return event.beforeUrl || event.report?.mlAnnotatedImageUrl || event.report?.images[0] || '';
}

function priorityClasses(level: GarbageReport['priorityLevel']) {
  switch (level) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-amber-100 text-amber-800';
    case 'medium':
      return 'bg-blue-100 text-blue-800';
    case 'low':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function statusClasses(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-800';
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

function isTodayOrPast(dateValue: string) {
  const today = new Date();
  const target = new Date(dateValue);

  return target.toDateString() <= today.toDateString();
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [currentView, setCurrentView] = useState<'dashboard' | 'flood-forecast' | 'surveillance'>(
    'dashboard',
  );
  const [reports, setReports] = useState<GarbageReport[]>([]);
  const [events, setEvents] = useState<CleaningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scheduleForm, setScheduleForm] = useState({
    reportId: '',
    scheduledAt: '',
    location: '',
    requiredVolunteers: '4',
    notes: '',
  });
  const [manualVolunteerForms, setManualVolunteerForms] = useState<
    Record<string, { fullName: string; phoneNumber: string }>
  >({});
  const [completionForms, setCompletionForms] = useState<
    Record<
      string,
      {
        afterUrl: string;
        completionNotes: string;
        wasteKg: string;
        reporterPoints: string;
        volunteerPoints: string;
      }
    >
  >({});
  const [pendingActionId, setPendingActionId] = useState('');
  const [selectedPendingReportId, setSelectedPendingReportId] = useState<string | null>(null);
  const mlRetryRequestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setError('');
        const [nextReports, nextEvents] = await Promise.all([fetchAllReports(), fetchCleanupEvents()]);

        if (!active) return;
        setReports(nextReports);
        setEvents(nextEvents);
        setLoading(false);
      } catch (loadError: any) {
        if (!active) return;
        setError(loadError.message ?? 'Unable to load admin dashboard data.');
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

  const pendingReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          report.status === 'pending' &&
          report.metadataStatus === 'verified',
      ),
    [reports],
  );

  const selectedPendingReport = useMemo(
    () => pendingReports.find((report) => report.id === selectedPendingReportId) ?? null,
    [pendingReports, selectedPendingReportId],
  );

  const scheduledEvents = useMemo(
    () => events.filter((event) => event.status === 'upcoming'),
    [events],
  );

  const ongoingEvents = useMemo(
    () => events.filter((event) => event.status === 'ongoing'),
    [events],
  );

  const completedEvents = useMemo(
    () => events.filter((event) => event.status === 'completed'),
    [events],
  );

  const volunteerCount = useMemo(
    () =>
      events.reduce((total, event) => {
        return total + event.volunteerCount;
      }, 0),
    [events],
  );

  useEffect(() => {
    if (!pendingReports.length) {
      setSelectedPendingReportId(null);
      return;
    }

    if (!selectedPendingReportId || !pendingReports.some((report) => report.id === selectedPendingReportId)) {
      setSelectedPendingReportId(pendingReports[0].id);
    }
  }, [pendingReports, selectedPendingReportId]);

  const openPendingReport = (report: GarbageReport) => {
    setSelectedPendingReportId(report.id);
    setScheduleForm((current) => ({
      ...current,
      reportId: report.id,
      location: report.address,
    }));
  };

  useEffect(() => {
    const pendingMlReports = pendingReports.filter((report) => report.mlStatus === 'pending');

    pendingMlReports.forEach((report) => {
      if (mlRetryRequestedRef.current.has(report.id)) {
        return;
      }

      mlRetryRequestedRef.current.add(report.id);
      requestBackendReportVerification(report.id).catch((invokeError) => {
        console.error('Admin retry for ML verification failed:', report.id, invokeError);
        mlRetryRequestedRef.current.delete(report.id);
      });
    });
  }, [pendingReports]);

  const handleScheduleEvent = async () => {
    if (!user || !scheduleForm.reportId || !scheduleForm.scheduledAt || !scheduleForm.location.trim()) {
      setError('Please choose a report, date/time, and location first.');
      return;
    }

    try {
      setPendingActionId(scheduleForm.reportId);
      await scheduleCleanupEvent({
        reportId: scheduleForm.reportId,
        scheduledAt: scheduleForm.scheduledAt,
        location: scheduleForm.location.trim(),
        requiredVolunteers: Number(scheduleForm.requiredVolunteers) || 0,
        eventNotes: scheduleForm.notes,
        createdBy: user.id,
      });
      setScheduleForm({
        reportId: '',
        scheduledAt: '',
        location: '',
        requiredVolunteers: '4',
        notes: '',
      });
    } catch (actionError: any) {
      setError(actionError.message ?? 'Unable to schedule cleanup event.');
    } finally {
      setPendingActionId('');
    }
  };

  const handleAddManualVolunteer = async (eventId: string) => {
    const form = manualVolunteerForms[eventId];

    if (!form?.fullName.trim()) {
      setError('Enter the volunteer name before adding them.');
      return;
    }

    try {
      setPendingActionId(eventId);
      await addManualVolunteer({
        eventId,
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
      });
      setManualVolunteerForms((current) => ({
        ...current,
        [eventId]: { fullName: '', phoneNumber: '' },
      }));
    } catch (actionError: any) {
      setError(actionError.message ?? 'Unable to add volunteer.');
    } finally {
      setPendingActionId('');
    }
  };

  const handleStartEvent = async (event: CleaningEvent) => {
    try {
      setPendingActionId(event.id);
      await markEventOngoing(event.id, event.primaryReportId);
    } catch (actionError: any) {
      setError(actionError.message ?? 'Unable to mark event as ongoing.');
    } finally {
      setPendingActionId('');
    }
  };

  const handleCompleteEvent = async (event: CleaningEvent) => {
    const form = completionForms[event.id] ?? {
      afterUrl: '',
      completionNotes: '',
      wasteKg: '0',
      reporterPoints: '20',
      volunteerPoints: '15',
    };

    try {
      setPendingActionId(event.id);
      await completeCleanupEvent({
        eventId: event.id,
        afterUrl: form.afterUrl,
        completionNotes: form.completionNotes,
        wasteKg: { total: Number(form.wasteKg) || 0 },
        reporterPoints: Number(form.reporterPoints) || 0,
        volunteerPoints: Number(form.volunteerPoints) || 0,
      });
    } catch (actionError: any) {
      setError(actionError.message ?? 'Unable to complete event.');
    } finally {
      setPendingActionId('');
    }
  };

  if (currentView === 'flood-forecast') {
    return <AdminFloodForecast onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'surveillance') {
    return <AdminSurveillance onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Municipal Admin Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Verify land-waste reports, schedule cleanup events, manage volunteers, and close
          completed operations.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="border-b border-slate-200 mb-8">
        <nav className="flex gap-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'reports', label: 'Reports' },
            { id: 'events', label: 'Events' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-8 shadow-md text-slate-600">
          Loading admin data...
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm">Total Reports</p>
                      <p className="text-3xl font-bold text-blue-600">{reports.length}</p>
                    </div>
                    <AlertCircle className="w-12 h-12 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm">Pending Reviews</p>
                      <p className="text-3xl font-bold text-amber-600">{pendingReports.length}</p>
                    </div>
                    <Clock className="w-12 h-12 text-amber-500" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm">Live Events</p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {scheduledEvents.length + ongoingEvents.length}
                      </p>
                    </div>
                    <Calendar className="w-12 h-12 text-emerald-500" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm">Volunteer Slots Filled</p>
                      <p className="text-3xl font-bold text-violet-600">{volunteerCount}</p>
                    </div>
                    <Users className="w-12 h-12 text-violet-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Monitoring Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setCurrentView('flood-forecast')}
                    className="p-5 bg-sky-50 rounded-2xl hover:bg-sky-100 transition-colors text-center"
                  >
                    <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-sky-600" />
                    </div>
                    <h3 className="font-medium text-slate-900 mb-1">Flood Forecast</h3>
                    <p className="text-sm text-slate-600">Track environmental risk around cleanup zones</p>
                  </button>

                  <button
                    onClick={() => setCurrentView('surveillance')}
                    className="p-5 bg-amber-50 rounded-2xl hover:bg-amber-100 transition-colors text-center"
                  >
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-amber-700" />
                    </div>
                    <h3 className="font-medium text-slate-900 mb-1">Surveillance</h3>
                    <p className="text-sm text-slate-600">Schedule patrols and safety monitoring</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)_minmax(320px,0.8fr)] gap-8">
                <div className="bg-white rounded-3xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Pending Verified Reports</h2>
                    <span className="text-sm text-slate-500">{pendingReports.length} ready</span>
                  </div>

                  {pendingReports.length === 0 ? (
                    <p className="text-slate-500">
                      No metadata-verified reports are waiting for scheduling right now.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {pendingReports.map((report) => (
                        <button
                          key={report.id}
                          type="button"
                          onClick={() => openPendingReport(report)}
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            selectedPendingReportId === report.id
                              ? 'border-emerald-400 bg-emerald-50/50 shadow-sm'
                              : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                          }`}
                        >
                          {resolveReportImage(report) ? (
                            <img
                              src={resolveReportImage(report)}
                              alt={`Verified garbage detection for ${report.address}`}
                              className="w-full h-48 object-cover rounded-2xl border border-slate-200 mb-4"
                            />
                          ) : null}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              metadata verified
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                report.mlStatus === 'verified'
                                  ? 'bg-blue-100 text-blue-800'
                                  : report.mlStatus === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              ml {report.mlStatus ?? 'pending'}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${priorityClasses(
                                report.priorityLevel,
                              )}`}
                            >
                              {report.priorityLevel ?? 'unscored'} priority
                            </span>
                          </div>
                          <p className="font-medium text-slate-900">{report.address}</p>
                          <p className="text-sm text-slate-500 mt-1">
                            By {report.reporterName} • {new Date(report.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-600 mt-3">{report.description}</p>
                          {!!report.mlDetectedTypes?.length && (
                            <p className="text-sm text-slate-600 mt-3">
                              Detected waste: {report.mlDetectedTypes.join(', ')}
                            </p>
                          )}
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-emerald-700">Open details</span>
                            <ChevronRight className="h-4 w-4 text-emerald-700" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-3xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Selected Report</h2>
                    {selectedPendingReport ? (
                      <span className="text-sm text-slate-500">Ready to schedule</span>
                    ) : null}
                  </div>

                  {!selectedPendingReport ? (
                    <p className="text-slate-500">
                      Select a pending verified report to inspect the report image and schedule it.
                    </p>
                  ) : (
                    <div className="space-y-5">
                      {resolveReportImage(selectedPendingReport) ? (
                        <img
                          src={resolveReportImage(selectedPendingReport)}
                          alt={`Waste detection output for ${selectedPendingReport.address}`}
                          className="w-full h-64 object-cover rounded-2xl border border-slate-200"
                        />
                      ) : (
                        <div className="w-full h-64 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <ImageOff className="h-4 w-4" />
                            No report image available
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-500">Address</p>
                          <p className="font-semibold text-slate-900">{selectedPendingReport.address}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Reporter</p>
                          <p className="text-slate-900">{selectedPendingReport.reporterName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Submitted</p>
                          <p className="text-slate-900">
                            {new Date(selectedPendingReport.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            metadata {selectedPendingReport.metadataStatus}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedPendingReport.mlStatus === 'verified'
                                ? 'bg-blue-100 text-blue-800'
                                : selectedPendingReport.mlStatus === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            ml {selectedPendingReport.mlStatus ?? 'pending'}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${priorityClasses(
                              selectedPendingReport.priorityLevel,
                            )}`}
                          >
                            {selectedPendingReport.priorityLevel ?? 'unscored'} priority
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Description</p>
                          <p className="text-slate-700">
                            {selectedPendingReport.description || 'No description provided.'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Detected waste types</p>
                          <p className="text-slate-700">
                            {selectedPendingReport.mlDetectedTypes?.length
                              ? selectedPendingReport.mlDetectedTypes.join(', ')
                              : 'Waiting for ML output or no types detected yet.'}
                          </p>
                        </div>
                        {selectedPendingReport.verificationNotes ? (
                          <div>
                            <p className="text-sm text-slate-500">Verification notes</p>
                            <p className="text-slate-700">{selectedPendingReport.verificationNotes}</p>
                          </div>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => openPendingReport(selectedPendingReport)}
                        className="w-full bg-emerald-100 text-emerald-800 py-3 rounded-2xl hover:bg-emerald-200"
                      >
                        Use this report in the schedule form
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-3xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Schedule Cleanup Event</h2>
                  <div className="space-y-4">
                    <select
                      value={scheduleForm.reportId}
                      onChange={(event) => {
                        const selectedReport = pendingReports.find((report) => report.id === event.target.value);
                        setSelectedPendingReportId(selectedReport?.id ?? null);
                        setScheduleForm((current) => ({
                          ...current,
                          reportId: event.target.value,
                          location: selectedReport?.address ?? current.location,
                        }));
                      }}
                      className="w-full px-4 py-3 border border-slate-300 rounded-2xl"
                    >
                      <option value="">Select a verified report</option>
                      {pendingReports.map((report) => (
                        <option key={report.id} value={report.id}>
                          {report.address} - {report.reporterName}
                        </option>
                      ))}
                    </select>
                    <input
                      type="datetime-local"
                      value={scheduleForm.scheduledAt}
                      onChange={(event) =>
                        setScheduleForm((current) => ({ ...current, scheduledAt: event.target.value }))
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-2xl"
                    />
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={scheduleForm.location}
                        onChange={(event) =>
                          setScheduleForm((current) => ({ ...current, location: event.target.value }))
                        }
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-2xl"
                        placeholder="Scheduled cleanup location"
                      />
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={scheduleForm.requiredVolunteers}
                      onChange={(event) =>
                        setScheduleForm((current) => ({
                          ...current,
                          requiredVolunteers: event.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-2xl"
                      placeholder="Required volunteers"
                    />
                    <textarea
                      value={scheduleForm.notes}
                      onChange={(event) =>
                        setScheduleForm((current) => ({ ...current, notes: event.target.value }))
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-300 rounded-2xl"
                      placeholder="Event notes, equipment instructions, collection timing..."
                    />
                    <button
                      onClick={handleScheduleEvent}
                      disabled={!scheduleForm.reportId || pendingActionId === scheduleForm.reportId}
                      className="w-full bg-emerald-600 text-white py-3 rounded-2xl hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {pendingActionId === scheduleForm.reportId
                        ? 'Scheduling...'
                        : 'Create Upcoming Event'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-3xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">All Reports</h2>
                <span className="text-sm text-slate-500">{reports.length} reports</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Reporter</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Metadata</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Submitted</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b border-slate-100 align-top">
                        <td className="py-4 px-4">
                          <p className="font-medium text-slate-900">{report.address}</p>
                          <p className="text-xs text-slate-500 mt-1">{report.description}</p>
                        </td>
                        <td className="py-4 px-4">{report.reporterName}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              report.metadataStatus === 'verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : report.metadataStatus === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {report.metadataStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses(
                              report.status,
                            )}`}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          {new Date(report.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          {report.status === 'pending' && report.metadataStatus === 'verified' ? (
                            <button
                              onClick={() => openPendingReport(report)}
                              className="text-emerald-700 hover:text-emerald-800 text-sm font-medium"
                            >
                              Schedule
                            </button>
                          ) : report.status === 'pending' ? (
                            <span className="text-slate-400 text-sm">Awaiting verification</span>
                          ) : (
                            <span className="text-slate-400 text-sm">Managed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-8">
              {events.length === 0 ? (
                <div className="rounded-3xl bg-white p-8 shadow-md text-slate-600">
                  No cleanup events have been scheduled yet.
                </div>
              ) : (
                events.map((event) => {
                  const manualForm = manualVolunteerForms[event.id] ?? {
                    fullName: '',
                    phoneNumber: '',
                  };
                  const completionForm = completionForms[event.id] ?? {
                    afterUrl: '',
                    completionNotes: '',
                    wasteKg: '0',
                    reporterPoints: '20',
                    volunteerPoints: '15',
                  };

                  return (
                    <div key={event.id} className="bg-white rounded-3xl shadow-md p-6 border border-slate-100">
                      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6 mb-6">
                        <div>
                          {resolveEventImage(event) ? (
                            <img
                              src={resolveEventImage(event)}
                              alt={`Cleanup event for ${event.report?.address || 'reported site'}`}
                              className="w-full h-56 object-cover rounded-2xl border border-slate-200"
                            />
                          ) : (
                            <div className="w-full h-56 rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-sm text-slate-500">
                              Event image unavailable
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-bold text-slate-900">
                              {event.report?.address || 'Cleanup event'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                              {new Date(event.scheduledAt).toLocaleString()}
                            </p>
                            <p className="text-sm text-slate-600 mt-2">
                              Location: {event.location || event.report?.address || 'Not set'}
                            </p>
                            <p className="text-sm text-slate-600 mt-3">
                              {event.volunteerCount}/{event.requiredVolunteers} volunteers registered
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="font-medium text-slate-900 mb-2">Volunteer List</p>
                            {event.volunteers.length === 0 ? (
                              <p className="text-sm text-slate-500">No volunteers yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {event.volunteers.map((volunteer) => (
                                  <div
                                    key={volunteer.id}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="text-slate-700">{volunteer.fullName}</span>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${statusClasses(
                                        volunteer.status,
                                      )}`}
                                    >
                                      {volunteer.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {event.status === 'upcoming' && (
                            <div className="rounded-2xl border border-slate-200 p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Plus className="w-4 h-4 text-emerald-700" />
                                <p className="font-medium text-slate-900">Add Manual Volunteer</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  value={manualForm.fullName}
                                  onChange={(evt) =>
                                    setManualVolunteerForms((current) => ({
                                      ...current,
                                      [event.id]: {
                                        ...manualForm,
                                        fullName: evt.target.value,
                                      },
                                    }))
                                  }
                                  className="px-4 py-3 border border-slate-300 rounded-2xl"
                                  placeholder="Volunteer name"
                                />
                                <input
                                  type="text"
                                  value={manualForm.phoneNumber}
                                  onChange={(evt) =>
                                    setManualVolunteerForms((current) => ({
                                      ...current,
                                      [event.id]: {
                                        ...manualForm,
                                        phoneNumber: evt.target.value,
                                      },
                                    }))
                                  }
                                  className="px-4 py-3 border border-slate-300 rounded-2xl"
                                  placeholder="Phone number"
                                />
                              </div>
                              <button
                                onClick={() => handleAddManualVolunteer(event.id)}
                                disabled={pendingActionId === event.id}
                                className="mt-3 w-full bg-slate-700 text-white py-3 rounded-2xl hover:bg-slate-800 disabled:opacity-60"
                              >
                                Add Volunteer
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {event.status === 'upcoming' && (
                            <div className="rounded-2xl border border-slate-200 p-4">
                              <p className="font-medium text-slate-900 mb-3">Start Event</p>
                              <p className="text-sm text-slate-600 mb-4">
                                When the event day arrives, you can move this cleanup into the ongoing
                                state.
                              </p>
                              <button
                                onClick={() => handleStartEvent(event)}
                                disabled={
                                  pendingActionId === event.id || !isTodayOrPast(event.scheduledAt)
                                }
                                className="w-full bg-amber-500 text-white py-3 rounded-2xl hover:bg-amber-600 disabled:opacity-60"
                              >
                                {isTodayOrPast(event.scheduledAt)
                                  ? 'Mark Ongoing Event'
                                  : 'Available on event day'}
                              </button>
                            </div>
                          )}

                          {event.status === 'ongoing' && (
                            <div className="rounded-2xl border border-slate-200 p-4">
                              <p className="font-medium text-slate-900 mb-3">
                                Complete Event & Award Points
                              </p>
                              <div className="space-y-3">
                                <input
                                  type="url"
                                  value={completionForm.afterUrl}
                                  onChange={(evt) =>
                                    setCompletionForms((current) => ({
                                      ...current,
                                      [event.id]: {
                                        ...completionForm,
                                        afterUrl: evt.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl"
                                  placeholder="After photo URL"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  value={completionForm.wasteKg}
                                  onChange={(evt) =>
                                    setCompletionForms((current) => ({
                                      ...current,
                                      [event.id]: {
                                        ...completionForm,
                                        wasteKg: evt.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl"
                                  placeholder="Total waste cleared (kg)"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="number"
                                    min="0"
                                    value={completionForm.reporterPoints}
                                    onChange={(evt) =>
                                      setCompletionForms((current) => ({
                                        ...current,
                                        [event.id]: {
                                          ...completionForm,
                                          reporterPoints: evt.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl"
                                    placeholder="Reporter points"
                                  />
                                  <input
                                    type="number"
                                    min="0"
                                    value={completionForm.volunteerPoints}
                                    onChange={(evt) =>
                                      setCompletionForms((current) => ({
                                        ...current,
                                        [event.id]: {
                                          ...completionForm,
                                          volunteerPoints: evt.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl"
                                    placeholder="Volunteer points"
                                  />
                                </div>
                                <textarea
                                  value={completionForm.completionNotes}
                                  onChange={(evt) =>
                                    setCompletionForms((current) => ({
                                      ...current,
                                      [event.id]: {
                                        ...completionForm,
                                        completionNotes: evt.target.value,
                                      },
                                    }))
                                  }
                                  rows={4}
                                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl"
                                  placeholder="Completion notes, disposal summary, follow-up details..."
                                />
                                <button
                                  onClick={() => handleCompleteEvent(event)}
                                  disabled={pendingActionId === event.id}
                                  className="w-full bg-emerald-600 text-white py-3 rounded-2xl hover:bg-emerald-700 disabled:opacity-60"
                                >
                                  Complete Event
                                </button>
                              </div>
                            </div>
                          )}

                          {event.status === 'completed' && (
                            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                              <p className="font-medium text-emerald-900 mb-2">
                                Completed Event Summary
                              </p>
                              <p className="text-sm text-emerald-800">
                                Reporter points: {event.reporterPoints} • Volunteer points:{' '}
                                {event.volunteerPoints}
                              </p>
                              {event.completionNotes && (
                                <p className="text-sm text-emerald-800 mt-3">
                                  {event.completionNotes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-md">
              <p className="text-slate-500 text-sm">Upcoming Events</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{scheduledEvents.length}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-md">
              <p className="text-slate-500 text-sm">Ongoing Events</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{ongoingEvents.length}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-md">
              <p className="text-slate-500 text-sm">Completed Events</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{completedEvents.length}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
