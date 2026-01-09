
import React, { useState } from 'react';
import { Shift, User, ShiftStatus, WeeklyAvailability, AvailabilitySlot } from '../types';

interface NotificationsViewProps {
  shifts: Shift[];
  users: User[];
  loggedUser: User | null;
  isAdmin: boolean;
  isLastWeekOfMonth: boolean;
  onConfirmShift: (shiftId: string, userId: string) => void;
  onCancelShift: (shiftId: string, userId: string) => void;
  onAcceptCoverage: (shiftId: string, userId: string) => void;
  onToggleAlerts: (userId: string) => void;
  onConfirmAvailability: (userId: string, availability: WeeklyAvailability[]) => void;
}

const NEXT_MONTH_WEEKS = [
  { week: 1, label: '01 Feb - 07 Feb' },
  { week: 2, label: '08 Feb - 14 Feb' },
  { week: 3, label: '15 Feb - 21 Feb' },
  { week: 4, label: '22 Feb - 28 Feb' },
];

const NotificationsView: React.FC<NotificationsViewProps> = ({ 
  shifts, users, loggedUser, isAdmin, isLastWeekOfMonth, onConfirmShift, onCancelShift, onAcceptCoverage, onToggleAlerts, onConfirmAvailability 
}) => {
  const [activeWeekTab, setActiveWeekTab] = useState(1);
  const [tempAvailability, setTempAvailability] = useState<WeeklyAvailability[]>(
    NEXT_MONTH_WEEKS.map(w => ({ ...w, slot: 'none' }))
  );

  const pendingShifts = loggedUser 
    ? shifts.filter(s => s.assignedUsers.some(au => au.userId === loggedUser.id && au.status === ShiftStatus.PENDING))
    : [];

  const openForCoverage = shifts.filter(s => s.isReassignmentOpen);

  const handleUpdateSlot = (slot: AvailabilitySlot) => {
    setTempAvailability(prev => prev.map(w => w.week === activeWeekTab ? { ...w, slot } : w));
  };

  const isAllFilled = tempAvailability.every(w => w.slot !== 'none');

  if (isAdmin) {
    const nextMonthConfirmed = users.filter(u => u.availableForNextMonth).length;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full animate-in fade-in duration-500">
        <div className="lg:col-span-2 space-y-8">
          {isLastWeekOfMonth && (
            <div className="bg-indigo-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Preparación Próximo Mes</h2>
                    <p className="text-indigo-300 font-bold text-xs uppercase tracking-widest mt-1">Disponibilidad Detallada Recibida</p>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 text-center">
                    <p className="text-2xl font-black leading-none">{nextMonthConfirmed}</p>
                    <p className="text-[8px] font-black uppercase opacity-60">Voluntarios</p>
                  </div>
                </div>
                <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-emerald-400" style={{ width: `${(nextMonthConfirmed / (users.length || 1)) * 100}%` }}></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black uppercase opacity-50 mb-1">Estado</p>
                    <p className="text-sm font-bold">Consulte el panel de Planificación para ver los horarios específicos.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-8">Centro de Control de Avisos</h2>
            <div className="space-y-6">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-triangle-exclamation text-amber-500"></i>
                Turnos Sin Cubrir ({openForCoverage.length})
              </h3>
              {openForCoverage.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold italic uppercase text-xs">Todo cubierto.</p>
                </div>
              ) : (
                openForCoverage.map(shift => (
                  <div key={shift.id} className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex justify-between items-center">
                    <div>
                      <h4 className="font-black text-slate-800 text-lg uppercase">{shift.location}</h4>
                      <p className="text-slate-500 font-bold text-xs">{shift.dayName}, {shift.date} • {shift.startTime}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* SECCIÓN DETALLADA: DISPONIBILIDAD PRÓXIMO MES */}
      {isLastWeekOfMonth && !loggedUser?.availableForNextMonth && (
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border border-indigo-100 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl shadow-indigo-100">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Disponibilidad Próximo Mes</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Selecciona tus preferencias por semana</p>
              </div>
            </div>

            {/* TABS DE SEMANAS */}
            <div className="flex flex-wrap gap-2 mb-8 bg-slate-50 p-2 rounded-2xl">
              {NEXT_MONTH_WEEKS.map(w => (
                <button
                  key={w.week}
                  onClick={() => setActiveWeekTab(w.week)}
                  className={`flex-1 min-w-[100px] py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    activeWeekTab === w.week 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : tempAvailability.find(ta => ta.week === w.week)?.slot !== 'none' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-white text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  Semana {w.week}
                </button>
              ))}
            </div>

            {/* CONTENIDO DE SEMANA SELECCIONADA */}
            <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-indigo-50 mb-8 animate-in fade-in zoom-in-95 duration-200">
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
              onClick={() => onConfirmAvailability(loggedUser!.id, tempAvailability)}
              className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${
                isAllFilled ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              <i className="fa-solid fa-paper-plane"></i>
              Confirmar mi disponibilidad mensual
            </button>
            {!isAllFilled && (
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase mt-4">Debes completar todas las semanas antes de enviar</p>
            )}
          </div>
        </div>
      )}

      {/* COBERTURAS ABIERTAS */}
      {openForCoverage.length > 0 && (
        <div className="bg-amber-500 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden animate-pulse">
          <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Turnos Libres: Necesitan Cobertura</h3>
            <div className="space-y-4 mt-6">
              {openForCoverage.map(shift => (
                <div key={shift.id} className="bg-white/10 border border-white/20 p-6 rounded-3xl flex justify-between items-center gap-4 backdrop-blur-md">
                  <p className="text-sm font-medium">Turno en <span className="font-black">{shift.location}</span> el <span className="font-black">{shift.dayName} {shift.date}</span>.</p>
                  <button onClick={() => onAcceptCoverage(shift.id, loggedUser!.id)} className="px-8 py-4 bg-white text-amber-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-50">Cubrir Turno</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inbox Personal */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase mb-8">Mis Notificaciones</h2>
        <div className="space-y-6">
          {pendingShifts.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">No hay avisos nuevos.</div>
          ) : (
            pendingShifts.map(shift => (
              <div key={shift.id} className="bg-slate-50 p-6 rounded-[2rem] border-2 border-indigo-50 flex justify-between items-center gap-6">
                <div className="flex-1">
                  <p className="text-indigo-600 font-black text-[10px] uppercase mb-1">Aviso Semanal</p>
                  <p className="text-slate-800 font-medium">Tienes un turno el <span className="font-black underline">{shift.dayName} {shift.date}</span> en <span className="font-black">{shift.location}</span>.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => onConfirmShift(shift.id, loggedUser!.id)} className="px-6 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase">Sí</button>
                  <button onClick={() => onCancelShift(shift.id, loggedUser!.id)} className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase">No</button>
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
