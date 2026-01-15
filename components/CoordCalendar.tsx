import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../services/db';
import { Shift, User, Assignment, AssignmentStatus, Location } from '../types'; // Importar Assignment y Location

interface CoordCalendarProps {
  locations: Location[];
  users: User[];
  shifts: Shift[];
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}

const CoordCalendar: React.FC<CoordCalendarProps> = ({ locations, users, shifts, assignments, setAssignments }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState<{lugar: string, franja: string, inicio: string, fin: string, shiftId: number} | null>(null);
  const [searchUser, setSearchUser] = useState('');

  const groupedShifts = useMemo(() => {
    const dayShifts = shifts.filter(s => s.date === selectedDate);
    const groups: Record<string, Record<string, Shift[]>> = {};

    dayShifts.forEach(s => {
      const location = locations.find(l => l.id === s.location_id);
      const locationName = location?.name || 'Unknown Location';
      if (!groups[locationName]) groups[locationName] = {};
      const slotKey = `${s.start_time}-${s.end_time}`;
      if (!groups[locationName][slotKey]) groups[locationName][slotKey] = [];
      groups[locationName][slotKey].push(s);
    });

    return groups;
  }, [shifts, selectedDate, locations]);

  const allPlaces = useMemo(() => locations.map(l => l.name), [locations]);

  const handleAddPerson = (userId: string) => {
    if (!showAddModal) return;
    
    const alreadyAssigned = assignments.some(a => a.shift_id === showAddModal.shiftId && a.user_id === userId);
    if (alreadyAssigned) {
      alert("Este voluntario ya está asignado a este turno.");
      return;
    }

    const newAssignment: Assignment = {
      id: Date.now(),
      shift_id: showAddModal.shiftId,
      user_id: userId,
      status: AssignmentStatus.CONFIRMED, // Asignación manual se considera confirmada
      confirmed_at: new Date().toISOString()
    };

    setAssignments(prev => [...prev, newAssignment]);
    setShowAddModal(null);
    setSearchUser('');
  };

  const handleRemoveAssignment = (assignmentId: number) => {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
  };

  const renderShiftAssignments = (shiftId: number) => {
    const shiftAssignments = assignments.filter(a => a.shift_id === shiftId);
    return (
      <div className="flex flex-wrap gap-2">
        {shiftAssignments.map(a => {
          const user = users.find(u => u.id === a.user_id);
          return (
            <div key={a.id} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase text-slate-700 shadow-sm">
              {user?.display_name.split(' ')[0]}
              <button onClick={() => handleRemoveAssignment(a.id)} className="text-red-400 hover:text-red-600 transition-colors"><i className="fa-solid fa-xmark text-[8px]"></i></button>
            </div>
          );
        })}
      </div>
    );
  };

  const filteredUsers = users.filter(u => 
    u.role === Role.USER &&
    u.display_name.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Calendario de Turnos</h2>
          <p className="text-slate-500 text-sm font-medium tracking-tight">IA genera 2 personas. Tú añades el refuerzo si es necesario.</p>
        </div>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPlaces.map(lugar => {
          const dateObj = new Date(selectedDate);
          const dayOfWeek = dateObj.getDay();
          
          let slotsVisibles: any[] = [];
          if (dayOfWeek === 2 || dayOfWeek === 4) { // Martes o Jueves
            slotsVisibles = [
              { id: 'm', label: 'Mañana', inicio: '10:30', fin: '12:30', type: 'manana' },
              { id: 't', label: 'Tarde', inicio: '17:30', fin: '19:30', type: 'tarde' }
            ];
          } else if (dayOfWeek === 6) { // Sábado
            slotsVisibles = [
              { id: 's1', label: 'Sábado (1)', inicio: '10:30', fin: '12:00', type: 'sabado' },
              { id: 's2', label: 'Sábado (2)', inicio: '12:00', fin: '13:30', type: 'sabado' }
            ];
          }

          if (slotsVisibles.length === 0) return null;

          return (
            <div key={lugar} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-in">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-location-dot text-blue-500 text-xs"></i>
                  {lugar}
                </h3>
              </div>
              
              <div className="p-4 flex-1 space-y-6">
                {slotsVisibles.map(slot => {
                  const slotKey = `${slot.inicio}-${slot.fin}`;
                  const currentShiftsForSlot = (groupedShifts[lugar] && groupedShifts[lugar][slotKey]) || [];
                  const firstShiftInSlot = currentShiftsForSlot[0]; // Asumimos que solo hay un Shift por slot/lugar/fecha

                  if (!firstShiftInSlot) return null; // Si no hay turno definido para este slot, no mostrar

                  const activeCount = assignments.filter(a => a.shift_id === firstShiftInSlot.id).length;

                  return (
                    <div key={slot.id} className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{slot.label} ({slot.inicio})</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeCount >= 2 ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          {activeCount} Voluntarios
                        </span>
                      </div>

                      <div className="p-2 rounded-2xl min-h-[80px] border border-dashed bg-slate-50/50 border-slate-200">
                        {renderShiftAssignments(firstShiftInSlot.id)}
                        <button 
                          onClick={() => setShowAddModal({ lugar, franja: slot.type, inicio: slot.inicio, fin: slot.fin, shiftId: firstShiftInSlot.id })}
                          className="w-full py-2 mt-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-plus-circle"></i>
                          {activeCount >= 2 ? 'Añadir 3º Voluntario' : 'Añadir Voluntario'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800">Asignar Voluntario</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {showAddModal.lugar} | {showAddModal.inicio}
                </p>
              </div>
              <button onClick={() => setShowAddModal(null)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="relative mb-6">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input 
                type="text"
                placeholder="Buscar por nombre..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(u => (
                  <button 
                    key={u.id}
                    onClick={() => handleAddPerson(u.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <img src={u.avatarUrl || `https://api.dicebear.com/7.x/lorelei/svg?seed=${u.avatarSeed || u.display_name.split(' ')[0]}&backgroundColor=b6e3f4,c0aede,d1d4f9`} alt="av" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700 group-hover:text-blue-700">{u.display_name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.genero}</p>
                    </div>
                    <i className="fa-solid fa-plus-circle text-slate-200 group-hover:text-blue-500 transition-colors"></i>
                  </button>
                ))
              ) : (
                <p className="text-center py-10 text-slate-400 font-bold text-xs uppercase tracking-widest">No hay resultados</p>
              )}
            </div>

            <div className="mt-8">
              <button 
                onClick={() => setShowAddModal(null)}
                className="w-full py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordCalendar;