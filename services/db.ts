
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Shift, MonthlyAvailability, AppNotification } from '../types';

// Vite inyecta estas variables desde el entorno
const rawUrl = process.env.SUPABASE_URL;
const rawKey = process.env.SUPABASE_ANON_KEY;

const cleanEnv = (val: any): string => {
  if (!val) return '';
  const s = String(val).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.substring(1, s.length - 1);
  }
  return s;
};

const supabaseUrl = cleanEnv(rawUrl);
const supabaseAnonKey = cleanEnv(rawKey);

export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

class DB {
  isConfigured(): boolean {
    return supabase !== null;
  }

  async seedInitialAdmin(): Promise<User | null> {
    if (!supabase) return null;
    const admin: User = {
      id: 'admin-1',
      nombre: 'Coordinador',
      apellidos: 'Barbera',
      rol: 'coordinador',
      activo: true,
      genero: 'masculino',
      avatarSeed: 'Coordinador'
    };
    const { error } = await supabase.from('users').upsert({
      id: admin.id,
      nombre: admin.nombre,
      apellidos: admin.apellidos,
      rol: admin.rol,
      activo: admin.activo,
      genero: admin.genero,
      avatar_seed: admin.avatarSeed
    });
    if (error) { console.error('Error seeding admin:', error); return null; }
    return admin;
  }

  async getUsers(): Promise<User[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('users').select('*').order('nombre');
    if (error) { console.error('Error fetching users:', error); return []; }
    return (data || []).map(u => ({
      ...u,
      avatarSeed: u.avatar_seed,
      avatarUrl: u.avatar_url
    })) as User[];
  }

  async updateUser(user: User) {
    if (!supabase) return;
    const dbUser = {
      nombre: user.nombre,
      apellidos: user.apellidos,
      rol: user.rol,
      activo: user.activo,
      genero: user.genero,
      avatar_seed: user.avatarSeed,
      avatar_url: user.avatarUrl,
      skills: user.skills || []
    };
    const { error } = await supabase.from('users').update(dbUser).eq('id', user.id);
    if (error) console.error('Error updating user:', error);
  }

  async setUsers(users: User[]) {
    if (!supabase) return;
    const dbUsers = users.map(u => ({
      id: u.id,
      nombre: u.nombre,
      apellidos: u.apellidos,
      rol: u.rol,
      activo: u.activo,
      genero: u.genero,
      avatar_seed: u.avatarSeed,
      avatar_url: u.avatarUrl
    }));
    const { error } = await supabase.from('users').upsert(dbUsers);
    if (error) console.error('Error upserting users:', error);
  }

  async setCurrentUserId(id: string) {
    localStorage.setItem('ppco_current_user_id', id);
  }

  getCurrentUserId(): string | null {
    return localStorage.getItem('ppco_current_user_id');
  }

  logout() {
    localStorage.removeItem('ppco_current_user_id');
  }

  async getShifts(): Promise<Shift[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('shifts').select('*').order('fecha');
    if (error) { console.error('Error fetching shifts:', error); return []; }
    return (data || []).map(s => ({
      ...s,
      asignadoA: s.asignado_a,
      motivoRechazo: s.motivo_rechazo
    })) as Shift[];
  }

  async setShifts(shifts: Shift[]) {
    if (!supabase) return;
    const dbShifts = shifts.map(s => ({
      id: s.id,
      fecha: s.fecha,
      inicio: s.inicio,
      fin: s.fin,
      lugar: s.lugar,
      franja: s.franja,
      estado: s.estado,
      asignado_a: s.asignadoA,
      motivo_rechazo: s.motivoRechazo
    }));
    const { error } = await supabase.from('shifts').upsert(dbShifts);
    if (error) console.error('Error upserting shifts:', error);
  }

  async getAvailabilities(): Promise<MonthlyAvailability[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('availabilities').select('*');
    if (error) { console.error('Error fetching availabilities:', error); return []; }
    return (data || []).map(a => ({
      ...a,
      idUsuario: a.id_usuario
    })) as MonthlyAvailability[];
  }

  async setAvailabilities(avs: MonthlyAvailability[]) {
    if (!supabase) return;
    const dbAvs = avs.map(a => ({
      id_usuario: a.idUsuario,
      mes: a.mes,
      semanas: a.semanas,
      estado: a.estado,
      timestamp: a.timestamp
    }));
    const { error } = await supabase.from('availabilities').upsert(dbAvs);
    if (error) console.error('Error upserting availabilities:', error);
  }

  async getNotifications(): Promise<AppNotification[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('notifications').select('*').order('timestamp', { ascending: false });
    if (error) { console.error('Error fetching notifications:', error); return []; }
    return (data || []).map(n => ({
      ...n,
      refTurnoId: n.ref_turno_id
    })) as AppNotification[];
  }

  async setNotifications(notifs: AppNotification[]) {
    if (!supabase) return;
    const dbNotifs = notifs.map(n => ({
      id: n.id,
      tipo: n.tipo,
      titulo: n.titulo,
      cuerpo: n.cuerpo,
      color: n.color,
      ref_turno_id: n.refTurnoId,
      destinatarios: n.destinatarios,
      timestamp: n.timestamp,
      leida: n.leida
    }));
    const { error } = await supabase.from('notifications').upsert(dbNotifs);
    if (error) console.error('Error upserting notifications:', error);
  }
}

export const db = new DB();
