export interface User {
  id: string;
  email: string;
  name: string;
  role: 'citizen' | 'collector' | 'admin';
  points: number;
  avatar?: string;
  phone?: string;
  location?: string;
}

export interface GarbageReport {
  id: string;
  userId: string;
  userName: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  image: string;
  description: string;
  status: 'pending' | 'approved' | 'in-progress' | 'completed';
  garbageType?: string;
  density: 'low' | 'medium' | 'high';
  timestamp: Date;
  assignedWorkers?: string[];
  completedAt?: Date;
  pointsAwarded?: number;
}

export interface CleaningEvent {
  id: string;
  reportId: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  scheduledDate: Date;
  status: 'scheduled' | 'in-progress' | 'completed';
  assignedWorkers: string[];
  volunteers: string[];
  beforeImages: string[];
  afterImages: string[];
  wasteCollected: {
    plastic: number;
    organic: number;
    metal: number;
    other: number;
  };
  pointsDistributed: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'cleaning_event' | 'points_earned' | 'assignment' | 'completion';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  eventId?: string;
}