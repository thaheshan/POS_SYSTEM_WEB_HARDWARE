'use client';

import MainLayout from '@/components/layout/MainLayout';
import { DollarSign } from 'lucide-react';

export default function SalesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Sales</h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600">Sales management page - ready to build</p>
        </div>
      </div>
    </MainLayout>
  );
}
