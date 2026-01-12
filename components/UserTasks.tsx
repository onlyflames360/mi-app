
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { User, Shift, Notification } from '../types';

interface UserTasksProps { user: User; }

const UserTasks: React.FC<UserTasksProps> = ({ user }) => {
  const [tasks, setTasks] = useState<Shift[]>([]);
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const users = db.getUsers();

  useEffect(() => {
    const shifts = db.getShifts();
    setAllShifts(shifts);
    setTasks(shifts.filter(s => s.asignadoA === user.id).sort((a, b) => a.fecha.localeCompare(b.fecha)));
  }, [user.id]);

  const updateStatus = (taskId: string, status: Shift['estado']) => {
    const currentShifts = db.getShifts();
    const updated = currentShifts.map(s => {
      if (s.id === taskId) {
        // Alerta al Coordinador
        const notifs = db.getNotifications();
        const coordAlert: Notification = {
          id: `coord-alert-${Date.now()}`,
          tipo: 'info',
          titulo: status === 'confirmado' ? 'Turno Confirmado' : 'Baja en Turno',
          cuerpo: `El voluntario ${user.nombre} ${status === 'confirmado' ? 'ha confirmado' : 'ha indicado que NO puede asistir al'} turno en ${s.lugar} (${s.fecha}).`,
          color: status === 'confirmado' ? 'normal' : 'rojo',
          destinatarios: users.filter(u => u.rol === 'coordinador').map(u => u.id),
          timestamp: new Date().toISOString(),
          leida: false
        };

        if (status === 'rechazado') {
          // Notificación masiva para cubrir el turno
          const urgent: Notification = {
            id: `urgent-${Date.now()}`,
            tipo: 'urgente_cobertura',
            titulo: '⚠️ SE NECESITA COBERTURA',
            cuerpo: `Turno libre en ${s.lugar} para el ${new Date(s.fecha).toLocaleDateString()}. ¿Puedes cubrirlo?`,
            color: 'rojo',
            refTurnoId: s.id,
            destinatarios: users.filter(u => u.rol === 'usuario' && u.id !== user.id).map(u => u.id),
            timestamp: new Date().toISOString(),
            leida: false
          };
          db.setNotifications([urgent, coordAlert, ...notifs]);
          return { ...s, estado: 'en_sustitucion' as const };
        }

        db.setNotifications([coordAlert, ...notifs]);
        return { ...s, estado: status };
      }
      return s;
    });

    db.setShifts(updated);
    setAllShifts(updated);
    setTasks(updated.filter(s => s.asignadoA === user.id));
  };

  const getPartners = (task: Shift) => {
    return allShifts.filter(s => 
      s.fecha === task.fecha && 
      s.lugar === task.lugar && 
      s.franja === task.franja && 
      s.asignadoA !== user.id &&
      s.estado !== 'cancelado'
    ).map(s => users.find(u => u.id === s.asignadoA)).filter(Boolean) as User[];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-slate-800">Tus próximos turnos</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-full">
          {tasks.filter(t => t.estado !== 'cancelado').length} Activos
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-calendar-day text-slate-300 text-3xl"></i>
          </div>
          <p className="text-slate-500 font-bold">No tienes turnos asignados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map(task => {
            const partners = getPartners(task);
            return (
              <div key={task.id} className={`bg-white p-6 rounded-3xl border shadow-sm transition-all relative overflow-hidden ${task.estado === 'cancelado' ? 'opacity-50 grayscale bg-slate-50' : 'border-slate-200'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    task.estado === 'confirmado' ? 'bg-green-100 text-green-700' :
                    task.estado === 'en_sustitucion' ? 'bg-orange-100 text-orange-700' :
                    task.estado === 'cancelado' ? 'bg-red-600 text-white' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {task.estado === 'pendiente' ? 'Esperando confirmación' : task.estado.replace('_', ' ')}
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-1">{task.lugar}</h3>
                
                <div className="flex items-center gap-3 text-slate-500 text-sm font-bold mb-6">
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-calendar opacity-50 text-xs"></i>
                    {new Date(task.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-clock opacity-50 text-xs"></i>
                    {task.inicio} - {task.fin}
                  </span>
                </div>

                {/* Sección de Compañeros */}
                <div className="mb-6 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <i className="fa-solid fa-user-group text-blue-500"></i> Mi compañero/a
                  </p>
                  {partners.length > 0 ? (
                    <div className="space-y-2">
                      {partners.map(p => (
                        <div key={p.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 overflow-hidden shadow-sm">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.nombre}&backgroundColor=ffffff&topType=${p.genero === 'femenino' ? 'longHair,bob,curly' : 'shortHair,theCaesar,frizzle'}`} alt="p" />
                          </div>
                          <span className="text-sm font-bold text-slate-700">{p.nombre} {p.apellidos}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] font-bold text-slate-400 italic">No hay otros asignados aún</p>
                  )}
                </div>

                {task.estado === 'pendiente' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => updateStatus(task.id, 'confirmado')}
                      className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-100"
                    >
                      <i className="fa-solid fa-check mr-2"></i> Asistiré
                    </button>
                    <button 
                      onClick={() => updateStatus(task.id, 'rechazado')}
                      className="py-3 bg-white border-2 border-slate-100 hover:border-red-200 hover:text-red-600 text-slate-400 rounded-2xl font-black text-sm transition-all"
                    >
                      <i className="fa-solid fa-xmark mr-2"></i> No puedo
                    </button>
                  </div>
                )}

                {task.estado === 'confirmado' && (
                  <button 
                    onClick={() => updateStatus(task.id, 'rechazado')}
                    className="w-full py-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-2xl font-black text-xs transition-all border border-transparent hover:border-red-100"
                  >
                    Cambiar a "No puedo asistir"
                  </button>
                )}

                {task.estado === 'cancelado' && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-2xl text-center text-xs font-black">
                    MOTIVO: {task.motivoRechazo}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserTasks;
