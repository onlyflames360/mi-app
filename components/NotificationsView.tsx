
import React, { useState } from 'react';
import { Shift, User, ShiftStatus, WeeklyAvailability, AvailabilitySlot } from '../types';

interface NotificationsViewProps {
  shifts: Shift[];
  users: User[];
  loggedUser: User | null;
  isAdmin: boolean;
  isLastWeekOfMonth: boolean;
  availabilitySubmissions?: {userId: string, timestamp: string}[];
  onConfirmShift: (shiftId: string, userId: string) => void;
  onCancelShift: (shiftId: string, userId: string) => void;
  onAcceptCoverage: (shiftId: string, userId: string) => void;
  onToggleAlerts: (userId: string) => void;
  onConfirmAvailability: (userId: string, availability: WeeklyAvailability[]) => void;
}

const NEXT_MONTH_WEEKS = [
  { week: 1, label: '01 Mar - 07 Mar' },
  { week: 2, label: '08 Mar - 14 Mar' },
  { week: 3, label: '15 Mar - 21 Mar' },
  { week: 4, label: '22 Mar - 28 Mar' },
];

const SLOT_LABELS: Record<string, string> = {
  morning: 'Mañana',
  afternoon: 'Tarde',
  both: 'Ambos',
  none: 'No puedo',
  empty: 'Sin seleccionar'
};

