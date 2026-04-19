'use client';

import { useAuth } from '@/hooks/useAuth';
import { Bell, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    // Initial set
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] sticky top-0 z-40 shadow-sm border-b border-white/10 h-[96px]">
      <div className="flex justify-between items-center h-full px-10">
        
        {/* Left: System Title */}
        <div className="w-[300px] flex items-center">
          <h1 className="text-white text-[17px] font-medium tracking-wide">
            POS CHECKOUT SYSTEM
          </h1>
        </div>
        
        {/* Center: Digital Clock */}
        <div className="flex-1 flex justify-center items-center">
          <div className="font-mono text-[26px] font-light text-white tracking-[0.15em] opacity-90">
            {time || '00:00:00'}
          </div>
        </div>
        
        {/* Right: User Info & Actions */}
        <div className="w-[300px] flex items-center justify-end gap-5">
          <div className="flex flex-col min-w-0 items-end">
            <span className="text-[14px] font-bold truncate text-white leading-tight">
              {user?.name || (isAuthenticated ? 'Connecting...' : 'Guest User')}
            </span>
            <span className="text-[12px] text-white/70 font-medium leading-tight mt-0.5 capitalize">
              {user?.role ? `${user.role} Member Profile` : 'Restricted Mode'}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="relative w-[40px] h-[40px] bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 border border-white/10 group">
              <Bell className="w-[19px] h-[19px] text-white group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
              <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-black text-white bg-red-500 rounded-full border-2 border-[#2563eb] shadow-sm">
                3
              </div>
            </button>
            <button className="w-[40px] h-[40px] bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 border border-white/10">
              <Settings className="w-[19px] h-[19px] text-white" strokeWidth={2.5} />
            </button>
            <button 
              onClick={logout}
              className="w-[40px] h-[40px] bg-red-500/80 hover:bg-red-600 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 border border-white/20 group"
              title="Logout"
            >
              <LogOut className="w-[19px] h-[19px] text-white group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
