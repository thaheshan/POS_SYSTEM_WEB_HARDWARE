import { X, CloudUpload, Download, Upload } from 'lucide-react';
import React, { useState } from 'react';
import api from '@/api/axiosInstance';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inventoryData?: any[];
}

export default function ImportExportModal({ isOpen, onClose, onSuccess, inventoryData = [] }: ImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importing, setImporting] = useState(false);

  const handleExportCSV = () => {
    const headers = ['Product Name', 'SKU', 'Category', 'Available Qty', 'Warehouse', 'Low Stock', 'Out of Stock'];
    const rows = inventoryData.map((item: any) => [
      item.product_name || item.name || '',
      item.sku || '',
      item.category || '',
      item.available_quantity ?? item.qty ?? 0,
      item.warehouse_name || item.warehouse || '',
      item.low_stock ? 'Yes' : 'No',
      item.out_of_stock ? 'Yes' : 'No',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(Boolean);
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

      const rows = lines.slice(1).map(line => {
        const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
        const cleaned = values.map(v => v.replace(/"/g, '').trim());
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h] = cleaned[i] || ''; });
        return obj;
      });

      let successCount = 0;
      for (const row of rows) {
        const sku = row['SKU'] || row['sku'];
        const qty = Number(row['Available Qty'] || row['qty'] || 0);
        if (!sku || isNaN(qty)) continue;

        // Find the product in current stock
        const stockRes = await api.get(`/stock?search=${sku}`);
        const stockItems = stockRes.data?.data || stockRes.data || [];
        const stockItem = stockItems[0];
        if (!stockItem) continue;

        const productId = stockItem.product_id || stockItem.productId;
        const warehouseId = stockItem.warehouse_id || stockItem.warehouseId || '00000000-0000-0000-0000-000000000000';
        const branchId = stockItem.branch_id || stockItem.branchId || '00000000-0000-0000-0000-000000000000';
        const currentQty = stockItem.available_quantity || stockItem.availableQuantity || 0;
        const diff = qty - currentQty;

        if (diff > 0) {
          await api.post('/stock/add', { product_id: productId, warehouse_id: warehouseId, branch_id: branchId, add_quantity: diff, reason: 'CSV Import' });
        } else if (diff < 0) {
          await api.post('/stock/deduct', { product_id: productId, warehouse_id: warehouseId, branch_id: branchId, deduct_quantity: Math.abs(diff), reason: 'CSV Import' });
        }
        successCount++;
      }

      alert(`Import complete. Updated ${successCount} product(s).`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Import failed', err);
      alert('Import failed. Please check your CSV format.');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Import / Export</h2>
              <p className="text-sm text-gray-500">Bulk update inventory via CSV</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50 p-1.5 m-4 rounded-xl border border-gray-100 gap-1">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'export' ? 'bg-white text-teal-600 shadow border border-teal-100' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'import' ? 'bg-white text-teal-600 shadow border border-teal-100' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Upload className="w-4 h-4" /> Import CSV
          </button>
        </div>

        <div className="p-6 pt-0 space-y-4">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-teal-800">
                <p className="font-bold mb-1">Export your full inventory to CSV</p>
                <p className="text-teal-600">Downloads all products with current stock levels, warehouse info, and status flags.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CSV Columns Included</p>
                <div className="flex flex-wrap gap-2">
                  {['Product Name', 'SKU', 'Category', 'Available Qty', 'Warehouse', 'Low Stock', 'Out of Stock'].map(col => (
                    <span key={col} className="bg-white border border-gray-200 text-gray-600 text-xs font-medium px-2 py-1 rounded-md">{col}</span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400">{inventoryData.length} products will be exported.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                <p className="font-bold mb-1">⚠️ CSV Format Required</p>
                <p className="text-amber-700">Your CSV must have these exact column headers: <strong>SKU</strong>, <strong>Available Qty</strong>. Quantities will be adjusted to match the imported values.</p>
              </div>
              <div className="relative">
                <label className={`w-full flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-xl cursor-pointer transition-all ${importing ? 'border-teal-300 bg-teal-50' : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/50'}`}>
                  <CloudUpload className={`w-10 h-10 mb-3 ${importing ? 'text-teal-500 animate-bounce' : 'text-gray-300'}`} />
                  <span className="text-sm font-bold text-gray-600">{importing ? 'Processing...' : 'Click to upload CSV file'}</span>
                  <span className="text-xs text-gray-400 mt-1">or drag and drop</span>
                  <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} disabled={importing} />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-4 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="py-2 px-6 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100">Close</button>
          {activeTab === 'export' && (
            <button onClick={handleExportCSV} className="py-2 px-6 rounded-lg text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 flex items-center gap-2">
              <Download className="w-4 h-4" /> Download CSV
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
