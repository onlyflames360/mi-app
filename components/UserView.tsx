import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Location, Shift, Assignment, AssignmentStatus, AvailabilitySlot, Alert, Notification, Message, Role, Availability } from '../types';
import { MOTIVATIONAL_PHRASES } from '../constants.tsx'; // Updated import path
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar as CalendarIcon, 
  Bell, 
  MessageCircle,
  ChevronRight,
  AlertOctagon,
  Hand,
  Send,
  User as UserIcon,
  MapPin,
  CalendarCheck,
  X,
  MessageSquare,
  Megaphone,
  Plus,
  Lock,
  ShieldCheck,
  CornerUpLeft,
  Heart,
  Star,
  Award,
  Users as UsersIconLucide,
  Check,
  CalendarDays,
  Sparkles,
  Loader2,
  CalendarPlus
} from 'lucide-react';

interface UserProps {
  activeTab?: string;
  user: User;
  locations: Location[];
  users: User[];
  shifts: Shift[];
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  addNotification: (title: string, body: string) => void;
  notifications: Notification[];
  messages: Message[];
  onSendMessage: (fromUserId: string, fromUserName: string, body: string, isBroadcast?: boolean, toUserId?: string) => void;
  onMarkNotificationsAsRead: () => void;
  onMarkMessagesAsRead: (userId: string) => void;
  broadcastUrgency: (fromUserId: string, shiftId: number) => void;
  alerts: Alert[];
  claimShift: (claimingUserId: string, alertId: number) => void;
  onSaveAvailability: (userId: string, weeks: { weekIndex: number, slot: AvailabilitySlot, saturday_available: boolean }[]) => void;
  availabilities: Availability[];
  currentMonthLabel: string;
}

