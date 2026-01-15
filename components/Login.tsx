import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Role, Gender } from '../types';
import { Fingerprint as FingerprintIcon, LogIn as LogInIcon, UserPlus as UserPlusIcon, ShieldCheck as ShieldCheckIcon, User as UserIconLucide, AlertCircle as AlertCircleIcon, Check as CheckIcon, X as XIcon, Mail, Lock } from 'lucide-react';
import { supabase } from '../services/supabase'; // Importar el cliente Supabase

interface LoginProps {
  onLogin: (user: User) => void;
  registeredUsers: User[]; // Mantener para la lógica del coordinador
}

const Login: React.FC<LoginProps> = ({ onLogin, registeredUsers }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Para el registro
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(`Error al iniciar sesión: ${error.message}`);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Supabase user object might not have all our custom fields directly
      // We'll create a local User object based on Supabase data and our defaults
      const localUser: User = {
        id: data.user.id,
        email: data.user.email || email,
        display_name: data.user.user_metadata?.display_name || email.split('@')[0].toUpperCase(),
        role: data.user.user_metadata?.role || Role.USER,
        created_at: data.user.created_at,
        activo: data.user.user_metadata?.activo || true,
        genero: data.user.user_metadata?.genero || Gender.MASCULINO,
        avatarSeed: data.user.user_metadata?.avatarSeed || email.split('@')[0],
      };
      onLogin(localUser);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: fullName.toUpperCase(),
          role: Role.USER,
          activo: true,
          genero: Gender.MASCULINO, // Default, user can change later
          avatarSeed: fullName.split(' ')[0],
        },
      },
    });

    if (error) {
      alert(`Error al registrarse: ${error.message}`);
      setLoading(false);
      return;
    }

    if (data.user) {
      alert('¡Registro exitoso! Por favor, revisa tu correo para verificar tu cuenta.');
      setIsRegistering(false); // Volver a la vista de login
      setEmail('');
      setPassword('');
      setFullName('');
    }
    setLoading(false);
  };

  const handleAdminAuth = async () => {
    if (adminCode === '1914') {
      const adminUser: User = {
        id: 'admin-1',
        email: 'admin@ppoc.com', // Email ficticio para el admin local
        display_name: 'COORDINADOR PRINCIPAL',
        role: Role.COORD,
        created_at: new Date().toISOString(),
        activo: true,
        genero: Gender.MASCULINO,
        avatarSeed: 'admin-1',
      };
      onLogin(adminUser);
    } else {
      alert('Código de administrador incorrecto.');
    }
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
          {!showAdminPanel ? (
            <>
              {isRegistering && (
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-tighter">
                    <UserIconLucide size={16} className="text-blue-600" />
                    Tu Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="EJ: JUAN PÉREZ"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-slate-50 text-slate-800 font-black placeholder:text-slate-300 placeholder:font-medium uppercase"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-tighter">
                  <Mail size={16} className="text-blue-600" />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="TU@CORREO.COM"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-slate-50 text-slate-800 font-black placeholder:text-slate-300 placeholder:font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-tighter">
                  <Lock size={16} className="text-blue-600" />
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all bg-slate-50 text-slate-800 font-black placeholder:text-slate-300 placeholder:font-medium"
                />
              </div>

              {isRegistering ? (
                <button
                  onClick={handleRegister}
                  disabled={loading || !email || !password || !fullName}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-black py-5 px-6 rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition-all transform active:scale-95"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <UserPlusIcon size={24} />
                      REGISTRARSE
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={loading || !email || !password}
                  className="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-200 text-white font-black py-5 px-6 rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center gap-3 transition-all transform active:scale-95"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <LogInIcon size={24} />
                      INICIAR SESIÓN
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => setIsRegistering(prev => !prev)}
                className="w-full text-blue-600 font-bold text-sm mt-4 hover:underline"
              >
                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>

              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase">O</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <button
                onClick={() => setShowAdminPanel(true)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/40"
              >
                Acceso Administrador
              </button>
            </>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Código de Seguridad</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  autoFocus
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminAuth()}
                  placeholder="••••"
                  className="flex-1 min-w-0 px-3 sm:px-5 py-4 bg-white/5 border-2 border-white/10 rounded-2xl focus:border-indigo-500 outline-none font-black text-2xl tracking-[0.5em] sm:tracking-[1em] text-center text-slate-800"
                />
                <button
                  onClick={handleAdminAuth}
                  className="shrink-0 w-14 sm:w-16 h-14 sm:h-16 bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-900/20"
                >
                  <i className="fa-solid fa-arrow-right text-xl text-white"></i>
                </button>
              </div>
              <button
                onClick={() => setShowAdminPanel(false)}
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-chevron-left text-[8px]"></i> Volver atrás
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-center text-[9px] text-slate-400 font-bold leading-relaxed uppercase tracking-tighter">
            Para acceder, debes registrarte o usar tu cuenta existente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;