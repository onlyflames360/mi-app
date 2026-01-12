
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
  skills?: string[];
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
  COORD_USERS = 'COORD_USERS',
  COORD_PLANNING = 'COORD_PLANNING',
  COORD_CALENDAR = 'COORD_CALENDAR',
  COORD_STATS = 'COORD_STATS',
  COORD_NOTIFICATIONS = 'COORD_NOTIFICATIONS'
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
