
import React from 'react';
import { ViewType } from '../types';

interface HeaderProps {
  currentView: ViewType;
  unreadCount?: number;
  onBellClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, unreadCount = 0, onBellClick }) => {
  const titles: Record<ViewType, string> = {
    register: 'Inscripción de Voluntarios',
    planning: 'Planilla de Turnos PPOC',
    personal: 'Mis Citas Personales',
    calendar: 'Calendario de Turnos',
    users: 'Gestión de Voluntarios',
    stats: 'Rendimiento y Cobertura',
    notifications: 'Centro de Avisos',
    auth: 'Acceso al Sistema'
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shrink-0 no-print">
      <h1 className="text-xl font-bold text-slate-800">{titles[currentView]}</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={onBellClick}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all relative ${
              unreadCount > 0 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <i className={`fa-solid fa-bell ${unreadCount > 0 ? 'animate-swing' : ''}`}></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 border-2 border-white rounded-full text-[10px] font-black text-white flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold leading-none">Usuario Conectado</p>
            <p className="text-xs text-slate-400 mt-1">Sincronizado</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-slate-200">
            <i className="fa-solid fa-user-check text-xs"></i>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-15deg); }
          60% { transform: rotate(10deg); }
          80% { transform: rotate(-10deg); }
        }
        .animate-swing {
          animation: swing 2s infinite;
        }
      `}</style>
    </header>
  );
};

export default Header;
