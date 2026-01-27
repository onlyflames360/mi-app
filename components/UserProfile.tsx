
import React, { useState, useRef } from 'react';
import { db } from '../services/db';
import { User } from '../types';

interface UserProfileProps { 
  user: User;
  onUserUpdate: (u: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUserUpdate }) => {
  const [currentSeed, setCurrentSeed] = useState(user.avatarSeed || user.nombre);
  const [currentUrl, setCurrentUrl] = useState<string | undefined>(user.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [options] = useState(() => 
    Array.from({ length: 8 }, () => Math.random().toString(36).substring(7))
  );

  const handleSave = () => {
    setIsSaving(true);
    const updatedUser = { ...user, avatarSeed: currentSeed, avatarUrl: currentUrl };
    
    setTimeout(() => {
      db.updateUser(updatedUser);
      onUserUpdate(updatedUser);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("La imagen es demasiado grande. El máximo son 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentUrl(event.target?.result as string);
        setCurrentSeed(''); // Limpiar seed si se sube foto
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setCurrentUrl(undefined);
    setCurrentSeed(user.nombre);
  };

  const getAvatarUrl = (seed: string) => 
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  const finalPreview = currentUrl || getAvatarUrl(currentSeed || user.nombre);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-xl mb-4 group-hover:scale-105 transition-transform duration-500 bg-slate-50">
              <img src={finalPreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fa-solid fa-camera text-sm"></i>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Tu Perfil</h2>
          <p className="text-slate-500 font-medium">Personaliza tu foto o elige un avatar amable.</p>
          
          {currentUrl && (
            <button 
              onClick={removePhoto}
              className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-700"
            >
              Eliminar foto y usar avatar
            </button>
          )}
        </div>

        <div className="space-y-8">
          {!currentUrl && (
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 ml-1">Ilustraciones amables</label>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                {[user.nombre, ...options].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentSeed(opt);
                      setCurrentUrl(undefined);
                    }}
                    className={`aspect-square rounded-2xl border-2 transition-all p-1 overflow-hidden ${
                      currentSeed === opt ? 'border-blue-500 bg-blue-50 scale-105 shadow-md' : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <img src={getAvatarUrl(opt)} alt={`option-${i}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                isSaving 
                  ? 'bg-slate-100 text-slate-400' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100'
              }`}
            >
              {isSaving ? (
                <i className="fa-solid fa-circle-notch animate-spin"></i>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-in fade-in">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce">
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 className="text-xl font-black text-slate-800">¡Perfil Actualizado!</h3>
            <p className="text-sm text-slate-500 font-medium">Tus cambios se han guardado correctamente.</p>
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Información de cuenta</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500">Nombre completo</span>
            <span className="text-sm font-black text-slate-700">{user.nombre} {user.apellidos}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-xs font-bold text-slate-500">Rol asignado</span>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase">{user.rol}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
