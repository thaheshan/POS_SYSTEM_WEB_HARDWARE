'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Settings, User, Bell, Lock } from 'lucide-react';

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Profile Settings</h2>
            </div>
            <p className="text-gray-600 mb-4">Update your personal information</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Edit Profile
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold">Security</h2>
            </div>
            <p className="text-gray-600 mb-4">Change password and security settings</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
              Security Settings
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <p className="text-gray-600 mb-4">Manage notification preferences</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
              Configure
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
