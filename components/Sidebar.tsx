
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
    { id: ViewType.USER_MESSAGING, icon: 'fa-comment-dots', label: 'Mensajería' },
    { id: ViewType.USER_PROFILE, icon: 'fa-circle-user', label: 'Perfil' },
    { id: ViewType.USER_NOTIFICATIONS, icon: 'fa-bell', label: 'Notificaciones', badge: unreadCount },
  ];

  const coordItems: SidebarItem[] = [
    { id: ViewType.COORD_USERS, icon: 'fa-users', label: 'Usuarios' },
    { id: ViewType.COORD_PLANNING, icon: 'fa-calendar-plus', label: 'Planificación' },
    { id: ViewType.COORD_CALENDAR, icon: 'fa-calendar-days', label: 'Calendario' },
    { id: ViewType.COORD_MESSAGING, icon: 'fa-paper-plane', label: 'Comunicación' },
    { id: ViewType.COORD_NOTIFICATIONS, icon: 'fa-bell', label: 'Alertas', badge: unreadCount },
    { id: ViewType.COORD_STATS, icon: 'fa-chart-pie', label: 'Estadísticas' },
  ];

  const items = isCoord ? coordItems : userItems;

  const avatarUrl = user.avatarUrl || `https://api.dicebear.com/7.x/lorelei/svg?seed=${user.avatarSeed || user.nombre}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

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
        {items.map(item => {
          const isNotifItem = item.id === ViewType.USER_NOTIFICATIONS || item.id === ViewType.COORD_NOTIFICATIONS;
          const hasUnread = isNotifItem && unreadCount > 0;
          const isActive = currentView === item.id;

          const containerClasses = isActive 
            ? (hasUnread ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700')
            : 'hover:bg-slate-50 text-slate-500';

          const iconWrapperClasses = isActive
            ? (hasUnread ? 'bg-red-100 text-red-600 shadow-sm' : 'bg-blue-100 text-blue-600 shadow-sm')
            : (hasUnread ? 'bg-red-50 text-red-500 animate-pulse shadow-sm' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600');

          const labelClasses = `hidden md:block text-sm font-bold truncate ${hasUnread && !isActive ? 'text-red-600' : ''}`;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group relative ${containerClasses}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${iconWrapperClasses}`}>
                <i className={`fa-solid ${item.icon} ${hasUnread ? 'scale-110' : ''}`}></i>
              </div>
              <span className={labelClasses}>
                {item.label}
              </span>
              
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`absolute top-2 right-2 md:right-4 bg-red-600 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1.5 flex items-center justify-center rounded-full ring-2 ring-white shadow-md animate-in zoom-in duration-300`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-3">
        {/* MongoDB Status Indicator (Coordinador) */}
        {isCoord && (
          <div className="hidden md:block bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">MongoDB Cloud</p>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-600 truncate">cluster0.f77u9i2</p>
          </div>
        )}

        <div className="hidden md:block bg-slate-50 p-3 rounded-xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Cambiar Rol (Demo)</p>
          <div className="flex gap-2">
            <button 
              onClick={() => onRoleSwitch('usuario')}
              className={`flex-1 py-1 text-[10px] font-bold rounded shadow-sm transition-colors ${user.rol === 'usuario' ? 'bg-white text-slate-800 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >User</button>
            <button 
              onClick={() => onRoleSwitch('coordinador')}
              className={`flex-1 py-1 text-[10px] font-bold rounded shadow-sm transition-colors ${user.rol === 'coordinador' ? 'bg-white text-slate-800 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >Coord</button>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 md:p-0">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => onViewChange(ViewType.USER_PROFILE)}>
            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-sm">
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
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
