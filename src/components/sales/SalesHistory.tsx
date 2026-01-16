'use client';

import { Clock } from 'lucide-react';

export default function SalesHistory() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Recent Sales
      </h3>
      <div className="space-y-3">
        <div className="text-center py-8 text-gray-500">
          No sales recorded yet
        </div>
      </div>
    </div>
  );
}
