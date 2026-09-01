'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Package, DollarSign, Store, Camera, Upload, Pencil, CheckCircle2 } from 'lucide-react';
import api from '@/api/axiosInstance';
import { toast } from 'sonner';

interface GlobalCatalogAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onSuccess: () => void;
}

const GRADIENTS = [
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-violet-400 to-purple-500',
  'from-orange-400 to-red-500',
  'from-amber-400 to-orange-500',
  'from-cyan-400 to-blue-500',
  'from-rose-400 to-pink-500',
  'from-lime-400 to-emerald-500',
];
function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}
function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function GlobalCatalogAddModal({ isOpen, onClose, product, onSuccess }: GlobalCatalogAddModalProps) {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    productName: product.name || '',
    warehouseId: '',
    branchId: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });

  const isLoose = product.sellType === 'loose';
  const gradient = getGradient(product.name);
  const initials = getInitials(product.name);
  const masterImage = product.images?.[0]?.imageUrl;

  useEffect(() => {
    if (isOpen) {
      setFormData({
        productName: product.name || '',
        warehouseId: '',
        branchId: '',
        purchasePrice: '',
        sellingPrice: '',
        quantity: '',
        imageFile: null,
        imagePreview: null,
      });
      fetchWarehouses();
    }
  }, [isOpen, product]);

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      const raw = res.data;
      const list = Array.isArray(raw) ? raw
        : Array.isArray(raw?.data) ? raw.data
        : Array.isArray(raw?.data?.data) ? raw.data.data
        : [];
      setWarehouses(list);
      if (list.length > 0) {
        setFormData(prev => ({ ...prev, warehouseId: list[0].id, branchId: list[0].branchId || '' }));
      }
    } catch {
      toast.error('Failed to load warehouses');
    }
  };

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wh = warehouses.find(w => w.id === e.target.value);
    setFormData(prev => ({ ...prev, warehouseId: e.target.value, branchId: wh?.branchId || '' }));
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    setFormData(prev => ({ ...prev, imageFile: file, imagePreview: URL.createObjectURL(file) }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sellingPrice || !formData.purchasePrice) {
      toast.error('Please enter both cost and selling price');
      return;
    }
    if (!formData.quantity) {
      toast.error('Please enter the initial quantity');
      return;
    }
    if (!formData.warehouseId) {
      toast.error('Please select a warehouse');
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Clone the product from catalog
      const cloneRes = await api.post('/catalog/clone', {
        masterProductId: product.id,
        warehouseId: formData.warehouseId,
        branchId: formData.branchId,
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        quantity: Number(formData.quantity),
        customName: formData.productName !== product.name ? formData.productName : undefined,
      });

      const raw = cloneRes.data;
      const newProduct = raw?.data?.data || raw?.data || raw;

      // Step 2: Rename if changed
      if (formData.productName !== product.name && newProduct?.id) {
        try {
          await api.patch(`/inventory/products/${newProduct.id}`, { name: formData.productName });
        } catch {
          // Non-blocking — product still created
        }
      }

      // Step 3: Upload custom image if provided
      if (formData.imageFile && newProduct?.id) {
        try {
          const imgForm = new FormData();
          imgForm.append('imageFile', formData.imageFile);
          await api.post(`/inventory/products/${newProduct.id}/image`, imgForm);
        } catch {
          // Non-blocking — product still created, just without custom image
          toast.warning('Product added but image upload failed. You can add it later by editing the product.');
        }
      }

      toast.success(`"${formData.productName}" added to your inventory!`);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const displayImage = formData.imagePreview || masterImage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[32px] w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-8 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-[32px]">
          <div>
            <h2 className="text-[22px] font-black tracking-tight text-gray-900">Quick Add Item</h2>
            <p className="text-[13px] font-bold text-gray-400">From Global Master Catalog</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">

          {/* ── IMAGE + NAME BLOCK ── */}
          <div className="flex gap-5 items-start bg-gray-50 p-5 rounded-3xl border border-gray-100">
            {/* Image Area */}
            <div
              className="relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              title="Click or drag to upload a custom image"
            >
              {displayImage ? (
                <img src={displayImage} alt="product" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <span className="text-white font-black text-[22px] drop-shadow">{initials}</span>
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <Camera className="w-5 h-5 text-white" />
                <span className="text-[9px] font-black text-white uppercase tracking-wide">Change</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
            />

            {/* Editable Name + meta */}
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Product Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.productName}
                  onChange={e => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                  className="w-full text-[15px] font-black text-gray-900 bg-white border border-gray-200 rounded-xl px-3 py-2 pr-8 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                />
                <Pencil className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isLoose ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {isLoose ? `LOOSE · ${product.measurementUnit}` : 'FIXED UNIT'}
                </span>
                <span className="text-[10px] font-bold text-gray-400">{product.brand?.name || 'Generic'} · {product.category?.name}</span>
              </div>
              {/* Upload hint */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex items-center gap-1.5 text-[10px] font-black text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <Upload className="w-3 h-3" />
                {formData.imageFile ? `Image selected: ${formData.imageFile.name}` : 'Upload custom image (optional)'}
              </button>
            </div>
          </div>

          {/* ── FORM ── */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Warehouse */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[12px] font-black text-gray-700 uppercase tracking-tight">
                <Store className="w-4 h-4 text-emerald-500" /> Receiving Warehouse
              </label>
              <select
                required
                value={formData.warehouseId}
                onChange={handleWarehouseChange}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-[14px] font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none appearance-none"
              >
                <option value="" disabled>Select warehouse...</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[12px] font-black text-gray-700 uppercase tracking-tight">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400" /> Cost Price (Rs.)
                </label>
                <input
                  type="number" step="0.01" min="0" required
                  placeholder="0.00"
                  value={formData.purchasePrice}
                  onChange={e => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-[14px] font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[12px] font-black text-gray-700 uppercase tracking-tight">
                  <DollarSign className="w-3.5 h-3.5 text-blue-500" /> Selling Price (Rs.)
                </label>
                <input
                  type="number" step="0.01" min="0" required
                  placeholder="0.00"
                  value={formData.sellingPrice}
                  onChange={e => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-[14px] font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[12px] font-black text-gray-700 uppercase tracking-tight">
                <Package className="w-4 h-4 text-emerald-500" /> Initial Stock Quantity
              </label>
              <div className="relative">
                <input
                  type="number"
                  step={isLoose ? '0.01' : '1'}
                  min="0" required
                  placeholder={`Enter quantity in ${product.measurementUnit || 'pieces'}`}
                  value={formData.quantity}
                  onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full px-4 py-3.5 pr-20 bg-gray-50 border border-gray-200 rounded-2xl text-[14px] font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <span className="text-[11px] font-black text-gray-500 uppercase bg-gray-200 px-2.5 py-1 rounded-lg">
                    {product.measurementUnit || (isLoose ? 'UNIT' : 'PCS')}
                  </span>
                </div>
              </div>
            </div>

            {/* Profit preview */}
            {formData.purchasePrice && formData.sellingPrice && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-[12px] font-bold text-emerald-700">
                  Margin: Rs.&nbsp;
                  {(Number(formData.sellingPrice) - Number(formData.purchasePrice)).toFixed(2)}
                  &nbsp;·&nbsp;
                  {Number(formData.sellingPrice) > 0
                    ? (((Number(formData.sellingPrice) - Number(formData.purchasePrice)) / Number(formData.sellingPrice)) * 100).toFixed(1)
                    : '0.0'}%
                </span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-[15px] font-black uppercase tracking-tight transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              {isSubmitting ? (
                <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Importing...</>
              ) : (
                <><Package className="w-4 h-4" /> Add to Inventory</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
