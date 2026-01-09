
import React, { useMemo } from 'react';
import { User, Shift, ShiftStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardStatsProps {
  users: User[];
  shifts: Shift[];
  onResetHistory: () => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ users, shifts, onResetHistory }) => {
  const topFulfilled = useMemo(() => [...users].sort((a, b) => b.shiftsFulfilled - a.shiftsFulfilled).slice(0, 10), [users]);
  const topCovers = useMemo(() => [...users].sort((a, b) => b.shiftsCovered - a.shiftsCovered).slice(0, 10), [users]);
  const activeCount = users.filter(u => u.isAvailable).length;

  // Filtrar turnos que han tenido bajas o cancelaciones para el historial
  const cancelledShiftsHistory = useMemo(() => {
    return shifts.filter(s => 
      s.isCancelledByAdmin || 
      s.isReassignmentOpen || 
      s.assignedUsers.some(au => au.status === ShiftStatus.CANCELLED)
    ).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
  }, [shifts]);

  const stats = [
    { label: 'Asistencia Media', value: '94%', icon: 'fa-check-double', color: 'bg-green-500' },
    { label: 'Turnos Abiertos', value: shifts.filter(s => s.isReassignmentOpen).length.toString(), icon: 'fa-triangle-exclamation', color: 'bg-amber-500' },
    { label: 'Tiempo de Cobertura', value: '14 min', icon: 'fa-clock', color: 'bg-indigo-500' },
    { label: 'Voluntarios Activos', value: `${activeCount}/${users.length}`, icon: 'fa-user-check', color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-xl`}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-tight">Top Cumplimiento</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFulfilled} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="shiftsFulfilled" radius={[0, 4, 4, 0]}>
                  {topFulfilled.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(226, 70%, ${40 + index * 4}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-tight">Héroes de Cobertura</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCovers} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="shiftsCovered" radius={[0, 4, 4, 0]}>
                  {topCovers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(35, 92%, ${45 + index * 4}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Historial de Bajas Recientes</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registros de incidencias en el calendario</p>
          </div>
          <button 
            onClick={onResetHistory}
            className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 border-2 border-red-100 hover:border-red-600"
          >
            <i className="fa-solid fa-trash-can"></i>
            Resetear Historial
          </button>
        </div>

        <div className="space-y-4">
          {cancelledShiftsHistory.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
               <i className="fa-solid fa-shield-check text-4xl text-slate-200 mb-4"></i>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay historial de bajas acumulado.</p>
            </div>
          ) : (
            cancelledShiftsHistory.map(shift => {
              const cancelledUser = shift.assignedUsers.find(au => au.status === ShiftStatus.CANCELLED);
              const user = users.find(u => u.id === cancelledUser?.userId);
              
              return (
                <div key={shift.id} className="flex items-center justify-between py-5 border-b border-slate-100 last:border-0 group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${shift.isCancelledByAdmin ? 'bg-slate-100 text-slate-400' : 'bg-red-50 text-red-500'}`}>
                      <i className={`fa-solid ${shift.isCancelledByAdmin ? 'fa-ban' : 'fa-user-xmark'}`}></i>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm uppercase">
                        {shift.isCancelledByAdmin ? 'Turno Suspendido' : `Baja de: ${user?.name || 'Voluntario'}`}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                        {new Date(shift.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} • {shift.location} • {shift.startTime}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${shift.isReassignmentOpen ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
                      {shift.isReassignmentOpen ? 'Esperando Sustituto' : 'Gestionado'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
