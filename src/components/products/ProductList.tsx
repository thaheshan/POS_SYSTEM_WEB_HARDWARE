'use client';

import { Package, Edit, Trash2 } from 'lucide-react';

export default function ProductList() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Product List</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold">Sample Product</p>
              <p className="text-sm text-gray-600">SKU: PROD001</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-blue-50 rounded-lg">
              <Edit className="w-4 h-4 text-blue-600" />
            </button>
            <button className="p-2 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
