'use client';

import { useState } from 'react';
import { Barcode, Scan } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductScanner() {
  const [barcode, setBarcode] = useState('');

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      toast.success(`Product scanned: ${barcode}`);
      setBarcode('');
    } else {
      toast.error('Please enter a barcode');
    }
  };

  return (
    <form onSubmit={handleScan} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Scan className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Scan Product</h3>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Scan or enter barcode..."
            autoFocus
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold"
        >
          <Barcode className="w-5 h-5" />
          Add
        </button>
      </div>
    </form>
  );
}
