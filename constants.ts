
import { User, Shift, ShiftStatus } from './types';

export const LOCATIONS = [
  'CENTRO SALUD',
  'LA BARBERA',
  'EL CENSAL',
  'Dr. ESQUERDO',
  'LA CREUETA'
];

// Efectos de sonido UI
export const SOUNDS = {
  SUCCESS: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  ALERT: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3',
  NOTIFICATION: 'https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3',
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  LOGOUT: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3'
};

export const MOCK_USERS: User[] = [];

/**
 * Genera turnos para un mes y año específicos
 */
export const generateRealShifts = (users: User[], year: number, month: number): Shift[] => {
  const shifts: Shift[] = [];
  
  // Días en el mes solicitado
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const getWeekOfMonth = (day: number) => {
    if (day <= 7) return 1;
    if (day <= 14) return 2;
    if (day <= 21) return 3;
    return 4;
  };

  const getDayType = (hour: string) => {
    const h = parseInt(hour.split(':')[0]);
    return h < 14 ? 'morning' : 'afternoon';
  };

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dayOfWeek = dateObj.getDay();
    // Formato local para evitar desfases de zona horaria
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
    const weekNum = getWeekOfMonth(d);

    const dailyConfig: {time: string, end: string, loc: string}[] = [];
    
    // Configuración estándar de puntos
    if (dayOfWeek === 2) { // Martes
      dailyConfig.push({time: '10:30', end: '12:30', loc: 'LA BARBERA'});
      dailyConfig.push({time: '17:30', end: '19:30', loc: 'EL CENSAL'});
    } else if (dayOfWeek === 4) { // Jueves
      dailyConfig.push({time: '10:30', end: '12:30', loc: 'CENTRO SALUD'});
      dailyConfig.push({time: '17:30', end: '19:30', loc: 'LA BARBERA'});
    } else if (dayOfWeek === 6) { // Sábado
      dailyConfig.push({time: '10:30', end: '12:00', loc: 'Dr. ESQUERDO'});
      dailyConfig.push({time: '12:00', end: '13:30', loc: 'EL CENSAL'});
    }

    dailyConfig.forEach(config => {
      const type = getDayType(config.time);
      
      // Filtramos voluntarios por disponibilidad si la tienen
      const preferredResponders = users.filter(u => {
        const weekAvail = u.availabilityNextMonth?.find(a => a.week === weekNum);
        return u.availableForNextMonth && (weekAvail?.slot === type || weekAvail?.slot === 'both');
      });

      const comodines = users.filter(u => !u.availableForNextMonth);
      const pool = [...preferredResponders.sort(() => 0.5 - Math.random())];
      const backup = [...comodines.sort(() => 0.5 - Math.random())];
      
      const selected: string[] = [];
      
      // Siempre intentamos asignar al menos 2 personas, pero el sistema escala
      while (selected.length < 2) {
        if (pool.length > 0) {
          selected.push(pool.pop()!.id);
        } else if (backup.length > 0) {
          selected.push(backup.pop()!.id);
        } else {
          break; 
        }
      }

      shifts.push({
        id: `s-${dateStr}-${config.loc}-${config.time}`,
        date: dateStr,
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        startTime: config.time,
        endTime: config.end,
        location: config.loc,
        assignedUsers: selected.map(id => ({ userId: id, status: ShiftStatus.PENDING })),
        isReassignmentOpen: false
      });
    });
  }
  return shifts;
};
