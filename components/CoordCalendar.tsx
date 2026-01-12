
import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../services/db';
import { Shift, User, Notification as AppNotification } from '../types';

const CoordCalendar: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>(db.getShifts());
  const users = useMemo(() => db.getUsers(), []);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState<{lugar: string, franja: string, inicio: string, fin: string} | null>(null);
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setShifts(db.getShifts());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const groupedShifts = useMemo(() => {
    const dayShifts = shifts.filter(s => s.fecha === selectedDate);
    const groups: Record<string, Record<string, Shift[]>> = {};

    dayShifts.forEach(s => {
      if (!groups[s.lugar]) groups[s.lugar] = {};
      const franjaKey = `${s.franja}-${s.inicio}`;
      if (!groups[s.lugar][franjaKey]) groups[s.lugar][franjaKey] = [];
      groups[s.lugar][franjaKey].push(s);
    });

    return groups;
  }, [shifts, selectedDate]);

  const allPlaces = ["LA BARBERA", "EL CENSAL", "LA CREUETA", "CENTRO SALUD", "Dr. ESQUERDO"];

  const handleAddPerson = (userId: string) => {
    if (!showAddModal) return;
    
    const newUserShift: Shift = {
      id: `s-${Date.now()}`,
      fecha: selectedDate,
      lugar: showAddModal.lugar,
      franja: showAddModal.franja as any,
      inicio: showAddModal.inicio,
      fin: showAddModal.fin,
      estado: 'confirmado',
      asignadoA: userId
    };

    const updated = [...shifts, newUserShift];
    db.setShifts(updated);
    setShifts(updated);
    setShowAddModal(null);
    setSearchUser('');
  };

  const removeShift = (id: string) => {
    const updated = shifts.filter(s => s.id !== id);
    db.setShifts(updated);
    setShifts(updated);
  };

  const renderShiftUsers = (groupShifts: Shift[]) => {
    const activeShifts = groupShifts.filter(s => s.estado !== 'cancelado');
    const usersInShift = activeShifts.map(s => users.find(u => u.id === s.asignadoA)).filter(Boolean) as User[];
    
    const surnameCounts: Record<string, number> = {};
    usersInShift.forEach(u => {
      surnameCounts[u.apellidos] = (surnameCounts[u.apellidos] || 0) + 1;
    });

    return groupShifts.map(s => {
      const u = users.find(user => user.id === s.asignadoA);
      if (!u) return null;
      const isCouple = surnameCounts[u.apellidos] > 1;
      const isCancelled = s.estado === 'cancelado';
      if (isCancelled) return null;

      return (
        <div 
          key={s.id} 
          className={`flex items-center justify-between p-2 rounded-xl mb-1 border transition-all ${
            isCouple ? 'bg-rose-50 border-rose-100 ring-1 ring-rose-200' : 'bg-white border-slate-100 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.nombre}&backgroundColor=ffffff&size=48`} alt="av" />
            </div>
            <div className="truncate">
              <p className="text-[10px] font-black leading-tight truncate text-slate-700">
                {u.nombre} {u.apellidos}
              </p>
              {isCouple && <p className="text-[8px] font-bold text-rose-500 uppercase tracking-tighter">Pareja</p>}
            </div>
          </div>
          <button 
            onClick={() => removeShift(s.id)}
            className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors shrink-0"
          >
            <i className="fa-solid fa-xmark text-[10px]"></i>
          </button>
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Calendario de Turnos</h2>
          <p className="text-slate-500 text-sm font-medium">Gestión libre: la IA genera parejas y tú añades los refuerzos.</p>
        </div>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allPlaces.map(lugar => {
          const dayOfWeek = new Date(selectedDate).getDay();
          
          // Definir franjas según el día
          let franjasVisibles: {id: string, label: string, inicio: string, fin: string}[] = [];
          if (dayOfWeek === 2 || dayOfWeek === 4) { // Martes o Jueves
            franjasVisibles = [
              { id: 'manana', label: 'Mañana', inicio: '10:30', fin: '12:30' },
              { id: 'tarde', label: 'Tarde', inicio: '17:30', fin: '19:30' }
            ];
          } else if (dayOfWeek === 6) { // Sábado
            franjasVisibles = [
              { id: 'sabado1', label: 'Sábado (1)', inicio: '10:30', fin: '12:00' },
              { id: 'sabado2', label: 'Sábado (2)', inicio: '12:00', fin: '13:30' }
            ];
          }

          if (franjasVisibles.length === 0) return null;

          return (
            <div key={lugar} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-location-dot text-blue-500 text-xs"></i>
                  {lugar}
                </h3>
              </div>
              
              <div className="p-4 flex-1 space-y-4">
                {franjasVisibles.map(f => {
                  const key = `${f.id}-${f.inicio}`;
                  const currentShifts = (groupedShifts[lugar] && groupedShifts[lugar][key]) || [];
                  const count = currentShifts.filter(s => s.estado !== 'cancelado').length;

                  return (
                    <div key={f.id} className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{f.label} ({f.inicio}-{f.fin})</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${count >= 2 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {count} Pers.
                        </span>
                      </div>

                      <div className="p-2 rounded-2xl min-h-[80px] border border-dashed bg-slate-50/50 border-slate-200">
                        {renderShiftUsers(currentShifts)}
                        <button 
                          onClick={() => setShowAddModal({ lugar, franja: f.id, inicio: f.inicio, fin: f.fin })}
                          className="w-full py-2 mt-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-2 group"
                        >
                          <i className="fa-solid fa-user-plus group-hover:scale-110"></i>
                          {count >= 2 ? 'Añadir 3º (o más)' : 'Añadir Voluntario'}
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
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-xl font-black text-slate-800 mb-6 text-left">Refuerzo para {showAddModal.lugar}</h2>
            <div className="relative mb-6">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input 
                type="text" 
                placeholder="Buscar voluntario..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50 font-medium"
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {users
                .filter(u => u.rol === 'usuario' && !shifts.some(s => s.fecha === selectedDate && s.asignadoA === u.id && s.inicio === showAddModal.inicio))
                .filter(u => `${u.nombre} ${u.apellidos}`.toLowerCase().includes(searchUser.toLowerCase()))
                .map(u => (
                <button 
                  key={u.id}
                  onClick={() => handleAddPerson(u.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.nombre}&backgroundColor=ffffff&size=48`} alt="av" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">{u.nombre} {u.apellidos}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{u.apellidos}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowAddModal(null)} className="mt-6 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordCalendar;
