'use client';

import { Users, Phone, Mail } from 'lucide-react';

export default function CustomerList() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Customer Directory</h3>
      <div className="space-y-3">
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No customers added yet</p>
        </div>
      </div>
    </div>
  );
}
