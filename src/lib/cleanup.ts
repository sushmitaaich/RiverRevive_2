import { supabase } from './supabase';
import { distanceInMeters, extractImageGps } from './exif';
import type {
  CleaningEvent,
  Coordinates,
  EventVolunteer,
  GarbageReport,
  MetadataStatus,
  PointTransaction,
  ReportStatus,
  ReportSubmissionResult,
  User,
  VolunteerStatus,
} from '../types';

const REPORT_IMAGE_BUCKET = 'waste-report-images';
const METADATA_MATCH_THRESHOLD_METERS = 250;

function toNumber(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function toCoordinates(lat: unknown, lng: unknown): Coordinates | null {
  const latitude = toNumber(lat);
  const longitude = toNumber(lng);

  if (latitude == null || longitude == null) {
    return null;
  }

  return { lat: latitude, lng: longitude };
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

function toObject(value: unknown) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, number>;
  }

  return {};
}

function mapProfileRow(row: any): User {
  return {
    id: row.id,
    email: row.email ?? '',
    name: row.full_name ?? '',
    role: row.role ?? 'citizen',
    points: row.points ?? 0,
    phone: row.phone_number ?? '',
    location: row.location ?? '',
    status: row.status ?? '',
    approved: row.approved ?? false,
    organization: row.organization ?? '',
    createdAt: row.created_at ?? undefined,
  };
}

function mapReportRow(row: any, profilesById: Record<string, User>): GarbageReport {
  const reporter = profilesById[row.reporter_id];

  return {
    id: row.id,
    reporterId: row.reporter_id,
    reporterName: reporter?.name ?? 'Unknown user',
    reporterRole: reporter?.role,
    address: row.address ?? '',
    description: row.description ?? '',
    images: toStringArray(row.images),
    density: row.density ?? 'medium',
    wasteTypes: toStringArray(row.waste_types),
    status: (row.status ?? 'pending') as ReportStatus,
    metadataStatus: (row.metadata_status ?? 'pending') as MetadataStatus,
    metadataDistanceM: row.metadata_distance_m ?? null,
    verificationNotes: row.verification_notes ?? null,
    reportedLocation: toCoordinates(row.reported_latitude, row.reported_longitude),
    metadataLocation: toCoordinates(row.metadata_latitude, row.metadata_longitude),
    cleanupEventId: row.cleanup_event_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  };
}

function mapVolunteerRow(row: any): EventVolunteer {
  return {
    id: row.id,
    eventId: row.event_id,
    collectorId: row.collector_id ?? null,
    fullName: row.full_name ?? 'Volunteer',
    phoneNumber: row.phone_number ?? null,
    source: row.source ?? 'self',
    status: (row.status ?? 'registered') as VolunteerStatus,
    createdAt: row.created_at,
  };
}

function mapPointTransaction(row: any): PointTransaction {
  return {
    id: row.id,
    profileId: row.profile_id,
    eventId: row.event_id ?? null,
    reportId: row.report_id ?? null,
    transactionType: row.transaction_type,
    points: row.points ?? 0,
    note: row.note ?? null,
    createdAt: row.created_at,
  };
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.\-_]/g, '-').toLowerCase();
}

async function fetchProfilesByIds(profileIds: string[]) {
  const uniqueIds = [...new Set(profileIds)].filter(Boolean);

  if (!uniqueIds.length) {
    return {} as Record<string, User>;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', uniqueIds);

  if (error) {
    throw error;
  }

  return (data ?? []).reduce<Record<string, User>>((accumulator, row) => {
    accumulator[row.id] = mapProfileRow(row);
    return accumulator;
  }, {});
}

async function fetchReportsByIds(reportIds: string[]) {
  const uniqueIds = [...new Set(reportIds)].filter(Boolean);

  if (!uniqueIds.length) {
    return [] as GarbageReport[];
  }

  const { data, error } = await supabase
    .from('garbage_reports')
    .select('*')
    .in('id', uniqueIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const reporterIds = (data ?? []).map((row) => row.reporter_id);
  const profilesById = await fetchProfilesByIds(reporterIds);

  return (data ?? []).map((row) => mapReportRow(row, profilesById));
}

export async function fetchCurrentUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    throw error;
  }

  return mapProfileRow(data);
}

