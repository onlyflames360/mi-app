
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ViewType, Shift, User, ShiftStatus, AuthRole, WeeklyAvailability } from './types';
import { MOCK_USERS, generateRealShifts, SOUNDS } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CalendarView from './components/CalendarView';
import UserDirectory from './components/UserDirectory';
import DashboardStats from './components/DashboardStats';
import NotificationsView from './components/NotificationsView';
import PlanningView from './components/PlanningView';
import PersonalShiftsView from './components/PersonalShiftsView';
import RegistrationView from './components/RegistrationView';
import AuthView from './components/AuthView';
import WelcomeView from './components/WelcomeView';
import { db } from './lib/firebase';
import { ref, onValue, set, update, push, child } from 'firebase/database';

const App: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sesión persistente local (Auth)
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    const savedRole = localStorage.getItem('carrito_authRole');
    return !savedRole || savedRole === 'guest';
  });

  const [authRole, setAuthRole] = useState<AuthRole>(() => {
    return (localStorage.getItem('carrito_authRole') as AuthRole) || 'guest';
  });
  
  const [loggedUser, setLoggedUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('carrito_loggedUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Estados de datos sincronizados
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [availabilitySubmissions, setAvailabilitySubmissions] = useState<{userId: string, timestamp: string}[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('auth');
  const [toasts, setToasts] = useState<any[]>([]);
  const [viewDate, setViewDate] = useState(new Date());

  const playSound = (soundUrl: string) => {
    const audio = new Audio(soundUrl);
    audio.volume = 0.45;
    audio.play().catch(() => {});
  };

  // --- SINCRONIZACIÓN FIREBASE (TIEMPO REAL) ---
  useEffect(() => {
    const usersRef = ref(db, 'users');
    const shiftsRef = ref(db, 'shifts');
    const subsRef = ref(db, 'submissions');

    setIsLoading(true);

    // Escuchar Usuarios
    const unsubUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersList = Object.values(data) as User[];
        setUsers(usersList);
        
        // Actualizar sesión si el usuario logueado cambió en el servidor
        if (loggedUser) {
          const updated = usersList.find(u => u.id === loggedUser.id);
          if (updated) setLoggedUser(updated);
        }
      }
      setIsLoading(false);
    });

    // Escuchar Turnos
    const unsubShifts = onValue(shiftsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setShifts(Object.values(data) as Shift[]);
      }
    });

    // Escuchar Envíos de Disponibilidad
    const unsubSubs = onValue(subsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const subsList = Object.values(data) as {userId: string, timestamp: string}[];
        setAvailabilitySubmissions(subsList.reverse().slice(0, 20));
      }
    });

    return () => {
      unsubUsers();
      unsubShifts();
      unsubSubs();
    };
  }, []);

  // Guardado de estado de sesión local
  useEffect(() => {
    localStorage.setItem('carrito_authRole', authRole);
    if (loggedUser) localStorage.setItem('carrito_loggedUser', JSON.stringify(loggedUser));
  }, [authRole, loggedUser]);

  const addToast = (message: string, type: 'info' | 'success' | 'alert') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    if (type === 'success') playSound(SOUNDS.SUCCESS);
    else if (type === 'alert') playSound(SOUNDS.ALERT);
    else playSound(SOUNDS.NOTIFICATION);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // --- HANDLERS (ESCRITURA EN NUBE) ---

  const handleAdminAccess = (code: string) => {
    if (code === '1914') {
      setAuthRole('admin');
      setCurrentView('planning');
      addToast("Identidad Coordinador Verificada.", "success");
    } else {
      playSound(SOUNDS.ALERT);
      alert("Código incorrecto.");
    }
  };

  const handleVolunteerAccess = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setLoggedUser(user);
      setAuthRole('volunteer');
      setCurrentView('personal');
      addToast(`Bienvenido, ${user.name.split(' ')[0]}.`, "success");
    }
  };

  const handleLogout = () => {
    if (window.confirm("¿Cerrar sesión?")) {
      playSound(SOUNDS.LOGOUT);
      setAuthRole('guest');
      setLoggedUser(null);
      setCurrentView('auth');
      setShowWelcome(true);
      localStorage.removeItem('carrito_authRole');
      localStorage.removeItem('carrito_loggedUser');
    }
  };

  const handleConfirmShift = async (shiftId: string, userId: string) => {
    setIsSaving(true);
    const updatedShifts = shifts.map(shift => {
      if (shift.id === shiftId) {
        return { 
          ...shift, 
          assignedUsers: shift.assignedUsers.map(au => 
            au.userId === userId ? { ...au, status: ShiftStatus.CONFIRMED } : au
          ) 
        };
      }
      return shift;
    });

    try {
      // En Firebase guardamos el objeto completo o por ID
      const targetShift = updatedShifts.find(s => s.id === shiftId);
      if (targetShift) {
        await set(ref(db, `shifts/${shiftId}`), targetShift);
        addToast("Turno confirmado en la nube.", "success");
      }
    } catch (e) {
      addToast("Error al sincronizar.", "alert");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelShift = async (shiftId: string, userId: string) => {
    setIsSaving(true);
    const targetShift = shifts.find(s => s.id === shiftId);
    if (targetShift) {
      const updated = {
        ...targetShift,
        assignedUsers: targetShift.assignedUsers.map(au => 
          au.userId === userId ? { ...au, status: ShiftStatus.CANCELLED } : au
        ),
        isReassignmentOpen: !targetShift.isCancelledByAdmin
      };
      await set(ref(db, `shifts/${shiftId}`), updated);
      addToast("Baja registrada y sincronizada.", "alert");
    }
    setIsSaving(false);
  };

  const handleAcceptCoverage = async (shiftId: string, userId: string) => {
    setIsSaving(true);
    const targetShift = shifts.find(s => s.id === shiftId);
    if (targetShift) {
      let replaced = false;
      const newAssigned = targetShift.assignedUsers.map(au => {
        if (!replaced && au.status === ShiftStatus.CANCELLED) {
          replaced = true;
          return { userId, status: ShiftStatus.CONFIRMED };
        }
        return au;
      });
      const updated = {
        ...targetShift,
        assignedUsers: newAssigned,
        isReassignmentOpen: newAssigned.some(au => au.status === ShiftStatus.CANCELLED)
      };
      
      const user = users.find(u => u.id === userId);
      if (user) {
        await update(ref(db, `users/${userId}`), { shiftsCovered: user.shiftsCovered + 1 });
      }
      
      await set(ref(db, `shifts/${shiftId}`), updated);
      addToast("Cobertura confirmada.", "success");
      setCurrentView('personal');
    }
    setIsSaving(false);
  };

  const handleConfirmAvailability = async (userId: string, availability: WeeklyAvailability[]) => {
    setIsSaving(true);
    const now = new Date();
    const timestamp = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    await update(ref(db, `users/${userId}`), { 
      availableForNextMonth: true, 
      availabilityNextMonth: availability 
    });
    
    await push(ref(db, 'submissions'), { userId, timestamp });
    
    addToast("Preferencias enviadas a coordinación.", "success");
    setCurrentView('personal');
    setIsSaving(false);
  };

  const handleRandomize = async () => {
    if (authRole !== 'admin') return;
    setIsSaving(true);
    const newShifts = generateRealShifts(users, viewDate.getFullYear(), viewDate.getMonth());
    
    // Guardar múltiples turnos en Firebase
    const updates: any = {};
    newShifts.forEach(s => {
      updates[`/shifts/${s.id}`] = s;
    });
    
    await update(ref(db), updates);
    addToast("Nueva planilla mensual publicada.", "success");
    setIsSaving(false);
  };

  const unreadNotificationsCount = useMemo(() => {
    if (authRole === 'admin') return shifts.filter(s => s.isReassignmentOpen).length;
    if (authRole === 'volunteer' && loggedUser) {
      const pendingMyConfirmation = shifts.filter(s => 
        s.assignedUsers.some(au => au.userId === loggedUser.id && au.status === ShiftStatus.PENDING)
      ).length;
      const openForEveryone = shifts.filter(s => s.isReassignmentOpen).length;
      return pendingMyConfirmation + openForEveryone;
    }
    return 0;
  }, [shifts, authRole, loggedUser]);

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-black uppercase tracking-widest text-xs">Sincronizando con la nube...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {showWelcome && (
        <WelcomeView 
          onEnter={() => { playSound(SOUNDS.CLICK); setShowWelcome(false); }} 
          isInstallable={!!deferredPrompt}
          onInstall={() => deferredPrompt?.prompt()}
        />
      )}

      {authRole !== 'guest' && (
        <Sidebar currentView={currentView} onViewChange={setCurrentView} authRole={authRole} onLogout={handleLogout} unreadCount={unreadNotificationsCount} />
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {authRole !== 'guest' && (
          <Header 
            currentView={currentView} 
            unreadCount={unreadNotificationsCount} 
            onBellClick={() => setCurrentView('notifications')}
            isOnline={isOnline}
            isSaving={isSaving}
          />
        )}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-8 hide-scrollbar safe-bottom">
          <div className="mx-auto max-w-7xl h-full">
            {authRole === 'guest' ? (
              <AuthView users={users} onAdminAuth={handleAdminAccess} onVolunteerAuth={handleVolunteerAccess} />
            ) : (
              (() => {
                switch (currentView) {
                  case 'register': return <RegistrationView onRegister={async (n, s, a) => {
                    const id = `u-${Date.now()}`;
                    const nu: User = { id, name: `${n.toUpperCase()} ${s.toUpperCase()}`, shiftsFulfilled: 0, shiftsFailed: 0, shiftsCovered: 0, isAvailable: true, notificationsEnabled: a, availableForNextMonth: false };
                    await set(ref(db, `users/${id}`), nu);
                    addToast("Voluntario registrado.", "success");
                    setCurrentView('users');
                  }} onGoToPlanning={() => setCurrentView('users')} />;
                  case 'planning': return <PlanningView shifts={shifts} users={users} onRandomize={handleRandomize} onAddManualShift={async (s) => await set(ref(db, `shifts/${s.id}`), s)} onUpdateShift={async (s) => await set(ref(db, `shifts/${s.id}`), s)} isAdmin={authRole === 'admin'} viewDate={viewDate} onViewDateChange={setViewDate} />;
                  case 'personal': return <PersonalShiftsView shifts={shifts} users={users} loggedUser={loggedUser} onConfirm={handleConfirmShift} onCancel={handleCancelShift} unreadCount={unreadNotificationsCount} />;
                  case 'calendar': return <CalendarView shifts={shifts} users={users} onCancel={handleCancelShift} onConfirm={handleConfirmShift} onAdminCancel={async (id, r) => {
                    const target = shifts.find(s => s.id === id);
                    if (target) {
                      await set(ref(db, `shifts/${id}`), { ...target, isCancelledByAdmin: true, cancellationReason: r, isReassignmentOpen: false });
                      addToast("Turno suspendido.", "alert");
                    }
                  }} isAdmin={authRole === 'admin'} filterUserId={authRole === 'volunteer' ? loggedUser?.id : undefined} viewDate={viewDate} onViewDateChange={setViewDate} />;
                  case 'users': return <UserDirectory users={users} onDeleteUser={async (id) => {
                    if (window.confirm("¿Eliminar voluntario?")) {
                      await set(ref(db, `users/${id}`), null);
                      addToast("Usuario eliminado.", "info");
                    }
                  }} />;
                  case 'stats': return <DashboardStats users={users} shifts={shifts} onResetHistory={() => {}} />;
                  case 'notifications': return <NotificationsView shifts={shifts} users={users} loggedUser={loggedUser} isAdmin={authRole === 'admin'} isLastWeekOfMonth={true} availabilitySubmissions={availabilitySubmissions} onConfirmShift={handleConfirmShift} onCancelShift={handleCancelShift} onAcceptCoverage={handleAcceptCoverage} onToggleAlerts={() => {}} onConfirmAvailability={handleConfirmAvailability} />;
                  default: return null;
                }
              })()
            )}
          </div>
        </main>
      </div>

      <div className="fixed top-[env(safe-area-inset-top,1rem)] right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border-2 flex items-center gap-3 animate-in slide-in-from-right duration-300 min-w-[280px] sm:min-w-[320px] ${
            t.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' : 
            t.type === 'alert' ? 'bg-red-600 border-red-400 text-white' : 
            'bg-slate-900 border-indigo-500 text-white'
          }`}>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
               <i className={`fa-solid ${t.type === 'alert' ? 'fa-triangle-exclamation' : t.type === 'success' ? 'fa-check' : 'fa-bell'}`}></i>
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Nube Protegida</p>
              <p className="text-xs sm:text-sm font-bold leading-tight">{t.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
