'use client';

import MainLayout from '@/components/layout/MainLayout';
import ProductScanner from '@/components/pos/ProductScanner';
import { ShoppingCart } from 'lucide-react';

export default function POSPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Point of Sale</h1>
        </div>
        
        <ProductScanner />
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Current Cart</h2>
          <p className="text-gray-600">Start scanning products to add to cart...</p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Cart is empty</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
