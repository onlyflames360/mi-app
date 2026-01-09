
import React, { useState } from 'react';
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

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* LADO VOLUNTARIO */}
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mb-8">
              <i className="fa-solid fa-users"></i>
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4 leading-none">Soy Voluntario</h2>
            <p className="text-slate-500 font-medium mb-10">Busca tu nombre y apellido para acceder a tu panel de turnos.</p>
            
            <div className="space-y-6">
              <div className="relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Identificación Oficial</label>
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input 
                    type="text"
                    placeholder="Escribe tu Nombre y Apellidos..."
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
                        <p className="text-[10px] text-slate-400 mt-2">Por favor, contacta con el coordinador para que te dé de alta.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
               Si no apareces en la lista, significa que el coordinador aún no ha procesado tu alta en el sistema Carrito.
             </p>
          </div>
        </div>

        {/* LADO COORDINADOR */}
        <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] shadow-2xl text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 text-white rounded-3xl flex items-center justify-center text-3xl mb-8">
              <i className="fa-solid fa-screwdriver-wrench"></i>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight mb-4 leading-none">Coordinación</h2>
            <p className="text-slate-400 font-medium mb-10">Accede para gestionar la planilla de los voluntarios y realizar nuevas altas.</p>

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
                    maxLength={4}
                    autoFocus
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onAdminAuth(adminCode)}
                    placeholder="••••"
                    className="flex-1 px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl focus:border-indigo-500 outline-none font-black text-2xl tracking-[1em] text-center"
                  />
                  <button 
                    onClick={() => onAdminAuth(adminCode)}
                    className="p-4 bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all"
                  >
                    <i className="fa-solid fa-arrow-right text-xl"></i>
                  </button>
                </div>
                <button 
                  onClick={() => setShowAdminPanel(false)}
                  className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                  Volver atrás
                </button>
              </div>
            )}
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

      </div>
    </div>
  );
};

export default AuthView;
