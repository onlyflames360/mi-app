
import React from 'react';
import { ViewType, AuthRole } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  authRole: AuthRole;
  onLogout: () => void;
  unreadCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, authRole, onLogout, unreadCount = 0 }) => {
  const adminItems = [
    { id: 'planning', label: 'Planilla PPOC', icon: 'fa-file-invoice' },
    { id: 'calendar', label: 'Calendario Global', icon: 'fa-calendar-days' },
    { id: 'users', label: 'Voluntarios', icon: 'fa-users' },
    { id: 'register', label: 'Altas de Voluntarios', icon: 'fa-user-plus' },
    { id: 'notifications', label: 'Avisos y Control', icon: 'fa-bell' },
    { id: 'stats', label: 'Estadísticas', icon: 'fa-chart-line' },
  ];

  const volunteerItems = [
    { id: 'personal', label: 'Mis Citas', icon: 'fa-user-check' },
    { id: 'calendar', label: 'Mi Calendario', icon: 'fa-calendar-day' },
    { id: 'notifications', label: 'Mis Avisos', icon: 'fa-bell' },
  ];

  const menuItems = authRole === 'admin' ? adminItems : volunteerItems;

  return (
    <div className="w-20 md:w-64 bg-slate-900 h-full flex flex-col text-white transition-all duration-300 no-print border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
          <i className="fa-solid fa-cart-shopping text-xl"></i>
        </div>
        <span className="hidden md:block font-black text-xl tracking-tighter uppercase">Carrito</span>
      </div>

      <div className="px-6 mb-4 hidden md:block">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {authRole === 'admin' ? 'Modo Coordinador' : 'Modo Voluntario'}
        </span>
      </div>

      <nav className="flex-1 mt-2 px-3 overflow-y-auto hide-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewType)}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl mb-2 transition-all group relative ${
              currentView === item.id 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-xl w-6 text-center`}></i>
            <span className="hidden md:block font-bold">{item.label}</span>
            {item.id === 'notifications' && unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-red-600 rounded-full text-[10px] font-black text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <i className="fa-solid fa-right-from-bracket text-xl w-6 text-center"></i>
          <span className="hidden md:block font-bold">Salir</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
