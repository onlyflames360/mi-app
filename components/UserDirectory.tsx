
import React, { useState } from 'react';
import { User } from '../types';

interface UserDirectoryProps {
  users: User[];
  onAddUser?: (name: string, surname: string) => void;
  onDeleteUser?: (userId: string) => void;
}

const UserDirectory: React.FC<UserDirectoryProps> = ({ users, onDeleteUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full relative">
      <div className="p-8 border-b border-slate-200 flex flex-col lg:flex-row gap-6 items-center justify-between bg-slate-50/50">
        <div className="relative w-full lg:w-96">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Buscar entre los voluntarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all font-bold text-slate-700"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="bg-white px-6 py-4 rounded-2xl border-2 border-slate-100 flex items-center gap-3 flex-1 lg:flex-none">
            <span className="text-2xl font-black text-indigo-600">{users.length}</span>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Voluntarios<br/>Registrados
            </div>
          </div>
          {onDeleteUser && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
               <i className="fa-solid fa-user-shield text-indigo-600 text-xs"></i>
               <span className="text-[9px] font-black text-indigo-800 uppercase tracking-widest">Modo Coordinador Activo</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto hide-scrollbar p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <i className="fa-solid fa-user-slash text-5xl text-slate-100 mb-4"></i>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay voluntarios que coincidan</p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} className="bg-white p-5 rounded-3xl border-2 border-slate-50 hover:border-indigo-100 transition-all group shadow-sm flex items-center gap-4 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg border border-indigo-100 uppercase shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-slate-800 uppercase tracking-tight text-xs truncate">{user.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${user.notificationsEnabled ? 'bg-green-500' : 'bg-slate-200'}`}></span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {user.notificationsEnabled ? 'Avisos Push' : 'Sin Avisos'}
                    </span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="mb-2">
                    <p className="text-lg font-black text-slate-800 leading-none">{user.shiftsFulfilled}</p>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Turnos</p>
                  </div>
                  
                  {/* Botón de borrado solo visible para administradores */}
                  {onDeleteUser && (
                    <button 
                      onClick={() => onDeleteUser(user.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 shadow-sm border border-red-100"
                      title="Borrar voluntario del registro oficial"
                    >
                      <i className="fa-solid fa-user-minus text-xs"></i>
                    </button>
                  )}
                </div>
                
                {/* Decoración sutil de fondo */}
                <i className="fa-solid fa-user absolute -right-2 -bottom-2 text-4xl text-slate-50 opacity-0 group-hover:opacity-20 transition-opacity"></i>
              </div>
            ))
          )}
        </div>
      </div>
      
      {!onDeleteUser && (
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Consulta protegida • Solo el coordinador puede modificar el registro oficial
          </p>
        </div>
      )}
    </div>
  );
};

export default UserDirectory;
