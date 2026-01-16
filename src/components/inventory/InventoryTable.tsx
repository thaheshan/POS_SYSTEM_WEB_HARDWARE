'use client';

import { AlertTriangle } from 'lucide-react';

export default function InventoryTable() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Inventory Status</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                No inventory data available
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
