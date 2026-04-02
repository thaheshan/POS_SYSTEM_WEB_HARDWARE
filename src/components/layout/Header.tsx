'use client';

import { useAuth } from '@/hooks/useAuth';
import { Bell, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const { user } = useAuth();
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
          {/* User Info Stack */}
          <div className="flex flex-col items-end">
            <span className="text-[14px] font-medium text-white leading-tight">
              {user?.name || 'Nimal Fernando'}
            </span>
            <span className="text-[11.5px] text-white/80 leading-tight mt-0.5 font-medium">
              Shift: 9:00 AM - 5:00 PM
            </span>
            <span className="text-[10px] text-white/60 leading-tight mt-0.5 font-medium">
              Till #1
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="relative w-[38px] h-[38px] bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all shadow-sm">
              <Bell className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
              <div className="absolute top-1.5 right-1.5 text-[10px] font-bold text-white bg-transparent leading-none">
                3
              </div>
            </button>
            <button className="w-[38px] h-[38px] bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all shadow-sm">
              <Settings className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </button>
            <button className="w-[38px] h-[38px] bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all shadow-sm">
              <LogOut className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
