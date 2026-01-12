
import React, { useState } from 'react';
import { db } from '../services/db';
import { User, AppNotification } from '../types';

interface UserMessagingProps { user: User; }

const UserMessaging: React.FC<UserMessagingProps> = ({ user }) => {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const subjects = [
    "Duda sobre mi turno",
    "Cambio de disponibilidad",
    "Problema técnico en la app",
    "Sugerencia / Feedback",
    "Otro motivo..."
  ];

  const handleSend = () => {
    if (!message.trim() || !subject) return;

    setIsSending(true);
    
    // Simular un pequeño delay de red
    setTimeout(() => {
      const coordinators = db.getUsers().filter(u => u.rol === 'coordinador').map(u => u.id);
      const notifs = db.getNotifications();
      
      const newNotif: AppNotification = {
        id: `msg-${Date.now()}`,
        tipo: 'info',
        titulo: `📩 Nuevo mensaje de ${user.nombre}`,
        cuerpo: `Asunto: ${subject}\n\n"${message}"`,
        color: 'normal',
        destinatarios: coordinators,
        timestamp: new Date().toISOString(),
        leida: false
      };

      db.setNotifications([newNotif, ...notifs]);
      
      setIsSending(false);
      setShowSuccess(true);
      setMessage('');
      setSubject('');
      
      // Ocultar mensaje de éxito tras 3 segundos
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <i className="fa-solid fa-paper-plane text-7xl text-blue-600 -rotate-12"></i>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-800">Mensajería Directa</h2>
          <p className="text-slate-500 font-medium">Envía un mensaje privado a los coordinadores. Te responderán lo antes posible.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asunto del mensaje</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {subjects.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSubject(s)}
                  className={`px-4 py-3 rounded-2xl text-xs font-bold text-left transition-all border ${
                    subject === s 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                      : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200 hover:bg-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tu mensaje</label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe aquí los detalles..."
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all resize-none"
            ></textarea>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSend}
              disabled={isSending || !message.trim() || !subject}
              className={`w-full py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                isSending || !message.trim() || !subject
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100'
              }`}
            >
              {isSending ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin text-lg"></i>
                  Enviando mensaje...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  Enviar Mensaje
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Feedback Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300 z-10">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce">
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 className="text-xl font-black text-slate-800">¡Mensaje Enviado!</h3>
            <p className="text-sm text-slate-500 font-medium">Los coordinadores han sido notificados.</p>
          </div>
        )}
      </div>

      <div className="bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden relative shadow-xl">
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl shrink-0">
             <i className="fa-solid fa-shield-halved text-blue-400"></i>
          </div>
          <div>
            <h4 className="font-bold text-sm">Privacidad Garantizada</h4>
            <p className="text-slate-400 text-xs mt-1">Tu mensaje solo podrá ser leído por el equipo de coordinación de PPCO.</p>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default UserMessaging;
