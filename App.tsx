import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Role, User, Location, Shift, Assignment, Notification, AssignmentStatus, Alert, AlertType, Availability, AvailabilitySlot, Message, Gender } from './types';
import AuthView from './components/AuthView';
import Layout from './components/Layout';
import CoordinatorView from './components/CoordinatorView';
import UserView from './components/UserView';
import { SEED_DATA } from './constants.tsx';
import { db } from './services/db';
import { supabase } from './services/supabase'; // Importar el cliente de Supabase

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]); // Ahora se gestionará desde Supabase
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMonth, setCurrentMonth] = useState('2026-01');
  const [sentReminders, setSentReminders] = useState<Set<string>>(new Set());
  const [loadingAuth, setLoadingAuth] = useState(true); // Nuevo estado de carga para auth

  // Función para sembrar usuarios en Supabase si la tabla está vacía
  const seedSupabaseUsers = useCallback(async () => {
    const { data: existingUsers, error } = await supabase.from('users').select('id');
    if (error) {
      console.error('Error checking existing users in Supabase:', error);
      return;
    }

    if (existingUsers.length === 0) {
      console.log('Seeding initial users to Supabase...');
      const initialUsers: User[] = [
        { id: 'admin-1', email: 'admin@ppoc.com', display_name: 'COORDINADOR PRINCIPAL', role: Role.COORD, created_at: new Date().toISOString(), activo: true, genero: Gender.MASCULINO, avatarSeed: 'admin-1' },
        ...SEED_DATA.users.map((name, i) => {
          const firstName = name.split(' ')[0];
          const isFemale = ["ANA", "ROSA", "DOLY", "MAITE", "OTILIA", "CONCHI", "ARACELI", "JUANITA", "ANDREA", "TOÑI", "PAULA", "ADELA", "JACQUELINE", "MANUELA", "PAQUI", "DESI", "PALOMA", "BLANCA", "ANABEL", "RAQUEL", "MARI", "ABIGAIL", "MARTA", "MÍRIAM", "MÓNICA", "LIA", "JANINE", "PATTY"].includes(firstName.toUpperCase());
          return {
            id: `u-${i}`,
            email: `${firstName.toLowerCase().replace(/\s/g, '')}${i}@ppoc.com`, // Email ficticio
            display_name: name.toUpperCase(),
            role: Role.USER,
            created_at: new Date().toISOString(),
            activo: true,
            genero: isFemale ? Gender.FEMENINO : Gender.MASCULINO,
            avatarSeed: firstName
          };
        })
      ];
      await db.setUsers(initialUsers); // Usa db.setUsers que ahora interactúa con Supabase
      setUsers(initialUsers);
    } else {
      const fetchedUsers = await db.getUsers();
      setUsers(fetchedUsers);
    }
  }, []);

  // Inicializar datos y escuchar cambios de autenticación de Supabase
  useEffect(() => {
    const initializeApp = async () => {
      setLoadingAuth(true);
      await seedSupabaseUsers(); // Asegura que los usuarios estén en Supabase

      setLocations(SEED_DATA.locations.map((l, i) => ({ id: i + 1, ...l })));

      const initialShifts: Shift[] = [];
      const initialAssignments: Assignment[] = [];

      SEED_DATA.raw_shifts.forEach((raw, shiftIdx) => {
        const locId = SEED_DATA.locations.findIndex(l => l.name === raw.loc) + 1;
        const [start, end] = raw.time.split('-');
        
        const newShift: Shift = {
          id: shiftIdx + 1,
          date: raw.date,
          start_time: start,
          end_time: end,
          location_id: locId,
          max_people: raw.people.length,
          notes: ''
        };
        initialShifts.push(newShift);

        raw.people.forEach((pName) => {
          const foundUser = users.find(u => u.display_name.toUpperCase() === pName.toUpperCase());
          if (foundUser) {
            initialAssignments.push({
              id: initialAssignments.length + 1,
              shift_id: newShift.id,
              user_id: foundUser.id,
              status: AssignmentStatus.CONFIRMED
            });
          }
        });
      });

      setShifts(initialShifts);
      setAssignments(initialAssignments);
      
      const storedAvails = localStorage.getItem('ppoc_availabilities');
      if (storedAvails) setAvailabilities(JSON.parse(storedAvails));

      // Escuchar cambios de autenticación de Supabase
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          const { data: profile, error } = await supabase.from('users').select('*').eq('id', session.user.id).single();
          if (error) {
            console.error('Error fetching user profile:', error);
            setUser(null);
          } else {
            setUser(profile as User);
            db.setCurrentUserId(profile.id);
          }
        } else {
          setUser(null);
          db.logout();
        }
        setLoadingAuth(false);
      });

      // Intentar obtener la sesión actual al cargar
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile, error } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        if (error) {
          console.error('Error fetching user profile on initial load:', error);
          setUser(null);
        } else {
          setUser(profile as User);
          db.setCurrentUserId(profile.id);
        }
      } else {
        setUser(null);
      }
      setLoadingAuth(false);

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeApp();
  }, [seedSupabaseUsers, users]); // Añadir 'users' como dependencia para que se re-ejecute si los usuarios cambian

  useEffect(() => {
    if (availabilities.length > 0) {
      localStorage.setItem('ppoc_availabilities', JSON.stringify(availabilities));
    }
  }, [availabilities]);

  const addNotification = useCallback((title: string, body: string, targetUserId?: string) => {
    const newNote: Notification = {
      id: Date.now(),
      title,
      body,
      read: false,
      timestamp: new Date().toISOString(),
      user_id: targetUserId
    };
    setNotifications(prev => [newNote, ...prev]);
  }, []);

  useEffect(() => {
    if (!user || user.role !== Role.USER) return;

    const checkReminders = () => {
      const now = new Date();
      const userAssignments = assignments.filter(a => a.user_id === user.id);

      userAssignments.forEach(a => {
        const shift = shifts.find(s => s.id === a.shift_id);
        if (!shift) return;

        const shiftStartTime = new Date(`${shift.date}T${shift.start_time}:00`);
        const diffMs = shiftStartTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        const key24h = `24h-${a.id}`;
        if (diffHours > 0 && diffHours <= 24 && !sentReminders.has(key24h)) {
          addNotification(
            "⏰ Mañana tienes turno",
            `No olvides tu turno en ${locations.find(l => l.id === shift.location_id)?.name} a las ${shift.start_time}.`,
            user.id
          );
          setSentReminders(prev => new Set(prev).add(key24h));
        }

        const key2h = `2h-${a.id}`;
        if (diffHours > 0 && diffHours <= 2 && a.status === AssignmentStatus.PENDING && !sentReminders.has(key2h)) {
          addNotification(
            "⚠️ URGENTE: Confirma tu turno",
            `Empiezas en 2 horas. Por favor, confirma asistencia.`,
            user.id
          );
          setSentReminders(prev => new Set(prev).add(key2h));
        }
      });
    };

    const timer = setInterval(checkReminders, 60000);
    checkReminders();
    return () => clearInterval(timer);
  }, [user, assignments, shifts, locations, sentReminders, addNotification]);

  const handleSendMessage = useCallback((fromUserId: string, fromUserName: string, body: string, isBroadcast: boolean = false, toUserId?: string) => {
    const newMessage: Message = {
      id: Date.now(),
      from_user_id: fromUserId,
      from_user_name: fromUserName,
      to_user_id: toUserId,
      body,
      timestamp: new Date().toISOString(),
      is_broadcast: isBroadcast,
      read: false
    };
    setMessages(prev => [newMessage, ...prev]);
    
    if (isBroadcast) {
      addNotification("Aviso del Coordinador", body);
    } else if (toUserId && toUserId !== 'admin-1') {
      addNotification(`Respuesta del Coordinador`, body, toUserId);
    } else {
      addNotification(`Mensaje privado de ${fromUserName}`, body, 'admin-1');
    }
  }, [addNotification]);

  const markMessagesAsRead = useCallback((userId: string) => {
    setMessages(prev => prev.map(m => {
      if (userId === 'admin-1' && !m.is_broadcast && m.to_user_id === 'admin-1') return { ...m, read: true };
      if (userId !== 'admin-1' && (m.is_broadcast || m.to_user_id === userId)) return { ...m, read: true };
      return m;
    }));
  }, []);

  // Login de voluntarios (simulado para Supabase, manteniendo la interfaz)
  const handleVolunteerAuth = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error) {
      console.error('Error fetching volunteer profile:', error);
      alert('Usuario no encontrado o error al cargar el perfil.');
      return;
    }
    if (data) {
      setUser(data as User);
      db.setCurrentUserId(data.id);
    } else {
      alert('Usuario no encontrado.');
    }
  }, []);

  // Login de administrador (autenticación real de Supabase)
  const handleAdminAuth = useCallback(async (code: string) => {
    if (code === '1914') {
      setLoadingAuth(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@ppoc.com', // Email predefinido para el admin
        password: 'password123' // Contraseña predefinida para el admin (debería ser segura en producción)
      });

      if (error) {
        console.error('Error logging in admin:', error);
        alert('Código de administrador incorrecto o error de autenticación.');
      } else if (data.user) {
        const { data: profile, error: profileError } = await supabase.from('users').select('*').eq('id', data.user.id).single();
        if (profileError) {
          console.error('Error fetching admin profile:', profileError);
          alert('Error al cargar el perfil del administrador.');
          setUser(null);
        } else {
          setUser(profile as User);
          db.setCurrentUserId(profile.id);
        }
      }
      setLoadingAuth(false);
    } else {
      alert('Código de administrador incorrecto.');
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setLoadingAuth(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    }
    setUser(null);
    db.logout();
    setLoadingAuth(false);
  }, []);

  const currentUserNotifications = useMemo(() => {
    if (!user) return [];
    return notifications.filter(n => !n.user_id || n.user_id === user.id);
  }, [notifications, user]);

  const markNotificationsAsRead = useCallback(() => {
    if (!user) return;
    setNotifications(prev => prev.map(n => {
        if (!n.user_id || n.user_id === user.id) return { ...n, read: true };
        return n;
    }));
  }, [user]);

  const deleteNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const submitAvailability = useCallback((userId: string, weeks: { weekIndex: number, slot: AvailabilitySlot, saturday_available: boolean }[]) => {
    const newAvails: Availability[] = weeks.map(w => ({
      id: Math.floor(Math.random() * 1000000),
      user_id: userId,
      week_start: `WEEK-${w.weekIndex}`, 
      slot: w.slot,
      saturday_available: w.saturday_available
    }));
    setAvailabilities(prev => [...prev.filter(a => a.user_id !== userId), ...newAvails]);
  }, []);

  const handleAutoPlanManual = useCallback(() => {
    const targetMonthPrefix = currentMonth === '2026-01' ? '2026-01' : '2026-02';
    const monthShifts = shifts.filter(s => s.date.startsWith(targetMonthPrefix));
    
    let newAssignments: Assignment[] = [];
    let userLoad: Record<string, number> = {};
    users.forEach(u => userLoad[u.id] = assignments.filter(a => a.user_id === u.id).length);

    monthShifts.forEach(shift => {
      // Si el turno ya tiene gente asignada, saltar (o completar hasta max_people)
      const currentAssigned = assignments.filter(a => a.shift_id === shift.id).length + 
                              newAssignments.filter(a => a.shift_id === shift.id).length;
      if (currentAssigned >= shift.max_people) return;

      const dateObj = new Date(shift.date);
      const isSaturday = dateObj.getDay() === 6;
      
      // Encontrar a qué semana (1-5) pertenece el día
      const dayOfMonth = dateObj.getDate();
      const weekIndex = Math.ceil(dayOfMonth / 7);
      const weekKey = `WEEK-${weekIndex}`;

      const hour = parseInt(shift.start_time.split(':')[0]);
      const isMorning = hour < 14;

      // Filtrar candidatos disponibles
      const candidates = users.filter(u => {
        if (u.role === Role.COORD) return false;
        
        // Evitar asignar a alguien que ya está en este turno
        const alreadyInShift = assignments.some(a => a.shift_id === shift.id && a.user_id === u.id) || 
                               newAssignments.some(a => a.shift_id === shift.id && a.user_id === u.id);
        if (alreadyInShift) return false;

        const avail = availabilities.find(a => a.user_id === u.id && a.week_start === weekKey);
        
        if (avail) {
          // Lógica con disponibilidad real proporcionada por el usuario
          if (isSaturday && !avail.saturday_available) return false;
          if (avail.slot === AvailabilitySlot.AMBOS) return true;
          if (isMorning && avail.slot === AvailabilitySlot.MANANA) return true;
          if (!isMorning && avail.slot === AvailabilitySlot.TARDE) return true;
          return false;
        } else {
          // Lógica por defecto: "asumira que puede en todos los turnos menos el sabado"
          if (isSaturday) return false;
          return true; // Disponible mañana y tarde en días laborables
        }
      });

      // Ordenar candidatos por carga de trabajo (el que menos lleva, primero)
      candidates.sort((a, b) => (userLoad[a.id] || 0) - (userLoad[b.id] || 0));

      const needed = shift.max_people - currentAssigned;
      const selected = candidates.slice(0, needed);

      selected.forEach(u => {
        newAssignments.push({
          id: Date.now() + Math.random(),
          shift_id: shift.id,
          user_id: u.id,
          status: AssignmentStatus.PENDING
        });
        userLoad[u.id] = (userLoad[u.id] || 0) + 1;
      });
    });

    if (newAssignments.length > 0) {
      setAssignments(prev => [...prev, ...newAssignments]);
      alert(`¡Autoplan completado! Se han generado ${newAssignments.length} nuevas asignaciones. Los voluntarios sin disponibilidad han sido asignados automáticamente (excepto sábados).`);
    } else {
      alert("No se han podido generar nuevas asignaciones. Comprueba que haya turnos vacíos en el mes seleccionado.");
    }
  }, [currentMonth, shifts, availabilities, users, assignments]);

  const broadcastUrgency = useCallback((fromUserId: string, shiftId: number) => {
    const shift = shifts.find(s => s.id === shiftId);
    const location = locations.find(l => l.id === shift?.location_id);
    const msg = `¡ALERTA URGENTE! Necesitamos cubrir un turno en ${location?.name} el día ${shift?.date}. ¿Alguien puede asistir?`;
    const newAlert: Alert = {
      id: Date.now(),
      user_id: fromUserId,
      shift_id: shiftId,
      type: AlertType.URGENT_CALL,
      message: msg,
      created_at: new Date().toISOString()
    };
    setAlerts(prev => [newAlert, ...prev]);
    addNotification("⚠️ Turno por cubrir", msg);
  }, [shifts, locations, addNotification]);

  const claimShift = useCallback((claimingUserId: string, alertId: number) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;
    setAssignments(prev => [...prev, {
        id: Date.now(),
        shift_id: alert.shift_id,
        user_id: claimingUserId,
        status: AssignmentStatus.CONFIRMED,
        confirmed_at: new Date().toISOString()
      }]);
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    const claimingUser = users.find(u => u.id === claimingUserId);
    addNotification("✅ Turno Cubierto", `${claimingUser?.display_name} ha aceptado el turno urgente.`, 'admin-1');
  }, [alerts, users, addNotification]);

  const unreadMessagesCount = useMemo(() => {
    if (!user) return 0;
    if (user.role === Role.COORD) {
      return messages.filter(m => !m.is_broadcast && m.to_user_id === 'admin-1' && !m.read).length;
    } else {
      return messages.filter(m => (m.is_broadcast || m.to_user_id === user.id) && !m.read).length;
    }
  }, [user, messages]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-bold">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView users={users} onAdminAuth={handleAdminAuth} onVolunteerAuth={handleVolunteerAuth} />;
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      notifications={currentUserNotifications}
      onMarkAsRead={markNotificationsAsRead}
      onDeleteNotification={deleteNotification}
      unreadMessagesCount={unreadMessagesCount}
    >
      {user.role === Role.COORD ? (
        <CoordinatorView 
          locations={locations} 
          setLocations={setLocations}
          users={users}
          setUsers={setUsers}
          shifts={shifts}
          setShifts={setShifts}
          assignments={assignments}
          setAssignments={setAssignments}
          addNotification={(t, b) => addNotification(t, b, 'admin-1')}
          alerts={alerts}
          setAlerts={setAlerts}
          availabilities={availabilities}
          messages={messages}
          onSendMessage={handleSendMessage}
          onMarkMessagesAsRead={markMessagesAsRead}
          onTransitionMonth={() => setCurrentMonth(prev => prev === '2026-01' ? '2026-02' : '2026-01')}
          currentMonthLabel={currentMonth === '2026-01' ? 'Enero 2026' : 'Febrero 2026'}
          handleAutoPlanManual={handleAutoPlanManual}
        />
      ) : (
        <UserView 
          user={user}
          locations={locations}
          users={users}
          shifts={shifts}
          assignments={assignments}
          setAssignments={setAssignments}
          addNotification={(t, b) => addNotification(t, b, user.id)}
          notifications={currentUserNotifications}
          messages={messages}
          onSendMessage={handleSendMessage}
          onMarkNotificationsAsRead={markNotificationsAsRead}
          onMarkMessagesAsRead={markMessagesAsRead}
          broadcastUrgency={broadcastUrgency}
          alerts={alerts}
          claimShift={claimShift}
          onSaveAvailability={submitAvailability}
          availabilities={availabilities}
          currentMonthLabel={currentMonth === '2026-01' ? 'Enero 2026' : 'Febrero 2026'}
        />
      )}
    </Layout>
  );
};

export default App;