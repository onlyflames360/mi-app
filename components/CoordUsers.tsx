
import React, { useState } from 'react';
import { db } from '../services/db';
import { User, Role, Gender } from '../types';

const CoordUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    rol: 'usuario' as Role,
    genero: 'femenino' as Gender,
    activo: true,
    avatarSeed: ''
  });

  const filtered = users.filter(u => 
    `${u.nombre} ${u.apellidos}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellidos: '',
      rol: 'usuario',
      genero: 'femenino',
      activo: true,
      avatarSeed: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      apellidos: user.apellidos,
      rol: user.rol,
      genero: user.genero,
      activo: user.activo,
      avatarSeed: user.avatarSeed || user.nombre
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar a este usuario?')) {
      const updated = users.filter(u => u.id !== id);
      db.setUsers(updated);
      setUsers(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedUsers: User[];

    if (editingUser) {
      updatedUsers = users.map(u => 
        u.id === editingUser.id ? { ...u, ...formData } : u
      );
    } else {
      const newUser: User = {
        id: `u-${Date.now()}`,
        ...formData,
        avatarSeed: formData.avatarSeed || formData.nombre
      };
      updatedUsers = [...users, newUser];
    }

    db.setUsers(updatedUsers);
    setUsers(updatedUsers);
    setIsModalOpen(false);
  };

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
          <button 
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-slate-900 text-white font-black rounded-xl text-sm hover:bg-black transition-all shrink-0 flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
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
            {filtered.map(user => {
              const avatar = user.avatarUrl || `https://api.dicebear.com/7.x/lorelei/svg?seed=${user.avatarSeed || user.nombre}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
              return (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
                        <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
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
                      <button 
                        onClick={() => handleOpenEdit(user)}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <i className="fa-solid fa-pen text-xs"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">
                {editingUser ? 'Editar Voluntario' : 'Nuevo Voluntario'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                <input 
                  required
                  type="text" 
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                  placeholder="Ej. Ana"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Apellidos</label>
                <input 
                  required
                  type="text" 
                  value={formData.apellidos}
                  onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                  placeholder="Ej. Pérez García"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Género</label>
                  <select 
                    value={formData.genero}
                    onChange={(e) => setFormData({...formData, genero: e.target.value as Gender})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all appearance-none"
                  >
                    <option value="femenino">Femenino</option>
                    <option value="masculino">Masculino</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol</label>
                  <select 
                    value={formData.rol}
                    onChange={(e) => setFormData({...formData, rol: e.target.value as Role})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all appearance-none"
                  >
                    <option value="usuario">Usuario</option>
                    <option value="coordinador">Coordinador</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input 
                  type="checkbox" 
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="activo" className="text-sm font-bold text-slate-700 cursor-pointer">Usuario activo en el sistema</label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordUsers;
