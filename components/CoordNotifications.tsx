
import React from 'react';
import { db } from '../services/db';

const CoordNotifications: React.FC = () => {
  const allNotifs = db.getNotifications().sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 mb-6">Alertas y Registro del Sistema</h2>
        
        <div className="space-y-4">
          {allNotifs.map((n, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                n.color === 'rojo' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-500'
              }`}>
                <i className={`fa-solid ${n.color === 'rojo' ? 'fa-bell-concierge' : 'fa-list-check'}`}></i>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(n.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {n.tipo === 'urgente_cobertura' && (
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[8px] font-black uppercase rounded">Incidencia</span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-800">{n.titulo}</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">{n.cuerpo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoordNotifications;
