
import { User, Shift, MonthlyAvailability, AppNotification, Gender } from '../types';

// Configuración de MongoDB Atlas (Proporcionada por el usuario)
const MONGO_CONFIG = {
  connectionString: "mongodb+srv://cluster0.f77u9i2.mongodb.net/",
  username: "Onlyflames",
  password: "Qxb2XS2em2Xou0LO",
  database: "ppco_la_barbera",
  cluster: "cluster0"
};

const FEMALE_NAMES = new Set([
  "ABIGAIL", "ADELA", "ANA", "ANABEL", "ANDREA", "ARACELI", "BLANCA", "CONCHI", "DESI", 
  "DOLY", "JACQUELINE", "JANINE", "JUANITA", "LIA", "MARI", "MAITE", "MANUELA", "MARTA", 
  "MÍRIAM", "MÓNICA", "NOELIA", "OTILIA", "PALOMA", "PAQUI", "PATTY", "PAULA", "RAQUEL", 
  "ROSA", "TOÑI"
]);

const USER_SEED_NAMES = [
  "ABIGAIL TORRES", "ADELA CARRILLO", "ANA VÍLCHEZ", "ANA GABRIELA JIMÉNEZ", "ANA CÁNOVAS",
  "ANABEL LLAMAS", "ANDREA ORQUIN", "ARACELI GARRIDO", "AURELIO GARCÍA", "BARTOLOMÉ ROMERO",
  "BLANCA CALVO", "CONCHI CÁNOVAS", "DANIEL LÓPEZ", "DEMETRIO MENESES", "DESI ZAMORA",
  "DOLY ABELLÁN", "FERNANDO VÍLCHEZ", "JACQUELINE CARNEIRO", "JANINE GORDILLO", "JAVIER ESTRADA",
  "JESÚS ROIG", "JONATHAN LLAMAS", "JONY LÓPEZ", "JORGE TORRES", "JOSÉ RAMÓN ORQUIN",
  "JOSÉ MANUEL MONTES", "JOSÉ DEVESA", "JOSÉ CARNEIRO", "JUANITA ROMERO", "KEVIN BALLESTER",
  "LEMUEL GORDILLO", "LIA LÓPEZ", "LITO CHEDA", "MARI CARMEN ORQUIN", "MAITE ROIG",
  "MANUELA CRESCIMANNO", "MARI CHEDA", "MARTA LUCIA MORALES", "MÍRIAM DEVESA", "MISAEL GORDILLO",
  "MÓNICA GARCÍA", "MÓNICA BALLESTER", "NATÁN ZAMORA", "NOELIA LÓPEZ", "OTILIA MONTES",
  "PALOMA PÉREZ", "PAQUI ESTRADA", "PAQUI LEAL", "PARÍS ZAMORA", "PATTY CRESCIMANNO",
  "PAULA ALGUACIL", "RAQUEL GORDILLO", "ROBERTO PÉREZ", "RODOLFO GONZÁLEZ", "ROSA BARBER",
  "TOÑI ESCANERO", "TOÑI LÓPEZ"
];

const USER_SEED: User[] = [
  { id: 'admin-1', nombre: 'Coordinador', apellidos: 'General', rol: 'coordinador', activo: true, genero: 'masculino', avatarSeed: 'admin-1' },
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
      genero: (isFemale ? 'femenino' : 'masculino') as Gender,
      avatarSeed: firstName
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

  // Simulación de Sincronización con MongoDB Atlas
  async syncToCloud() {
    console.log(`Iniciando sincronización con MongoDB Atlas: ${MONGO_CONFIG.cluster}`);
    // Aquí se implementaría la llamada al Atlas Data API o un backend intermedio
    // Por ahora, simulamos latencia de red y éxito
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Datos sincronizados exitosamente en MongoDB");
        resolve(true);
      }, 1500);
    });
  }

  getUsers(): User[] { return this.get('users', USER_SEED); }
  setUsers(users: User[]) { this.set('users', users); }
  
  updateUser(updatedUser: User) {
    const users = this.getUsers();
    const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    this.setUsers(newUsers);
  }

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
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window) {
      if (window.Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
          registration.active?.postMessage({
            type: 'SHOW_NOTIFICATION',
            payload: {
              title: notif.titulo,
              body: notif.cuerpo,
              tag: notif.id
            }
          });
        });
      }
    }
  }

  getCurrentUserId(): string | null { return localStorage.getItem('ppco_current_user_id'); }
  setCurrentUserId(id: string) { localStorage.setItem('ppco_current_user_id', id); }
  
  logout() {
    localStorage.removeItem('ppco_current_user_id');
  }
}

export const db = new DB();
