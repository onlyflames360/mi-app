
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
    
    allShifts[shiftIdx] = { 
      ...shift, 
      asignadoA: user.id, 
      estado: 'confirmado' 
    };
    db.setShifts(allShifts);

    const coordNotif: AppNotification = {
      id: `cover-coord-${Date.now()}`,
      tipo: 'info',
      titulo: 'Turno Cubierto',
      cuerpo: `${user.nombre} ha cubierto el turno de ${oldUser?.nombre || 'otro voluntario'} en ${shift.lugar}.`,
      color: 'normal',
      destinatarios: db.getUsers().filter(u => u.rol === 'coordinador').map(u => u.id),
      timestamp: new Date().toISOString(),
      leida: false
    };

    const filteredNotifs = db.getNotifications().filter(n => n.refTurnoId !== notif.refTurnoId);
    db.setNotifications([coordNotif, ...filteredNotifs]);

    alert("¡Turno asignado! Gracias por tu colaboración.");
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
          {filtered.map(n => (
            <div 
              key={n.id} 
              className={`p-5 rounded-3xl border transition-all relative overflow-hidden ${
                n.color === 'rojo' 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-white border-slate-100'
              } ${!n.leida ? 'ring-2 ring-blue-500/10 shadow-lg' : ''}`}
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  n.tipo === 'urgente_cobertura' ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-100 text-blue-600'
                }`}>
                  <i className={`fa-solid ${n.tipo === 'urgente_cobertura' ? 'fa-fire-flame-curved' : 'fa-info-circle'}`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-sm font-black ${n.color === 'rojo' ? 'text-red-900' : 'text-slate-800'}`}>{n.titulo}</h3>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{n.cuerpo}</p>
                  
                  {n.tipo === 'urgente_cobertura' && !n.leida && (
                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={() => handleCoverShift(n)}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-red-100 transition-all"
                      >
                        ✅ Cubrir Turno
                      </button>
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="px-6 py-2 bg-white text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase rounded-xl border border-slate-200 transition-all"
                      >
                        Omitir
                      </button>
                    </div>
                  )}
                  
                  {!n.leida && n.tipo !== 'urgente_cobertura' && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="mt-3 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800"
                    >
                      Marcar como leída
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserNotifications;
