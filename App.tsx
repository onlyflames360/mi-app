
import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { ViewType, Role, User, AppNotification } from './types';
import Sidebar from './components/Sidebar';
import UserTasks from './components/UserTasks';
import UserAvailability from './components/UserAvailability';
import UserNotifications from './components/UserNotifications';
import UserMessaging from './components/UserMessaging';
import UserProfile from './components/UserProfile';
import CoordUsers from './components/CoordUsers';
import CoordPlanning from './components/CoordPlanning';
import CoordStats from './components/CoordStats';
import CoordNotifications from './components/CoordNotifications';
import CoordCalendar from './components/CoordCalendar';
import CoordMessaging from './components/CoordMessaging';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.USER_TASKS);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [hasEntered, setHasEntered] = useState(false);
  
  // Install PWA State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // Login States
  const [loginSearch, setLoginSearch] = useState('');
  const [selectedUserForPass, setSelectedUserForPass] = useState<User | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passError, setPassError] = useState(false);

  const loadNotifications = () => {
    if (!currentUser) return;
    const allNotifs = db.getNotifications();
    const mine = allNotifs.filter(n => n.destinatarios.includes(currentUser.id) || n.destinatarios.includes('all'));
    setNotifs(mine);
  };

  const loadUser = () => {
    const userId = db.getCurrentUserId();
    const users = db.getUsers();
    if (userId) {
      const found = users.find(u => u.id === userId);
      if (found) {
        setCurrentUser(found);
        setHasEntered(true);
      }
    }
  };

  useEffect(() => {
    loadUser();

    // Capturar evento de instalación PWA
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });
  }, []);

  // Sincronizar notificaciones cada 3 segundos o cuando cambie el usuario
  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 3000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  const handleRoleSwitch = (role: Role) => {
    const users = db.getUsers();
    const nextUser = users.find(u => u.rol === role);
    if (nextUser) {
      if (role === 'coordinador') {
        setSelectedUserForPass(nextUser);
        setPasswordInput('');
        setPassError(false);
      } else {
        db.setCurrentUserId(nextUser.id);
        setCurrentUser(nextUser);
        setCurrentView(ViewType.USER_TASKS);
      }
    }
  };

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
    setSelectedUserForPass(null);
    setHasEntered(false);
  };

  const attemptLogin = (u: User) => {
    if (u.rol === 'coordinador') {
      setSelectedUserForPass(u);
      setPasswordInput('');
      setPassError(false);
    } else {
      db.setCurrentUserId(u.id);
      setCurrentUser(u);
      setCurrentView(ViewType.USER_TASKS);
    }
  };

  const verifyPassword = () => {
    if (passwordInput === '1914' && selectedUserForPass) {
      db.setCurrentUserId(selectedUserForPass.id);
      setCurrentUser(selectedUserForPass);
      setCurrentView(selectedUserForPass.rol === 'coordinador' ? ViewType.COORD_USERS : ViewType.USER_TASKS);
      setSelectedUserForPass(null);
      setPasswordInput('');
    } else {
      setPassError(true);
    }
  };

  const renderView = () => {
    if (!currentUser) return null;
    switch (currentView) {
      case ViewType.USER_TASKS: return <UserTasks user={currentUser} />;
      case ViewType.USER_AVAILABILITY: return <UserAvailability user={currentUser} />;
      case ViewType.USER_NOTIFICATIONS: return <UserNotifications user={currentUser} />;
      case ViewType.USER_MESSAGING: return <UserMessaging user={currentUser} />;
      case ViewType.USER_PROFILE: return <UserProfile user={currentUser} onUserUpdate={setCurrentUser} />;
      case ViewType.COORD_USERS: return <CoordUsers />;
      case ViewType.COORD_PLANNING: return <CoordPlanning />;
      case ViewType.COORD_CALENDAR: return <CoordCalendar />;
      case ViewType.COORD_STATS: return <CoordStats />;
      case ViewType.COORD_NOTIFICATIONS: return <CoordNotifications />;
      case ViewType.COORD_MESSAGING: return <CoordMessaging />;
      default: return <UserTasks user={currentUser} />;
    }
  };

  // Pantalla de Bienvenida Inicial
  if (!hasEntered && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-0 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]"></div>
        
        <div className="max-w-xl w-full bg-white rounded-[3rem] p-10 md:p-16 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] text-center animate-in zoom-in duration-700 relative z-10 border border-white/20">
          <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 mx-auto mb-10 transform -rotate-6">
            <i className="fa-solid fa-layer-group text-white text-4xl"></i>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
            Bienvenidos a la <span className="text-blue-600">PPOC</span>
          </h1>
          
          <p className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-2">La Barbera</p>
          <p className="text-lg font-medium text-slate-500 mb-12">Villajoyosa</p>
          
          <button 
            onClick={() => setHasEntered(true)}
            className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-500/30 transition-all active:scale-95 group flex items-center justify-center gap-4"
          >
            Entrar a la Plataforma
            <i className="fa-solid fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
          </button>
          
          <div className="mt-12 flex items-center justify-center gap-6 opacity-30">
            <i className="fa-solid fa-calendar-check text-2xl"></i>
            <i className="fa-solid fa-user-group text-2xl"></i>
            <i className="fa-solid fa-shield-halved text-2xl"></i>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de Selección de Usuario (Login)
  if (!currentUser) {
    const users = db.getUsers();
    const filteredUsers = users.filter(u => 
      `${u.nombre} ${u.apellidos}`.toLowerCase().includes(loginSearch.toLowerCase())
    );

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden text-center">
          
          {selectedUserForPass ? (
            <div className="animate-in slide-in-from-right duration-300">
              <button 
                onClick={() => setSelectedUserForPass(null)}
                className="text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-2 font-bold text-sm"
              >
                <i className="fa-solid fa-arrow-left"></i> Volver
              </button>
              
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center text-blue-600 text-3xl shadow-inner border-4 border-white">
                  <i className="fa-solid fa-lock"></i>
                </div>
                <h2 className="text-xl font-black text-slate-800">Acceso Coordinador</h2>
                <p className="text-sm text-slate-500 font-medium">Introduce la contraseña de seguridad</p>
              </div>

              <div className="space-y-4">
                <div>
                  <input 
                    type="password"
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => { setPasswordInput(e.target.value); setPassError(false); }}
                    onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
                    placeholder="••••"
                    className={`w-full text-center text-2xl tracking-[1em] py-4 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                      passError ? 'border-red-300 bg-red-50 text-red-500' : 'border-slate-100 text-slate-700'
                    }`}
                  />
                  {passError && <p className="text-center text-red-500 text-xs font-bold mt-2">Contraseña incorrecta</p>}
                </div>

                <button 
                  onClick={verifyPassword}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all"
                >
                  Confirmar Acceso
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-left duration-300">
              <div className="flex items-center gap-4 mb-6 text-left">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <i className="fa-solid fa-layer-group text-white text-2xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-800">PPCO</h1>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Selecciona tu perfil</p>
                </div>
              </div>
              
              <div className="relative mb-6">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="text"
                  placeholder="Busca tu nombre..."
                  value={loginSearch}
                  onChange={(e) => setLoginSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                />
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar text-left">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <button 
                      key={u.id}
                      onClick={() => attemptLogin(u)}
                      className="w-full flex items-center gap-4 p-3 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                        <img src={u.avatarUrl || `https://api.dicebear.com/7.x/lorelei/svg?seed=${u.avatarSeed || u.nombre}&backgroundColor=b6e3f4,c0aede,d1d4f9`} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700">{u.nombre} {u.apellidos}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.rol}</p>
                      </div>
                      <i className="fa-solid fa-chevron-right text-slate-200 group-hover:text-blue-400 transition-colors"></i>
                    </button>
                  ))
                ) : (
                  <div className="py-10 text-center text-slate-400">
                    <i className="fa-solid fa-user-slash text-2xl mb-2 opacity-20"></i>
                    <p className="text-xs font-bold uppercase tracking-wider">No se encontraron usuarios</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                {showInstallBtn ? (
                  <button 
                    onClick={handleInstallClick}
                    className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200"
                  >
                    <i className="fa-brands fa-android text-lg text-green-400"></i>
                    Instalar App en Android
                    <i className="fa-solid fa-download"></i>
                  </button>
                ) : (
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PWA de Gestión de Turnos</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Interfaz Principal (App Dashboard)
  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-900 font-sans">
      {/* Overlay for password prompt when switching role from sidebar */}
      {selectedUserForPass && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300">
            <button 
              onClick={() => setSelectedUserForPass(null)}
              className="text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-2 font-bold text-sm"
            >
              <i className="fa-solid fa-xmark"></i> Cancelar
            </button>
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center text-blue-600 text-3xl shadow-inner border-4 border-white">
                <i className="fa-solid fa-lock"></i>
              </div>
              <h2 className="text-xl font-black text-slate-800">Acceso Coordinador</h2>
              <p className="text-sm text-slate-500 font-medium">Confirma tu identidad para el rol Coordinador</p>
            </div>
            <div className="space-y-4 text-center">
              <input 
                type="password"
                autoFocus
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPassError(false); }}
                onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
                placeholder="Contraseña"
                className={`w-full text-center text-xl py-4 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                  passError ? 'border-red-300 bg-red-50 text-red-500' : 'border-slate-100 text-slate-700'
                }`}
              />
              {passError && <p className="text-center text-red-500 text-xs font-bold">Contraseña incorrecta</p>}
              <button 
                onClick={verifyPassword}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all"
              >
                Ingresar
              </button>
            </div>
          </div>
        </div>
      )}

      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        user={currentUser}
        onRoleSwitch={handleRoleSwitch}
        unreadCount={notifs.filter(n => !n.leida).length}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto pb-20">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Hola, {currentUser.nombre} 👋
              </h1>
              <p className="text-slate-500 font-medium">
                {currentUser.rol === 'coordinador' ? 'Panel de Gestión Estratégica' : 'Gestión de tus turnos y tareas'}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado Local</p>
                <div className="flex items-center gap-2 justify-end">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-bold text-slate-600">Sincronizado</span>
                </div>
              </div>
            </div>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
