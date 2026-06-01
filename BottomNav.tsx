import React from 'react';
import { cn } from './utils';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isDev?: boolean;
}

export function BottomNav({ activeSection, onSectionChange }: BottomNavProps) {
  const items = [
    { id: 'dashboard', label: 'HUB' },
    { id: 'live', label: 'LIVE' },
    { id: 'courses', label: 'ACAD' },
    { id: 'sys-config', label: 'SYS' },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white h-20 border border-blue-600/10 flex md:hidden justify-around items-center px-4 z-50 w-[92%] max-w-lg font-mono shadow-xl">
      {items.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 py-1 px-3 transition-all h-full flex-1",
              isActive ? "text-blue-600 bg-blue-600/5 font-black" : "text-blue-900/40 font-bold"
            )}
          >
            <span className={cn(
              "text-[10px] uppercase tracking-widest",
              isActive ? "scale-110" : ""
            )}>
              {item.label}
            </span>
            {isActive && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" 
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
