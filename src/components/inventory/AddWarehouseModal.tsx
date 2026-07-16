import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import api from '@/api/axiosInstance';
import * as Dialog from '@radix-ui/react-dialog';

interface AddWarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddWarehouseModal({ isOpen, onClose, onSuccess }: AddWarehouseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    capacity: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        code: formData.code || undefined,
        address: formData.address || undefined,
        capacity: formData.capacity ? Number(formData.capacity) : undefined
      };
      
      await api.post('/warehouses', payload);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to add warehouse:', error);
      alert(error?.response?.data?.message || 'Failed to add warehouse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-[24px] shadow-2xl z-50 w-[95vw] max-w-[500px] overflow-hidden animate-in fade-in zoom-in-95">
          <div className="bg-[#1e40af] p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <Dialog.Title className="text-[18px] font-black tracking-tight leading-none mb-1">
                  Add New Warehouse
                </Dialog.Title>
                <Dialog.Description className="text-[13px] font-medium text-blue-200">
                  Create a new location to store inventory
                </Dialog.Description>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1">Warehouse Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Main Warehouse"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">Warehouse Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. WH-01"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 mb-1">Capacity (Sq Ft or Items)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g. 5000"
                    min="0"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1">Address Location</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Warehouse full address..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-[13px] font-black hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-[#1e40af] text-white rounded-xl text-[13px] font-black hover:bg-blue-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Warehouse'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
