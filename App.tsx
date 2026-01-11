
import React, { useState, useEffect, useMemo } from 'react';
import { User, Shift, Role, AppNotification } from './types';
import { generateMonthlyPlan } from './services/geminiService';

const INITIAL_VOLUNTEERS_LIST = [
  "TOÑI ESCANERO", "ARACELI GARRIDO", "BLANCA CALVO", "ANA VÍLCHEZ", "ANABEL LLAMAS",
  "MISAEL GORDILLO", "RAQUEL GORDILLO", "MARI CHEDA", "Mª CARMEN ORQUIN", "JORGE TORRES",
  "ABIGAIL TORRES", "MARTA LUCIA MORALES", "ANA GABRIELA JIMÉNEZ", "AURELIO GARCÍA",
  "MÓNICA GARCÍA", "PARÍS ZAMORA", "JOSÉ RAMÓN ORQUIN", "BARTOLOMÉ ROMERO", "ROSA BARBER",
  "JESÚS ROIG", "MAITE ROIG", "ROBERTO PÉREZ", "PALOMA PÉREZ", "ADELA CARRILLO",
  "ANDREA ORQUIN", "FERNANDO VÍLCHEZ", "JONATHAN LLAMAS", "LITO CHEDA", "JUANITA ROMERO",
  "TOÑI LÓPEZ", "PAULA ALGUACIL", "MANUELA CRESCIMANNO", "JAVIER ESTRADA", "PAQUI ESTRADA",
  "JOSÉ MANUEL MONTES", "OTILIA MONTES", "NATÁN ZAMORA", "DESI ZAMORA", "DEMETRIO MENESES",
  "RODOLFO GONZÁLEZ", "DANIEL LÓPEZ", "NOELIA LÓPEZ", "JONY LÓPEZ", "LIA LÓPEZ",
  "LEMUEL GORDILLO", "JANINE GORDILLO", "MÍRIAM DEVESA", "JOSÉ DEVESA", "CONCHI CÁNOVAS",
  "MÓNICA BALLESTER", "ANA CÁNOVAS", "JACQUELINE CARNEIRO", "PAQUI LEAL", "PATTY CRESCIMANNO",
  "JOSÉ CARNEIRO", "KEVIN BALLESTER", "DOLY ABELLÁN"
];

const STORAGE_KEY = 'ppoc_data_final_v5';

const loadData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) return JSON.parse(data);
  
  const initialUsers: User[] = INITIAL_VOLUNTEERS_LIST.map((fullName) => {
    const parts = fullName.split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return {
      id: Math.random().toString(36).substr(2, 9),
      firstName: firstName.toUpperCase(),
      lastName: lastName.toUpperCase(),
      wantsNotifications: true,
      attendanceHistory: { confirmed: 0, failed: 0 }
    };
  });

  return {
    users: initialUsers,
    shifts: [],
    availabilities: [],
    notifications: []
  };
};

