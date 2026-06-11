'use client';

import { useAuth } from '@/hooks/useAuth';
import { Copy, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout, isAuthenticated } = useAuth();
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
      <div className="flex justify-between items-center h-full px-4 md:px-10">
        
        {/* Left: Hamburger & System Title */}
        <div className="flex items-center gap-3 w-auto md:w-[300px]">
          {/* Hamburger Menu Icon (Mobile/Tablet only) */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex flex-col justify-center">
            <h1 className="text-white text-[15px] md:text-[17px] font-medium tracking-wide hidden sm:block">
              POS CHECKOUT SYSTEM
            </h1>
            <h1 className="text-white text-[15px] font-medium tracking-wide sm:hidden">
              POS SYSTEM
            </h1>
            {user?.role?.toLowerCase() === 'owner' && ((user as any)?.tenantId || (user as any)?.tenant_id) && (
            <div
              className="flex items-center gap-1.5 mt-1 cursor-pointer group w-fit"
              onClick={() => {
                const id = (user as any)?.tenantId || (user as any)?.tenant_id;
                const code = id?.split('-')[0].toUpperCase();
                navigator.clipboard.writeText(code);
                alert(`Shop code '${code}' copied! Share this with your staff for registration.`);
              }}
              title="Click to copy Shop Verification Code"
            >
              <span className="text-white/60 text-[11px] font-medium tracking-wider">SHOP CODE:</span>
              <span className="text-white font-mono text-[13px] font-black tracking-widest bg-white/15 border border-white/25 rounded px-1.5 py-0.5">
                {((user as any)?.tenantId || (user as any)?.tenant_id)?.split('-')[0].toUpperCase()}
              </span>
              <Copy size={11} className="text-white/50 group-hover:text-white transition-colors" />
            </div>
          )}
          </div>
        </div>
        
        {/* Center: Digital Clock */}
        <div className="flex-1 flex justify-center items-center">
          <div className="hidden sm:block font-mono text-[20px] md:text-[26px] font-light text-white tracking-[0.15em] opacity-90">
            {time || '00:00:00'}
          </div>
        </div>
        
        {/* Right: User Info & Actions */}
        <div className="flex items-center justify-end gap-3 md:gap-5 w-auto lg:w-[300px] min-w-0">
          <div className="hidden xl:flex flex-col min-w-0 items-end max-w-[180px]">
            <span className="text-[14px] font-bold truncate text-white leading-tight w-full text-right">
              {user?.name || (isAuthenticated ? 'Connecting...' : 'Guest User')}
            </span>
            <span className="text-[12px] text-white/70 font-medium leading-tight mt-0.5 capitalize truncate w-full text-right">
              {user?.role ? `${user.role.toLowerCase()} Member Profile` : 'Restricted Mode'}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
