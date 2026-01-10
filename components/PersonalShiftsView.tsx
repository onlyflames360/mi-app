
import React, { useMemo } from 'react';
import { Shift, User, ShiftStatus } from '../types';

interface PersonalShiftsViewProps {
  shifts: Shift[];
  users: User[];
  loggedUser: User | null;
  onConfirm: (shiftId: string, userId: string) => void;
  onCancel: (shiftId: string, userId: string) => void;
  unreadCount: number;
}

const PersonalShiftsView: React.FC<PersonalShiftsViewProps> = ({ 
  shifts, users, loggedUser, onConfirm, onCancel, unreadCount 
}) => {
  const userShifts = useMemo(() => {
    if (!loggedUser) return [];
    return shifts.filter(shift => 
      shift.assignedUsers.some(au => au.userId === loggedUser.id)
    ).sort((a, b) => a.date.localeCompare(b.date));
  }, [shifts, loggedUser]);

  const getDayType = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    return hour < 14 ? 'Mañana' : 'Tarde';
  };

  if (!loggedUser) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* VISTA DE PERFIL - BIENVENIDA LIMPIA */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-indigo-200">
            {loggedUser.name.charAt(0)}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-white rounded-full flex items-center justify-center text-white text-sm shadow-lg">
            <i className="fa-solid fa-check"></i>
          </div>
        </div>
        
        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none uppercase">{loggedUser.name}</h2>
            {unreadCount > 0 && (
              <span className="w-fit mx-auto md:mx-0 px-3 py-1 bg-red-100 text-red-600 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse border border-red-200">
                {unreadCount} Pendientes
              </span>
            )}
          </div>
          <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-xs">Bienvenido de nuevo • PPOC Villajoyosa</p>
          
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-slate-50 p-3 rounded-2xl text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Realizados</p>
              <p className="text-xl font-black text-indigo-600">{loggedUser.shiftsFulfilled}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Coberturas</p>
              <p className="text-xl font-black text-amber-500">{loggedUser.shiftsCovered}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Próximos</p>
              <p className="text-xl font-black text-emerald-500">{userShifts.filter(s => !s.isCancelledByAdmin).length}</p>
            </div>
          </div>
        </div>
        <i className="fa-solid fa-circle-user absolute -right-10 -top-10 text-[12rem] text-slate-50 opacity-50"></i>
      </div>

      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-4 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-calendar-star text-indigo-400"></i>
          Mi Agenda de Servicio
        </h3>
        
        <div className="space-y-4">
          {userShifts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
              <i className="fa-solid fa-calendar-xmark text-slate-100 text-6xl mb-4"></i>
              <p className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">No tienes turnos asignados aún.</p>
            </div>
          ) : (
            userShifts.map((shift) => {
              const myStatus = shift.assignedUsers.find(au => au.userId === loggedUser.id)?.status;
              const partners = shift.assignedUsers.filter(au => au.userId !== loggedUser.id);
              const dateObj = new Date(shift.date);

              return (
                <div key={shift.id} className={`bg-white rounded-[2.5rem] p-6 shadow-sm border transition-all ${shift.isCancelledByAdmin ? 'border-red-100 bg-red-50/30' : 'border-slate-100 hover:shadow-xl hover:border-indigo-100'}`}>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex items-center gap-4 md:border-r border-slate-100 md:pr-8">
                      <div className="text-center">
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${shift.isCancelledByAdmin ? 'text-red-400' : 'text-indigo-400'}`}>{shift.dayName.slice(0, 3)}</p>
                        <p className={`text-3xl font-black leading-none ${shift.isCancelledByAdmin ? 'text-slate-400' : 'text-slate-800'}`}>{dateObj.getDate()}</p>
                      </div>
                      <div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${shift.isCancelledByAdmin ? 'bg-red-100 text-red-600' : (getDayType(shift.startTime) === 'Mañana' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700')}`}>
                          {shift.isCancelledByAdmin ? 'SUSPENDIDO' : getDayType(shift.startTime)}
                        </span>
                        <p className={`text-lg font-black leading-tight mt-1 ${shift.isCancelledByAdmin ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{shift.startTime} - {shift.endTime}</p>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className={`flex items-center gap-2 font-black text-sm uppercase ${shift.isCancelledByAdmin ? 'text-slate-400' : 'text-indigo-900'}`}>
                        <i className={`fa-solid ${shift.isCancelledByAdmin ? 'fa-cloud-showers-heavy text-red-400' : 'fa-location-dot text-indigo-400'}`}></i>
                        {shift.location}
                        {shift.isCancelledByAdmin && (
                           <span className="ml-2 text-[10px] text-red-500 font-bold border-l-2 border-red-200 pl-2">MOTIVO: {shift.cancellationReason}</span>
                        )}
                      </div>

                      {!shift.isCancelledByAdmin && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest shrink-0">Compañeros:</span>
                          <div className="flex -space-x-2">
                            {partners.map(p => {
                              const pUser = users.find(u => u.id === p.userId);
                              return (
                                <div key={p.userId} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-500 uppercase cursor-help group relative" title={pUser?.name}>
                                  {pUser?.name.charAt(0)}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {shift.isCancelledByAdmin ? (
                        <div className="px-6 py-3 bg-red-100 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 animate-pulse">
                          <i className="fa-solid fa-bell"></i>
                          Suspendido
                        </div>
                      ) : (
                        <>
                          {myStatus === ShiftStatus.PENDING && (
                            <button 
                              onClick={() => onConfirm(shift.id, loggedUser.id)}
                              className="flex-1 md:flex-none px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all"
                            >
                              Confirmar
                            </button>
                          )}
                          {myStatus !== ShiftStatus.CANCELLED && (
                            <button 
                              onClick={() => onCancel(shift.id, loggedUser.id)}
                              className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all"
                            >
                              No puedo
                            </button>
                          )}
                          {myStatus === ShiftStatus.CONFIRMED && (
                            <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                              <i className="fa-solid fa-check"></i>
                              Confirmado
                            </div>
                          )}
                        </>
                      )}
                    </div>
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

export default PersonalShiftsView;