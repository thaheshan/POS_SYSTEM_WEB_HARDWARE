'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Users, Plus } from 'lucide-react';

export default function CustomersPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Customers</h1>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Customer
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600">Customers management page - ready to build</p>
        </div>
      </div>
    </MainLayout>
  );
}
