export enum Role {
  COORD = 'COORD',
  USER = 'USER'
}

export enum AssignmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  REASSIGNED = 'REASSIGNED'
}

export enum AvailabilitySlot {
  MANANA = 'MANANA',
  TARDE = 'TARDE',
  AMBOS = 'AMBOS',
  NO_PUEDO = 'NO_PUEDO'
}

export enum AlertType {
  CAN_ATTEND = 'CAN_ATTEND',
  CANNOT_ATTEND = 'CANNOT_ATTEND',
  URGENT_CALL = 'URGENT_CALL'
}

// Define Gender enum
export enum Gender {
  FEMENINO = 'femenino',
  MASCULINO = 'masculino'
}

export interface User {
  id: string;
  display_name: string;
  email?: string;
  phone?: string;
  role: Role;
  created_at: string;
  // Added properties for consistency with db.ts and other components
  avatarSeed?: string;
  avatarUrl?: string;
  activo?: boolean;
  genero?: Gender;
}

export interface Location {
  id: number;
  name: string;
  color_hex: string;
}

export interface Shift {
  id: number;
  date: string; // ISO YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  location_id: number;
  notes?: string;
  max_people: number;
  // Added properties for consistency with component usage
  isCancelledByAdmin?: boolean;
  isReassignmentOpen?: boolean;
  cancellationReason?: string;
}

export interface Assignment {
  id: number;
  shift_id: number;
  user_id: string;
  status: AssignmentStatus;
  confirmed_at?: string;
}

export interface Availability {
  id: number;
  user_id: string;
  week_start: string;
  slot: AvailabilitySlot;
  saturday_available: boolean;
}

export interface Alert {
  id: number;
  user_id: string;
  shift_id: number;
  type: AlertType;
  message?: string;
  created_at: string;
}

// Renamed from AppNotification to Notification and aligned properties
export interface Notification {
  id: number;
  title: string;
  body: string;
  read: boolean;
  timestamp: string;
  user_id?: string; // ID del destinatario. Si no está definido, es para todos (broadcast).
  // Added for consistency with previous AppNotification usage in db.ts
  type?: string; // e.g., 'info', 'urgente_cobertura'
  color?: string; // e.g., 'rojo', 'normal'
  refTurnoId?: string; // Reference to a shift ID for urgent coverage
}

export interface Message {
  id: number;
  from_user_id: string;
  from_user_name: string;
  to_user_id?: string;
  body: string;
  timestamp: string;
  is_broadcast: boolean;
  read: boolean;
}