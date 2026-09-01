'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Settings, LogOut, CreditCard, User, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ProfileDropdownProps {
  logoUrl?: string;
  shopName?: string;
}

export default function ProfileDropdown({ logoUrl, shopName }: ProfileDropdownProps) {
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
    const name = shopName || user?.name;
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const activeLogo = (logoUrl || user?.logoUrl) ?? undefined;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 transition-all active:scale-95 group"
      >
        {activeLogo ? (
          <img 
            src={activeLogo} 
            alt="Shop Logo" 
            className="w-[54px] h-[54px] md:w-[58px] md:h-[58px] rounded-xl object-cover"
          />
        ) : (
          <div className="w-[54px] h-[54px] md:w-[58px] md:h-[58px] rounded-xl flex items-center justify-center bg-white/10">
            <span className="text-white text-[20px] font-black">{getInitials()}</span>
          </div>
        )}
        <ChevronDown className="hidden md:block w-4 h-4 text-white/90 group-hover:text-white" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-gray-50 mb-1">
            <p className="text-[13.5px] font-black text-gray-900 truncate">{shopName || user?.name}</p>
            <p className="text-[11.5px] font-medium text-gray-500 truncate">{user?.name ? `${user.name} (${user.role || 'Member'})` : user?.email}</p>
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
