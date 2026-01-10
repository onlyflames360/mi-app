
import React, { useState } from 'react';
import { Shift, User, ShiftStatus, AvailabilitySlot } from '../types';
import { LOCATIONS, SOUNDS } from '../constants';

interface PlanningViewProps {
  shifts: Shift[];
  users: User[];
  onRandomize: () => void;
  onAddManualShift: (shift: Shift) => void;
  onUpdateShift: (shift: Shift) => void;
  isAdmin?: boolean;
  viewDate: Date;
  onViewDateChange: (date: Date) => void;
}

const PlanningView: React.FC<PlanningViewProps> = ({ 
  shifts, users, onRandomize, onAddManualShift, onUpdateShift, isAdmin, viewDate, onViewDateChange 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  
  const currentMonthName = viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const [newShiftData, setNewShiftData] = useState({
    date: '',
    startTime: '10:30',
    endTime: '12:30',
    location: LOCATIONS[0],
    selectedUsers: [] as string[]
  });

  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const sortedShifts = [...shifts].filter(s => {
    const d = new Date(s.date);
    return d.getFullYear() === viewDate.getFullYear() && d.getMonth() === viewDate.getMonth();
  }).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  const handlePrevMonth = () => {
    playSound(SOUNDS.CLICK);
    onViewDateChange(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    playSound(SOUNDS.CLICK);
    onViewDateChange(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const toggleUserSelection = (userId: string) => {
    playSound(SOUNDS.CLICK);
    setNewShiftData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }));
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftData.date || newShiftData.selectedUsers.length === 0) {
      playSound(SOUNDS.ALERT);
      return;
    }

    const dateObj = new Date(newShiftData.date);
    const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });

    const shiftToSave: Shift = {
      id: editingShiftId || `manual-${Date.now()}`,
      date: newShiftData.date,
      dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      startTime: newShiftData.startTime,
      endTime: newShiftData.endTime,
      location: newShiftData.location,
      assignedUsers: newShiftData.selectedUsers.map(id => ({ userId: id, status: ShiftStatus.PENDING })),
      isReassignmentOpen: false
    };

    if (editingShiftId) onUpdateShift(shiftToSave);
    else onAddManualShift(shiftToSave);
    
    setShowAddModal(false);
    setEditingShiftId(null);
    setNewShiftData({
      date: '',
      startTime: '10:30',
      endTime: '12:30',
      location: LOCATIONS[0],
      selectedUsers: [] as string[]
    });
  };

  const filteredUsersForAdd = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const openModal = () => {
    playSound(SOUNDS.POP);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* CABECERA PLANIFICACIÓN */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Panel de Control</p>
          <h2 className="text-3xl font-black uppercase tracking-tight">Gestión {currentMonthName}</h2>
          <p className="text-slate-400 text-xs font-bold mt-1 opacity-60">Sincronización en tiempo real activa.</p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-2 rounded-3xl border border-white/20 relative z-10">
          <button onClick={handlePrevMonth} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/20 transition-all flex items-center justify-center">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className="text-center px-4">
            <p className="text-[10px] font-black uppercase opacity-40">Mes</p>
            <p className="text-sm font-bold">Navegar</p>
          </div>
          <button onClick={handleNextMonth} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/20 transition-all flex items-center justify-center">
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        <i className="fa-solid fa-screwdriver-wrench absolute -right-10 -bottom-10 text-[12rem] opacity-5 -rotate-12"></i>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-lg border border-slate-200">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-10 border-b-2 border-slate-100 pb-6 gap-6">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Planilla Mensual</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Registro oficial de asistencia
            </p>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap justify-center gap-3">
              <button 
                onClick={openModal} 
                className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-emerald-700 transition-all text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-100"
              >
                <i className="fa-solid fa-plus"></i>
                Añadir Turno
              </button>
              <button 
                onClick={() => { playSound(SOUNDS.CLICK); onRandomize(); }} 
                className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100"
              >
                <i className="fa-solid fa-shuffle"></i>
                Auto-Reparto
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 text-left">
                <th className="py-3 px-4 font-black text-slate-400 text-[11px] uppercase tracking-widest">Día</th>
                <th className="py-3 px-4 font-black text-slate-400 text-[11px] uppercase tracking-widest">Horario</th>
                <th className="py-3 px-4 font-black text-slate-400 text-[11px] uppercase tracking-widest">Ubicación</th>
                <th className="py-3 px-4 font-black text-slate-400 text-[11px] uppercase tracking-widest">Personal</th>
                {isAdmin && <th className="py-3 px-4 text-right">Acción</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedShifts.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="py-20 text-center text-slate-300 font-bold italic uppercase tracking-widest">
                    Sin turnos registrados.
                  </td>
                </tr>
              ) : sortedShifts.map((shift, idx) => {
                const isNewDate = idx === 0 || shift.date !== sortedShifts[idx - 1].date;
                return (
                  <tr key={shift.id} className={`hover:bg-slate-50 transition-colors group ${shift.isCancelledByAdmin ? 'opacity-50' : ''}`}>
                    <td className="py-4 px-4 font-black text-indigo-800 uppercase whitespace-nowrap">
                      {isNewDate ? shift.dayName.slice(0,3) + " " + new Date(shift.date).getDate() : ""}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-600 uppercase tracking-tighter whitespace-nowrap">
                      {shift.startTime} - {shift.endTime}
                    </td>
                    <td className="py-4 px-4 font-black text-indigo-900 text-[12px] uppercase">
                      {shift.location}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {shift.assignedUsers.map(au => {
                          const user = users.find(u => u.id === au.userId);
                          return (
                            <span key={au.userId} className={`font-black uppercase text-[11px] ${au.status === 'CONFIRMED' ? 'text-emerald-600' : 'text-slate-600'}`}>
                              {user?.name} {au.status === 'CONFIRMED' && "✓"}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-4 text-right">
                        <button className="w-8 h-8 rounded-lg text-slate-300 hover:text-indigo-600 transition-all flex items-center justify-center">
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl max-h-[92vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-500 flex flex-col">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 leading-none">Nuevo Turno</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Completa los datos para publicar</p>
              </div>
              <button 
                onClick={() => { playSound(SOUNDS.CLICK); setShowAddModal(false); }} 
                className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            {/* Body Modal */}
            <form onSubmit={handleSaveShift} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-5 hide-scrollbar safe-bottom">
              
              {/* Barra de Fecha y Punto (MÁS PEQUEÑA) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700 text-xs"
                    value={newShiftData.date}
                    onChange={(e) => setNewShiftData({...newShiftData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ubicación</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700 text-xs"
                    value={newShiftData.location}
                    onChange={(e) => setNewShiftData({...newShiftData, location: e.target.value})}
                  >
                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
              </div>

              {/* Horarios Compactos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Entrada</label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-xs"
                    value={newShiftData.startTime}
                    onChange={(e) => setNewShiftData({...newShiftData, startTime: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Salida</label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-xs"
                    value={newShiftData.endTime}
                    onChange={(e) => setNewShiftData({...newShiftData, endTime: e.target.value})}
                  />
                </div>
              </div>

              {/* Selector de Voluntarios */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Personal Asignado ({newShiftData.selectedUsers.length})
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="relative mb-3">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                    <input 
                      type="text" 
                      placeholder="Buscar voluntario..."
                      className="w-full pl-8 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto hide-scrollbar pr-1">
                    {filteredUsersForAdd.length > 0 ? filteredUsersForAdd.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleUserSelection(u.id)}
                        className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase text-left transition-all truncate flex items-center justify-between ${
                          newShiftData.selectedUsers.includes(u.id)
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {u.name.split(' ')[0]}
                        {newShiftData.selectedUsers.includes(u.id) && <i className="fa-solid fa-check text-[8px]"></i>}
                      </button>
                    )) : (
                      <p className="col-span-2 text-center text-[9px] text-slate-400 py-4 italic uppercase">No hay voluntarios registrados</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones Finales (CON MARGEN EXTRA ABAJO) */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-12 sm:pb-4">
                <button 
                  type="button" 
                  onClick={() => { playSound(SOUNDS.CLICK); setShowAddModal(false); }}
                  className="w-full py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={!newShiftData.date || newShiftData.selectedUsers.length === 0}
                  className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl order-1 sm:order-2 ${
                    !newShiftData.date || newShiftData.selectedUsers.length === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 scale-[1.02]'
                  }`}
                >
                  Crear Turno Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanningView;
