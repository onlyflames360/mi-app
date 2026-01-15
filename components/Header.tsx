import React from 'react';
import { ViewType } from '../types';

interface HeaderProps {
  // currentView: ViewType; // Removed as it's no longer used directly for titles
  unreadCount?: number;
  onBellClick?: () => void;
  isOnline?: boolean;
  isSaving?: boolean;
}

const Header: React.FC<HeaderProps> = ({ unreadCount = 0, onBellClick, isOnline = true, isSaving = false }) => {
  // Removed titles as currentView is no longer passed
  // const titles: Record<ViewType, string> = {
  //   register: 'Inscripción de Voluntarios',
  //   planning: 'Planilla de Turnos PPOC',
  //   personal: 'Mis Citas Personales',
  //   calendar: 'Calendario de Turnos',
  //   users: 'Gestión de Voluntarios',
  //   stats: 'Rendimiento y Cobertura',
  //   notifications: 'Centro de Avisos',
  //   auth: 'Acceso al Sistema'
  // };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-8 shrink-0 no-print">
      <div className="flex items-center gap-3">
        {/* Removed dynamic title as currentView is no longer passed */}
        {/* <h1 className="text-sm sm:text-xl font-bold text-slate-800 truncate mr-2">{titles[currentView]}</h1> */}
        <h1 className="text-sm sm:text-xl font-bold text-slate-800 truncate mr-2">PPOC - Gestión</h1> {/* Static title */}
        {isSaving && (
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md animate-pulse">
            <i className="fa-solid fa-cloud-arrow-up text-[10px]"></i>
            <span className="text-[9px] font-bold uppercase tracking-tighter">Guardando...</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Indicador de Conexión y Protección de Datos */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          <span className="hidden sm:block text-[9px] font-black uppercase tracking-widest text-slate-400">
            {isOnline ? 'Datos Protegidos' : 'Modo Local'}
          </span>
          <i className="fa-solid fa-shield-halved text-[10px] text-slate-300 ml-1"></i>
        </div>

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

        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
        
        <div className="flex items-center gap-3">
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