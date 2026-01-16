'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Package, Plus } from 'lucide-react';

export default function ProductsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Products</h1>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600">Product management page - ready to build</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">Connect to your backend API to load products</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
