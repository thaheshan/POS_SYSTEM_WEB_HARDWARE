'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import { User, KeyRound, Bell, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StaffSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (user?.role === 'admin' || user?.role === 'owner') {
    // Redirect owners/admins to the main settings page
    router.replace('/settings');
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your staff account settings and preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#1E429F] text-white rounded-xl text-sm font-medium transition-colors">
              <User className="w-5 h-5" />
              Personal Info
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-white text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors border border-gray-100">
              <KeyRound className="w-5 h-5" />
              Change Password
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-white text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors border border-gray-100">
              <Bell className="w-5 h-5" />
              Notifications
            </button>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
              
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={user?.name || ''}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E429F]/20 focus:border-[#1E429F] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <input 
                      type="text" 
                      defaultValue={user?.role || 'Staff'}
                      disabled
                      className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">Contact your administrator to change your email address.</p>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-6">
                  <button type="button" className="flex items-center gap-2 px-6 py-2.5 bg-[#1E429F] hover:bg-blue-800 text-white rounded-xl text-sm font-medium transition-colors ml-auto">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
