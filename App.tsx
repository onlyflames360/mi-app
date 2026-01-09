
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ViewType, Shift, User, ShiftStatus, AuthRole, WeeklyAvailability } from './types';
import { MOCK_USERS, generateRealShifts } from './constants';
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

const App: React.FC = () => {
  const [authRole, setAuthRole] = useState<AuthRole>('guest');
  const [currentView, setCurrentView] = useState<ViewType>('auth');
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [shifts, setShifts] = useState<Shift[]>([]); 
  const [toasts, setToasts] = useState<any[]>([]);
  const [viewDate, setViewDate] = useState(new Date());

  const unreadNotificationsCount = useMemo(() => {
    if (authRole === 'admin') {
      return shifts.filter(s => s.isReassignmentOpen).length;
    } else if (authRole === 'volunteer' && loggedUser) {
      const pendingMyConfirmation = shifts.filter(s => 
        s.assignedUsers.some(au => au.userId === loggedUser.id && au.status === ShiftStatus.PENDING)
      ).length;
      const openForEveryone = shifts.filter(s => s.isReassignmentOpen).length;
      return pendingMyConfirmation + openForEveryone;
    }
    return 0;
  }, [shifts, authRole, loggedUser]);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const playNotificationSound = (type: 'info' | 'success' | 'alert') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      const now = audioCtx.currentTime;
      
      if (type === 'alert') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, now);
        oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.1);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
      } else {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, now);
        oscillator.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
      }
      oscillator.start(now);
      oscillator.stop(now + 0.3);
      if (navigator.vibrate) {
        navigator.vibrate(type === 'alert' ? [100, 50, 100] : 50);
      }
    } catch (e) {}
  };

  const addToast = (message: string, type: 'info' | 'success' | 'alert') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    playNotificationSound(type);

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Carrito Alerta", {
        body: message,
        silent: false
      });
    }

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleAdminAccess = (code: string) => {
    if (code === '1914') {
      setAuthRole('admin');
      setCurrentView('planning');
      addToast("Acceso de Coordinador concedido", "success");
    } else {
      alert("Código incorrecto");
    }
  };

  const handleVolunteerAccess = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setLoggedUser(user);
      setAuthRole('volunteer');
      setCurrentView('personal');
      addToast(`Sesión iniciada como ${user.name}`, "info");
    }
  };

  const handleLogout = () => {
    setAuthRole('guest');
    setLoggedUser(null);
    setCurrentView('auth');
  };

  const handleRandomize = useCallback(() => {
    if (users.length < 2) {
      alert(`Necesitas al menos 2 voluntarios registrados para generar una planilla.`);
      return;
    }
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const newShifts = generateRealShifts(users, year, month);
    setShifts(prev => {
      const otherMonths = prev.filter(s => {
        const d = new Date(s.date);
        return d.getFullYear() !== year || d.getMonth() !== month;
      });
      return [...otherMonths, ...newShifts];
    });
    addToast(`Planilla de ${viewDate.toLocaleDateString('es-ES', {month: 'long'})} generada`, "success");
  }, [users, viewDate]);

  const handleAdminCancelShift = (shiftId: string, reason: string) => {
    setShifts(prev => prev.map(shift => {
      if (shift.id === shiftId) {
        const newAssigned = shift.assignedUsers.map(au => ({ ...au, status: ShiftStatus.CANCELLED }));
        return { 
          ...shift, 
          assignedUsers: newAssigned, 
          isCancelledByAdmin: true, 
          cancellationReason: reason,
          isReassignmentOpen: false 
        };
      }
      return shift;
    }));
    addToast(`Turno suspendido por la coordinación`, "alert");
  };

  const handleRegisterUser = (name: string, surname: string, alerts: boolean) => {
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: `${name.toUpperCase()} ${surname.toUpperCase()}`,
      shiftsFulfilled: 0,
      shiftsFailed: 0,
      shiftsCovered: 0,
      isAvailable: true,
      notificationsEnabled: alerts,
      availableForNextMonth: false
    };
    setUsers(prev => [newUser, ...prev]);
    addToast(`Voluntario registrado: ${newUser.name}`, "success");
    setCurrentView('users');
  };

  const handleConfirmShift = (shiftId: string, userId: string) => {
    setShifts(prev => prev.map(shift => {
      if (shift.id === shiftId) {
        const newAssigned = shift.assignedUsers.map(au => 
          au.userId === userId ? { ...au, status: ShiftStatus.CONFIRMED } : au
        );
        return { ...shift, assignedUsers: newAssigned };
      }
      return shift;
    }));
    addToast("Asistencia confirmada", "success");
  };

  const handleCancelShift = (shiftId: string, userId: string) => {
    setShifts(prev => prev.map(shift => {
      if (shift.id === shiftId) {
        const newAssigned = shift.assignedUsers.map(au => 
          au.userId === userId ? { ...au, status: ShiftStatus.CANCELLED } : au
        );
        return { ...shift, assignedUsers: newAssigned, isReassignmentOpen: !shift.isCancelledByAdmin };
      }
      return shift;
    }));
    addToast(`URGENTE: Baja en turno. Buscando cobertura.`, "alert");
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
    addToast("¡Turno cubierto con éxito!", "success");
    setCurrentView('personal');
  };

  const handleResetHistory = () => {
    setShifts(prev => prev.map(s => ({
      ...s,
      isReassignmentOpen: false,
      assignedUsers: s.assignedUsers.map(au => 
        au.status === ShiftStatus.CANCELLED ? { ...au, status: ShiftStatus.OPEN } : au
      )
    })));
    addToast("Historial de bajas reseteado", "info");
  };

  const renderContent = () => {
    if (currentView === 'auth') {
      return <AuthView users={users} onAdminAuth={handleAdminAccess} onVolunteerAuth={handleVolunteerAccess} />;
    }

    switch (currentView) {
      case 'register':
        return <RegistrationView onRegister={handleRegisterUser} onGoToPlanning={() => setCurrentView('users')} />;
      case 'planning':
        return (
          <PlanningView 
            shifts={shifts} 
            users={users} 
            onRandomize={handleRandomize} 
            onAddManualShift={(s) => {
              setShifts([...shifts, s]);
              addToast("Turno manual creado", "info");
            }}
            onUpdateShift={(s) => setShifts(shifts.map(sh => sh.id === s.id ? s : sh))}
            isAdmin={authRole === 'admin'}
            viewDate={viewDate}
            onViewDateChange={setViewDate}
          />
        );
      case 'personal':
        return (
          <PersonalShiftsView 
            shifts={shifts} 
            users={users} 
            loggedUser={loggedUser} 
            onConfirm={handleConfirmShift} 
            onCancel={handleCancelShift} 
            unreadCount={unreadNotificationsCount}
          />
        );
      case 'calendar':
        return (
          <CalendarView 
            shifts={shifts} 
            users={users} 
            onCancel={handleCancelShift} 
            onConfirm={handleConfirmShift} 
            onAdminCancel={handleAdminCancelShift}
            isAdmin={authRole === 'admin'}
            filterUserId={authRole === 'volunteer' ? loggedUser?.id : undefined}
            viewDate={viewDate}
            onViewDateChange={setViewDate}
          />
        );
      case 'users':
        return <UserDirectory users={users} onAddUser={() => setCurrentView('register')} />;
      case 'stats':
        return <DashboardStats users={users} shifts={shifts} onResetHistory={handleResetHistory} />;
      case 'notifications':
        return (
          <NotificationsView 
            shifts={shifts} 
            users={users} 
            loggedUser={loggedUser}
            isAdmin={authRole === 'admin'}
            isLastWeekOfMonth={true}
            onConfirmShift={handleConfirmShift}
            onCancelShift={handleCancelShift}
            onAcceptCoverage={handleAcceptCoverage}
            onToggleAlerts={() => {}}
            onConfirmAvailability={() => {}}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {authRole !== 'guest' && (
        <Sidebar currentView={currentView} onViewChange={setCurrentView} authRole={authRole} onLogout={handleLogout} unreadCount={unreadNotificationsCount} />
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {authRole !== 'guest' && (
          <Header 
            currentView={currentView} 
            unreadCount={unreadNotificationsCount} 
            onBellClick={() => setCurrentView('notifications')} 
          />
        )}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-8 hide-scrollbar safe-bottom">
          <div className="mx-auto max-w-7xl h-full">
            {renderContent()}
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
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
               <i className={`fa-solid ${t.type === 'alert' ? 'fa-triangle-exclamation animate-bounce text-sm' : t.type === 'success' ? 'fa-check text-sm' : 'fa-bell text-sm'}`}></i>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Aviso Crítico</p>
              <p className="text-xs sm:text-sm font-bold leading-tight">{t.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
