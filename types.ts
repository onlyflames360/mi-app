
export type Role = 'COORDINATOR' | 'VOLUNTEER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  wantsNotifications: boolean;
  attendanceHistory: { confirmed: number; failed: number };
}

export interface Shift {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  time: string; // e.g., "10:30 - 12:30"
  period: 'MAÑANA' | 'TARDE';
  location: string;
  assignedUserIds: string[];
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'VACANT';
  cancelledReason?: string;
}

export interface Availability {
  userId: string;
  month: string; // YYYY-MM
  preferences: {
    week: number;
    option: 'MAÑANA' | 'TARDE' | 'AMBOS' | 'NADA';
  }[];
}

export interface AppNotification {
  id: string;
  userId?: string; // If undefined, it's global
  title: string;
  message: string;
  type: 'URGENT' | 'INFO' | 'SHIFT_CHANGE';
  timestamp: number;
  read: boolean;
  actionShiftId?: string;
}
