
import React from 'react';
import { db } from '../services/db';

const CoordStats: React.FC = () => {
  const shifts = db.getShifts();
  const users = db.getUsers().filter(u => u.rol === 'usuario');
  
  const total = shifts.length;
  const confirmed = shifts.filter(s => s.estado === 'confirmado').length;
  const rejected = shifts.filter(s => s.estado === 'rechazado').length;
  const replacements = shifts.filter(s => s.estado === 'reasignado').length;

  const attendanceRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Asistencia', val: `${attendanceRate}%`, icon: 'fa-check-double', color: 'bg-green-500' },
          { label: 'Confirmados', val: confirmed, icon: 'fa-user-check', color: 'bg-blue-500' },
          { label: 'Ausencias', val: rejected, icon: 'fa-user-xmark', color: 'bg-red-500' },
          { label: 'Reemplazos', val: replacements, icon: 'fa-shuffle', color: 'bg-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-slate-100`}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-black text-slate-800 mb-6">Ranking de Compromiso</h3>
        <div className="space-y-4">
          {users.slice(0, 5).map((u, i) => {
            const uShifts = shifts.filter(s => s.asignadoA === u.id);
            const uConfirmed = uShifts.filter(s => s.estado === 'confirmado').length;
            const pct = uShifts.length > 0 ? Math.round((uConfirmed / uShifts.length) * 100) : 0;
            
            return (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500">
                    {i+1}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{u.nombre} {u.apellidos}</span>
                </div>
                <div className="flex items-center gap-4 flex-1 max-w-xs mx-10">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="text-xs font-black text-slate-400 w-10">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoordStats;
