
import React, { useState, useMemo, useEffect } from 'react';
import { User, Location, Shift, Assignment, Role, AssignmentStatus, Alert, Availability, AvailabilitySlot, Message } from '../types';
// Fix: Import generateShiftsPDF to use it in handleShare for exporting the shift plan
import { generateShiftsPDF } from '../services/pdfService';
import { 
  Plus, 
  Upload, 
  Share2, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  TrendingUp, 
  Search,
  UserCheck,
  Calendar as CalendarIcon,
  MessageSquare,
  BarChart3,
  Clock,
  Shuffle,
  AlertOctagon,
  Sparkles,
  Zap,
  UserPlus,
  ArrowRightCircle,
  Copy,
  Cpu,
  Megaphone,
  Send,
  User as UserIcon,
  ShieldCheck,
  Lock,
  CornerUpLeft,
  PieChart,
  Activity,
  Award,
  BarChart2,
  Users,
  MapPin,
  Edit2,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';

interface CoordProps {
  activeTab?: string;
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  addNotification: (title: string, body: string) => void;
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
  availabilities: Availability[];
  messages: Message[];
  onSendMessage: (fromUserId: string, fromUserName: string, body: string, isBroadcast: boolean, toUserId?: string) => void;
  onMarkMessagesAsRead: (userId: string) => void;
  onTransitionMonth: () => void;
  currentMonthLabel: string;
  handleAutoPlanManual: () => void;
}

const CoordinatorView: React.FC<CoordProps> = ({ 
  activeTab, 
  locations, setLocations, 
  users, setUsers, 
  shifts, setShifts, 
  assignments, setAssignments,
  addNotification,
  alerts,
  setAlerts,
  availabilities,
  messages,
  onSendMessage,
  onMarkMessagesAsRead,
  onTransitionMonth,
  currentMonthLabel,
  handleAutoPlanManual
}) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningShiftId, setAssigningShiftId] = useState<number | null>(null);
  const [userPickerSearch, setUserPickerSearch] = useState('');
  
  // User Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'add' | 'edit'>('add');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({ display_name: '', role: Role.USER });

  // Broadcast State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastBody, setBroadcastBody] = useState('');

  // Reply State
  const [replyingTo, setReplyingTo] = useState<{ userId: string, userName: string } | null>(null);
  const [replyBody, setReplyBody] = useState('');

  useEffect(() => {
    if (activeTab === 'comms') {
      onMarkMessagesAsRead('admin-1');
    }
  }, [activeTab, onMarkMessagesAsRead]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.display_name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [users, searchTerm]);

  // Volunteers who have submitted availability
  const usersWithAvailability = useMemo(() => {
    const userIds = new Set(availabilities.map(a => a.user_id));
    return users.filter(u => userIds.has(u.id));
  }, [users, availabilities]);

  // Statistics Calculations
  const stats = useMemo(() => {
    const totalShifts = shifts.length;
    const confirmed = assignments.filter(a => a.status === AssignmentStatus.CONFIRMED).length;
    const declined = assignments.filter(a => a.status === AssignmentStatus.DECLINED).length;
    const pending = assignments.filter(a => a.status === AssignmentStatus.PENDING).length;
    
    const coveragePercent = totalShifts > 0 ? Math.round((confirmed / (totalShifts * 2)) * 100) : 0;

    const userRanking = users
      .filter(u => u.role === Role.USER)
      .map(u => ({
        name: u.display_name,
        count: assignments.filter(a => a.user_id === u.id && a.status === AssignmentStatus.CONFIRMED).length,
        hours: assignments.filter(a => a.user_id === u.id && a.status === AssignmentStatus.CONFIRMED).length * 2 
      }))
      .sort((a, b) => b.count - a.count);

    const locationStats = locations.map(loc => {
      const locShifts = shifts.filter(s => s.location_id === loc.id);
      const locConfirmed = assignments.filter(a => {
        const s = shifts.find(sh => sh.id === a.shift_id);
        return s?.location_id === loc.id && a.status === AssignmentStatus.CONFIRMED;
      }).length;
      const totalCapacity = locShifts.reduce((acc, s) => acc + s.max_people, 0);
      return {
        name: loc.name,
        color: loc.color_hex,
        percent: totalCapacity > 0 ? Math.round((locConfirmed / totalCapacity) * 100) : 0,
        confirmed: locConfirmed,
        total: totalCapacity
      };
    });

    return { totalShifts, confirmed, declined, pending, coveragePercent, userRanking, locationStats };
  }, [shifts, assignments, users, locations]);

  // --- FUNCIONES DE GESTIÓN DE USUARIOS ---

  const handleDeleteUser = (id: string, name: string) => {
    if (id === 'admin-1') {
      alert("No puedes eliminar la cuenta maestra del coordinador.");
      return;
    }
    if (window.confirm(`¿Seguro que quieres borrar a "${name}"? Esta acción no se puede deshacer y borrará sus turnos.`)) {
      setUsers(prev => prev.filter(u => u.id !== id));
      setAssignments(prev => prev.filter(a => a.user_id !== id));
      addNotification("Usuario Borrado", `${name} ha sido eliminado satisfactoriamente.`);
    }
  };

  const openAddUserModal = () => {
    setUserModalMode('add');
    setEditingUser(null);
    setUserFormData({ display_name: '', role: Role.USER });
    setShowUserModal(true);
  };

  const openEditUserModal = (u: User) => {
    setUserModalMode('edit');
    setEditingUser(u);
    setUserFormData({ display_name: u.display_name, role: u.role });
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    const trimmedName = userFormData.display_name.trim().toUpperCase();
    if (!trimmedName) {
      alert("El nombre no puede estar vacío.");
      return;
    }

    if (userModalMode === 'add') {
      const newUser: User = {
        id: `u-${Date.now()}`,
        display_name: trimmedName,
        role: userFormData.role,
        created_at: new Date().toISOString()
      };
      setUsers(prev => [...prev, newUser]);
      addNotification("Nuevo Usuario", `${newUser.display_name} se ha añadido a la lista.`);
    } else if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, display_name: trimmedName, role: userFormData.role } : u));
      addNotification("Cambios Guardados", `Se han actualizado los datos de ${trimmedName}.`);
    }
    setShowUserModal(false);
  };

  // --- FUNCIONES DE PLANIFICACIÓN Y TURNOS ---

  const handleDeleteShift = (shiftId: number) => {
    if (confirm("¿Borrar este turno definitivamente?")) {
      setShifts(prev => prev.filter(s => s.id !== shiftId));
      setAssignments(prev => prev.filter(a => a.shift_id !== shiftId));
      addNotification("Turno Eliminado", "Turno borrado del calendario.");
    }
  };

  const assignUserToShift = (userId: string) => {
    if (assigningShiftId === null) return;
    
    const alreadyAssigned = assignments.find(a => a.shift_id === assigningShiftId && a.user_id === userId);
    if (alreadyAssigned) {
      alert("Este voluntario ya está en este turno.");
      return;
    }

    const newAssignment: Assignment = {
      id: Date.now(),
      shift_id: assigningShiftId,
      user_id: userId,
      status: AssignmentStatus.CONFIRMED,
      confirmed_at: new Date().toISOString()
    };

    setAssignments(prev => [...prev, newAssignment]);
    setAssigningShiftId(null);
    setUserPickerSearch('');
    
    const userName = users.find(u => u.id === userId)?.display_name || "Usuario";
    addNotification("Turno Asignado", `Has añadido a ${userName} manualmente.`);
  };

  // Triggers the PDF generation for the coordinator.
  const handleShare = () => {
    generateShiftsPDF(shifts, locations, users, assignments, currentMonthLabel);
  };

  // --- MENSAJERÍA ---

  const handleSendBroadcast = () => {
    if (!broadcastBody.trim()) return;
    onSendMessage("admin-1", "COORDINADOR", broadcastBody, true);
    setBroadcastBody('');
    setShowBroadcastModal(false);
    alert("Mensaje difundido con éxito.");
  };

  const handleSendReply = () => {
    if (!replyBody.trim() || !replyingTo) return;
    onSendMessage("admin-1", "COORDINADOR", replyBody, false, replyingTo.userId);
    setReplyBody('');
    setReplyingTo(null);
    alert("Respuesta privada enviada.");
  };

  // --- RENDERS ---

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">Resumen Coordinador</h2>
        <div className="flex items-center gap-2">
           <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-black text-[10px] uppercase">{currentMonthLabel}</span>
           {currentMonthLabel === 'Enero 2026' && (
             <button onClick={onTransitionMonth} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all"><ArrowRightCircle size={14} /> Rotar Mes</button>
           )}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Voluntarios', val: users.length, icon: <UserCheck size={16} /> }, { label: 'Turnos Mes', val: shifts.length, icon: <Clock size={16} /> }, { label: 'Confirmados', val: stats.confirmed, icon: <Check size={16} /> }, { label: 'Alertas', val: alerts.length, icon: <AlertOctagon size={16} /> }].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-center justify-between mt-1"><span className="text-2xl font-black text-slate-800 tracking-tighter">{stat.val}</span><div className="p-2 bg-blue-50 text-blue-600 rounded-xl">{stat.icon}</div></div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="relative z-10"><h2 className="text-3xl font-black tracking-tight italic uppercase">Generador de Planning</h2><p className="text-indigo-100 mt-2 max-w-lg font-medium">Reparte automáticamente los turnos según la disponibilidad enviada.</p></div>
        <button onClick={handleAutoPlanManual} className="relative z-10 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all active:scale-95 uppercase tracking-widest text-[11px] flex items-center gap-2"><Zap size={18} fill="currentColor" /> Ejecutar Autoplan</button>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </div>

      {/* New Section: Availability Sent */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase italic flex items-center gap-3">
              <CalendarDays className="text-blue-600" size={24} />
              Disponibilidad Recibida
            </h3>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Voluntarios que han enviado su previsión para el mes próximo</p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-xl text-blue-600 font-black text-[10px] uppercase tracking-widest">
            {usersWithAvailability.length} / {users.filter(u => u.role === Role.USER).length}
          </div>
        </div>

        {usersWithAvailability.length === 0 ? (
          <div className="py-10 text-center text-slate-300 font-black uppercase text-[10px] italic">Nadie ha enviado su disponibilidad aún</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {usersWithAvailability.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-green-50 hover:border-green-100">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-slate-400 text-xs uppercase shadow-sm group-hover:bg-green-600 group-hover:text-white transition-colors italic">
                  {u.display_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-700 text-[10px] uppercase truncate">{u.display_name}</p>
                </div>
                <CheckCircle2 size={16} className="text-green-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="BUSCAR POR NOMBRE..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black uppercase text-xs focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        <button onClick={openAddUserModal} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 uppercase text-xs tracking-widest transition-all hover:bg-blue-600"><Plus size={20} /> Añadir Manual</button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-20 text-center text-slate-300 font-black uppercase text-xs italic">No hay resultados para la búsqueda</td></tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-800 font-black border border-slate-100 uppercase shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">{u.display_name.charAt(0)}</div>
                      <span className="font-black text-slate-800 text-sm tracking-tight uppercase">{u.display_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5"><span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border ${u.role === Role.COORD ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{u.role}</span></td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setReplyingTo({ userId: u.id, userName: u.display_name })} className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90" title="Enviar Mensaje"><MessageSquare size={18} /></button>
                      <button onClick={() => openEditUserModal(u)} className="p-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-all active:scale-90" title="Editar"><Edit2 size={18} /></button>
                      <button onClick={() => handleDeleteUser(u.id, u.display_name)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90" title="Eliminar"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showUserModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowUserModal(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-pop-in border border-white">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">{userModalMode === 'add' ? 'Alta de Usuario' : 'Editar Usuario'}</h3>
              <button onClick={() => setShowUserModal(false)} className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all"><X size={20}/></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">Nombre y Apellidos</label>
                <input type="text" value={userFormData.display_name} onChange={e => setUserFormData({...userFormData, display_name: e.target.value})} placeholder="EJ: JUAN PÉREZ" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black uppercase text-xs focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1 block">Rol del usuario</label>
                <select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as Role})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black uppercase text-xs focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all">
                  <option value={Role.USER}>VOLUNTARIO ESTÁNDAR</option>
                  <option value={Role.COORD}>COORDINADOR (ADMIN)</option>
                </select>
              </div>
              <button onClick={handleSaveUser} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl mt-4 active:scale-95 uppercase text-xs tracking-widest shadow-xl transition-all hover:bg-blue-600">Guardar Información</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPlanning = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div><h2 className="font-black text-2xl text-slate-800 tracking-tight uppercase italic">Control Calendario</h2><p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Gestión de turnos y asignaciones</p></div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => handleShare()} className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-4 rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 uppercase tracking-widest transition-all shadow-lg shadow-blue-100"><Share2 size={18} /> Compartir Planning</button>
          <button onClick={() => { if(confirm("¿Borrar todas las asignaciones?")) setAssignments([]); }} className="p-4 text-red-500 bg-red-50 hover:bg-red-100 rounded-2xl transition-all active:scale-90" title="Borrar todo"><Trash2 size={20} /></button>
        </div>
      </div>
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Día / Hora</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lugar</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Voluntarios</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Borrar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...shifts].sort((a,b) => a.date.localeCompare(b.date)).map(shift => {
              const loc = locations.find(l => l.id === shift.location_id);
              const shiftAssignments = assignments.filter(a => a.shift_id === shift.id);
              return (
                <tr key={shift.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap"><p className="font-black text-slate-800 text-sm uppercase">{shift.date}</p><p className="text-[10px] font-black text-blue-500">{shift.start_time}</p></td>
                  <td className="px-6 py-5"><span className="px-3 py-1.5 rounded-xl text-[10px] font-black text-white shadow-sm uppercase tracking-tighter" style={{backgroundColor: loc?.color_hex}}>{loc?.name}</span></td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {shiftAssignments.map(a => (
                        <div key={a.id} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase text-slate-700 shadow-sm">
                          {users.find(usr => usr.id === a.user_id)?.display_name.split(' ')[0]}
                          <button onClick={() => setAssignments(p => p.filter(it => it.id !== a.id))} className="text-red-400 hover:text-red-600 transition-colors"><X size={10}/></button>
                        </div>
                      ))}
                      <button onClick={() => setAssigningShiftId(shift.id)} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase hover:bg-blue-100 transition-all border border-blue-100"><Plus size={12} /> Añadir</button>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right"><button onClick={() => handleDeleteShift(shift.id)} className="text-slate-300 hover:text-red-600 transition-all active:scale-90"><Trash2 size={20}/></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div><h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic flex items-center gap-4"><BarChart2 className="text-blue-600" size={32} />Analítica</h2><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Actividad acumulada y participación</p></div>
        <div className="bg-indigo-50 px-6 py-4 rounded-3xl flex items-center gap-4"><div className="text-right"><p className="text-[9px] font-black text-indigo-400 uppercase">Eficiencia Red</p><p className="text-3xl font-black text-indigo-600 tracking-tighter">{stats.coveragePercent}%</p></div><Activity className="text-indigo-600" size={28} /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
          <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest italic">Estado de los Turnos</h3>
          <div className="space-y-5">
            {[{ label: 'Confirmados', val: stats.confirmed, color: 'bg-green-500' }, { label: 'Pendientes', val: stats.pending, color: 'bg-amber-400' }, { label: 'Rechazados', val: stats.declined, color: 'bg-red-400' }].map((item, i) => (
              <div key={i} className="space-y-2"><div className="flex justify-between text-[10px] font-black uppercase"><span className="text-slate-600">{item.label}</span><span className="text-slate-900 font-black italic">{item.val}</span></div><div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100"><div className={`h-full ${item.color} transition-all duration-1000`} style={{ width: `${(item.val / (stats.confirmed + stats.pending + stats.declined || 1)) * 100}%` }}></div></div></div>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
          <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest italic">TOP Participación</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.userRanking.slice(0, 6).map((u, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:scale-[1.02]">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center font-black text-blue-600 border border-slate-100 italic text-lg">{i + 1}</div>
                <div className="flex-1"><p className="font-black text-slate-800 text-[11px] uppercase truncate italic">{u.name}</p><p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{u.count} turnos</p></div>
                {i === 0 && <Award className="text-amber-400 shrink-0" size={24} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderComms = () => {
    const incomingMessages = messages.filter(m => !m.is_broadcast && m.to_user_id === 'admin-1');
    const broadcastMessages = messages.filter(m => m.is_broadcast);
    return (
      <div className="space-y-6">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div><h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic flex items-center gap-4"><MessageSquare className="text-blue-600" size={32} />Buzón Admin</h2><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Mensajes privados y difusiones</p></div>
          <button onClick={() => setShowBroadcastModal(true)} className="w-full md:w-auto bg-indigo-600 text-white px-8 py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase text-[11px] tracking-widest active:scale-95"><Megaphone size={22} /> Difundir Aviso</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] px-2 flex items-center gap-2 italic"><Lock size={14} className="text-indigo-500" /> Mensajes de Voluntarios</h3>
            {incomingMessages.length === 0 ? (
              <div className="p-20 text-center text-slate-300 font-black uppercase text-[10px] italic border-2 border-dashed border-slate-100 rounded-[2.5rem]">Sin mensajes privados</div>
            ) : (
              incomingMessages.map(msg => (
                <div key={msg.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black uppercase text-xs border border-indigo-100 italic">{msg.from_user_name.charAt(0)}</div><div><p className="font-black text-slate-800 text-sm uppercase italic">{msg.from_user_name}</p><p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{new Date(msg.timestamp).toLocaleString()}</p></div></div>
                    <button onClick={() => setReplyingTo({ userId: msg.from_user_id, userName: msg.from_user_name })} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg active:scale-95 transition-all hover:bg-blue-700">Responder</button>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl italic text-slate-600 text-xs font-medium border border-slate-100 leading-relaxed shadow-inner">"{msg.body}"</div>
                </div>
              ))
            )}
          </div>
          <div className="space-y-5">
            <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] px-2 flex items-center gap-2 italic"><Megaphone size={14} className="text-blue-500" /> Historial de Difusión</h3>
            {broadcastMessages.length === 0 ? (
              <div className="p-20 text-center text-slate-300 font-black uppercase text-[10px] italic border-2 border-dashed border-slate-100 rounded-[2.5rem]">No has enviado avisos globales</div>
            ) : (
              broadcastMessages.map(msg => (
                <div key={msg.id} className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group border border-slate-800">
                  <Megaphone className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform" size={120} />
                  <div className="relative z-10 flex justify-between items-start mb-4"><span className="bg-blue-600 text-[9px] font-black uppercase px-3 py-1 rounded-full italic tracking-widest shadow-lg">Lanzado a Todos</span><p className="text-[9px] font-black text-blue-400 uppercase italic">{new Date(msg.timestamp).toLocaleString()}</p></div>
                  <p className="relative z-10 text-sm font-bold leading-relaxed italic pr-4">{msg.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in pb-20">
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'planning' && renderPlanning()}
      {activeTab === 'stats' && renderStats()}
      {activeTab === 'comms' && renderComms()}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"><h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Alertas Activas</h2></div>
          {alerts.length === 0 ? (
            <div className="p-32 text-center opacity-20"><AlertOctagon size={80} className="mx-auto mb-6 text-slate-300" /><p className="font-black uppercase text-xs italic tracking-widest">Sin urgencias pendientes</p></div>
          ) : (
            alerts.map(a => (
              <div key={a.id} className="bg-red-500 text-white p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl shadow-red-200/50 animate-pulse-slow">
                <div><p className="font-black text-lg uppercase italic pr-8">{a.message}</p><p className="text-[10px] text-red-200 font-black uppercase mt-2 tracking-widest">{new Date(a.created_at).toLocaleString()}</p></div>
                <button onClick={() => setAlerts(p => p.filter(it => it.id !== a.id))} className="p-4 bg-white/20 hover:bg-white text-white hover:text-red-600 rounded-2xl transition-all shadow-xl active:scale-90"><Trash2 size={24}/></button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Responder */}
      {replyingTo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setReplyingTo(null)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-pop-in border border-white">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Respuesta a {replyingTo.userName}</h3>
              <button onClick={() => setReplyingTo(null)} className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all"><X size={24}/></button>
            </div>
            <textarea value={replyBody} onChange={e => setReplyBody(e.target.value)} autoFocus placeholder="Escribe tu respuesta privada..." className="w-full h-44 bg-slate-50 border border-slate-100 rounded-[2rem] p-8 outline-none font-medium text-slate-800 mb-8 resize-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-inner" />
            <button onClick={handleSendReply} className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl active:scale-95 uppercase text-[11px] tracking-widest shadow-2xl shadow-blue-100 flex items-center justify-center gap-3 transition-all hover:bg-blue-700"><Send size={20} /> Enviar Mensaje Privado</button>
          </div>
        </div>
      )}

      {/* Modal Difundir */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowBroadcastModal(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-pop-in border border-white">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Aviso a La Vila</h3>
              <button onClick={() => setShowBroadcastModal(false)} className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all"><X size={24}/></button>
            </div>
            <textarea value={broadcastBody} onChange={e => setBroadcastBody(e.target.value)} autoFocus placeholder="Este aviso llegará a todos los voluntarios registrados..." className="w-full h-44 bg-slate-50 border border-slate-100 rounded-[2rem] p-8 outline-none font-medium text-slate-800 mb-8 resize-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all shadow-inner" />
            <button onClick={handleSendBroadcast} className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl active:scale-95 uppercase text-[11px] tracking-widest shadow-2xl transition-all hover:bg-indigo-600 flex items-center justify-center gap-3"><Megaphone size={20} /> Difundir Aviso Global</button>
          </div>
        </div>
      )}

      {/* User Picker Modal */}
      {assigningShiftId !== null && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setAssigningShiftId(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-pop-in flex flex-col max-h-[85vh] border border-white">
            <div className="flex justify-between items-start mb-8 shrink-0">
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Asignar Voluntario</h3>
              <button onClick={() => setAssigningShiftId(null)} className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all"><X size={24}/></button>
            </div>
            <div className="relative mb-6 shrink-0">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Filtrar voluntarios..." value={userPickerSearch} onChange={e => setUserPickerSearch(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black uppercase text-[10px] focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {users.filter(u => u.display_name.toUpperCase().includes(userPickerSearch.toUpperCase())).map(u => (
                <button key={u.id} onClick={() => assignUserToShift(u.id)} className="w-full p-5 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white text-left border border-slate-100 transition-all font-black uppercase text-[10px] group flex items-center gap-4 active:scale-95">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm group-hover:border-transparent transition-colors text-slate-800 italic">{u.display_name.charAt(0)}</div>
                  {u.display_name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pop-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } } 
        .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .85; } }
      `}</style>
    </div>
  );
};

export default CoordinatorView;
