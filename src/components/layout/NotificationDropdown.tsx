'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, Trash2, X, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import NotificationModal from './NotificationModal';
import { cn } from '@/lib/utils';

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'ERROR': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getBg = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-transparent';
    switch (type) {
      case 'WARNING': return 'bg-amber-50/50';
      case 'ERROR': return 'bg-red-50/50';
      case 'SUCCESS': return 'bg-emerald-50/50';
      default: return 'bg-blue-50/50';
    }
  };

  const visibleNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-[40px] h-[40px] bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 border border-white/10 group"
      >
        <Bell className="w-[19px] h-[19px] text-white group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 flex items-center justify-center text-[10px] font-black text-white bg-red-500 rounded-full border-2 border-[#2563eb] shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm font-medium">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {visibleNotifications.map((notif) => (
                  <div key={notif.id} className={cn('p-4 transition-colors hover:bg-gray-50 cursor-pointer', getBg(notif.type, notif.isRead))}>
                    <div className="flex gap-3">
                      <div className="mt-0.5">{getIcon(notif.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={cn('text-[13px] font-bold', notif.isRead ? 'text-gray-700' : 'text-gray-900')}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-1">
            <div className="flex gap-1">
              <button 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                title="Mark all as read"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button 
                onClick={clearAll}
                disabled={notifications.length === 0}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={() => {
                setIsOpen(false);
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 text-[12px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-1 text-center"
            >
              View All
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <NotificationModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
