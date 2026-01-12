
import React, { useState, useMemo } from 'react';
import { db } from '../services/db';
import { Shift, User } from '../types';

const CoordStats: React.FC = () => {
  // Inicializar rango con el mes actual
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const allShifts = db.getShifts();
  const users = db.getUsers().filter(u => u.rol === 'usuario');

  // Filtrar turnos por rango de fechas
  const filteredShifts = useMemo(() => {
    return allShifts.filter(s => s.fecha >= startDate && s.fecha <= endDate);
  }, [allShifts, startDate, endDate]);

  const total = filteredShifts.length;
  const confirmed = filteredShifts.filter(s => s.estado === 'confirmado').length;
  const rejected = filteredShifts.filter(s => s.estado === 'rechazado' || s.estado === 'cancelado').length;
  const replacements = filteredShifts.filter(s => s.estado === 'reasignado' || s.estado === 'en_sustitucion').length;

  const attendanceRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  const resetDates = () => {
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  return (
    <div className="space-y-6">
      {/* Date Filter Panel */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-end gap-6">
        <div className="flex-1 w-full space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center md:text-left block w-full">Rango de análisis</label>
          
          <div className="flex flex-col gap-4 w-full max-w-md mx-auto md:mx-0">
            {/* Input Desde */}
            <div className="relative group">
              <span className="absolute -top-2 left-4 px-2 bg-white text-[9px] font-black text-blue-500 uppercase tracking-widest z-10">Desde</span>
              <i className="fa-solid fa-calendar-day absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs transition-colors group-focus-within:text-blue-500"></i>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Input Hasta */}
            <div className="relative group">
              <span className="absolute -top-2 left-4 px-2 bg-white text-[9px] font-black text-blue-500 uppercase tracking-widest z-10">Hasta</span>
              <i className="fa-solid fa-calendar-check absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs transition-colors group-focus-within:text-blue-500"></i>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={resetDates}
          className="w-full md:w-auto px-8 py-4 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
        >
          <i className="fa-solid fa-rotate-left group-hover:rotate-[-45deg] transition-transform"></i>
          Mes Actual
        </button>
      </div>

      {/* Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tasa Asistencia', val: `${attendanceRate}%`, icon: 'fa-chart-line', color: 'bg-blue-600', sub: `${confirmed} de ${total} turnos` },
          { label: 'Confirmados', val: confirmed, icon: 'fa-user-check', color: 'bg-green-500', sub: 'Asistencia validada' },
          { label: 'Incidencias', val: rejected, icon: 'fa-triangle-exclamation', color: 'bg-red-500', sub: 'Bajas comunicadas' },
          { label: 'Coberturas', val: replacements, icon: 'fa-handshake-angle', color: 'bg-orange-500', sub: 'Turnos reasignados' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-blue-200 transition-all">
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform`}>
              <i className={`fa-solid ${stat.icon} text-lg`}></i>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
            <p className="text-3xl font-black text-slate-800 mt-2">{stat.val}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Detailed Ranking */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-lg font-black text-slate-800">Ranking de Compromiso</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Calculado sobre el periodo seleccionado</p>
          </div>
          <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest self-start md:self-center">
            Top 10 Voluntarios
          </div>
        </div>
        
        <div className="space-y-6">
          {users
            .map(u => {
              const uShifts = filteredShifts.filter(s => s.asignadoA === u.id);
              const uConfirmed = uShifts.filter(s => s.estado === 'confirmado').length;
              const pct = uShifts.length > 0 ? Math.round((uConfirmed / uShifts.length) * 100) : 0;
              return { ...u, pct, total: uShifts.length, conf: uConfirmed };
            })
            .sort((a, b) => b.pct - a.pct || b.total - a.total)
            .slice(0, 10)
            .map((u, i) => (
              <div key={u.id} className="flex items-center group">
                <div className="w-10 h-10 flex items-center justify-center font-black text-sm text-slate-300 group-hover:text-blue-500 transition-colors">
                  {i + 1}
                </div>
                
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 overflow-hidden shadow-sm shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.avatarSeed || u.nombre}&backgroundColor=ffffff&size=40&topType=${u.genero === 'femenino' ? 'longHair,bob,curly' : 'shortHair,theCaesar,frizzle'}`} alt="avatar" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-700 truncate">{u.nombre} {u.apellidos}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{u.conf} de {u.total} turnos</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 flex-1 max-w-sm ml-10 hidden sm:flex">
                  <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        u.pct > 80 ? 'bg-green-500' : u.pct > 50 ? 'bg-blue-500' : 'bg-orange-400'
                      }`} 
                      style={{ width: `${u.pct}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs font-black w-10 text-right ${
                     u.pct > 80 ? 'text-green-600' : 'text-slate-500'
                  }`}>
                    {u.pct}%
                  </span>
                </div>
              </div>
            ))}
        </div>

        {total === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200 text-3xl">
              <i className="fa-solid fa-magnifying-glass-chart"></i>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay datos para este rango de fechas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoordStats;