export async function fetchUserReports(userId: string) {
  const { data, error } = await supabase
    .from('garbage_reports')
    .select('*')
    .eq('reporter_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const profile = await fetchCurrentUserProfile(userId);
  const profilesById = profile ? { [userId]: profile } : {};

  return (data ?? []).map((row) => mapReportRow(row, profilesById));
}

export async function fetchAllReports() {
  const { data, error } = await supabase
    .from('garbage_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const profilesById = await fetchProfilesByIds((data ?? []).map((row) => row.reporter_id));

  return (data ?? []).map((row) => mapReportRow(row, profilesById));
}

export async function fetchCleanupEvents() {
  const { data: eventRows, error: eventError } = await supabase
    .from('cleaning_events')
    .select('*')
    .order('scheduled_at', { ascending: true });

  if (eventError) {
    throw eventError;
  }

  const reportIds = (eventRows ?? [])
    .flatMap((row) => {
      if (row.primary_report_id) return [row.primary_report_id];
      return toStringArray(row.report_ids);
    });

  const reports = await fetchReportsByIds(reportIds);
  const reportsById = reports.reduce<Record<string, GarbageReport>>((accumulator, report) => {
    accumulator[report.id] = report;
    return accumulator;
  }, {});

  const eventIds = (eventRows ?? []).map((row) => row.id);
  const { data: volunteerRows, error: volunteerError } = await supabase
    .from('event_volunteers')
    .select('*')
    .in('event_id', eventIds.length ? eventIds : ['00000000-0000-0000-0000-000000000000']);

  if (volunteerError) {
    throw volunteerError;
  }

  const volunteersByEvent = (volunteerRows ?? []).reduce<Record<string, EventVolunteer[]>>(
    (accumulator, row) => {
      const volunteer = mapVolunteerRow(row);

      if (!accumulator[volunteer.eventId]) {
        accumulator[volunteer.eventId] = [];
      }

      accumulator[volunteer.eventId].push(volunteer);
      return accumulator;
    },
    {},
  );

  return (eventRows ?? []).map<CleaningEvent>((row) => {
    const primaryReportId = row.primary_report_id ?? toStringArray(row.report_ids)[0] ?? null;
    const volunteers = volunteersByEvent[row.id] ?? [];

    return {
      id: row.id,
      primaryReportId,
      reportIds: primaryReportId ? [primaryReportId] : toStringArray(row.report_ids),
      scheduledAt: row.scheduled_at,
      status: row.status ?? 'upcoming',
      requiredVolunteers: row.required_volunteers ?? 0,
      eventNotes: row.event_notes ?? null,
      completionNotes: row.completion_notes ?? null,
      beforeUrl: row.before_url ?? null,
      afterUrl: row.after_url ?? null,
      wasteKg: toObject(row.waste_kg),
      reporterPoints: row.reporter_points ?? 0,
      volunteerPoints: row.volunteer_points ?? 0,
      pointsDistributed: row.points_distributed ?? 0,
      createdBy: row.created_by ?? null,
      createdAt: row.created_at,
      completedAt: row.completed_at ?? null,
      report: primaryReportId ? reportsById[primaryReportId] ?? null : null,
      volunteers,
      volunteerCount: volunteers.filter((volunteer) => volunteer.status !== 'cancelled').length,
    };
  });
}

export async function fetchPointTransactions(profileId: string) {
  const { data, error } = await supabase
    .from('points_ledger')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPointTransaction);
}

export function subscribeToCleanupUpdates(onChange: () => void) {
  const channel = supabase
    .channel(`cleanup-live-${Date.now()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'garbage_reports' },
      () => onChange(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cleaning_events' },
      () => onChange(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'event_volunteers' },
      () => onChange(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'points_ledger' },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function submitWasteReport({
  reporterId,
  address,
  description,
  density,
  wasteTypes,
  browserLocation,
  imageFile,
}: {
  reporterId: string;
  address: string;
  description: string;
  density: string;
  wasteTypes: string[];
  browserLocation: Coordinates;
  imageFile: File;
}): Promise<ReportSubmissionResult> {
  const metadataLocation = await extractImageGps(imageFile);
  const distance =
    metadataLocation != null ? Math.round(distanceInMeters(browserLocation, metadataLocation)) : null;

  let metadataStatus: MetadataStatus = 'rejected';
  let verificationMessage = 'Photo metadata is missing GPS coordinates, so the report has been rejected.';
  let status: ReportStatus = 'rejected';

  if (metadataLocation && distance != null && distance <= METADATA_MATCH_THRESHOLD_METERS) {
    metadataStatus = 'verified';
    verificationMessage =
      'Photo metadata matched your browser location. The report is now pending municipal review.';
    status = 'pending';
  } else if (metadataLocation && distance != null) {
    verificationMessage =
      'Photo metadata did not match your browser location closely enough, so the report has been rejected.';
  }

  const storagePath = `${reporterId}/${Date.now()}-${sanitizeFileName(imageFile.name)}`;
  const { error: uploadError } = await supabase.storage
    .from(REPORT_IMAGE_BUCKET)
    .upload(storagePath, imageFile, { upsert: false });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from(REPORT_IMAGE_BUCKET)
    .getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from('garbage_reports')
    .insert({
      reporter_id: reporterId,
      location: `(${browserLocation.lng},${browserLocation.lat})`,
      address,
      description,
      images: [publicUrlData.publicUrl],
      density,
      waste_types: wasteTypes,
      status,
      reported_latitude: browserLocation.lat,
      reported_longitude: browserLocation.lng,
      metadata_latitude: metadataLocation?.lat ?? null,
      metadata_longitude: metadataLocation?.lng ?? null,
      metadata_distance_m: distance,
      metadata_status: metadataStatus,
      verification_notes: verificationMessage,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  const reporter = await fetchCurrentUserProfile(reporterId);
  const report = mapReportRow(data, reporter ? { [reporter.id]: reporter } : {});

  return {
    report,
    verificationMessage,
  };
}

export async function scheduleCleanupEvent({
  reportId,
  scheduledAt,
  requiredVolunteers,
  eventNotes,
  createdBy,
}: {
  reportId: string;
  scheduledAt: string;
  requiredVolunteers: number;
  eventNotes: string;
  createdBy: string;
}) {
  const { data, error } = await supabase.rpc('schedule_cleanup_event', {
    p_report_id: reportId,
    p_scheduled_at: scheduledAt,
    p_required_volunteers: requiredVolunteers,
    p_event_notes: eventNotes,
    p_created_by: createdBy,
  });

  if (error) {
    throw error;
  }

  return data as string;
}

export async function registerCollectorForEvent({
  eventId,
  collector,
}: {
  eventId: string;
  collector: User;
}) {
  const { error } = await supabase.from('event_volunteers').upsert(
    {
      event_id: eventId,
      collector_id: collector.id,
      full_name: collector.name,
      phone_number: collector.phone ?? null,
      source: 'self',
      status: 'registered',
    },
    {
      onConflict: 'event_id,collector_id',
    },
  );

  if (error) {
    throw error;
  }
}

export async function removeCollectorRegistration(eventId: string, collectorId: string) {
  const { error } = await supabase
    .from('event_volunteers')
    .delete()
    .eq('event_id', eventId)
    .eq('collector_id', collectorId);

  if (error) {
    throw error;
  }
}

export async function addManualVolunteer({
  eventId,
  fullName,
  phoneNumber,
}: {
  eventId: string;
  fullName: string;
  phoneNumber?: string;
}) {
  const { error } = await supabase.from('event_volunteers').insert({
    event_id: eventId,
    collector_id: null,
    full_name: fullName,
    phone_number: phoneNumber ?? null,
    source: 'manual',
    status: 'assigned',
  });

  if (error) {
    throw error;
  }
}

export async function markEventOngoing(eventId: string, reportId: string | null) {
  const { error: eventError } = await supabase
    .from('cleaning_events')
    .update({ status: 'ongoing' })
    .eq('id', eventId);

  if (eventError) {
    throw eventError;
  }

  if (reportId) {
    const { error: reportError } = await supabase
      .from('garbage_reports')
      .update({ status: 'ongoing' })
      .eq('id', reportId);

    if (reportError) {
      throw reportError;
    }
  }
}

export async function completeCleanupEvent({
  eventId,
  afterUrl,
  completionNotes,
  wasteKg,
  reporterPoints,
  volunteerPoints,
}: {
  eventId: string;
  afterUrl?: string;
  completionNotes?: string;
  wasteKg: Record<string, number>;
  reporterPoints: number;
  volunteerPoints: number;
}) {
  const { data, error } = await supabase.rpc('complete_cleanup_event', {
    p_event_id: eventId,
    p_after_url: afterUrl ?? null,
    p_completion_notes: completionNotes ?? null,
    p_waste_kg: wasteKg,
    p_reporter_points: reporterPoints,
    p_volunteer_points: volunteerPoints,
  });

  if (error) {
    throw error;
  }

  return data as string;
}
