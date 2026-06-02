'use client';

import { useAuth } from '@/hooks/useAuth';
import { Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';

export default function Header() {
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
      <div className="flex justify-between items-center h-full px-10">
        
        {/* Left: System Title + Shop Code (owners only) */}
        <div className="w-[300px] flex flex-col justify-center">
          <h1 className="text-white text-[17px] font-medium tracking-wide">
            POS CHECKOUT SYSTEM
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
