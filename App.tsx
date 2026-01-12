
import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { ViewType, Role, User, Notification as AppNotification } from './types';
import Sidebar from './components/Sidebar';
import UserTasks from './components/UserTasks';
import UserAvailability from './components/UserAvailability';
import UserNotifications from './components/UserNotifications';
import CoordUsers from './components/CoordUsers';
import CoordPlanning from './components/CoordPlanning';
import CoordStats from './components/CoordStats';
import CoordNotifications from './components/CoordNotifications';
import CoordCalendar from './components/CoordCalendar';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.USER_TASKS);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  
  // Login States
  const [loginSearch, setLoginSearch] = useState('');
  const [selectedUserForPass, setSelectedUserForPass] = useState<User | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passError, setPassError] = useState(false);

  const loadUser = () => {
    const userId = db.getCurrentUserId();
    const users = db.getUsers();
    if (userId) {
      const found = users.find(u => u.id === userId);
      if (found) {
        setCurrentUser(found);
        setNotifs(db.getNotifications().filter(n => n.destinatarios.includes(found.id) || n.destinatarios.includes('all')));
        return;
      }
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

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
      case ViewType.COORD_USERS: return <CoordUsers />;
      case ViewType.COORD_PLANNING: return <CoordPlanning />;
      case ViewType.COORD_CALENDAR: return <CoordCalendar />;
      case ViewType.COORD_STATS: return <CoordStats />;
      case ViewType.COORD_NOTIFICATIONS: return <CoordNotifications />;
      default: return <UserTasks user={currentUser} />;
    }
  };

  if (!currentUser) {
    const users = db.getUsers();
    const filteredUsers = users.filter(u => 
      `${u.nombre} ${u.apellidos}`.toLowerCase().includes(loginSearch.toLowerCase())
    );

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500 overflow-hidden text-center">
          
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
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Acceso</p>
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
              
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <button 
                      key={u.id}
                      onClick={() => attemptLogin(u)}
                      className="w-full flex items-center gap-4 p-3 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-white overflow-hidden shrink-0 border border-slate-200 shadow-sm">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.nombre}&backgroundColor=ffffff&topType=${u.genero === 'femenino' ? 'longHair,bob,curly' : 'shortHair,theCaesar,frizzle'}`} alt="avatar" />
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
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PWA de Gestión de Turnos</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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
