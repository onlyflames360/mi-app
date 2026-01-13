
export type Role = 'usuario' | 'coordinador';
export type ShiftStatus = 'pendiente' | 'confirmado' | 'rechazado' | 'en_sustitucion' | 'reasignado' | 'cancelado';
export type SlotType = 'manana' | 'tarde' | 'sabado';
export type AvailabilityStatus = 'manana' | 'tarde' | 'ambos' | 'no_puedo';
export type Gender = 'masculino' | 'femenino';

export interface User {
  id: string;
  nombre: string;
  apellidos: string;
  rol: Role;
  activo: boolean;
  genero: Gender;
  avatarSeed?: string;
  avatarUrl?: string;
  skills?: string[];
  // Propiedades de compatibilidad
  name?: string; 
  shiftsFulfilled?: number;
  shiftsCovered?: number;
  isAvailable?: boolean;
  availableForNextMonth?: boolean;
  notificationsEnabled?: boolean;
  availabilityNextMonth?: any;
}

export interface Shift {
  id: string;
  fecha: string; // ISO Date
  inicio: string; // HH:mm
  fin: string; // HH:mm
  lugar: string;
  franja: SlotType;
  estado: ShiftStatus;
  asignadoA: string; // User ID
  motivoRechazo?: string;
  // Propiedades de compatibilidad
  date?: string;
  assignedUsers?: any; // Acepta string[] o objetos con userId
  isCancelledByAdmin?: boolean;
  isReassignmentOpen?: boolean;
  location?: string;
  startTime?: string;
  endTime?: string;
  dayName?: string;
  cancellationReason?: string;
}

export interface DayAvailability {
  fecha: string;
  estado: AvailabilityStatus;
}

export interface WeekAvailability {
  semana: number;
  dias: DayAvailability[];
}

export interface MonthlyAvailability {
  idUsuario: string;
  mes: string; // YYYY-MM
  semanas: WeekAvailability[];
  estado: 'borrador' | 'enviada' | 'bloqueada';
  timestamp: string;
}

export interface AppNotification {
  id: string;
  tipo: 'urgente_cobertura' | 'info' | 'cambio';
  titulo: string;
  cuerpo: string;
  color: 'rojo' | 'normal';
  refTurnoId?: string;
  destinatarios: string[]; // User IDs o ['all']
  timestamp: string;
  leida: boolean;
}

export enum ViewType {
  USER_TASKS = 'USER_TASKS',
  USER_AVAILABILITY = 'USER_AVAILABILITY',
  USER_NOTIFICATIONS = 'USER_NOTIFICATIONS',
  USER_MESSAGING = 'USER_MESSAGING',
  USER_PROFILE = 'USER_PROFILE',
  COORD_USERS = 'COORD_USERS',
  COORD_PLANNING = 'COORD_PLANNING',
  COORD_CALENDAR = 'COORD_CALENDAR',
  COORD_STATS = 'COORD_STATS',
  COORD_NOTIFICATIONS = 'COORD_NOTIFICATIONS',
  COORD_MESSAGING = 'COORD_MESSAGING'
}

export interface GroundingLink {
  uri: string;
  title: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
