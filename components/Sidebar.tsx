
import React from 'react';
import { ViewType, Role, User } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (v: ViewType) => void;
  user: User;
  onRoleSwitch: (r: Role) => void;
  unreadCount: number;
  onLogout: () => void;
}

interface SidebarItem {
  id: ViewType;
  icon: string;
  label: string;
  badge?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, user, onRoleSwitch, unreadCount, onLogout }) => {
  const isCoord = user.rol === 'coordinador';

  const userItems: SidebarItem[] = [
    { id: ViewType.USER_TASKS, icon: 'fa-calendar-check', label: 'Tareas' },
    { id: ViewType.USER_AVAILABILITY, icon: 'fa-clock', label: 'Disponibilidad' },
    { id: ViewType.USER_NOTIFICATIONS, icon: 'fa-bell', label: 'Notificaciones', badge: unreadCount },
  ];

  const coordItems: SidebarItem[] = [
    { id: ViewType.COORD_USERS, icon: 'fa-users', label: 'Usuarios' },
    { id: ViewType.COORD_PLANNING, icon: 'fa-calendar-plus', label: 'Planificación' },
    { id: ViewType.COORD_CALENDAR, icon: 'fa-calendar-days', label: 'Calendario' },
    { id: ViewType.COORD_NOTIFICATIONS, icon: 'fa-clipboard-list', label: 'Alertas' },
    { id: ViewType.COORD_STATS, icon: 'fa-chart-pie', label: 'Estadísticas' },
  ];

  const items = isCoord ? coordItems : userItems;

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nombre}&backgroundColor=ffffff&topType=${user.genero === 'femenino' ? 'longHair,bob,curly' : 'shortHair,theCaesar,frizzle'}`;

  return (
    <aside className="w-20 md:w-64 bg-white border-r border-slate-200 h-screen flex flex-col sticky top-0 transition-all z-40">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
          <i className="fa-solid fa-layer-group text-white text-xl"></i>
        </div>
        <div className="hidden md:block">
          <h1 className="font-black text-slate-800 leading-none">PPCO</h1>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Turnos v1.0</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group relative ${
              currentView === item.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-500'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              currentView === item.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'
            }`}>
              <i className={`fa-solid ${item.icon}`}></i>
            </div>
            <span className="hidden md:block text-sm font-bold truncate">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-2 right-2 md:right-4 bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="hidden md:block bg-slate-50 p-3 rounded-xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Cambiar Rol (Demo)</p>
          <div className="flex gap-2">
            <button 
              onClick={() => onRoleSwitch('usuario')}
              className={`flex-1 py-1 text-[10px] font-bold rounded shadow-sm ${user.rol === 'usuario' ? 'bg-white text-slate-800' : 'text-slate-500'}`}
            >User</button>
            <button 
              onClick={() => onRoleSwitch('coordinador')}
              className={`flex-1 py-1 text-[10px] font-bold rounded shadow-sm ${user.rol === 'coordinador' ? 'bg-white text-slate-800' : 'text-slate-500'}`}
            >Coord</button>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 md:p-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-white overflow-hidden shrink-0 border border-slate-200 shadow-sm">
              <img src={avatarUrl} alt="avatar" />
            </div>
            <div className="hidden md:block overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user.nombre}</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase">{user.rol}</p>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            title="Cerrar sesión"
            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
