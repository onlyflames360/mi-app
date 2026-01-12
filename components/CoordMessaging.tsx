
import React, { useState } from 'react';
import { db } from '../services/db';
import { User, AppNotification } from '../types';

const CoordMessaging: React.FC = () => {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedDest, setSelectedDest] = useState<'all' | string[]>(['all']);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const users = db.getUsers().filter(u => u.rol === 'usuario');

  const subjects = [
    "📢 Comunicado General",
    "🗓️ Recordatorio de Reunión",
    "⚠️ Cambio de Horario",
    "🌟 Agradecimiento",
    "🛠️ Mantenimiento App"
  ];

  const handleToggleUser = (userId: string) => {
    if (selectedDest === 'all') {
      setSelectedDest([userId]);
    } else {
      if (selectedDest.includes(userId)) {
        const next = selectedDest.filter(id => id !== userId);
        setSelectedDest(next.length === 0 ? ['all'] : next);
      } else {
        setSelectedDest([...selectedDest, userId]);
      }
    }
  };

  const handleSend = () => {
    if (!message.trim() || !subject) return;

    setIsSending(true);
    
    setTimeout(() => {
      const notifs = db.getNotifications();
      const recipients = selectedDest === 'all' ? ['all'] : selectedDest;
      
      const newNotif: AppNotification = {
        id: `coord-msg-${Date.now()}`,
        tipo: 'info',
        titulo: subject,
        cuerpo: message,
        color: subject.includes('⚠️') ? 'rojo' : 'normal',
        destinatarios: recipients,
        timestamp: new Date().toISOString(),
        leida: false
      };

      db.setNotifications([newNotif, ...notifs]);
      
      setIsSending(false);
      setShowSuccess(true);
      setMessage('');
      setSubject('');
      setSelectedDest(['all']);
      
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const filteredUsers = users.filter(u => 
    `${u.nombre} ${u.apellidos}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-800">Enviar Comunicado</h2>
              <p className="text-slate-500 font-medium">Llega a todos los voluntarios de forma instantánea.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asunto rápido</label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setSubject(s)}
                      className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                        subject === s 
                          ? 'bg-slate-900 border-slate-900 text-white' 
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asunto personalizado</label>
                <input 
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Título del mensaje..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensaje completo</label>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe aquí el contenido del aviso..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all resize-none"
                ></textarea>
              </div>

              <button
                onClick={handleSend}
                disabled={isSending || !message.trim() || !subject}
                className={`w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                  isSending || !message.trim() || !subject
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100'
                }`}
              >
                {isSending ? (
                  <i className="fa-solid fa-circle-notch animate-spin text-lg"></i>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i>
                    Enviar a {selectedDest === 'all' ? 'todos' : `${selectedDest.length} voluntarios`}
                  </>
                )}
              </button>
            </div>

            {showSuccess && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in z-20">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mb-4 animate-bounce">
                  <i className="fa-solid fa-check"></i>
                </div>
                <h3 className="text-xl font-black text-slate-800">¡Enviado con éxito!</h3>
                <p className="text-sm text-slate-500">Notificación entregada a los destinatarios.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recipients */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-[600px]">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Destinatarios</h3>
            
            <button 
              onClick={() => setSelectedDest('all')}
              className={`w-full p-4 mb-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 flex items-center justify-between ${
                selectedDest === 'all' 
                  ? 'bg-blue-50 border-blue-600 text-blue-700' 
                  : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
              }`}
            >
              <span>Todos los voluntarios</span>
              <i className={`fa-solid ${selectedDest === 'all' ? 'fa-check-circle' : 'fa-users'}`}></i>
            </button>

            <div className="relative mb-4">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
              <input 
                type="text"
                placeholder="Filtrar voluntarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredUsers.map(u => {
                const isSelected = selectedDest !== 'all' && selectedDest.includes(u.id);
                return (
                  <button 
                    key={u.id}
                    onClick={() => handleToggleUser(u.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-100 ring-1 ring-blue-500/20' 
                        : 'bg-white border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.avatarSeed || u.nombre}&backgroundColor=ffffff&size=32&topType=${u.genero === 'femenino' ? 'longHair,bob,curly' : 'shortHair,theCaesar,frizzle'}`} alt="av" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                        {u.nombre}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium truncate">{u.apellidos}</p>
                    </div>
                    {isSelected && <i className="fa-solid fa-check text-blue-600 text-[10px]"></i>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordMessaging;
