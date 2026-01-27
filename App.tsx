
import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { ViewType, User, AppNotification } from './types';
import Sidebar from './components/Sidebar';
import UserTasks from './components/UserTasks';
import UserAvailability from './components/UserAvailability';
import UserNotifications from './components/UserNotifications';
import UserMessaging from './components/UserMessaging';
import UserProfile from './components/UserProfile';
import CoordUsers from './components/CoordUsers';
import CoordPlanning from './components/CoordPlanning';
import CoordCalendar from './components/CoordCalendar';
import CoordStats from './components/CoordStats';
import CoordNotifications from './components/CoordNotifications';
import CoordMessaging from './components/CoordMessaging';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.USER_TASKS);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(true);
  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState<User | null>(null);
  
  const refreshUsers = async () => {
    try {
      const users = await db.getUsers();
      setAllUsers(users);
      return users;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  useEffect(() => {
    if (!db.isConfigured()) {
      setConfigError("Faltan las variables de entorno de Supabase.");
      setIsLoadingData(false);
      return;
    }

    const initApp = async () => {
      try {
        const users = await refreshUsers();
        const savedId = db.getCurrentUserId();
        
        if (savedId) {
          const found = users.find(u => u.id === savedId);
          if (found) {
            setCurrentUser(found);
            setIsLoggingIn(false);
          }
        }
      } catch (e) {
        console.error("Error inicializando la app:", e);
      } finally {
        setIsLoadingData(false);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (currentUser && db.isConfigured()) {
      const fetchNotifs = async () => {
        const all = await db.getNotifications();
        const mine = all.filter(n => n.destinatarios.includes(currentUser.id) || n.destinatarios.includes('all'));
        setNotifs(mine);
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    if (user.rol === 'coordinador') {
      setShowPinModal(user);
    } else {
      setCurrentUser(user);
      db.setCurrentUserId(user.id);
      setIsLoggingIn(false);
    }
  };

  const verifyPin = () => {
    if (pin === '1914' && showPinModal) {
      setCurrentUser(showPinModal);
      db.setCurrentUserId(showPinModal.id);
      setIsLoggingIn(false);
      setShowPinModal(null);
      setPin('');
    } else {
      alert("PIN Incorrecto");
      setPin('');
    }
  };

  const handleSeed = async () => {
    setIsLoadingData(true);
    const admin = await db.seedInitialAdmin();
    if (admin) {
      await refreshUsers();
    }
    setIsLoadingData(false);
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-blue-100 font-black tracking-widest uppercase text-xs">PPCO La Barbera</p>
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] border border-red-100 shadow-xl text-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
            <i className="fa-solid fa-database"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4">Configuración Requerida</h2>
          <p className="text-slate-500 mb-6 font-medium">Conecta Supabase para activar la app.</p>
        </div>
      </div>
    );
  }

  if (isLoggingIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-['Plus_Jakarta_Sans']">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12 animate-in">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 mx-auto mb-6">
              <i className="fa-solid fa-layer-group text-white text-3xl"></i>
            </div>
            <h1 className="text-4xl font-black text-white mb-2">PPCO La Barbera</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Gestión Proactiva de Turnos</p>
          </div>

          {allUsers.length === 0 ? (
            <div className="bg-slate-900 p-12 rounded-[3rem] border border-slate-800 text-center shadow-2xl">
              <i className="fa-solid fa-user-slash text-4xl text-slate-700 mb-6"></i>
              <h2 className="text-xl font-black text-white mb-4">Sistema vacío</h2>
              <button 
                onClick={handleSeed}
                className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
              >
                Crear Coordinador Inicial
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in">
              {allUsers.map(u => (
                <button 
                  key={u.id}
                  onClick={() => handleLogin(u)}
                  className="group bg-slate-900 hover:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-800 hover:border-blue-500/50 transition-all text-left shadow-xl"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden group-hover:scale-110 transition-transform">
                      <img 
                        src={u.avatarUrl || `https://api.dicebear.com/7.x/lorelei/svg?seed=${u.avatarSeed || u.nombre}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                        alt="av" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <p className="text-white font-black text-lg leading-tight">{u.nombre}</p>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{u.rol}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showPinModal && (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in">
              <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl max-w-sm w-full text-center">
                <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-6">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Acceso Restringido</h3>
                <p className="text-slate-400 text-sm mb-8 font-bold">Introduce el PIN de Coordinador</p>
                <input 
                  type="password" 
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-4 text-center text-2xl font-black text-white tracking-[1em] focus:border-blue-50 outline-none transition-all mb-6"
                  maxLength={4}
                />
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setShowPinModal(null)}
                    className="py-4 bg-slate-800 text-slate-400 font-black rounded-2xl hover:bg-slate-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={verifyPin}
                    className="py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                  >
                    Entrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case ViewType.USER_TASKS: return <UserTasks user={currentUser!} />;
      case ViewType.USER_AVAILABILITY: return <UserAvailability user={currentUser!} />;
      case ViewType.USER_NOTIFICATIONS: return <UserNotifications user={currentUser!} />;
      case ViewType.USER_MESSAGING: return <UserMessaging user={currentUser!} />;
      case ViewType.USER_PROFILE: return <UserProfile user={currentUser!} onUserUpdate={setCurrentUser} />;
      case ViewType.COORD_USERS: return <CoordUsers />;
      case ViewType.COORD_PLANNING: return <CoordPlanning />;
      case ViewType.COORD_CALENDAR: return <CoordCalendar />;
      case ViewType.COORD_STATS: return <CoordStats />;
      case ViewType.COORD_NOTIFICATIONS: return <CoordNotifications />;
      case ViewType.COORD_MESSAGING: return <CoordMessaging />;
      default: return <UserTasks user={currentUser!} />;
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-['Plus_Jakarta_Sans']">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        user={currentUser!} 
        unreadCount={notifs.filter(n => !n.leida).length}
        onRoleSwitch={(r) => {
          const updated = { ...currentUser!, rol: r };
          setCurrentUser(updated);
          db.updateUser(updated);
        }}
        onLogout={() => { db.logout(); window.location.reload(); }}
      />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto animate-in">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
