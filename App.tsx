
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

const App: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSaving, setIsSaving] = useState(false);

  // Sesión persistente
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

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('carrito_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('carrito_shifts');
    return saved ? JSON.parse(saved) : [];
  });

  const [availabilitySubmissions, setAvailabilitySubmissions] = useState<{userId: string, timestamp: string}[]>(() => {
    const saved = localStorage.getItem('carrito_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const savedRole = localStorage.getItem('carrito_authRole');
    if (savedRole === 'admin') return 'planning';
    if (savedRole === 'volunteer') return 'personal';
    return 'auth';
  });

  const [toasts, setToasts] = useState<any[]>([]);
  const [viewDate, setViewDate] = useState(new Date());

  const playSound = (soundUrl: string) => {
    const audio = new Audio(soundUrl);
    audio.volume = 0.45;
    audio.play().catch(() => {});
  };

  // SINCRONIZACIÓN AUTOMÁTICA MEJORADA
  useEffect(() => {
    const syncFromLocalStorage = () => {
      const u = localStorage.getItem('carrito_users');
      const s = localStorage.getItem('carrito_shifts');
      const sub = localStorage.getItem('carrito_submissions');
      const l = localStorage.getItem('carrito_loggedUser');
      
      if (u) setUsers(JSON.parse(u));
      if (s) setShifts(JSON.parse(s));
      if (sub) setAvailabilitySubmissions(JSON.parse(sub));
      if (l) {
        const parsedLogged = JSON.parse(l);
        // Si el usuario logueado ha sido actualizado en la lista global, actualizarlo aquí también
        if (u) {
          const globalList = JSON.parse(u) as User[];
          const updated = globalList.find(user => user.id === parsedLogged.id);
          if (updated) setLoggedUser(updated);
          else setLoggedUser(parsedLogged);
        } else {
          setLoggedUser(parsedLogged);
        }
      }
    };

    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith('carrito_')) {
        syncFromLocalStorage();
        // Feedback visual sutil de sincronización
        console.log("Sincronizando cambios externos...");
      }
    });

    // Polling agresivo cada 15s para simular "tiempo real" en Vercel sin backend
    const interval = setInterval(syncFromLocalStorage, 15000);
    return () => {
      window.removeEventListener('storage', syncFromLocalStorage);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast("Conexión restablecida.", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast("Modo Offline: Datos guardados localmente.", "alert");
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToast = (message: string, type: 'info' | 'success' | 'alert') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    if (type === 'success') playSound(SOUNDS.SUCCESS);
    else if (type === 'alert') playSound(SOUNDS.ALERT);
    else playSound(SOUNDS.NOTIFICATION);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // Persistencia de estado
  useEffect(() => {
    setIsSaving(true);
    localStorage.setItem('carrito_users', JSON.stringify(users));
    localStorage.setItem('carrito_submissions', JSON.stringify(availabilitySubmissions));
    localStorage.setItem('carrito_shifts', JSON.stringify(shifts));
    localStorage.setItem('carrito_authRole', authRole);
    if (loggedUser) localStorage.setItem('carrito_loggedUser', JSON.stringify(loggedUser));
    
    const timer = setTimeout(() => setIsSaving(false), 500);
    return () => clearTimeout(timer);
  }, [users, availabilitySubmissions, shifts, authRole, loggedUser]);

  const handleAdminAccess = (code: string) => {
    if (code === '1914') {
      setAuthRole('admin');
      setCurrentView('planning');
      addToast("Acceso Coordinador.", "success");
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
      addToast(`Hola, ${user.name.split(' ')[0]}.`, "success");
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

  const handleConfirmShift = (shiftId: string, userId: string) => {
    setShifts(prev => prev.map(shift => {
      if (shift.id === shiftId) {
        return { 
          ...shift, 
          assignedUsers: shift.assignedUsers.map(au => 
            au.userId === userId ? { ...au, status: ShiftStatus.CONFIRMED } : au
          ) 
        };
      }
      return shift;
    }));
    addToast("Turno confirmado.", "success");
  };

  const handleCancelShift = (shiftId: string, userId: string) => {
    setShifts(prev => prev.map(shift => {
      if (shift.id === shiftId) {
        return { 
          ...shift, 
          assignedUsers: shift.assignedUsers.map(au => 
            au.userId === userId ? { ...au, status: ShiftStatus.CANCELLED } : au
          ), 
          isReassignmentOpen: !shift.isCancelledByAdmin 
        };
      }
      return shift;
    }));
    addToast("Baja registrada.", "alert");
  };

  const handleAcceptCoverage = (shiftId: string, userId: string) => {
    setShifts(prev => prev.map(shift => {
      if (shift.id === shiftId) {
        let replaced = false;
        const newAssigned = shift.assignedUsers.map(au => {
          if (!replaced && au.status === ShiftStatus.CANCELLED) {
            replaced = true;
            return { userId, status: ShiftStatus.CONFIRMED };
          }
          return au;
        });
        const stillNeedsCoverage = newAssigned.some(au => au.status === ShiftStatus.CANCELLED);
        return { ...shift, assignedUsers: newAssigned, isReassignmentOpen: stillNeedsCoverage };
      }
      return shift;
    }));
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, shiftsCovered: u.shiftsCovered + 1 } : u));
    addToast("¡Gracias por cubrir!", "success");
    setCurrentView('personal');
  };

  const handleConfirmAvailability = (userId: string, availability: WeeklyAvailability[]) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) return { ...u, availableForNextMonth: true, availabilityNextMonth: availability };
      return u;
    }));
    
    const now = new Date();
    const timestamp = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setAvailabilitySubmissions(prev => [{ userId, timestamp }, ...prev].slice(0, 20));

    if (loggedUser && loggedUser.id === userId) {
      setLoggedUser(prev => prev ? { ...prev, availableForNextMonth: true, availabilityNextMonth: availability } : null);
    }
    addToast("Disponibilidad enviada.", "success");
    setCurrentView('personal');
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
                  case 'register': return <RegistrationView onRegister={(n, s, a) => {
                    const nu: User = { id: `u-${Date.now()}`, name: `${n.toUpperCase()} ${s.toUpperCase()}`, shiftsFulfilled: 0, shiftsFailed: 0, shiftsCovered: 0, isAvailable: true, notificationsEnabled: a, availableForNextMonth: false };
                    setUsers(prev => [nu, ...prev]); addToast("Voluntario registrado.", "success"); setCurrentView('users');
                  }} onGoToPlanning={() => setCurrentView('users')} />;
                  case 'planning': return <PlanningView shifts={shifts} users={users} onRandomize={() => {
                    const ns = generateRealShifts(users, viewDate.getFullYear(), viewDate.getMonth());
                    setShifts(prev => [...prev.filter(s => new Date(s.date).getMonth() !== viewDate.getMonth()), ...ns]);
                    addToast("Planilla generada.", "success");
                  }} onAddManualShift={(s) => setShifts([...shifts, s])} onUpdateShift={(s) => setShifts(shifts.map(sh => sh.id === s.id ? s : sh))} isAdmin={authRole === 'admin'} viewDate={viewDate} onViewDateChange={setViewDate} />;
                  case 'personal': return <PersonalShiftsView shifts={shifts} users={users} loggedUser={loggedUser} onConfirm={handleConfirmShift} onCancel={handleCancelShift} unreadCount={unreadNotificationsCount} />;
                  case 'calendar': return <CalendarView shifts={shifts} users={users} onCancel={handleCancelShift} onConfirm={handleConfirmShift} onAdminCancel={(id, r) => {
                    setShifts(prev => prev.map(s => s.id === id ? {...s, isCancelledByAdmin: true, cancellationReason: r, isReassignmentOpen: false} : s));
                    addToast("Turno suspendido.", "alert");
                  }} isAdmin={authRole === 'admin'} filterUserId={authRole === 'volunteer' ? loggedUser?.id : undefined} viewDate={viewDate} onViewDateChange={setViewDate} />;
                  case 'users': return <UserDirectory users={users} onDeleteUser={(id) => {
                    if (window.confirm("¿Eliminar?")) { setUsers(users.filter(u => u.id !== id)); addToast("Usuario eliminado.", "info"); }
                  }} />;
                  case 'stats': return <DashboardStats users={users} shifts={shifts} onResetHistory={() => setShifts(shifts.map(s => ({...s, isReassignmentOpen: false})))} />;
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
              <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Sincronizado</p>
              <p className="text-xs sm:text-sm font-bold leading-tight">{t.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
