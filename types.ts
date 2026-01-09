
export enum ShiftStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  OPEN = 'OPEN'
}

export type AuthRole = 'guest' | 'admin' | 'volunteer';

export type AvailabilitySlot = 'morning' | 'afternoon' | 'both' | 'none';

export interface WeeklyAvailability {
  week: number;
  label: string;
  slot: AvailabilitySlot;
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  shiftsFulfilled: number;
  shiftsFailed: number;
  shiftsCovered: number;
  isAvailable: boolean;
  notificationsEnabled: boolean;
  availableForNextMonth?: boolean;
  availabilityNextMonth?: WeeklyAvailability[];
}

export interface Shift {
  id: string;
  date: string;
  dayName: string;
  startTime: string;
  endTime: string;
  location: string;
  assignedUsers: {
    userId: string;
    status: ShiftStatus;
  }[];
  isReassignmentOpen: boolean;
  isCancelledByAdmin?: boolean; // Nueva propiedad
  cancellationReason?: string; // Nueva propiedad
}

export type ViewType = 'calendar' | 'planning' | 'users' | 'stats' | 'notifications' | 'personal' | 'register' | 'auth';
