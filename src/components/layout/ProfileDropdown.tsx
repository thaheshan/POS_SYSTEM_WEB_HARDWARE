'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Settings, LogOut, CreditCard, User, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const getInitials = () => {
    if (!user?.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-[40px] h-[40px] md:w-auto md:h-auto bg-white/15 hover:bg-white/25 rounded-xl md:rounded-full md:px-2 md:py-1 transition-all shadow-md active:scale-95 border border-white/10"
      >
        {user?.logoUrl ? (
          <img 
            src={user.logoUrl} 
            alt="Shop Logo" 
            className="w-[28px] h-[28px] rounded-full object-cover bg-white"
          />
        ) : (
          <div className="w-[28px] h-[28px] rounded-full bg-blue-500 flex items-center justify-center border border-white/20">
            <span className="text-white text-[12px] font-bold">{getInitials()}</span>
          </div>
        )}
        <ChevronDown className="hidden md:block w-4 h-4 text-white/80" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-gray-50 mb-1">
            <p className="text-[13px] font-bold text-gray-900 truncate">{user?.name}</p>
            <p className="text-[11px] font-medium text-gray-500 truncate">{user?.email}</p>
          </div>

          <button
            onClick={() => handleNavigation('/settings?tab=profile')}
            className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center gap-2.5"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>

          {user?.role === 'owner' && (
            <button
              onClick={() => handleNavigation('/settings?tab=billing')}
              className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center gap-2.5"
            >
              <CreditCard className="w-4 h-4" />
              Subscription Plan
            </button>
          )}

          <div className="h-px bg-gray-100 my-1"></div>

          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
