import React from 'react';
import { useAuth } from '../context/AuthContext';
import { cn } from './utils';
import { motion } from 'motion/react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export function Sidebar({ activeSection, setActiveSection, collapsed, setCollapsed }: SidebarProps) {
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'courses', label: 'Programs' },
    { id: 'intakes', label: 'Intakes' },
    { id: 'students', label: 'Students' },
    { id: 'financial', label: 'Financial' },
    { id: 'live', label: 'Online Classes' },
    { id: 'labs', label: 'Practical Labs' },
    { id: 'library', label: 'Library' },
    { id: 'mentor', label: 'AI Mentor' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'video-gen', label: 'Video AI' },
    ...(user?.role === 'admin' ? [
      { id: 'sys-config', label: 'System Config' },
      { id: 'security', label: 'Security Registry' },
    ] : []),
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? '80px' : '280px' }}
      className="fixed top-0 left-0 h-screen bg-white text-blue-900 z-[1000] border-r border-blue-600/10 flex flex-col shadow-sm font-mono"
    >
      {/* Branding */}
      <div className="h-20 flex items-center px-8 border-b border-blue-600/10">
        {!collapsed ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="font-black tracking-[0.3em] text-xl uppercase leading-none text-blue-600">
              CORE_STREAM
            </span>
            <span className="text-[9px] font-black tracking-[0.4em] text-blue-900/40 uppercase leading-none mt-2">ACADEMY_TERMINAL</span>
          </motion.div>
        ) : (
          <div className="w-full flex justify-center">
            <span className="font-black text-blue-600 text-xl">C</span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-8 custom-scrollbar">
        <div className="px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 transition-all relative group border border-transparent",
                activeSection === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-blue-900/40 hover:bg-blue-600/5 hover:text-blue-600"
              )}
            >
              {!collapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {collapsed && (
                <div className="w-full text-center text-xs font-black">
                   {item.label[0]}
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-blue-600/10 mt-auto">
        <div className={cn("bg-blue-600/5 p-4 flex items-center gap-4 border border-blue-600/10", collapsed && "justify-center p-2")}>
          {!collapsed ? (
            <>
              <div className="w-10 h-10 bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                {(user?.username?.[0] || user?.role?.[0] || 'U').toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-black uppercase text-blue-950 truncate">{user?.username}</p>
                <p className="text-[9px] font-black uppercase tracking-tighter text-blue-600/60 mt-0.5">
                  {user?.role || 'operator'}
                </p>
              </div>
              <button 
                onClick={logout}
                className="text-[10px] font-black text-blue-900/20 hover:text-blue-600 transition-colors uppercase"
                title="End Session"
              >
                OUT
              </button>
            </>
          ) : (
            <button 
              onClick={setCollapsed.bind(null, false)}
              className="w-10 h-10 bg-blue-600 flex items-center justify-center text-white font-black"
            >
              +
            </button>
          )}
        </div>
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(true)}
            className="w-full mt-6 h-12 border border-blue-600/10 flex items-center justify-center text-blue-900/20 hover:text-blue-600 transition-colors font-black text-[10px] uppercase tracking-widest"
          >
            Collapse
          </button>
        )}
      </div>
    </motion.aside>
  );
}
