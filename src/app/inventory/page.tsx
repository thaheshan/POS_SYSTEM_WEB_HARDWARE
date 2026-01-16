'use client';

import MainLayout from '@/components/layout/MainLayout';
import { BarChart3 } from 'lucide-react';

export default function InventoryPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Inventory</h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600">Inventory management page - ready to build</p>
        </div>
      </div>
    </MainLayout>
  );
}
