
import React from 'react';
import { Shift, User, ShiftStatus } from '../types';

interface NotificationSimulatorProps {
  shifts: Shift[];
  users: User[];
  notifications: any[];
  onAcceptCoverage: (shiftId: string, userId: string) => void;
  onCancelShift: (shiftId: string, userId: string) => void;
}

const NotificationSimulator: React.FC<NotificationSimulatorProps> = ({ shifts, users, notifications, onAcceptCoverage, onCancelShift }) => {
  const openShifts = shifts.filter(s => s.isReassignmentOpen);
  
  // Simulation: We assume the coordinator can "Force-Trigger" reminders
  const triggerWeeklyReminder = () => {
    alert(`Simulando: Enviando ${users.length} mensajes de WhatsApp para los turnos de la semana.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Control de Avisos</h2>
            <div className="flex gap-2">
              <button 
                onClick={triggerWeeklyReminder}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
              >
                <i className="fa-brands fa-whatsapp"></i>
                Lanzar Avisos de Semana
              </button>
            </div>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6">
            <p className="text-sm text-indigo-700 leading-relaxed">
              <strong>Lógica de Carrito:</strong> Al iniciar la semana, el sistema envía un mensaje automático. Si un voluntario marca "No puedo", el turno se abre inmediatamente para los demás usuarios. El primero en pulsar "OK" se queda con el turno.
            </p>
          </div>

          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-bolt text-amber-500"></i>
            Turnos Abiertos (Esperando Cobertura)
          </h3>
          
          <div className="space-y-4">
            {openShifts.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <i className="fa-solid fa-circle-check text-4xl text-green-200 mb-4"></i>
                <p className="text-slate-500">No hay turnos abiertos. Todo el calendario está cubierto.</p>
              </div>
            )}
            
            {openShifts.map(shift => (
              <div key={shift.id} className="p-5 bg-white border-2 border-red-100 rounded-2xl shadow-sm hover:border-red-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <p className="text-red-600 font-bold uppercase text-xs tracking-widest">Urgente: Sin Personal</p>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">{shift.location}</h4>
                  <p className="text-slate-500 text-sm">
                    {new Date(shift.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })} • {shift.startTime} - {shift.endTime}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs text-slate-400 font-medium italic">Disponible para el resto de voluntarios</p>
                  <button 
                    onClick={() => {
                        const randomUser = users[Math.floor(Math.random() * users.length)];
                        if (randomUser) onAcceptCoverage(shift.id, randomUser.id);
                    }}
                    className="px-6 py-2.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-100 flex items-center gap-2"
                  >
                    <i className="fa-solid fa-hand-holding-heart"></i>
                    Aceptar Turno (Simular Usuario)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Demo: Flujo de Usuario</h2>
          <div className="max-w-xs mx-auto bg-slate-100 rounded-[3rem] p-4 border-8 border-slate-800 shadow-2xl relative overflow-hidden">
             {/* Simulating a phone */}
             <div className="bg-indigo-600 p-4 -mx-4 -mt-4 mb-4 flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-white/20"></div>
               <div className="flex-1">
                 <p className="text-white text-xs font-bold">Carrito Avisos</p>
                 <p className="text-indigo-100 text-[10px]">En línea</p>
               </div>
             </div>
             
             <div className="space-y-3">
               <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-xs text-slate-700 max-w-[85%]">
                 ¡Hola! Esta semana te toca el carrito el <strong>Jueves de 10:30 a 12:30</strong> en <strong>Plaza Mayor</strong>. ¿Confirmas tu asistencia?
               </div>
               
               <div className="grid grid-cols-2 gap-2 mt-4">
                 <button 
                    className="bg-green-500 text-white py-3 rounded-xl text-xs font-bold hover:bg-green-600 transition-all"
                    onClick={() => alert("Simulación: Usuario confirma asistencia")}
                 >
                   ✅ Sí, puedo
                 </button>
                 <button 
                    className="bg-red-500 text-white py-3 rounded-xl text-xs font-bold hover:bg-red-600 transition-all"
                    onClick={() => {
                        if (shifts.length > 0 && shifts[0].assignedUsers.length > 0) {
                            onCancelShift(shifts[0].id, shifts[0].assignedUsers[0].userId);
                        }
                    }}
                 >
                   ❌ No puedo
                 </button>
               </div>
               
               <p className="text-[10px] text-slate-400 text-center mt-2 italic">Presiona "No puedo" para ver la lógica de reemplazo automático.</p>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white flex flex-col h-full max-h-[800px]">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <i className="fa-solid fa-terminal text-indigo-400"></i>
          Registro de Sistema
        </h3>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {notifications.length === 0 && (
            <p className="text-slate-500 text-sm italic">Esperando eventos del sistema...</p>
          )}
          {notifications.map(n => (
            <div key={n.id} className={`p-4 rounded-xl border-l-4 ${
              n.type === 'success' ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'
            }`}>
              <div className="flex justify-between items-start mb-1">
                <p className={`text-xs font-bold uppercase tracking-widest ${
                  n.type === 'success' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {n.type === 'success' ? 'LOG: OK' : 'LOG: ALERTA'}
                </p>
                <span className="text-[10px] text-slate-500">{n.time}</span>
              </div>
              <p className="text-sm text-slate-300">{n.message}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-slate-800">
           <p className="text-xs text-slate-500">El sistema monitorea en tiempo real cambios en el calendario de todos los voluntarios.</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSimulator;
