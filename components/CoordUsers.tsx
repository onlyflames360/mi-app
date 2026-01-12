
import React, { useState } from 'react';
import { db } from '../services/db';
import { User } from '../types';

const CoordUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [search, setSearch] = useState('');

  const filtered = users.filter(u => 
    `${u.nombre} ${u.apellidos}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Administrar Usuarios</h2>
          <p className="text-slate-500 text-sm font-medium">Gestiona el alta y baja de voluntarios.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
            <input 
              type="text" 
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 bg-slate-900 text-white font-black rounded-xl text-sm hover:bg-black transition-all shrink-0">
            Registrar usuario
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre completo</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white overflow-hidden border border-slate-200 shadow-sm">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nombre}&backgroundColor=ffffff&topType=${user.genero === 'femenino' ? 'longHair,bob,curly' : 'shortHair,theCaesar,frizzle'}`} alt="avatar" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{user.nombre} {user.apellidos}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${user.rol === 'coordinador' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.rol}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${user.activo ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    <span className="text-xs font-bold text-slate-500">{user.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-red-500 transition-colors">
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoordUsers;
