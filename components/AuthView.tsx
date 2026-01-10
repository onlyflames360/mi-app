
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';

interface AuthViewProps {
  users: User[];
  onAdminAuth: (code: string) => void;
  onVolunteerAuth: (userId: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ users, onAdminAuth, onVolunteerAuth }) => {
  const [adminCode, setAdminCode] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'volunteer' | 'admin'>('volunteer');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  // Manejar la detección de qué tarjeta está visible en móvil
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const width = scrollContainerRef.current.offsetWidth;
      const newActiveTab = scrollLeft < width / 2 ? 'volunteer' : 'admin';
      if (newActiveTab !== activeTab) {
        setActiveTab(newActiveTab);
      }
    }
  };

  const scrollTo = (tab: 'volunteer' | 'admin') => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: tab === 'volunteer' ? 0 : width,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-2 sm:p-4 md:p-8">
      {/* Contenedor Principal con Scroll Snapping */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="w-full max-w-6xl flex md:grid md:grid-cols-2 gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory md:overflow-visible hide-scrollbar"
      >
        
        {/* LADO VOLUNTARIO - TARJETA 1 */}
        <div className="min-w-full md:min-w-0 snap-center px-2 md:px-0">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col justify-between h-full min-h-[500px]">
            <div>
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mb-8">
                <i className="fa-solid fa-users"></i>
              </div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4 leading-none uppercase">Inicia sesión</h2>
              <p className="text-slate-500 font-medium mb-10">Busca tu nombre para acceder a tus turnos.</p>
              
              <div className="space-y-6">
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Identificación Oficial</label>
                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                    <input 
                      type="text"
                      placeholder="Escribe tu Nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700"
                    />
                  </div>
                  {searchTerm && (
                    <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-2xl mt-2 shadow-2xl z-50 overflow-hidden divide-y divide-slate-50">
                      {filteredUsers.length > 0 ? filteredUsers.map(u => (
                        <button 
                          key={u.id}
                          onClick={() => onVolunteerAuth(u.id)}
                          className="w-full px-5 py-4 text-left hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-700 text-sm uppercase">{u.name}</span>
                        </button>
                      )) : (
                        <div className="p-6 text-center">
                          <p className="text-xs font-bold text-slate-400 uppercase italic">No se encuentra tu registro.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                 Si no apareces en la lista, contacta con tu coordinador para procesar tu alta.
               </p>
            </div>
          </div>
        </div>

        {/* LADO COORDINADOR - TARJETA 2 */}
        <div className="min-w-full md:min-w-0 snap-center px-2 md:px-0">
          <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] shadow-2xl text-white flex flex-col justify-between h-full min-h-[500px] relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 text-white rounded-3xl flex items-center justify-center text-3xl mb-8">
                <i className="fa-solid fa-screwdriver-wrench"></i>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tight mb-4 leading-none uppercase">Coordinación</h2>
              <p className="text-slate-400 font-medium mb-10">Acceso para gestionar la planilla y nuevas altas.</p>

              {!showAdminPanel ? (
                <button 
                  onClick={() => setShowAdminPanel(true)}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40"
                >
                  Acceso Administrador
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Código de Seguridad</label>
                  <div className="flex gap-2">
                    <input 
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      autoFocus
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onAdminAuth(adminCode)}
                      placeholder="••••"
                      className="flex-1 min-w-0 px-3 sm:px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl focus:border-indigo-500 outline-none font-black text-2xl tracking-[0.5em] sm:tracking-[1em] text-center"
                    />
                    <button 
                      onClick={() => onAdminAuth(adminCode)}
                      className="shrink-0 w-14 sm:w-16 h-14 sm:h-16 bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-900/20"
                    >
                      <i className="fa-solid fa-arrow-right text-xl"></i>
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowAdminPanel(false)}
                    className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
                  >
                    <i className="fa-solid fa-chevron-left text-[8px]"></i> Volver atrás
                  </button>
                </div>
              )}
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      {/* Indicadores de Paginación (Solo Móvil) */}
      <div className="flex md:hidden items-center justify-center gap-3 mt-8">
        <button 
          onClick={() => scrollTo('volunteer')}
          className={`h-2 transition-all duration-300 rounded-full ${activeTab === 'volunteer' ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-300'}`}
        />
        <button 
          onClick={() => scrollTo('admin')}
          className={`h-2 transition-all duration-300 rounded-full ${activeTab === 'admin' ? 'w-8 bg-indigo-900' : 'w-2 bg-slate-300'}`}
        />
      </div>
      
      <p className="md:hidden mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
        Desliza para cambiar de modo <i className="fa-solid fa-arrows-left-right ml-1"></i>
      </p>
    </div>
  );
};

export default AuthView;
