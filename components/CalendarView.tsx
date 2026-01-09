
import React, { useState } from 'react';
import { Shift, User, ShiftStatus } from '../types';

interface CalendarViewProps {
  shifts: Shift[];
  users: User[];
  onCancel: (shiftId: string, userId: string) => void;
  onConfirm: (shiftId: string, userId: string) => void;
  onAdminCancel: (shiftId: string, reason: string) => void;
  isAdmin?: boolean;
  filterUserId?: string;
  viewDate: Date;
  onViewDateChange: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  shifts, users, onCancel, onConfirm, onAdminCancel, isAdmin, filterUserId, viewDate, onViewDateChange 
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(viewDate.toISOString().split('T')[0]);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const handlePrevMonth = () => {
    onViewDateChange(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    onViewDateChange(new Date(currentYear, currentMonth + 1, 1));
  };

  const currentMonthShifts = shifts.filter(s => {
    const sDate = new Date(s.date);
    const isThisMonth = sDate.getFullYear() === currentYear && sDate.getMonth() === currentMonth;
    if (filterUserId) {
      return isThisMonth && s.assignedUsers.some(au => au.userId === filterUserId);
    }
    return isThisMonth;
  });

  const selectedShifts = shifts.filter(s => {
    return s.date === selectedDate && (!filterUserId || s.assignedUsers.some(au => au.userId === filterUserId));
  });

  const getDayType = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    return hour < 14 ? 'Mañana' : 'Tarde';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full animate-in fade-in duration-500">
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div className="bg-white p-3 sm:p-6 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
              {filterUserId ? 'Mi Calendario de Turnos' : 'Calendario General'}
            </h2>
            
            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <button 
                onClick={handlePrevMonth}
                className="w-10 h-10 rounded-full hover:bg-white hover:shadow-md text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center border border-transparent hover:border-slate-100"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              
              <div className="flex items-center gap-2 min-w-[160px] justify-center">
                 <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                 <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{monthName}</span>
              </div>

              <button 
                onClick={handleNextMonth}
                className="w-10 h-10 rounded-full hover:bg-white hover:shadow-md text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center border border-transparent hover:border-slate-100"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-inner">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
              <div key={day} className="bg-slate-50 p-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
            ))}
            
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50/50 min-h-[110px] md:min-h-[140px]"></div>
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayShifts = currentMonthShifts.filter(s => s.date === dateStr);
              const isSelected = selectedDate === dateStr;
              
              const today = new Date();
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`bg-white min-h-[110px] md:min-h-[140px] p-2 transition-all hover:bg-indigo-50 flex flex-col gap-1 text-left relative group ${
                    isSelected ? 'ring-4 ring-inset ring-indigo-500/20 bg-indigo-50/50 z-10' : ''
                  }`}
                >
                  <span className={`text-xs font-black ${isToday ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg shadow-indigo-200' : isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {day}
                  </span>
                  
                  <div className="flex flex-col gap-1 overflow-y-auto hide-scrollbar max-h-[100px]">
                    {dayShifts.map(s => (
                      <div 
                        key={s.id} 
                        className={`text-[9px] p-1.5 rounded-xl border leading-[1.1] shadow-sm ${
                          s.isCancelledByAdmin
                            ? 'bg-slate-200 text-slate-500 border-slate-300 line-through'
                            : s.isReassignmentOpen 
                                ? 'bg-red-50 text-red-700 border-red-100 animate-pulse' 
                                : 'bg-indigo-600 text-white border-indigo-400'
                        }`}
                      >
                        <div className="truncate font-black uppercase text-[7px]">{s.location}</div>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl sticky top-0">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Día seleccionado</p>
            <h2 className="text-xl font-black text-slate-800 leading-tight uppercase">
              {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
          </div>
          
          <div className="space-y-4">
            {selectedShifts.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200 text-2xl">
                  <i className="fa-solid fa-calendar-day"></i>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sin turnos asignados</p>
                {isAdmin && (
                  <p className="text-[10px] text-slate-300 mt-2 font-bold uppercase">Usa el panel de Planilla para generar turnos en este mes.</p>
                )}
              </div>
            ) : (
              selectedShifts.map(shift => (
                <div key={shift.id} className={`p-5 border-2 rounded-[2rem] transition-all ${shift.isCancelledByAdmin ? 'bg-slate-50 border-slate-200 opacity-80' : 'bg-slate-50 border-slate-100 hover:border-indigo-200'}`}>
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${shift.isCancelledByAdmin ? 'bg-slate-200 text-slate-500' : (getDayType(shift.startTime) === 'Mañana' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700')}`}>
                        {shift.isCancelledByAdmin ? 'SUSPENDIDO' : getDayType(shift.startTime)}
                      </span>
                      <p className={`text-lg font-black mt-1 ${shift.isCancelledByAdmin ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{shift.startTime} - {shift.endTime}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${shift.isCancelledByAdmin ? 'text-slate-400' : 'text-indigo-600'}`}>{shift.location}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {shift.assignedUsers.map(au => {
                      const user = users.find(u => u.id === au.userId);
                      const isMe = filterUserId === au.userId;
                      return (
                        <div key={au.userId} className={`flex items-center justify-between p-3 rounded-2xl bg-white border-2 shadow-sm transition-all ${isMe ? 'border-indigo-500 ring-4 ring-indigo-500/5' : 'border-white'} ${shift.isCancelledByAdmin ? 'opacity-50' : ''}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black uppercase border ${isMe ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                              {user?.name.charAt(0)}
                            </div>
                            <span className={`text-[11px] font-black uppercase block leading-none ${isMe ? 'text-indigo-600' : 'text-slate-700'}`}>
                              {user?.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {isAdmin && !shift.isCancelledByAdmin && (
                    <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onAdminCancel(shift.id, "MAL TIEMPO")}
                          className="flex-1 px-3 py-2 bg-slate-200 text-slate-600 rounded-xl font-black text-[9px] uppercase hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-cloud-showers-heavy"></i>
                          Mal Tiempo
                        </button>
                        <button 
                          onClick={() => onAdminCancel(shift.id, "FUERZA MAYOR")}
                          className="flex-1 px-3 py-2 bg-slate-200 text-slate-600 rounded-xl font-black text-[9px] uppercase hover:bg-slate-300 transition-all flex items-center justify-center gap-2"
                        >
                          Suspender
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
