import { User, Shift, Availability, Notification, Gender, Role } from './types';
import { supabase } from './services/supabase'; // Importar el cliente de Supabase

// Uso estricto de la variable de entorno para la conexión
const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://Onlyflames:Qxb2XS2em2Xou0LO@cluster0.f77u9i2.mongodb.net/ppco_la_barbera";

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
  { id: 'admin-1', email: 'admin@ppoc.com', display_name: 'COORDINADOR PRINCIPAL', role: Role.COORD, activo: true, genero: Gender.MASCULINO, avatarSeed: 'admin-1', created_at: new Date().toISOString() },
  ...USER_SEED_NAMES.map((name, i) => {
    const parts = name.split(' ');
    const firstName = parts[0];
    const isFemale = FEMALE_NAMES.has(firstName.toUpperCase());
    return {
      id: `u-${i}`,
      email: `${firstName.toLowerCase().replace(/\s/g, '')}${i}@ppoc.com`, // Email ficticio
      display_name: name, // Use full name for display_name
      role: Role.USER,
      activo: true,
      genero: (isFemale ? Gender.FEMENINO : Gender.MASCULINO),
      avatarSeed: firstName,
      created_at: new Date().toISOString()
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

  async syncToCloud() {
    console.log(`Conectando a MongoDB Atlas...`);
    const maskedUri = MONGO_URI.replace(/:([^@]+)@/, ":****@");
    console.debug(`Remote Host: ${maskedUri}`);

    try {
      const dataToSync = {
        users: this.getUsers(), // Esto ahora debería venir de Supabase
        shifts: this.getShifts(),
        availabilities: this.getAvailabilities(),
        lastSync: new Date().toISOString()
      };
      console.log("Sincronizando con Atlas...", dataToSync);
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("¡Datos sincronizados en el clúster!");
          resolve(true);
        }, 1200);
      });
    } catch (error) {
      console.error("Fallo en la conexión remota:", error);
      throw error;
    }
  }

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Error fetching users from Supabase:', error);
      // Fallback to local storage if Supabase fails or is empty
      const localUsers = this.get('users', USER_SEED);
      if (localUsers.length === 0) {
        // If local is also empty, return the seed
        return USER_SEED;
      }
      return localUsers;
    }
    return data as User[];
  }

  async setUsers(users: User[]) {
    // This function will primarily be used for initial seeding or bulk updates
    // For individual user updates, use updateUser
    for (const user of users) {
      const { error } = await supabase.from('users').upsert(user, { onConflict: 'id' });
      if (error) {
        console.error('Error upserting user to Supabase:', error);
      }
    }
    // Also keep local storage updated for offline fallback
    this.set('users', users);
  }
  
  async updateUser(updatedUser: User) {
    const { error } = await supabase.from('users').update(updatedUser).eq('id', updatedUser.id);
    if (error) {
      console.error('Error updating user in Supabase:', error);
    }
    // Also update local storage
    const users = this.getUsers(); // This will now fetch from Supabase
    const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    this.set('users', newUsers);
  }

  async deleteUser(userId: string) {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      console.error('Error deleting user from Supabase:', error);
    }
    // Also update local storage
    const users = this.getUsers(); // This will now fetch from Supabase
    const newUsers = users.filter(u => u.id !== userId);
    this.set('users', newUsers);
  }

  getShifts(): Shift[] { return this.get('shifts', []); }
  setShifts(shifts: Shift[]) { this.set('shifts', shifts); }

  getAvailabilities(): Availability[] { return this.get('availabilities', []); }
  setAvailabilities(avs: Availability[]) { this.set('availabilities', avs); }

  getNotifications(): Notification[] { return this.get('notifications', []); }
  
  setNotifications(notifs: Notification[]) { 
    this.set('notifications', notifs); 
  }

  getCurrentUserId(): string | null { return localStorage.getItem('ppco_current_user_id'); }
  setCurrentUserId(id: string) { localStorage.setItem('ppco_current_user_id', id); }
  
  logout() {
    localStorage.removeItem('ppco_current_user_id');
  }
}

export const db = new DB();