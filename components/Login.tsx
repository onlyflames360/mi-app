
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Role } from '../types';
import { LucideIcon, Fingerprint as FingerprintIcon, LogIn as LogInIcon, UserPlus as UserPlusIcon, ShieldCheck as ShieldCheckIcon, User as UserIconLucide, AlertCircle as AlertCircleIcon, Check as CheckIcon, X as XIcon } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  registeredUsers: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, registeredUsers }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const upperName = useMemo(() => fullName.toUpperCase().trim(), [fullName]);
  
  const suggestions = useMemo(() => {
    if (upperName.length < 2) return [];
    return registeredUsers
      .filter(u => u.display_name.toUpperCase().includes(upperName))
      .slice(0, 5);
  }, [upperName, registeredUsers]);

  const isUserRegistered = useMemo(() => {
    if (!upperName) return false;
    if (upperName === '1914') return true;
    return registeredUsers.some(u => u.display_name.toUpperCase() === upperName);
  }, [upperName, registeredUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuth = async () => {
    if (!upperName) {
      alert("Por favor, introduce tu nombre.");
      return;
    }

    if (!isUserRegistered) {
      alert("Lo sentimos, este nombre no figura en la lista del coordinador. Por favor, revisa que esté bien escrito.");
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    
    let role = Role.USER;
    let displayName = upperName;
    let userId = "";

    if (upperName === '1914') {
      role = Role.COORD;
      displayName = 'COORDINADOR PRINCIPAL';
      userId = 'admin-1';
    } else {
      const existing = registeredUsers.find(u => u.display_name.toUpperCase() === upperName);
      role = existing?.role || Role.USER;
      userId = existing?.id || Math.random().toString(36).substr(2, 9);
    }

    const mockUser: User = {
      id: userId,
      display_name: displayName,
      role: role,
      created_at: new Date().toISOString()
    };
    
    setLoading(false);
    onLogin(mockUser);
  };

  const selectSuggestion = (name: string) => {
    setFullName(name);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 space-y-8 border border-white">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-200">
            <FingerprintIcon size={48} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">PPOC</h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Acceso Voluntarios</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 relative" ref={suggestionRef}>
            <label className="text-sm font-black text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-tighter">
              <UserIconLucide size={16} className="text-blue-600" />
              Tu Nombre de Usuario
            </label>
            <div className="relative group">
              <input 
                type="text" 
                value={fullName}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="ESCRIBE TU NOMBRE COMPLETO"
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-slate-50 text-slate-800 font-black placeholder:text-slate-300 placeholder:font-medium uppercase"
              />
              {upperName === '1914' && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 flex items-center gap-1 animate-bounce">
                  <ShieldCheckIcon size={24} />
                  <span className="text-[10px] font-black uppercase">Admin</span>
                </div>
              )}
            </div>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2">
                  {suggestions.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => selectSuggestion(u.display_name)}
                      className="w-full flex items-center justify-between p-4 hover:bg-blue-50 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-400 text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {u.display_name.charAt(0)}
                        </div>
                        <span className="font-black text-slate-700 text-xs uppercase tracking-tight group-hover:text-blue-700">
                          {u.display_name}
                        </span>
                      </div>
                      <CheckIcon size={14} className="text-blue-500 opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {upperName.length > 3 && !isUserRegistered && !showSuggestions && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100 text-red-700 mt-2">
                <AlertCircleIcon size={16} className="shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-tight leading-tight">
                  No estás en la lista. Debes confirmar tu nombre con el coordinador.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleAuth}
            disabled={loading || (upperName.length > 0 && !isUserRegistered)}
            className="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-200 text-white font-black py-5 px-6 rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-3 transition-all transform active:scale-95"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <FingerprintIcon size={24} />
                {upperName === '1914' ? 'ACCESO COORDINACIÓN' : 'CONFIRMAR Y ENTRAR'}
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-center text-[9px] text-slate-400 font-bold leading-relaxed uppercase tracking-tighter">
            Para entrar, tu nombre debe haber sido registrado previamente por el coordinador de turnos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
