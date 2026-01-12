
import React, { useState } from 'react';
import { db } from '../services/db';
import { generateSmartPlanning } from '../services/geminiService';
import { Shift, User } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Configuración estricta basada en la imagen del usuario
const STRICT_SCHEDULE = {
  2: [ // Martes
    { lugar: "LA BARBERA", inicio: "10:30", fin: "12:30", franja: "manana" },
    { lugar: "LA CREUETA", inicio: "10:30", fin: "12:30", franja: "manana" },
    { lugar: "EL CENSAL", inicio: "17:30", fin: "19:30", franja: "tarde" },
    { lugar: "LA BARBERA", inicio: "17:30", fin: "19:30", franja: "tarde" }
  ],
  4: [ // Jueves
    { lugar: "CENTRO SALUD", inicio: "10:30", fin: "12:30", franja: "manana" },
    { lugar: "LA BARBERA", inicio: "10:30", fin: "12:30", franja: "manana" },
    { lugar: "EL CENSAL", inicio: "17:30", fin: "19:30", franja: "tarde" },
    { lugar: "LA BARBERA", inicio: "17:30", fin: "19:30", franja: "tarde" }
  ],
  6: [ // Sábado
    { lugar: "Dr. ESQUERDO", inicio: "10:30", fin: "12:00", franja: "sabado" },
    { lugar: "Dr. ESQUERDO", inicio: "12:00", fin: "13:30", franja: "sabado" },
    { lugar: "EL CENSAL", inicio: "10:30", fin: "12:00", franja: "sabado" },
    { lugar: "EL CENSAL", inicio: "12:00", fin: "13:30", franja: "sabado" }
  ]
};

const CoordPlanning: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Shift[]>([]);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setShowDownloadSuccess(false);
    try {
      const users = db.getUsers().filter(u => u.rol === 'usuario');
      const avs = db.getAvailabilities();
      
      const nextMonthDate = new Date();
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const monthStr = nextMonthDate.toISOString().slice(0, 7);
      const monthName = nextMonthDate.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
      const year = nextMonthDate.getFullYear();
      
      const plan = await generateSmartPlanning(users, avs, monthStr, STRICT_SCHEDULE);
      setPendingPlan(plan);
    } catch (e) {
      alert("Error en la planificación rápida. Inténtalo de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = (planToDownload: Shift[]) => {
    const doc = new jsPDF();
    const users = db.getUsers();
    
    const nextMonthDate = new Date();
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const monthName = nextMonthDate.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    const year = nextMonthDate.getFullYear();

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text(`PPOC DE LA CONGREGACIÓN LA BARBERA PARA`, 105, 15, { align: 'center' });
    doc.text(`EL MES DE ${monthName} ${year}`, 105, 22, { align: 'center' });
    
    const tableData = planToDownload.reduce((acc: any[], p) => {
      const key = `${p.fecha}-${p.lugar}-${p.inicio}`;
      let row = acc.find(r => r.key === key);
      const user = users.find(u => u.id === p.asignadoA);
      const userName = user ? `${user.nombre} ${user.apellidos}` : 'Sin asignar';
      
      if (!row) {
        acc.push({
          key,
          fechaRaw: p.fecha,
          fecha: new Date(p.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit' }),
          lugar: p.lugar,
          horario: `${p.inicio} - ${p.fin}`,
          voluntarios: [userName]
        });
      } else {
        row.voluntarios.push(userName);
      }
      return acc;
    }, []).sort((a, b) => a.fechaRaw.localeCompare(b.fechaRaw));

    const finalRows = tableData.map(r => [
      r.fecha.charAt(0).toUpperCase() + r.fecha.slice(1),
      r.horario,
      r.lugar,
      r.voluntarios.join(' – ')
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['FECHA', 'HORARIO', 'UBICACIÓN', 'NOMBRES']],
      body: finalRows,
      headStyles: { fillColor: [255, 255, 255], textColor: [100, 116, 139], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59], cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40, textColor: [37, 99, 235], fontStyle: 'bold' },
        3: { textColor: [234, 88, 12], fontStyle: 'bold' }
      },
      alternateRowStyles: { fillColor: [250, 251, 253] },
      margin: { left: 14, right: 14 }
    });

    doc.save(`Plan_PPCO_${monthName}_${year}.pdf`);
  };

  const handlePublish = () => {
    const existing = db.getShifts();
    db.setShifts([...existing, ...pendingPlan]);
    
    const notifs = db.getNotifications();
    const info: any = {
      id: `plan-${Date.now()}`,
      tipo: 'info',
      titulo: '🗓️ Nueva Planificación Mensual',
      cuerpo: `Se han publicado los turnos siguiendo los horarios oficiales de La Barbera. ¡Revisa tu calendario!`,
      color: 'normal',
      destinatarios: ['all'],
      timestamp: new Date().toISOString(),
      leida: false
    };
    db.setNotifications([info, ...notifs]);
    setShowDownloadSuccess(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <i className="fa-solid fa-clock-rotate-left text-8xl text-blue-600"></i>
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 mb-2">Generación con Horarios Oficiales</h2>
        <p className="text-slate-500 font-medium mb-8 max-w-2xl">
          El sistema solo creará turnos los <b>Martes, Jueves y Sábados</b> en las ubicaciones y horas exactas de la congregación.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4">
          {!showDownloadSuccess ? (
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <i className="fa-solid fa-bolt animate-pulse"></i>
                  Sincronizando horarios oficiales...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  Generar Planificación Fiel
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 flex gap-3">
               <button 
                onClick={() => downloadPDF(pendingPlan)}
                className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-100"
              >
                <i className="fa-solid fa-file-pdf"></i>
                Descargar Cuadrante PDF
              </button>
              <button 
                onClick={() => { setPendingPlan([]); setShowDownloadSuccess(false); }}
                className="px-8 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>

      {pendingPlan.length > 0 && !showDownloadSuccess && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-800">Vista Previa del Cuadrante</h3>
              <p className="text-xs font-bold text-slate-400 uppercase mt-1">Sincronizado con el modelo oficial</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handlePublish}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl text-sm transition-all shadow-lg shadow-green-100"
              >
                <i className="fa-solid fa-paper-plane mr-2"></i>
                Confirmar y Publicar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {pendingPlan.reduce((acc: any[], p) => {
              const key = `${p.fecha}-${p.lugar}-${p.inicio}`;
              let group = acc.find(g => g.key === key);
              if (!group) {
                group = { key, fecha: p.fecha, lugar: p.lugar, inicio: p.inicio, fin: p.fin, users: [] };
                acc.push(group);
              }
              const user = db.getUsers().find(u => u.id === p.asignadoA);
              group.users.push(user);
              return acc;
            }, []).sort((a,b) => a.fecha.localeCompare(b.fecha)).map((group, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(group.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600">{group.inicio}-{group.fin}</span>
                </div>
                <p className="text-xs font-black text-slate-800 mb-3 truncate">{group.lugar}</p>
                <div className="space-y-1">
                  {group.users.map((u: User, uIdx: number) => (
                    <div key={uIdx} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u?.nombre}&backgroundColor=ffffff&size=32`} alt="avatar" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 truncate">{u?.nombre} {u?.apellidos}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordPlanning;
