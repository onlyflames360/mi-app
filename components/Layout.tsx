import React, { useState } from 'react';
import { User, Role, Notification } from '../types'; // Changed AppNotification to Notification
import { NAV_ITEMS_COORD, NAV_ITEMS_USER } from '../constants';
import { LogOut, Bell, X, Trash2, CheckCheck } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  notifications: Notification[];
  onMarkAsRead: () => void;
  onDeleteNotification: (id: number) => void;
  unreadMessagesCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ 
  user, 
  onLogout, 
  children, 
  notifications, 
  onMarkAsRead, 
  onDeleteNotification,
  unreadMessagesCount = 0
}) => {
  const [activeTab, setActiveTab] = useState(user.role === Role.COORD ? 'dashboard' : 'home');
  const [showNotifications, setShowNotifications] = useState(false);
  const navItems = user.role === Role.COORD ? NAV_ITEMS_COORD : NAV_ITEMS_USER;
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpenNotifications = () => {
    setShowNotifications(true);
    onMarkAsRead();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">P</div>
            <h1 className="text-xl font-black text-slate-800 tracking-tighter">PPOC</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleOpenNotifications}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
            >
              <Bell size={24} className={unreadCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-600'} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-lg shadow-red-200 ring-2 ring-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors active:scale-95"
              title="Cerrar sesión"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 pb-24 md:pb-4 overflow-y-auto">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, { activeTab });
          }
          return child;
        })}
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-2 z-50 md:hidden safe-area-bottom shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all relative ${
              activeTab === item.id ? 'text-blue-600 scale-110' : 'text-slate-400 opacity-60'
            }`}
          >
            <div className="relative">
              {item.icon}
              {(item.id === 'notifications' && unreadCount > 0) || (item.id === 'comms' && unreadMessagesCount > 0) || (item.id === 'messages' && unreadMessagesCount > 0) ? (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black w-4 h-4 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                  {item.id === 'notifications' ? unreadCount : unreadMessagesCount}
                </span>
              ) : null}
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-20 bg-white border-r border-slate-200 flex-col items-center py-4 gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`p-3 rounded-2xl transition-all active:scale-90 relative ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                : 'text-slate-400 hover:bg-slate-50'
            }`}
            title={item.label}
          >
            {item.icon}
            {(item.id === 'notifications' && unreadCount > 0) || (item.id === 'comms' && unreadMessagesCount > 0) || (item.id === 'messages' && unreadMessagesCount > 0) ? (
              <span className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black w-4 h-4 rounded-full border-2 border-white translate-x-1/4 -translate-y-1/4 flex items-center justify-center">
                {item.id === 'notifications' ? unreadCount : unreadMessagesCount}
              </span>
            ) : null}
          </button>
        ))}
      </aside>

      <style>{`
        @media (min-width: 768px) {
          main { margin-left: 80px; }
        }
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
      `}</style>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowNotifications(false)}></div>
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-in border-l border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-xl text-slate-800 tracking-tight">Avisos</h3>
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest">Centro de notificaciones</p>
              </div>
              <button 
                onClick={() => setShowNotifications(false)} 
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
                  <CheckCheck size={48} className="text-slate-200" />
                  <div>
                    <p className="font-black text-slate-800">Todo al día</p>
                    <p className="text-xs font-medium">No tienes avisos nuevos</p>
                  </div>
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`group relative p-4 rounded-2xl border transition-all ${
                      n.read ? 'bg-white border-slate-100 shadow-sm' : 'bg-white border-red-100 shadow-md shadow-red-50/50 ring-1 ring-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {!n.read && <div className="w-2 h-2 bg-red-600 rounded-full"></div>}
                          <p className={`font-black text-sm leading-tight uppercase ${!n.read ? 'text-red-700' : 'text-slate-800'}`}>{n.title}</p>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{n.body}</p>
                        <p className="text-[9px] font-black text-slate-300 mt-2 uppercase tracking-widest">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification(n.id);
                        }}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                        title="Borrar notificación"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-white">
                <button 
                  onClick={() => notifications.forEach(n => onDeleteNotification(n.id))}
                  className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors bg-slate-50 rounded-xl"
                >
                  Limpiar historial
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;