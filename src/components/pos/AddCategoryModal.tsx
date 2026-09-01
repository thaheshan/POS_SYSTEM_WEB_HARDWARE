'use client';

import { X, Tags, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import api from '@/api/axiosInstance';
import { toast } from 'sonner';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultParentId?: string;
}

export default function AddCategoryModal({ isOpen, onClose, onSuccess, defaultParentId }: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>(defaultParentId || '');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setParentId(defaultParentId || '');
      fetchParentCategories();
    }
  }, [isOpen, defaultParentId]);

  const fetchParentCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      const items = res.data?.data || res.data || [];
      if (Array.isArray(items)) {
        setCategories(items.map((c: any) => ({ id: c.id, name: c.name })));
      }
    } catch {
      // silently fail
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required.');
      return;
    }
    
    setLoading(true);
    try {
      if (parentId) {
        await api.post(`/products/categories/${parentId}/subcategories`, {
          name,
          description,
        });
        toast.success('Subcategory created successfully.');
      } else {
        await api.post('/products/categories', {
          name,
          description,
        });
        toast.success('Category created successfully.');
      }
      setName('');
      setDescription('');
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create category.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{parentId ? 'Add Subcategory' : 'Add Category'}</h2>
              <p className="text-xs text-gray-500">{parentId ? 'Create a subcategory under parent' : 'Create a new main category or subcategory'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Parent Category</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-white"
            >
              <option value="">None (Top-Level Main Category)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
              {parentId ? 'Subcategory Name' : 'Category Name'} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={parentId ? 'e.g. LED Bulbs, Switches...' : 'e.g. Electrical, Tools, Paints...'}
              className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Description (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="py-2 px-6 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-6 rounded-xl text-sm font-bold bg-[#059669] text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? 'Saving...' : parentId ? 'Save Subcategory' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
