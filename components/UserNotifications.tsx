
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { User, AppNotification, Shift } from '../types';

interface UserNotificationsProps { user: User; }

const UserNotifications: React.FC<UserNotificationsProps> = ({ user }) => {
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'urgente'>('all');
  const [permissionStatus, setPermissionStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'default'
  );

  useEffect(() => {
    loadNotifications();
  }, [user.id]);

  const loadNotifications = () => {
    const all = db.getNotifications();
    const mine = all.filter(n => n.destinatarios.includes(user.id) || n.destinatarios.includes('all'));
    setNotifs(mine);
  };

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await window.Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        alert("¡Genial! Ahora recibirás avisos incluso con el móvil bloqueado.");
      }
    }
  };

  const markAsRead = (id: string) => {
    const all = db.getNotifications();
    const updated = all.map(n => n.id === id ? { ...n, leida: true } : n);
    db.setNotifications(updated);
    loadNotifications();
  };

  const handleCoverShift = (notif: AppNotification) => {
    if (!notif.refTurnoId) return;

    const allShifts = db.getShifts();
    const shiftIdx = allShifts.findIndex(s => s.id === notif.refTurnoId);
    
    if (shiftIdx === -1) {
      alert("Este turno ya no existe.");
      return;
    }

    const shift = allShifts[shiftIdx];

    if (shift.estado !== 'en_sustitucion') {
      alert("Este turno ya ha sido cubierto por otro voluntario.");
      const allNotifs = db.getNotifications().filter(n => n.id !== notif.id);
      db.setNotifications(allNotifs);
      loadNotifications();
      return;
    }

    const oldUserId = shift.asignadoA;
    const oldUser = db.getUsers().find(u => u.id === oldUserId);
    const fechaTurno = new Date(shift.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' });
    
    // Actualizar el turno con el nuevo voluntario
    allShifts[shiftIdx] = { 
      ...shift, 
      asignadoA: user.id, 
      estado: 'confirmado' 
    };
    db.setShifts(allShifts);

    // 1. Notificación para el COORDINADOR
    const coordNotif: AppNotification = {
      id: `cover-coord-${Date.now()}`,
      tipo: 'info',
      titulo: '✅ Turno Reasignado',
      cuerpo: `${user.nombre} ${user.apellidos} ha cubierto el turno de ${oldUser?.nombre || 'otro voluntario'} en ${shift.lugar} (${fechaTurno}).`,
      color: 'normal',
      destinatarios: db.getUsers().filter(u => u.rol === 'coordinador').map(u => u.id),
      timestamp: new Date().toISOString(),
      leida: false
    };

    // 2. Notificación para el USUARIO SALIENTE (el que no podía ir)
    const oldUserNotif: AppNotification = {
      id: `cover-old-${Date.now()}`,
      tipo: 'info',
      titulo: '🔄 Turno Cubierto',
      cuerpo: `Tu turno del ${fechaTurno} en ${shift.lugar} ha sido cubierto por ${user.nombre}. No te preocupes, ¡gracias por avisar!`,
      color: 'normal',
      destinatarios: [oldUserId],
      timestamp: new Date().toISOString(),
      leida: false
    };

    // 3. Notificación para el USUARIO ENTRANTE (el que acaba de aceptar)
    const newUserNotif: AppNotification = {
      id: `cover-new-${Date.now()}`,
      tipo: 'info',
      titulo: '🌟 ¡Gracias por colaborar!',
      cuerpo: `Has reasignado a tu nombre el turno en ${shift.lugar} para el ${fechaTurno}. Se ha añadido a tus tareas.`,
      color: 'normal',
      destinatarios: [user.id],
      timestamp: new Date().toISOString(),
      leida: false
    };

    // Filtrar notificaciones antiguas del mismo turno y añadir las nuevas
    const currentAllNotifs = db.getNotifications().filter(n => n.refTurnoId !== notif.refTurnoId);
    db.setNotifications([newUserNotif, oldUserNotif, coordNotif, ...currentAllNotifs]);

    alert(`¡Gracias ${user.nombre}! El turno ahora es tuyo. Hemos avisado al coordinador y a tu compañero/a.`);
    loadNotifications();
  };

  const filtered = filter === 'all' ? notifs : notifs.filter(n => n.tipo === 'urgente_cobertura');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {permissionStatus !== 'granted' && (
        <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 flex flex-col md:flex-row items-center justify-between gap-6 animate-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shrink-0">
              <i className="fa-solid fa-mobile-screen-button"></i>
            </div>
            <div>
              <h3 className="font-black">¿Recibir avisos en el móvil?</h3>
              <p className="text-sm text-blue-100">Actívalas para enterarte de turnos libres incluso con el móvil bloqueado.</p>
            </div>
          </div>
          <button 
            onClick={requestPermission}
            className="px-6 py-3 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all text-sm whitespace-nowrap"
          >
            Habilitar Avisos
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-slate-800">Centro de Mensajes</h2>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl shadow-inner">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${filter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
          >Todas</button>
          <button 
            onClick={() => setFilter('urgente')}
            className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${filter === 'urgente' ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'text-slate-400'}`}
          >Urgentes</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-20 rounded-3xl border border-slate-100 text-center text-slate-400 font-bold">
          <i className="fa-solid fa-envelope-open text-3xl mb-4 opacity-20 block"></i>
          Sin notificaciones pendientes
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(n => {
            const isUrgent = n.tipo === 'urgente_cobertura';
            
            return (
              <div 
                key={n.id} 
                className={`group p-6 rounded-[2.5rem] border transition-all relative overflow-hidden ${
                  isUrgent 
                    ? 'bg-gradient-to-br from-red-50 via-white to-red-50 border-red-200 shadow-xl shadow-red-100/50 ring-2 ring-red-500/20' 
                    : 'bg-white border-slate-100 hover:shadow-md shadow-sm'
                } ${!n.leida && !isUrgent ? 'ring-2 ring-blue-500/10 shadow-lg' : ''}`}
              >
                {/* Visual feedback for urgency */}
                {isUrgent && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>
                )}

                <div className="flex gap-5 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                    isUrgent ? 'bg-red-500 text-white animate-bounce' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <i className={`fa-solid ${isUrgent ? 'fa-triangle-exclamation text-xl' : 'fa-info-circle text-lg'}`}></i>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        {isUrgent && (
                          <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
                            Incidencia Crítica
                          </span>
                        )}
                        <h3 className={`text-base font-black leading-tight ${n.color === 'rojo' ? 'text-red-900' : 'text-slate-800'}`}>
                          {n.titulo}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-bold ${isUrgent ? 'text-red-400' : 'text-slate-400'}`}>
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className={`text-sm font-medium leading-relaxed whitespace-pre-line ${
                      isUrgent ? 'text-red-700/80 bg-red-100/30 p-4 rounded-2xl border border-red-100/50 my-3' : 'text-slate-500'
                    }`}>
                      {n.cuerpo}
                    </div>
                    
                    {isUrgent && !n.leida && (
                      <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => handleCoverShift(n)}
                          className="flex-1 px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase rounded-2xl shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                          <i className="fa-solid fa-check-circle text-lg"></i>
                          ✅ CUBRIR ESTE TURNO AHORA
                        </button>
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="px-8 py-4 bg-white text-slate-400 hover:text-slate-600 text-xs font-black uppercase rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                          Omitir
                        </button>
                      </div>
                    )}
                    
                    {!n.leida && !isUrgent && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 flex items-center gap-2"
                      >
                        <i className="fa-solid fa-check-double"></i>
                        Marcar como leída
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserNotifications;
