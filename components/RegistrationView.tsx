
import React, { useState } from 'react';

interface RegistrationViewProps {
  onRegister: (name: string, surname: string, alerts: boolean) => void;
  onGoToPlanning: () => void;
}

const RegistrationView: React.FC<RegistrationViewProps> = ({ onRegister, onGoToPlanning }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [alerts, setAlerts] = useState(true);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && surname) {
      onRegister(name, surname, alerts);
      setSuccess(true);
      // Reset form for next registration
      setName('');
      setSurname('');
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tight mb-2 uppercase">Alta de Voluntarios</h2>
          <p className="text-slate-400 font-bold opacity-80 uppercase text-xs tracking-widest">Módulo de gestión del Coordinador</p>
        </div>
        <i className="fa-solid fa-user-plus absolute -right-10 -bottom-10 text-[12rem] opacity-5 -rotate-12"></i>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-200">
            {success && (
              <div className="mb-8 p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-check"></i>
                </div>
                <div>
                  <p className="text-emerald-800 font-black text-sm uppercase leading-none">Alta Completada</p>
                  <p className="text-emerald-600 text-[10px] font-bold mt-1 uppercase">El voluntario ya puede acceder con su nombre.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                  <input 
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="NOMBRE"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700 placeholder:opacity-30 uppercase transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Apellidos</label>
                  <input 
                    required
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="APELLIDOS"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-700 placeholder:opacity-30 uppercase transition-all"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="fa-solid fa-tower-broadcast text-indigo-600 text-xs"></i>
                    <h3 className="font-black text-slate-800 text-sm uppercase">Habilitar Notificaciones Push</h3>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
                    Avisos nativos en tiempo real. Llegarán al móvil <span className="text-indigo-600 underline">incluso si la app está cerrada</span> o el móvil bloqueado.
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => setAlerts(!alerts)}
                  className={`w-14 h-7 rounded-full transition-all relative shrink-0 ${alerts ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${alerts ? 'left-8' : 'left-1'}`}></div>
                </button>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                Registrar Voluntario Oficial
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-50 p-6 rounded-[2rem] border-2 border-indigo-100">
            <h3 className="font-black text-indigo-900 text-xs uppercase tracking-widest mb-4">Información de Seguridad</h3>
            <p className="text-indigo-700/80 text-[11px] font-bold leading-relaxed uppercase">
              Para asegurar la integridad de la organización, el registro manual es obligatorio. Una vez registrado, el voluntario podrá acceder introduciendo su nombre exacto.
            </p>
          </div>
          <button 
            onClick={onGoToPlanning}
            className="w-full py-4 border-2 border-slate-200 text-slate-500 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-users"></i>
            Ver Listado Completo
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationView;
