import { User, Shift, MonthlyAvailability, AppNotification, Gender } from '../types';

const FEMALE_NAMES = new Set([
  "ABIGAIL", "ADELA", "ANA", "ANABEL", "ANDREA", "ARACELI", "BLANCA", "CONCHI", "DESI",
  "DOLY", "JACQUELINE", "JANINE", "JUANITA", "LIA", "MARI", "MAITE", "MANUELA", "MARTA",
  "MIRIAM", "MONICA", "NOELIA", "OTILIA", "PALOMA", "PAQUI", "PATTY", "PAULA", "RAQUEL",
  "ROSA", "TONI"
]);

const USER_SEED_NAMES = [
  "ABIGAIL TORRES", "ADELA CARRILLO", "ANA VILCHEZ", "ANA GABRIELA JIMENEZ", "ANA CANOVAS",
  "ANABEL LLAMAS", "ANDREA ORQUIN", "ARACELI GARRIDO", "AURELIO GARCIA", "BARTOLOME ROMERO",
  "BLANCA CALVO", "CONCHI CANOVAS", "DANIEL LOPEZ", "DEMETRIO MENESES", "DESI ZAMORA",
  "DOLY ABELLAN", "FERNANDO VILCHEZ", "JACQUELINE CARNEIRO", "JANINE GORDILLO", "JAVIER ESTRADA",
  "JESUS ROIG", "JONATHAN LLAMAS", "JONY LOPEZ", "JORGE TORRES", "JOSE RAMON ORQUIN",
  "JOSE MANUEL MONTES", "JOSE DEVESA", "JOSE CARNEIRO", "JUANITA ROMERO", "KEVIN BALLESTER",
  "LEMUEL GORDILLO", "LIA LOPEZ", "LITO CHEDA", "MARI CARMEN ORQUIN", "MAITE ROIG",
  "MANUELA CRESCIMANNO", "MARI CHEDA", "MARTA LUCIA MORALES", "MIRIAM DEVESA", "MISAEL GORDILLO",
  "MONICA GARCIA", "MONICA BALLESTER", "NATAN ZAMORA", "NOELIA LOPEZ", "OTILIA MONTES",
  "PALOMA PEREZ", "PAQUI ESTRADA", "PAQUI LEAL", "PARIS ZAMORA", "PATTY CRESCIMANNO",
  "PAULA ALGUACIL", "RAQUEL GORDILLO", "ROBERTO PEREZ", "RODOLFO GONZALEZ", "ROSA BARBER",
  "TONI ESCANERO", "TONI LOPEZ"
];

const USER_SEED: User[] = [
  { id: 'admin-1', nombre: 'Coordinador', apellidos: 'General', rol: 'coordinador', activo: true, genero: 'masculino' },
  ...USER_SEED_NAMES.map((name, i) => {
    const parts = name.split(' ');
    const firstName = parts[0];
    const isFemale = FEMALE_NAMES.has(firstName.toUpperCase());
    return {
      id: `u-${i}`,
      nombre: firstName,
      apellidos: parts.slice(1).join(' '),
      rol: 'usuario' as const,
      activo: true,
      genero: (isFemale ? 'femenino' : 'masculino') as Gender
    };
  })
];

class DB {
  private get<T>(key: string, defaultValue: T): T {
    const val = localStorage.getItem(`ppco_${key}`);
    return val ? JSON.parse(val) : defaultValue;
  }

  private set<T>(key: string, value: T) {
    localStorage.setItem(`ppco_${key}`, JSON.stringify(value));
  }

  getUsers(): User[] { return this.get('users', USER_SEED); }
  setUsers(users: User[]) { this.set('users', users); }

  getShifts(): Shift[] { return this.get('shifts', []); }
  setShifts(shifts: Shift[]) { this.set('shifts', shifts); }

  getAvailabilities(): MonthlyAvailability[] { return this.get('availabilities', []); }
  setAvailabilities(avs: MonthlyAvailability[]) { this.set('availabilities', avs); }

  getNotifications(): AppNotification[] { return this.get('notifications', []); }
  
  setNotifications(notifs: AppNotification[]) { 
    const oldNotifs = this.getNotifications();
    this.set('notifications', notifs); 
    
    if (notifs.length > oldNotifs.length) {
      const latest = notifs[0];
      const userId = this.getCurrentUserId();
      if (latest.destinatarios.includes(userId || '') || latest.destinatarios.includes('all')) {
        this.triggerSystemNotification(latest);
      }
    }
  }

  private triggerSystemNotification(notif: AppNotification) {
    try {
      if (typeof window === 'undefined') return;
      if (!('serviceWorker' in navigator) || !('Notification' in window)) return;
      
      if (window.Notification.permission === 'granted') {
        navigator.serviceWorker.ready
          .then(registration => {
            if (registration.active) {
              registration.active.postMessage({
                type: 'SHOW_NOTIFICATION',
                payload: {
                  title: notif.titulo,
                  body: notif.cuerpo,
                  tag: notif.id
                }
              });
            }
          })
          .catch(error => {
            console.warn('Error en notificacion:', error);
          });
      }
    } catch (error) {
      console.error('Error en triggerSystemNotification:', error);
    }
  }

  getCurrentUserId(): string | null { 
    return localStorage.getItem('ppco_current_user_id'); 
  }

  setCurrentUserId(id: string) { 
    localStorage.setItem('ppco_current_user_id', id); 
  }
  
  logout() {
    localStorage.removeItem('ppco_current_user_id');
  }
}

export const db = new DB();
