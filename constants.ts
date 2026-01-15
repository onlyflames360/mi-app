import { User, AssignmentStatus } from './types'; // Changed ShiftStatus to AssignmentStatus

export const LOCATIONS = [
  'CENTRO SALUD',
  'LA BARBERA',
  'EL CENSAL',
  'Dr. ESQUERDO',
  'LA CREUETA'
];

// Efectos de sonido UI de alta calidad
export const SOUNDS = {
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  ALERT: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3',
  NOTIFICATION: 'https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3',
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  LOGOUT: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  POP: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'
};

export const MOCK_USERS: User[] = [];

// Removed generateRealShifts function as it was unused and caused type conflicts.