const UserView: React.FC<UserProps> = ({ 
  activeTab, 
  user, 
  locations,
  users,
  shifts, 
  assignments, 
  setAssignments,
  addNotification,
  notifications,
  messages,
  onSendMessage,
  onMarkNotificationsAsRead,
  onMarkMessagesAsRead,
  broadcastUrgency,
  alerts,
  claimShift,
  onSaveAvailability,
  availabilities,
  currentMonthLabel
}) => {
  const [availability, setAvailability] = useState<Record<number, { slot: AvailabilitySlot, sat: boolean }>>({});
  const [prevAssignmentCount, setPrevAssignmentCount] = useState(0);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [isSavingAvail, setIsSavingAvail] = useState(false);
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to get next month name
  const nextMonthName = useMemo(() => {
    if (currentMonthLabel === 'Enero 2026') return 'Febrero 2026';
    if (currentMonthLabel === 'Febrero 2026') return 'Marzo 2026';
    return 'Mes Próximo';
  }, [currentMonthLabel]);

  // Initialize availability from global state when tab changes
  useEffect(() => {
    if (activeTab === 'availability') {
      const userAvails = availabilities.filter(a => a.user_id === user.id);
      const initial: Record<number, { slot: AvailabilitySlot, sat: boolean }> = {};
      userAvails.forEach(a => {
        const weekIdx = parseInt(a.week_start.replace('WEEK-', ''));
        if (!isNaN(weekIdx)) {
          initial[weekIdx] = { slot: a.slot, sat: a.saturday_available };
        }
      });
      setAvailability(initial);
    }
  }, [activeTab, availabilities, user.id]);

  const { activeAssignments, completedAssignments } = useMemo(() => {
    const now = new Date();
    const active: Assignment[] = [];
    const completed: Assignment[] = [];

    assignments.filter(a => a.user_id === user.id).forEach(a => {
      const shift = shifts.find(s => s.id === a.shift_id);
      if (!shift) return;

      const shiftEndDate = new Date(`${shift.date}T${shift.end_time}:00`);
      if (shiftEndDate < now) {
        completed.push(a);
      } else {
        active.push(a);
      }
    });

    return { activeAssignments: active, completedAssignments: completed };
  }, [assignments, shifts, user.id]);

  const getMotivationalPhrase = (shiftId: number) => {
    return MOTIVATIONAL_PHRASES[shiftId % MOTIVATIONAL_PHRASES.length];
  };

  useEffect(() => {
    if (activeAssignments.length > prevAssignmentCount && prevAssignmentCount > 0) {
      addNotification(
        "Nuevos Turnos Recibidos", 
        `Se han asignado ${activeAssignments.length} nuevos turnos en tu calendario.`
      );
    }
    setPrevAssignmentCount(activeAssignments.length);
  }, [activeAssignments.length, addNotification]);

  useEffect(() => {
    if (activeTab === 'notifications') onMarkNotificationsAsRead();
    if (activeTab === 'messages') onMarkMessagesAsRead(user.id);
  }, [activeTab, onMarkNotificationsAsRead, onMarkMessagesAsRead, user.id]);

  useEffect(() => {
    if (activeTab === 'messages') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleUpdateStatus = (assignmentId: number, status: AssignmentStatus) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, status, confirmed_at: new Date().toISOString() } : a));
    
    if (status === AssignmentStatus.CONFIRMED) {
      addNotification("✅ Turno Confirmado", "Has confirmado tu asistencia. El coordinador ha sido notificado.");
    } else if (status === AssignmentStatus.DECLINED) {
      addNotification("❌ Turno Cancelado", "Has marcado que no puedes asistir. Se ha generado una alerta para buscar un reemplazo.");
      broadcastUrgency(user.id, assignment.shift_id);
    }
  };

  const myMessages = useMemo(() => {
    return messages.filter(m => 
      (m.from_user_id === user.id && m.to_user_id === 'admin-1') || 
      (m.from_user_id === 'admin-1' && m.to_user_id === user.id) || 
      m.is_broadcast
    );
  }, [messages, user.id]);

  const handleSendContactMessage = async () => {
    if (!contactMessage.trim()) return;
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    onSendMessage(user.id, user.display_name, contactMessage, false, 'admin-1');
    setContactMessage('');
    setIsContactModalOpen(false);
    setIsSending(false);
    alert("Mensaje enviado al coordinador. Te responderá lo antes posible.");
  };

  const updateWeekSlot = (week: number, slot: AvailabilitySlot) => {
    setAvailability(prev => ({
      ...prev,
      [week]: { ...prev[week] || { sat: false }, slot }
    }));
  };

  const updateWeekSat = (week: number, sat: boolean) => {
    setAvailability(prev => ({
      ...prev,
      [week]: { ...prev[week] || { slot: AvailabilitySlot.NO_PUEDO }, sat }
    }));
  };

  const handleSaveAvailability = async () => {
    setIsSavingAvail(true);
    // Simular un pequeño retardo para feedback visual
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const payload = Array.from({ length: 5 }).map((_, i) => ({
      weekIndex: i + 1,
      slot: availability[i + 1]?.slot || AvailabilitySlot.NO_PUEDO,
      saturday_available: availability[i + 1]?.sat || false
    }));
    
    onSaveAvailability(user.id, payload);
    setIsSavingAvail(false);
    setShowSavedMessage(true);
    
    // Auto ocultar el mensaje después de 5 segundos
    setTimeout(() => setShowSavedMessage(false), 5000);
  };

  const renderHome = () => (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Mi Perfil</span>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{currentMonthLabel}</span>
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic">¡Hola, {user.display_name.split(' ')[0]}!</h2>
          <p className="text-slate-500 mt-2 font-medium italic">"Tu ayuda marca la diferencia en La Vila."</p>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full -mr-24 -mt-24 opacity-50"></div>
      </div>

      {completedAssignments.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-black text-lg text-green-600 tracking-tight flex items-center gap-2 px-2 uppercase italic">
            <Award size={20} /> Gracias por tu labor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedAssignments.slice(0, 2).map(a => {
              const shift = shifts.find(s => s.id === a.shift_id);
              const loc = locations.find(l => l.id === shift?.location_id);
              return (
                <div key={a.id} className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-[2rem] p-6 relative overflow-hidden group">
                  <Heart className="absolute -right-4 -bottom-4 text-green-100/40" size={80} />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-green-600 uppercase mb-1">Turno finalizado • {shift?.date}</p>
                    <h4 className="font-black text-slate-800 uppercase mb-2 italic">{loc?.name}</h4>
                    <p className="text-slate-600 text-xs font-bold leading-relaxed italic">"{getMotivationalPhrase(shift?.id || 0)}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-black text-lg text-red-600 tracking-tight flex items-center gap-2 px-2 uppercase italic">
            <AlertOctagon size={20} /> Alertas de hoy
          </h3>
          {alerts.map(alertItem => (
            <div key={alertItem.id} className="bg-red-500 text-white p-6 rounded-[2rem] shadow-xl border-2 border-red-600 animate-pulse-slow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="font-black text-sm uppercase leading-tight">{alertItem.message}</p>
                {alertItem.user_id !== user.id && (
                  <button 
                    onClick={() => claimShift(user.id, alertItem.id)}
                    className="bg-white text-red-600 px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Hand size={16} /> Yo cubro el turno
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-2 mt-8">
        <h3 className="font-black text-xl text-slate-800 tracking-tight flex items-center gap-2 uppercase italic">
          <CalendarIcon size={22} className="text-blue-600" /> Próximos Turnos
        </h3>
      </div>

      <div className="space-y-4">
        {activeAssignments.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center">
            <Clock size={32} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-black uppercase text-[10px]">No tienes turnos pendientes asignados</p>
          </div>
        ) : (
          [...activeAssignments].sort((a,b) => {
            const sA = shifts.find(s => s.id === a.shift_id);
            const sB = shifts.find(s => s.id === b.shift_id);
            return (sA?.date || '').localeCompare(sB?.date || '');
          }).map(a => {
            const shift = shifts.find(s => s.id === a.shift_id);
            const loc = locations.find(l => l?.id === shift?.location_id);
            if (!shift) return null;

            const companions = assignments
              .filter(other => other.shift_id === shift.id && other.user_id !== user.id)
              .map(other => {
                const companionData = users.find(u => u.id === other.user_id);
                return {
                  name: companionData?.display_name || 'Desconocido',
                  status: other.status
                };
              });

            return (
              <div key={a.id} className={`bg-white rounded-[2rem] border overflow-hidden ${a.status === AssignmentStatus.PENDING ? 'border-blue-200 shadow-lg' : 'border-slate-100 shadow-sm'}`}>
                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-[1.2rem] flex flex-col items-center justify-center text-white shadow-lg uppercase" style={{backgroundColor: loc?.color_hex}}>
                        <span className="text-[10px] font-black opacity-60">{new Date(shift.date).toLocaleDateString('es', {month:'short'})}</span>
                        <span className="text-2xl font-black leading-none">{shift.date.split('-')[2]}</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-slate-800 text-lg md:text-xl tracking-tight uppercase leading-none italic">{loc?.name}</h4>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Clock size={14} className="text-blue-500" /> {shift.start_time} - {shift.end_time}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {a.status === AssignmentStatus.PENDING ? (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(a.id, AssignmentStatus.CONFIRMED)} 
                            className="px-6 py-3 bg-green-500 text-white font-black rounded-xl text-[10px] uppercase shadow-lg hover:bg-green-600 transition-all active:scale-95"
                          >
                            Confirmar
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(a.id, AssignmentStatus.DECLINED)} 
                            className="px-6 py-3 bg-red-50 text-red-600 font-black rounded-xl text-[10px] uppercase hover:bg-red-100 transition-all active:scale-95"
                          >
                            No puedo
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className={`px-6 py-3 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest border ${a.status === AssignmentStatus.CONFIRMED ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-400'}`}>
                            {a.status === AssignmentStatus.CONFIRMED ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                            {a.status === AssignmentStatus.CONFIRMED ? 'Confirmado' : 'No Asistiré'}
                          </div>
                          {a.status === AssignmentStatus.CONFIRMED && (
                            <button 
                              onClick={() => handleUpdateStatus(a.id, AssignmentStatus.DECLINED)} 
                              className="px-5 py-3 bg-red-50 text-red-600 font-black rounded-xl text-[10px] uppercase hover:bg-red-100 active:scale-95 transition-all"
                            >
                              No puedo
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <UsersIconLucide size={12} className="text-blue-400" /> Compañeros en este turno:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {companions.length === 0 ? (
                        <span className="text-[10px] text-slate-300 font-bold uppercase italic">Solo tú de momento</span>
                      ) : (
                        companions.map((comp, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                             <div className={`w-2 h-2 rounded-full ${comp.status === AssignmentStatus.CONFIRMED ? 'bg-green-500 shadow-sm' : 'bg-slate-300'}`}></div>
                             <span className="text-[10px] font-black text-slate-700 uppercase">{comp.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div 
        onClick={() => setIsContactModalOpen(true)}
        className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group mt-8 cursor-pointer hover:bg-slate-800 transition-all active:scale-[0.98]"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
              <MessageCircle size={28} />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight uppercase italic flex items-center gap-2">¿Dudas o Problemas? <Lock size={14} className="text-slate-500" /></p>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Habla en privado con el coordinador</p>
            </div>
          </div>
          <ChevronRight size={24} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {isContactModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity" onClick={() => setIsContactModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-8 md:p-12 shadow-2xl animate-pop-in overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
                  <Lock className="text-blue-600" size={24} />
                  Enviar Duda
                </h3>
                <p className="text-slate-400 text-[10px] font-black uppercase mt-1">Este mensaje es privado para el coordinador</p>
              </div>
              <button onClick={() => setIsContactModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"><X size={24}/></button>
            </div>
            <textarea 
              autoFocus
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Escribe aquí tu consulta o incidencia..."
              className="w-full h-40 bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-slate-800 resize-none text-sm leading-relaxed mb-6"
            ></textarea>
            <button 
              onClick={handleSendContactMessage}
              disabled={isSending || !contactMessage.trim()}
              className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] shadow-xl flex items-center justify-center gap-3 transition-all hover:bg-blue-600 active:scale-95 uppercase text-[11px] tracking-widest"
            >
              {isSending ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Send size={18} /> Enviar al Coordinador</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderMessages = () => {
    return (
      <div className="space-y-6 flex flex-col h-[calc(100vh-160px)]">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic flex items-center gap-3">
                <ShieldCheck className="text-blue-600" size={24} />
                Línea Directa
              </h2>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-0.5">Conversación privada con coordinación</p>
            </div>
            <button 
              onClick={() => setIsContactModalOpen(true)}
              className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all active:scale-90"
              title="Nueva duda"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 px-1 pb-4 scroll-smooth">
          {myMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 p-12">
              <MessageSquare size={48} className="mb-4" />
              <p className="font-black uppercase text-xs">No hay mensajes previos</p>
            </div>
          ) : (
            [...myMessages].sort((a,b) => a.id - b.id).map((msg, i) => {
              const isFromMe = msg.from_user_id === user.id;
              const isBroadcast = msg.is_broadcast;

              if (isBroadcast) {
                return (
                  <div key={msg.id} className="mx-auto max-w-[90%] bg-slate-900 p-4 rounded-2xl text-white shadow-lg relative overflow-hidden group border border-slate-800">
                    <Megaphone className="absolute -right-2 -bottom-2 text-white/5" size={48} />
                    <p className="text-[8px] font-black uppercase text-blue-400 mb-1 flex items-center gap-1"><Megaphone size={10} /> Aviso General</p>
                    <p className="text-xs font-bold leading-relaxed">{msg.body}</p>
                    <p className="text-[8px] font-black text-white/30 text-right mt-2">{new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm border ${
                    isFromMe 
                      ? 'bg-blue-600 text-white border-blue-700 rounded-tr-none' 
                      : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                  }`}>
                    {!isFromMe && <p className="text-[8px] font-black uppercase text-blue-600 mb-1 flex items-center gap-1"><Lock size={8} /> Coordinador</p>}
                    <p className="text-xs font-bold leading-relaxed">{msg.body}</p>
                    <p className={`text-[8px] font-black mt-2 text-right ${isFromMe ? 'text-white/40' : 'text-slate-300'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-lg">
           <div className="flex items-center gap-3">
             <input 
              type="text" 
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendContactMessage()}
              placeholder="Escribe tu duda al coordinador..."
              className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-blue-500 transition-all"
             />
             <button 
              onClick={handleSendContactMessage}
              disabled={!contactMessage.trim()}
              className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 active:scale-90 disabled:opacity-30 disabled:scale-100 transition-all"
             >
               <Send size={20} />
             </button>
           </div>
        </div>
      </div>
    );
  };

  const renderAvailability = () => (
    <div className="space-y-6 pb-28">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic flex items-center gap-3">
            <CalendarPlus className="text-blue-600" size={28} />
            Previsión {nextMonthName}
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase mt-1 tracking-widest">Planifica tus turnos para el próximo mes</p>
        </div>
      </div>

      {showSavedMessage && (
        <div className="bg-green-600 text-white p-6 rounded-[2.5rem] shadow-xl shadow-green-100 animate-in slide-in-from-top-4 duration-500 flex items-center justify-between gap-4 sticky top-20 z-[60]">
          <div className="flex items-center gap-3">
            <Sparkles size={24} className="animate-pulse" />
            <div>
              <p className="font-black uppercase text-[11px] tracking-widest leading-none">¡Disponibilidad Enviada!</p>
              <p className="text-[9px] font-bold opacity-80 uppercase mt-1">Tus datos de {nextMonthName} han sido actualizados.</p>
            </div>
          </div>
          <button onClick={() => setShowSavedMessage(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={16} /></button>
        </div>
      )}

      <div className="grid gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 overflow-hidden relative group">
            <div className="flex items-center justify-between">
               <h4 className="font-black text-slate-400 tracking-tight uppercase text-[11px] italic">Semana {i} de {nextMonthName.split(' ')[0]}</h4>
               <CalendarDays size={20} className="text-slate-100 group-hover:text-blue-100 transition-colors" />
            </div>
            
            <div className="space-y-4">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest border-l-2 border-blue-500 pl-2">Lunes a Viernes</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: AvailabilitySlot.MANANA, label: 'Mañana' },
                  { id: AvailabilitySlot.TARDE, label: 'Tarde' },
                  { id: AvailabilitySlot.AMBOS, label: 'Ambos' },
                  { id: AvailabilitySlot.NO_PUEDO, label: 'No Puedo' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => updateWeekSlot(i, opt.id)}
                    className={`p-4 rounded-2xl border-2 font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${
                      availability[i]?.slot === opt.id 
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg' 
                        : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {availability[i]?.slot === opt.id && <Check size={14} />}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest border-l-2 border-amber-500 pl-2">¿Puedes el Sábado?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateWeekSat(i, true)}
                  className={`p-4 rounded-2xl border-2 font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${
                    availability[i]?.sat === true 
                      ? 'border-amber-500 bg-amber-500 text-white shadow-lg' 
                      : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {availability[i]?.sat === true && <Check size={14} />}
                  SÍ PUEDO
                </button>
                <button
                  onClick={() => updateWeekSat(i, false)}
                  className={`p-4 rounded-2xl border-2 font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${
                    availability[i]?.sat === false 
                      ? 'border-red-500 bg-red-500 text-white shadow-lg' 
                      : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {availability[i]?.sat === false && <Check size={14} />}
                  NO PUEDO
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Refined Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none md:pl-24">
        <div className="max-w-xl mx-auto pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-3">
            <button 
              onClick={handleSaveAvailability}
              disabled={isSavingAvail}
              className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] transition-all active:scale-[0.98] hover:bg-blue-500 uppercase tracking-[0.15em] text-[11px] flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 disabled:opacity-50"
            >
              {isSavingAvail ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send size={18} /> 
                  <span>Mandar Disponibilidad {nextMonthName.split(' ')[0]}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in h-full flex flex-col">
      {activeTab === 'home' && renderHome()}
      {activeTab === 'availability' && renderAvailability()}
      {activeTab === 'messages' && renderMessages()}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex justify-between items-center overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic flex items-center gap-3 relative z-10">
              <Bell className="text-red-600" size={28} />
              Centro de Avisos
            </h2>
          </div>
          <div className="space-y-3">
            {notifications.length === 0 ? (
               <div className="p-20 text-center opacity-30 flex flex-col items-center gap-4">
                 <CheckCircle2 size={48} className="text-slate-200" />
                 <p className="font-black uppercase text-xs italic tracking-widest">No hay avisos recientes</p>
               </div>
            ) : (
              [...notifications].sort((a,b) => b.id - a.id).map(n => (
                <div key={n.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex gap-4 items-start group hover:border-red-100 transition-colors">
                  <div className={`w-3 h-3 rounded-full mt-2 shrink-0 ${n.read ? 'bg-slate-200' : 'bg-red-500 shadow-md shadow-red-200 animate-pulse'}`}></div>
                  <div className="flex-1">
                    <p className={`font-black uppercase text-sm ${!n.read ? 'text-slate-900' : 'text-slate-500'}`}>{n.title}</p>
                    <p className="text-slate-500 text-xs mt-1 font-medium leading-relaxed">{n.body}</p>
                    <p className="text-[9px] font-black text-slate-300 mt-2 uppercase tracking-tighter">{new Date(n.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes pop-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } } 
        .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
};

export default UserView;