const saveData = (data: any) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [authInput, setAuthInput] = useState({ name: '', surname: '', code: '' });
  const [db, setDb] = useState(loadData());
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [view, setView] = useState<'calendar' | 'admin' | 'notifications' | 'team'>('calendar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Estados para gestión de equipo
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ firstName: '', lastName: '' });

  const currentMonthStr = useMemo(() => {
    const y = currentMonthDate.getFullYear();
    const m = (currentMonthDate.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  }, [currentMonthDate]);

  useEffect(() => saveData(db), [db]);

  useEffect(() => {
    if (!currentUser) return;
    const now = new Date();
    const checkUpcomingShifts = () => {
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const myTomorrowShifts = db.shifts.filter((s: Shift) => 
        s.date === tomorrow && 
        s.assignedUserIds.includes(currentUser.id) &&
        s.status === 'PENDING'
      );
      if (myTomorrowShifts.length > 0) {
        myTomorrowShifts.forEach((s: Shift) => {
          const notificationId = `remind-${s.id}-${currentUser.id}`;
          if (!db.notifications.find((n: AppNotification) => n.id === notificationId)) {
            const newNotif: AppNotification = {
              id: notificationId,
              userId: currentUser.id,
              title: "RECORDATORIO DE TURNO",
              message: `MAÑANA TIENES UN TURNO EN ${s.location.toUpperCase()} A LAS ${s.time}. ¡CONFIRMA TU ASISTENCIA!`,
              type: 'URGENT',
              timestamp: Date.now(),
              read: false,
              actionShiftId: s.id
            };
            setDb((prev: any) => ({ ...prev, notifications: [newNotif, ...prev.notifications] }));
          }
        });
      }
    };
    checkUpcomingShifts();
  }, [db.shifts, currentUser]);

  const handleLogin = () => {
    if (authInput.code === '1914') {
      setRole('COORDINATOR');
      return;
    }
    const user = db.users.find(
      (u: User) => u.firstName.toLowerCase() === authInput.name.toLowerCase() && 
                   u.lastName.toLowerCase() === authInput.surname.toLowerCase()
    );
    if (user) {
      setCurrentUser(user);
      setRole('VOLUNTEER');
    } else {
      alert("NO SE ENCONTRÓ EL HERMANO EN LA LISTA. REVISA MAYÚSCULAS Y ACENTOS.");
    }
  };

  const handleAddUser = () => {
    if (!userForm.firstName || !userForm.lastName) return;
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: userForm.firstName.toUpperCase(),
      lastName: userForm.lastName.toUpperCase(),
      wantsNotifications: true,
      attendanceHistory: { confirmed: 0, failed: 0 }
    };
    setDb((prev: any) => ({ ...prev, users: [...prev.users, newUser] }));
    setUserForm({ firstName: '', lastName: '' });
    setIsAddingUser(false);
  };

  const handleUpdateUser = () => {
    if (!editingUser || !userForm.firstName || !userForm.lastName) return;
    setDb((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) => u.id === editingUser.id ? { 
        ...u, 
        firstName: userForm.firstName.toUpperCase(), 
        lastName: userForm.lastName.toUpperCase() 
      } : u)
    }));
    setEditingUser(null);
    setUserForm({ firstName: '', lastName: '' });
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm("¿SEGURO QUE QUIERES ELIMINAR A ESTE HERMAN@? SE QUITARÁ DE SUS TURNOS.")) return;
    setDb((prev: any) => ({
      ...prev,
      users: prev.users.filter((u: User) => u.id !== userId),
      shifts: prev.shifts.map((s: Shift) => ({
        ...s,
        assignedUserIds: s.assignedUserIds.filter(id => id !== userId),
        status: s.assignedUserIds.length <= 1 && s.assignedUserIds.includes(userId) ? 'VACANT' : s.status
      }))
    }));
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + offset, 1);
    setCurrentMonthDate(newDate);
    setSelectedDate(null);
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const newShifts = await generateMonthlyPlan(db.users, [], currentMonthStr);
      if (newShifts.length === 0) {
        alert("ERROR AL GENERAR TURNOS. INTENTA DE NUEVO.");
        return;
      }
      const otherShifts = db.shifts.filter((s: Shift) => !s.date.startsWith(currentMonthStr));
      setDb({ ...db, shifts: [...otherShifts, ...newShifts] });
      alert(`CALENDARIO DE ${currentMonthDate.toLocaleString('es-ES', { month: 'long' }).toUpperCase()} CREADO.`);
    } catch (error) {
      alert("ERROR DE CONEXIÓN.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmShift = (shiftId: string) => {
    setDb((prev: any) => {
      const updatedShifts = prev.shifts.map((s: Shift) => 
        s.id === shiftId ? { ...s, status: 'CONFIRMED' } : s
      );
      return { ...prev, shifts: updatedShifts };
    });
  };

  const handleDeclineShift = (shiftId: string) => {
    const shift = db.shifts.find((s: Shift) => s.id === shiftId);
    if (!shift || !currentUser) return;
    setDb((prev: any) => {
      const updatedShifts = prev.shifts.map((s: Shift) => {
        if (s.id === shiftId) {
          const newIds = s.assignedUserIds.filter(id => id !== currentUser.id);
          return { ...s, status: 'VACANT', assignedUserIds: newIds };
        }
        return s;
      });
      const broadcastNotif: AppNotification = {
        id: `vacant-${shiftId}-${Date.now()}`,
        title: "¡NUEVA VACANTE DISPONIBLE!",
        message: `EL TURNO DEL ${shift.date} EN ${shift.location.toUpperCase()} (${shift.time}) NECESITA UN VOLUNTARIO. ¡EL PRIMERO EN DARLE SE LO QUEDA!`,
        type: 'SHIFT_CHANGE', timestamp: Date.now(), read: false, actionShiftId: shiftId
      };
      return { ...prev, shifts: updatedShifts, notifications: [broadcastNotif, ...prev.notifications] };
    });
  };

  const handleTakeVacantShift = (shiftId: string) => {
    if (!currentUser) return;
    const shift = db.shifts.find((s: Shift) => s.id === shiftId);
    if (shift && shift.assignedUserIds.length >= 3) {
      alert("LO SIENTO, ESTE TURNO YA HA SIDO CUBIERTO.");
      return;
    }
    setDb((prev: any) => {
      const updatedShifts = prev.shifts.map((s: Shift) => {
        if (s.id === shiftId) {
          const newIds = [...s.assignedUserIds, currentUser.id];
          return { ...s, assignedUserIds: newIds, status: newIds.length >= 2 ? 'PENDING' : 'VACANT' };
        }
        return s;
      });
      return { ...prev, shifts: updatedShifts };
    });
  };

  const daysInMonth = useMemo(() => new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0).getDate(), [currentMonthDate]);
  const startDayOfMonth = useMemo(() => {
    const day = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  }, [currentMonthDate]);

  const unreadNotifs = useMemo(() => db.notifications.filter((n: AppNotification) => !n.read && (!n.userId || n.userId === currentUser?.id)), [db.notifications, currentUser]);

  const filteredUsers = useMemo(() => {
    return db.users
      .filter((u: User) => `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [db.users, searchTerm]);

  const markNotifRead = (id: string) => {
    setDb((prev: any) => ({
      ...prev,
      notifications: prev.notifications.map((n: AppNotification) => n.id === id ? { ...n, read: true } : n)
    }));
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-sm glass p-10 rounded-[3rem] shadow-2xl border border-slate-800 text-center animate-in zoom-in duration-500">
          <div className="mb-10">
            <h1 className="text-5xl font-black gradient-text tracking-tighter uppercase">PPOC</h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">CONGREGACIÓN LA BARBERA</p>
          </div>
          <div className="space-y-4">
            <input 
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-700 uppercase"
              placeholder="NOMBRE"
              value={authInput.name}
              onChange={e => setAuthInput({...authInput, name: e.target.value.toUpperCase()})}
            />
            <input 
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-700 uppercase"
              placeholder="APELLIDO"
              value={authInput.surname}
              onChange={e => setAuthInput({...authInput, surname: e.target.value.toUpperCase()})}
            />
            <div className="py-2 flex items-center gap-4">
              <div className="h-px bg-slate-800/50 flex-1"></div>
              <span className="text-[9px] font-black text-slate-700 uppercase">COORDINADOR</span>
              <div className="h-px bg-slate-800/50 flex-1"></div>
            </div>
            <input 
              type="password"
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4 text-white text-center tracking-[0.8em] text-lg outline-none"
              placeholder="••••"
              value={authInput.code}
              onChange={e => setAuthInput({...authInput, code: e.target.value})}
            />
            <button 
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-[2.5rem] text-sm transition-all active:scale-95 shadow-xl shadow-blue-900/20 mt-6 uppercase"
            >
              ACCEDER
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-44">
      <header className="glass sticky top-0 z-50 px-8 py-6 flex items-center justify-between border-b border-slate-800/30">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 w-11 h-11 flex items-center justify-center rounded-[1.3rem] font-black text-sm text-white shadow-lg shadow-blue-900/40 uppercase">PP</div>
          <div>
            <h2 className="font-black text-lg tracking-tight leading-none text-white uppercase">AGENDA PPOC</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">BARBERA ANUAL</p>
          </div>
        </div>
        <button onClick={() => { setCurrentUser(null); setRole(null); }} className="text-[10px] font-black text-slate-500 uppercase bg-slate-900/50 px-4 py-3 rounded-2xl border border-slate-800">SALIR</button>
      </header>

      <main className="max-w-md mx-auto p-6">
        {view === 'notifications' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
             <h3 className="text-4xl font-black text-white tracking-tighter uppercase">AVISOS</h3>
             {db.notifications.filter((n: any) => !n.userId || n.userId === currentUser?.id).map((n: AppNotification) => (
               <div key={n.id} className={`p-8 rounded-[3rem] border shadow-2xl transition-all ${!n.read ? 'bg-blue-600/10 border-blue-500/50' : 'bg-slate-900/30 border-slate-800/50'}`}>
                 <div className="flex justify-between items-start mb-4">
                   <h4 className="font-black text-base text-white uppercase">{n.title.toUpperCase()}</h4>
                   {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>}
                 </div>
                 <p className="text-xs text-slate-400 leading-relaxed mb-6 uppercase">{n.message.toUpperCase()}</p>
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-600 uppercase">
                      {new Date(n.timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                    </span>
                    <button 
                      onClick={() => { markNotifRead(n.id); if(n.actionShiftId) { setSelectedDate(db.shifts.find((s: Shift) => s.id === n.actionShiftId)?.date || null); setView('calendar'); } }}
                      className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-600/10 px-4 py-2 rounded-xl border border-blue-500/20"
                    >
                      {n.actionShiftId ? 'VER TURNO' : 'LEÍDO'}
                    </button>
                 </div>
               </div>
             ))}
          </div>
        )}

        {view === 'team' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-4xl font-black text-white tracking-tighter uppercase">EQUIPO</h3>
                <button 
                  onClick={() => { setIsAddingUser(true); setEditingUser(null); setUserForm({firstName: '', lastName: ''}); }}
                  className="bg-blue-600 text-white w-10 h-10 rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-blue-900/50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </button>
             </div>

             {/* Formulario Añadir/Editar */}
             {(isAddingUser || editingUser) && (
               <div className="glass p-8 rounded-[3rem] border border-blue-500/30 animate-in zoom-in duration-300">
                  <h4 className="font-black text-xs text-blue-500 uppercase tracking-widest mb-6">
                    {editingUser ? 'EDITAR HERMAN@' : 'NUEVO VOLUNTARIO'}
                  </h4>
                  <div className="space-y-4">
                    <input 
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all uppercase"
                      placeholder="NOMBRE"
                      value={userForm.firstName}
                      onChange={e => setUserForm({...userForm, firstName: e.target.value.toUpperCase()})}
                    />
                    <input 
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all uppercase"
                      placeholder="APELLIDO"
                      value={userForm.lastName}
                      onChange={e => setUserForm({...userForm, lastName: e.target.value.toUpperCase()})}
                    />
                    <div className="flex gap-3 mt-4">
                      <button 
                        onClick={editingUser ? handleUpdateUser : handleAddUser}
                        className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest"
                      >
                        {editingUser ? 'GUARDAR' : 'REGISTRAR'}
                      </button>
                      <button 
                        onClick={() => { setIsAddingUser(false); setEditingUser(null); }}
                        className="px-6 bg-slate-900 text-slate-500 font-black py-4 rounded-2xl text-[10px] uppercase"
                      >
                        X
                      </button>
                    </div>
                  </div>
               </div>
             )}

             <div className="relative">
                <input 
                  className="w-full bg-slate-900/40 border border-slate-800/50 rounded-[2rem] px-12 py-5 text-sm text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all uppercase placeholder:text-slate-700"
                  placeholder="BUSCAR HERMAN@..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>

             <div className="grid grid-cols-1 gap-4">
               {filteredUsers.map((u: User) => (
                 <div key={u.id} className="glass p-5 rounded-[2.5rem] border border-slate-800/50 flex items-center justify-between group hover:border-slate-600 transition-all">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-[1.2rem] bg-blue-600/10 flex items-center justify-center font-black text-blue-500 border border-blue-900/20 uppercase">
                       {u.firstName[0]}
                     </div>
                     <span className="text-sm font-black text-slate-200 uppercase">{u.firstName} {u.lastName}</span>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => { setEditingUser(u); setUserForm({firstName: u.firstName, lastName: u.lastName}); setIsAddingUser(false); }}
                        className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-500 hover:text-blue-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-500 hover:text-red-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                   </div>
                 </div>
               ))}
               {filteredUsers.length === 0 && (
                  <div className="text-center py-20 opacity-10">
                    <p className="text-sm font-black uppercase tracking-[0.4em]">SIN COINCIDENCIAS</p>
                  </div>
               )}
             </div>
          </div>
        )}

        {view === 'calendar' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-[2.5rem] border border-slate-800/20 shadow-2xl">
              <button onClick={() => changeMonth(-1)} className="p-4 text-slate-400 hover:text-white transition-colors bg-slate-800/20 rounded-[1.2rem]">←</button>
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-blue-500 text-center">
                {currentMonthDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
              </h3>
              <button onClick={() => changeMonth(1)} className="p-4 text-slate-400 hover:text-white transition-colors bg-slate-800/20 rounded-[1.2rem]">→</button>
            </div>

            <div className="grid grid-cols-7 gap-3">
              {['LU','MA','MI','JU','VI','SÁ','DO'].map(d => (
                <div key={d} className={`text-center text-[10px] font-black py-2 uppercase ${d === 'LU' || d === 'MI' || d === 'VI' ? 'text-red-900/30' : 'text-slate-700'}`}>
                  {d}
                </div>
              ))}
              {Array.from({length: startDayOfMonth}).map((_, i) => <div key={`empty-${i}`} className="aspect-square"></div>)}
              {Array.from({length: daysInMonth}).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentMonthStr}-${day.toString().padStart(2,'0')}`;
                const dateObj = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), day);
                const dayOfWeek = dateObj.getDay(); 
                const isProhibited = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5 || dayOfWeek === 0;
                const dayShifts = db.shifts.filter((s: Shift) => s.date === dateStr);
                const isSelected = selectedDate === dateStr;
                const hasVacancies = dayShifts.some((s: Shift) => s.status === 'VACANT');
                
                return (
                  <button 
                    key={i}
                    disabled={isProhibited}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square rounded-[1.8rem] flex flex-col items-center justify-center relative transition-all border-2 ${
                      isSelected ? 'bg-blue-600 border-blue-400 text-white shadow-2xl scale-110 z-10' :
                      isProhibited ? 'bg-slate-900/5 border-transparent text-slate-900/20 cursor-not-allowed opacity-20' :
                      hasVacancies ? 'bg-red-600/10 border-red-500/40 text-red-500' : 'bg-slate-900/30 border-slate-800/30 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-sm font-black">{day}</span>
                    {dayShifts.length > 0 && <div className={`w-1.5 h-1.5 rounded-full mt-2 ${isSelected ? 'bg-white' : hasVacancies ? 'bg-red-500' : 'bg-blue-500'}`}></div>}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                <div className="flex justify-between items-center border-b border-slate-800/50 pb-6">
                   <h4 className="font-black text-2xl text-white tracking-tighter uppercase">TURNOS {selectedDate.split('-')[2]}</h4>
                   <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] bg-slate-900 px-4 py-2 rounded-2xl border border-slate-800">
                     {new Date(selectedDate).toLocaleString('es-ES', { weekday: 'long' }).toUpperCase()}
                   </span>
                </div>
                <div className="grid grid-cols-1 gap-5">
                  {db.shifts.filter((s: Shift) => s.date === selectedDate).map((s: Shift) => {
                    const isVacant = s.status === 'VACANT' || s.assignedUserIds.length < 3;
                    const alreadyIn = currentUser && s.assignedUserIds.includes(currentUser.id);
                    return (
                      <div key={s.id} className={`glass p-8 rounded-[3.5rem] border relative overflow-hidden transition-all ${s.status === 'VACANT' ? 'border-red-500/30' : 'border-slate-800/50 shadow-xl'}`}>
                        <div className="flex justify-between items-center mb-6">
                          <span className={`text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase tracking-widest ${s.status === 'VACANT' ? 'bg-red-600 text-white animate-pulse' : s.period === 'TARDE' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {s.time} {s.status === 'VACANT' ? '• ¡LIBRE!' : ''}
                          </span>
                          {isVacant && !alreadyIn && (
                            <button onClick={() => handleTakeVacantShift(s.id)} className="bg-green-600 hover:bg-green-500 text-white text-[9px] font-black px-5 py-2.5 rounded-2xl uppercase tracking-widest shadow-2xl shadow-green-900/40">CUBRIR</button>
                          )}
                        </div>
                        <h5 className="font-black text-xl text-slate-100 uppercase tracking-tight mb-8">{s.location.toUpperCase()}</h5>
                        <div className="space-y-4 mb-6">
                          {s.assignedUserIds.map(id => {
                            const user = db.users.find((u: User) => u.id === id);
                            return (
                              <div key={id} className="flex items-center gap-5 bg-slate-950/60 p-5 rounded-[2rem] border border-slate-900/60">
                                <div className="w-10 h-10 rounded-[1.2rem] bg-blue-600/10 flex items-center justify-center font-black text-blue-500 border border-blue-500/20 uppercase">
                                  {user?.firstName[0]}
                                </div>
                                <span className="text-sm font-black text-slate-300 uppercase">
                                  {user ? `${user.firstName} ${user.lastName}`.toUpperCase() : '---'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {alreadyIn && s.status === 'PENDING' && (
                          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom duration-300">
                             <button onClick={() => handleConfirmShift(s.id)} className="bg-green-600 hover:bg-green-500 text-white font-black py-5 rounded-[2rem] text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-green-900/30 transition-all active:scale-95">ACUDIRÉ</button>
                             <button onClick={() => handleDeclineShift(s.id)} className="bg-red-950/40 hover:bg-red-950/60 text-red-500 font-black py-5 rounded-[2rem] text-[11px] uppercase tracking-[0.2em] border border-red-500/30 transition-all active:scale-95">NO PUEDO</button>
                          </div>
                        )}
                        {alreadyIn && s.status === 'CONFIRMED' && (
                          <div className="flex items-center gap-4 bg-green-500/10 p-5 rounded-[2rem] border border-green-500/30">
                            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                            <p className="text-[12px] font-black text-green-500 uppercase tracking-widest uppercase">HAS CONFIRMADO TU ASISTENCIA</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'admin' && role === 'COORDINATOR' && (
          <div className="space-y-8 animate-in zoom-in duration-500">
            <div className="glass p-12 rounded-[4rem] border border-slate-800/50 text-center shadow-2xl">
               <div className="w-28 h-28 bg-blue-600/5 rounded-[3rem] flex items-center justify-center mx-auto mb-10 text-blue-500 border border-blue-500/10 shadow-inner">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
               </div>
               <h4 className="font-black text-3xl text-white mb-4 tracking-tighter uppercase">ADMINISTRACIÓN</h4>
               <p className="text-[12px] text-slate-500 mb-12 leading-relaxed max-w-[280px] mx-auto uppercase tracking-wide">GESTIÓN TOTAL DEL PLAN PARA EL MES DE <b>{currentMonthDate.toLocaleString('es-ES', { month: 'long' }).toUpperCase()}</b>.</p>
               <button disabled={isGenerating} onClick={handleGeneratePlan} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-900 text-white font-black py-7 rounded-[3rem] text-[14px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/50 flex items-center justify-center gap-6 transition-all active:scale-95">{isGenerating ? "CREANDO PLAN..." : "GENERAR MES"}</button>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-md glass rounded-[4rem] p-3 border border-slate-800/40 flex justify-around items-center shadow-2xl z-50 backdrop-blur-3xl bg-slate-900/90 border-t border-slate-700/30">
        <button onClick={() => setView('calendar')} className={`flex-1 p-6 rounded-[3rem] transition-all flex flex-col items-center gap-2 ${view === 'calendar' ? 'text-blue-500 bg-blue-600/10 shadow-inner' : 'text-slate-700'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="text-[7px] font-black uppercase tracking-widest">AGENDA</span>
        </button>
        <button onClick={() => setView('team')} className={`flex-1 p-6 rounded-[3rem] transition-all flex flex-col items-center gap-2 ${view === 'team' ? 'text-blue-500 bg-blue-600/10 shadow-inner' : 'text-slate-700'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span className="text-[7px] font-black uppercase tracking-widest">EQUIPO</span>
        </button>
        <button onClick={() => setView('notifications')} className={`flex-1 p-6 rounded-[3rem] transition-all flex flex-col items-center gap-2 relative ${view === 'notifications' ? 'text-blue-500 bg-blue-600/10 shadow-inner' : 'text-slate-700'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span className="text-[7px] font-black uppercase tracking-widest">AVISOS</span>
          {unreadNotifs.length > 0 && <span className="absolute top-4 right-4 bg-red-600 text-[8px] font-black text-white w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow-lg shadow-red-900/50">{unreadNotifs.length}</span>}
        </button>
        {role === 'COORDINATOR' && (
          <button onClick={() => setView('admin')} className={`flex-1 p-6 rounded-[3rem] transition-all flex flex-col items-center gap-2 ${view === 'admin' ? 'text-blue-500 bg-blue-600/10 shadow-inner' : 'text-slate-700'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-[7px] font-black uppercase tracking-widest">AJUSTES</span>
          </button>
        )}
      </nav>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 20px; }
      `}</style>
    </div>
  );
};
export default App;