const NotificationsView: React.FC<NotificationsViewProps> = ({ 
  shifts, users, loggedUser, isAdmin, isLastWeekOfMonth, availabilitySubmissions = [], onConfirmShift, onCancelShift, onAcceptCoverage, onConfirmAvailability 
}) => {
  const [activeWeekTab, setActiveWeekTab] = useState(1);
  const [tempAvailability, setTempAvailability] = useState<WeeklyAvailability[]>(
    NEXT_MONTH_WEEKS.map(w => ({ ...w, slot: 'empty' }))
  );

  const pendingShifts = loggedUser 
    ? shifts.filter(s => s.assignedUsers.some(au => au.userId === loggedUser.id && au.status === ShiftStatus.PENDING))
    : [];

  const openForCoverage = shifts.filter(s => s.isReassignmentOpen);

  const handleUpdateSlot = (slot: AvailabilitySlot) => {
    setTempAvailability(prev => prev.map(w => w.week === activeWeekTab ? { ...w, slot } : w));
  };

  const isAllFilled = tempAvailability.every(w => w.slot !== 'empty');

  if (isAdmin) {
    const nextMonthConfirmedCount = users.filter(u => u.availableForNextMonth).length;
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full animate-in fade-in duration-500">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-indigo-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Preparación Próximo Mes</h2>
                  <p className="text-indigo-300 font-bold text-xs uppercase tracking-widest mt-1">Monitoreo de Respuestas</p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 text-center">
                  <p className="text-2xl font-black leading-none">{nextMonthConfirmedCount}</p>
                  <p className="text-[8px] font-black uppercase opacity-60">Voluntarios</p>
                </div>
              </div>
              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mb-6">
                <div className="h-full bg-emerald-400 transition-all duration-1000" style={{ width: `${(nextMonthConfirmedCount / (users.length || 1)) * 100}%` }}></div>
              </div>
              <p className="text-xs text-indigo-200 font-medium italic opacity-80">
                Sincronización activa: Los datos se actualizan en todos los dispositivos.
              </p>
            </div>
            <i className="fa-solid fa-calendar-plus absolute -right-10 -bottom-10 text-9xl opacity-10"></i>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Actividad Reciente</h3>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse">
                   En Tiempo Real
                </span>
             </div>

             <div className="space-y-4 max-h-[400px] overflow-y-auto hide-scrollbar pr-2">
                {availabilitySubmissions.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No hay nuevas respuestas...</p>
                  </div>
                ) : (
                  availabilitySubmissions.map((sub, i) => {
                    const user = users.find(u => u.id === sub.userId);
                    if (!user) return null;
                    
                    return (
                      <div key={`${sub.userId}-${i}`} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-100">
                             {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase">{user.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Confirmado a las {sub.timestamp}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {user.availabilityNextMonth?.map((w, idx) => (
                            <div 
                              key={idx} 
                              className={`w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-black border shadow-sm transition-transform hover:scale-110 ${
                                w.slot === 'morning' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                                w.slot === 'afternoon' ? 'bg-indigo-100 text-indigo-600 border-indigo-200' :
                                w.slot === 'both' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' :
                                'bg-red-100 text-red-600 border-red-200'
                              }`} 
                              title={`Semana ${w.week}: ${SLOT_LABELS[w.slot] || w.slot}`}
                            >
                              {w.week}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
             </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2 mb-6">
                <i className="fa-solid fa-triangle-exclamation text-amber-500"></i>
                Bajas Críticas ({openForCoverage.length})
              </h3>
              <div className="space-y-4">
                {openForCoverage.map(shift => (
                  <div key={shift.id} className="p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col gap-1">
                    <h4 className="font-black text-slate-800 text-[11px] uppercase truncate">{shift.location}</h4>
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-tighter">{shift.dayName} • {shift.date}</p>
                    <span className="text-[8px] bg-red-500 text-white px-2 py-0.5 rounded-full w-fit font-black mt-2">URGENTE</span>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // FIJAR EL USUARIO PARA EVITAR ERRORES DE TIPADO TS18047
  if (!loggedUser) return null;
  const currentUserId = loggedUser.id;
  const currentUserAvailable = loggedUser.availableForNextMonth;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {isLastWeekOfMonth && !currentUserAvailable && (
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border border-indigo-100 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl shadow-indigo-100">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Mi Disponibilidad</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Elige tus turnos para el próximo mes</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8 bg-slate-50 p-2 rounded-2xl">
              {NEXT_MONTH_WEEKS.map(w => {
                const isSelected = activeWeekTab === w.week;
                const slotValue = tempAvailability.find(ta => ta.week === w.week)?.slot;
                const isFilled = slotValue !== 'empty';
                const isNone = slotValue === 'none';

                return (
                  <button
                    key={w.week}
                    onClick={() => setActiveWeekTab(w.week)}
                    className={`flex-1 min-w-[100px] py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                      isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                        : isFilled 
                          ? (isNone ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200') 
                          : 'bg-white text-slate-400 border-transparent hover:bg-slate-100'
                    }`}
                  >
                    Semana {w.week}
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-indigo-50 mb-8">
              <div className="text-center mb-8">
                <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">Semana {activeWeekTab}</p>
                <h4 className="text-2xl font-black text-slate-800">{NEXT_MONTH_WEEKS.find(w => w.week === activeWeekTab)?.label}</h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { id: 'morning', label: 'Mañana', icon: 'fa-sun', color: 'text-amber-500' },
                  { id: 'afternoon', label: 'Tarde', icon: 'fa-moon', color: 'text-indigo-600' },
                  { id: 'both', label: 'Ambos', icon: 'fa-star', color: 'text-emerald-500' },
                  { id: 'none', label: 'No puedo', icon: 'fa-xmark', color: 'text-red-500' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleUpdateSlot(opt.id as AvailabilitySlot)}
                    className={`p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-4 ${
                      tempAvailability.find(w => w.week === activeWeekTab)?.slot === opt.id
                        ? 'bg-white border-indigo-600 scale-105 shadow-xl'
                        : 'bg-white border-transparent grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    <i className={`fa-solid ${opt.icon} text-3xl ${opt.color}`}></i>
                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-800">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!isAllFilled}
              onClick={() => onConfirmAvailability(currentUserId, tempAvailability)}
              className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${
                isAllFilled ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              <i className="fa-solid fa-paper-plane"></i>
              Enviar al Coordinador
            </button>
          </div>
        </div>
      )}

      {openForCoverage.length > 0 && (
        <div className="bg-amber-500 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-4">
                <i className="fa-solid fa-hand-holding-heart text-2xl"></i>
                <h3 className="text-2xl font-black uppercase tracking-tight">Turnos sin cubrir</h3>
             </div>
            <div className="space-y-4 mt-6">
              {openForCoverage.map(shift => (
                <div key={shift.id} className="bg-white/10 border border-white/20 p-6 rounded-3xl flex justify-between items-center gap-4 backdrop-blur-md">
                  <div>
                    <p className="text-sm font-black uppercase">{shift.location}</p>
                    <p className="text-[10px] font-bold opacity-80">{shift.dayName} {shift.date} • {shift.startTime}</p>
                  </div>
                  <button 
                    onClick={() => onAcceptCoverage(shift.id, currentUserId)} 
                    className="px-8 py-4 bg-white text-amber-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-50 shadow-lg active:scale-95 transition-all"
                  >
                    Cubrir
                  </button>
                </div>
              ))}
            </div>
          </div>
          <i className="fa-solid fa-bolt absolute -right-6 -bottom-6 text-[10rem] opacity-10"></i>
        </div>
      )}

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase mb-8">Mis Avisos</h2>
        <div className="space-y-6">
          {pendingShifts.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-[10px]">No tienes notificaciones pendientes.</div>
          ) : (
            pendingShifts.map(shift => (
              <div key={shift.id} className="bg-slate-50 p-6 rounded-[2rem] border-2 border-indigo-50 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-indigo-200 transition-all">
                <div className="flex-1">
                  <p className="text-indigo-600 font-black text-[10px] uppercase mb-1">Nueva Asignación</p>
                  <p className="text-slate-800 font-bold uppercase text-sm tracking-tighter">
                    {shift.dayName} {shift.date} • {shift.location}
                  </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => onConfirmShift(shift.id, currentUserId)} 
                    className="flex-1 px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all"
                  >
                    Confirmar
                  </button>
                  <button 
                    onClick={() => onCancelShift(shift.id, currentUserId)} 
                    className="flex-1 px-6 py-4 bg-white text-red-600 border border-red-100 rounded-2xl font-black text-xs uppercase hover:bg-red-50 transition-all"
                  >
                    Baja
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsView;
