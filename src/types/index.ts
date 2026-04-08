export type UserRole = 'citizen' | 'collector' | 'admin';
export type ReportStatus = 'pending' | 'rejected' | 'scheduled' | 'ongoing' | 'completed';
export type MetadataStatus = 'pending' | 'verified' | 'rejected';
export type MlStatus = 'pending' | 'verified' | 'rejected';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed';
export type VolunteerSource = 'self' | 'manual';
export type VolunteerStatus = 'registered' | 'assigned' | 'completed' | 'cancelled';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';
export type PointTransactionType =
  | 'report_completion'
  | 'event_participation'
  | 'manual_adjustment';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DetectionBoundingBox {
  className: string;
  confidence: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
  areaRatio: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  points: number;
  avatar?: string;
  phone?: string;
  location?: string;
  status?: string;
  approved?: boolean;
  organization?: string;
  createdAt?: string;
}

export interface GarbageReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterRole?: UserRole;
  address: string;
  description: string;
  images: string[];
  density: string;
  wasteTypes: string[];
  status: ReportStatus;
  metadataStatus: MetadataStatus;
  metadataDistanceM: number | null;
  verificationNotes: string | null;
  reportedLocation: Coordinates | null;
  metadataLocation: Coordinates | null;
  priorityLevel?: PriorityLevel | null;
  priorityScore?: number | null;
  mlStatus?: MlStatus;
  mlDetected?: boolean | null;
  mlCoverageRatio?: number | null;
  mlDetectionCount?: number | null;
  mlConfidence?: number | null;
  mlDetectedTypes?: string[];
  mlDetections?: DetectionBoundingBox[];
  mlModelVersion?: string | null;
  mlProcessedAt?: string | null;
  mlNotes?: string | null;
  mlAnnotatedImageUrl?: string | null;
  cleanupEventId: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface EventVolunteer {
  id: string;
  eventId: string;
  collectorId: string | null;
  fullName: string;
  phoneNumber: string | null;
  source: VolunteerSource;
  status: VolunteerStatus;
  createdAt: string;
}

export interface CleaningEvent {
  id: string;
  primaryReportId: string | null;
  reportIds: string[];
  scheduledAt: string;
  status: EventStatus;
  requiredVolunteers: number;
  location: string | null;
  eventNotes: string | null;
  completionNotes: string | null;
  beforeUrl: string | null;
  afterUrl: string | null;
  wasteKg: Record<string, number>;
  reporterPoints: number;
  volunteerPoints: number;
  pointsDistributed: number;
  createdBy: string | null;
  createdAt: string;
  completedAt: string | null;
  report: GarbageReport | null;
  volunteers: EventVolunteer[];
  volunteerCount: number;
}

export interface PointTransaction {
  id: string;
  profileId: string;
  eventId: string | null;
  reportId: string | null;
  transactionType: PointTransactionType;
  points: number;
  note: string | null;
  createdAt: string;
}

export interface ReportSubmissionResult {
  report: GarbageReport;
  verificationMessage: string;
}
