
import React from 'react';

interface WelcomeViewProps {
  onEnter: () => void;
  isInstallable?: boolean;
  onInstall?: () => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onEnter, isInstallable, onInstall }) => {
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-end p-8 overflow-hidden bg-slate-900">
      {/* Imagen de fondo de Villajoyosa */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20000ms] hover:scale-125"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1629161911470-3507d6741743?q=80&w=2070&auto=format&fit=crop")',
          filter: 'brightness(0.65) contrast(1.1)'
        }}
      />
      
      {/* Overlay Degradado */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

      {/* Contenido */}
      <div className="relative z-10 w-full max-w-md text-center mb-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className="mb-6 inline-flex p-5 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-2xl">
          <i className="fa-solid fa-location-dot text-white text-4xl"></i>
        </div>
        
        <h1 className="text-7xl font-black text-white tracking-tighter uppercase mb-2 drop-shadow-2xl">
          PPOC
        </h1>
        <p className="text-indigo-300 font-bold uppercase tracking-[0.4em] text-[10px] mb-12 leading-relaxed drop-shadow-lg">
          Gestión de Turnos • Villajoyosa
        </p>

        <div className="space-y-4">
          <button 
            onClick={onEnter}
            className="group relative w-full py-6 bg-white text-slate-900 rounded-[2.5rem] font-black text-sm uppercase tracking-widest overflow-hidden transition-all hover:scale-[1.03] active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              Entrar a Gestionar
              <i className="fa-solid fa-arrow-right-long group-hover:translate-x-2 transition-transform"></i>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
          </button>

          {isInstallable && onInstall && (
            <button 
              onClick={onInstall}
              className="w-full py-4 bg-indigo-600/20 backdrop-blur-md border border-white/20 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600/40 transition-all flex items-center justify-center gap-3"
            >
              <i className="fa-solid fa-mobile-screen-button"></i>
              Instalar en el dispositivo
            </button>
          )}
        </div>

        <div className="mt-10 flex flex-col items-center gap-2">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">
            Sistema de Coordinación Oficial
          </p>
          <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default WelcomeView;
