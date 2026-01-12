
import React, { useState } from 'react';
import { db } from '../services/db';
import { User, MonthlyAvailability, AvailabilityStatus } from '../types';

interface UserAvailabilityProps { user: User; }

const UserAvailability: React.FC<UserAvailabilityProps> = ({ user }) => {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const monthKey = nextMonth.toISOString().slice(0, 7);
  const monthName = nextMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  // Generar semanas ficticias para el ejemplo
  const initialAv: MonthlyAvailability = {
    idUsuario: user.id,
    mes: monthKey,
    semanas: [1, 2, 3, 4].map(w => ({
      semana: w,
      dias: ['Martes', 'Jueves', 'Sábado'].map(d => ({
        fecha: `Semana ${w} - ${d}`,
        estado: 'ambos' as AvailabilityStatus
      }))
    })),
    estado: 'borrador',
    timestamp: new Date().toISOString()
  };

  const [av, setAv] = useState<MonthlyAvailability>(() => {
    const existing = db.getAvailabilities().find(a => a.idUsuario === user.id && a.mes === monthKey);
    return existing || initialAv;
  });

  const handleUpdate = (weekIdx: number, dayIdx: number, status: AvailabilityStatus) => {
    if (av.estado === 'enviada') return;
    const newAv = { ...av };
    newAv.semanas[weekIdx].dias[dayIdx].estado = status;
    setAv(newAv);
  };

  const save = (isFinal: boolean) => {
    const current = db.getAvailabilities();
    const updated = { ...av, estado: isFinal ? 'enviada' as const : 'borrador' as const, timestamp: new Date().toISOString() };
    const filtered = current.filter(a => !(a.idUsuario === user.id && a.mes === monthKey));
    db.setAvailabilities([...filtered, updated]);
    setAv(updated);
    if (isFinal) alert("Disponibilidad enviada correctamente al coordinador.");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 capitalize">Disponibilidad – {monthName}</h2>
            <p className="text-slate-500 font-medium">Marca los tramos horarios en los que estarás disponible.</p>
          </div>
          <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
            av.estado === 'enviada' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {av.estado}
          </div>
        </div>

        <div className="space-y-8">
          {av.semanas.map((week, wIdx) => (
            <div key={wIdx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Semana {week.semana}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {week.dias.map((day, dIdx) => (
                  <div key={dIdx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <p className="text-sm font-black text-slate-800 mb-3">{day.fecha}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['manana', 'tarde', 'ambos', 'no_puedo'] as AvailabilityStatus[]).map(status => (
                        <button
                          key={status}
                          disabled={av.estado === 'enviada'}
                          onClick={() => handleUpdate(wIdx, dIdx, status)}
                          className={`py-2 px-1 text-[10px] font-black uppercase rounded-lg border transition-all ${
                            day.estado === status 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100' 
                              : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'
                          }`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          {av.estado !== 'enviada' ? (
            <>
              <button 
                onClick={() => save(false)}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all"
              >
                Guardar borrador
              </button>
              <button 
                onClick={() => save(true)}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all"
              >
                Enviar al coordinador
              </button>
            </>
          ) : (
            <div className="w-full p-4 bg-green-50 text-green-700 text-center font-bold rounded-2xl border border-green-100">
              <i className="fa-solid fa-lock mr-2"></i>
              Disponibilidad bloqueada tras el envío
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAvailability;
