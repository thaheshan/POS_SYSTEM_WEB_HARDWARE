'use client';

import {
  X, Plus, ChevronDown, Upload, ImageIcon, Package, Tag,
  DollarSign, BarChart2, Layers, AlertCircle, Check, RefreshCw,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import api from '@/api/axiosInstance';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TAX_RATES = [
  { label: 'No Tax (0%)',  value: '0'  },
  { label: 'VAT (18%)',    value: '18' },
];

const UNIT_OPTIONS = ['Pieces', 'Kg', 'Litres', 'Metres', 'Bags', 'Boxes', 'Pairs'];

function SectionHeader({ icon: Icon, label, sub, color = 'emerald' }: {
  icon: React.ElementType; label: string; sub: string; color?: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500',
    blue:    'bg-blue-500',
    amber:   'bg-amber-500',
    purple:  'bg-purple-500',
    rose:    'bg-rose-500',
  };
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-8 h-8 ${colorMap[color] ?? 'bg-emerald-500'} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-[13px] font-black text-gray-900">{label}</p>
        <p className="text-[11px] font-medium text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder:text-gray-300";
const selectCls = "w-full appearance-none px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all cursor-pointer";

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
  const [loading, setLoading]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [categories, setCategories]     = useState<{ id: string; name: string }[]>([]);
  const [subCategories, setSubCategories] = useState<{ id: string; name: string }[]>([]);
  const [suppliers, setSuppliers]       = useState<{ id: string; name: string }[]>([]);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [dragOver, setDragOver]         = useState(false);
  const fileRef                         = useRef<HTMLInputElement>(null);
  const [errors, setErrors]             = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    // Basic Info
    name:             '',
    description:      '',
    shortDescription: '',
    // Product Type
    productType:  'FIX',   // FIX | LOOSE
    unit:         'Pieces',
    // Pricing
    costPrice:      '',
    sellingPrice:   '',
    comparePrice:   '',
    taxInclusive:   false,
    taxRate:        '18',
    // Inventory
    sku:              '',
    barcode:          '',
    trackInventory:   true,
    initialStock:     '0',
    minimumStock:     '10',
    continueOOS:      false,
    // Organization
    categoryId:       '',
    subCategoryId:    '',
    supplierId:       '',
    // Image
    imageFile:        null as File | null,
  });

  /* ─── Derived ─── */
  const profitMargin = (() => {
    const cost = parseFloat(form.costPrice)    || 0;
    const sell = parseFloat(form.sellingPrice) || 0;
    if (sell === 0) return 0;
    return (((sell - cost) / sell) * 100).toFixed(2);
  })();

  /* ─── Fetch dropdown data on open ─── */
  useEffect(() => {
    if (!isOpen) return;
    resetForm();
    fetchDropdowns();
  }, [isOpen]);

  const fetchDropdowns = async () => {
    setLoading(true);
    try {
      const [catRes] = await Promise.allSettled([
        api.get('/products/categories'),
      ]);
      if (catRes.status === 'fulfilled') {
        const catData = catRes.value.data;
        const arr = Array.isArray(catData) ? catData : (catData?.data || catData?.categories || []);
        if (Array.isArray(arr)) {
          const mappedCats = arr.map(c => typeof c === 'string' ? { id: c, name: c } : c);
          setCategories(mappedCats);
        } else {
          setCategories([]);
        }
      }
      // suppliers removed
      setSuppliers([]);
    } catch {
      // non-fatal — dropdowns will be empty
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '', description: '', shortDescription: '',
      productType: 'FIX', unit: 'Pieces',
      costPrice: '', sellingPrice: '', comparePrice: '',
      taxInclusive: false, taxRate: '18',
      sku: '', barcode: '', trackInventory: true,
      initialStock: '0', minimumStock: '10', continueOOS: false,
      categoryId: '', subCategoryId: '', supplierId: '',
      imageFile: null,
    });
    setPreviewUrl(null);
    setErrors({});
  };

  const set = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    set(name, val);
  };

  /* ─── Image handling ─── */
  const handleImageFile = (file: File) => {
    set('imageFile', file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageFile(file);
  };

  /* ─── Validation ─── */
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim())         errs.name         = 'Product name is required';
    if (!form.sku.trim())          errs.sku          = 'SKU is required';
    if (!form.sellingPrice)        errs.sellingPrice = 'Selling price is required';
    if (!form.categoryId)          errs.categoryId   = 'Category is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ─── Submit ─── */
  const handleSubmit = async (draft = false) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('sku', form.sku.trim());
      formData.append('categoryId', form.categoryId);
      formData.append('sellingPrice', (parseFloat(form.sellingPrice) || 0).toString());
      formData.append('purchasePrice', (parseFloat(form.costPrice) || 0).toString());
      formData.append('minimumStockLevel', (parseInt(form.minimumStock) || 10).toString());
      formData.append('initialStock', (parseInt(form.initialStock) || 0).toString());
      formData.append('taxCategory', 'STANDARD_VAT');
      formData.append('taxRate', (parseFloat(form.taxRate) || 18).toString());

      if (form.description?.trim()) formData.append('description', form.description.trim());
      if (form.imageFile) formData.append('imageFile', form.imageFile);

      await api.post('/products', formData);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create product', err);
      const raw = err?.response?.data?.message;
      const detail = Array.isArray(raw)
        ? raw.join('\n')
        : raw || 'Failed to create product. Please try again.';
      alert(detail);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-5xl flex flex-col max-h-[94vh] overflow-hidden">

        {/* ── TOP BAR ── */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 flex-shrink-0 bg-white">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Products &rsaquo; All Products &rsaquo; Add Product
            </p>
            <h2 className="text-[20px] font-black text-gray-900 tracking-tight">Add New Product</h2>
            <p className="text-[12px] text-gray-400 font-medium">Add a new product to your inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose}
              className="py-2.5 px-5 rounded-xl text-[13px] font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={() => handleSubmit(true)} disabled={saving}
              className="py-2.5 px-5 rounded-xl text-[13px] font-bold text-gray-700 border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-all flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Save as Draft
            </button>
            <button onClick={() => handleSubmit(false)} disabled={saving}
              className="py-2.5 px-6 rounded-xl text-[13px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 active:scale-95">
              {saving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Check className="w-3.5 h-3.5" /> Save &amp; Publish</>}
            </button>
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all ml-1">
              <X className="w-4.5 h-4.5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-0">

            {/* ──── LEFT COLUMN ──── */}
            <div className="flex-1 p-7 space-y-6 border-r border-gray-100 min-w-0">

              {/* 1. Basic Information */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <SectionHeader icon={Package} label="Basic Information" sub="Essential product details" />

                <div className="space-y-4">
                  <Field label="Product Name" required>
                    <input name="name" value={form.name} onChange={handleChange}
                      placeholder="e.g. iPhone 15 Pro Max - 256GB"
                      className={`${inputCls} ${errors.name ? 'border-red-300 ring-2 ring-red-100' : ''}`} />
                    {errors.name && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.name}</p>}
                  </Field>

                  <Field label="Description">
                    <textarea name="description" value={form.description} onChange={handleChange}
                      rows={4} placeholder="Enter product description…"
                      className={`${inputCls} resize-none`} />
                    <p className="text-[11px] text-gray-400 mt-1">Detailed product description customers will see</p>
                  </Field>

                  <Field label="Short Description">
                    <input name="shortDescription" value={form.shortDescription} onChange={handleChange}
                      placeholder="Start product summary for listings…"
                      className={inputCls} />
                    <p className="text-[11px] text-gray-400 mt-1">Appears in product listings and receipts</p>
                  </Field>
                </div>
              </div>

              {/* 2. Product Media */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <SectionHeader icon={ImageIcon} label="Product Media" sub="Photos and images" color="blue" />

                <p className="text-[12px] font-bold text-gray-600 mb-3">Product Images</p>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${dragOver ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/40'}`}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-40 rounded-xl object-contain" />
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-gray-200 rounded-2xl flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-[13px] font-bold text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-[11px] text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB · Recommended: 1200×900px</p>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} />
                </div>
                {previewUrl && (
                  <p className="text-[11px] text-gray-400 mt-2 text-center">First image will be the primary product image. Drag to reorder.</p>
                )}
              </div>

              {/* 3. Pricing */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <SectionHeader icon={DollarSign} label="Pricing" sub="Product pricing and cost" color="amber" />

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="Cost Price" required>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">Rs.</span>
                      <input name="costPrice" type="number" value={form.costPrice} onChange={handleChange}
                        placeholder="0.00" className={`${inputCls} pl-10`} />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">What you pay to source / make this product</p>
                  </Field>
                  <Field label="Selling Price" required>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">Rs.</span>
                      <input name="sellingPrice" type="number" value={form.sellingPrice} onChange={handleChange}
                        placeholder="0.00"
                        className={`${inputCls} pl-10 ${errors.sellingPrice ? 'border-red-300 ring-2 ring-red-100' : ''}`} />
                    </div>
                    {errors.sellingPrice && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.sellingPrice}</p>}
                    <p className="text-[11px] text-gray-400 mt-1">Regular price customers pay</p>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="Compare at Price (Optional)">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">Rs.</span>
                      <input name="comparePrice" type="number" value={form.comparePrice} onChange={handleChange}
                        placeholder="0.00" className={`${inputCls} pl-10`} />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Original price shown as discounted</p>
                  </Field>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-600 mb-1.5">Profit Margin</label>
                    <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                      <span className={`text-[22px] font-black ${Number(profitMargin) < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {profitMargin}%
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Auto-calculated profit percentage</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 mb-4">
                  <button type="button" onClick={() => set('taxInclusive', !form.taxInclusive)}
                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${form.taxInclusive ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'}`}>
                    {form.taxInclusive && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div>
                    <p className="text-[12.5px] font-bold text-gray-700">Price includes tax</p>
                    <p className="text-[11px] text-gray-400">Tax is already included in the selling price</p>
                  </div>
                </div>

                <Field label="Tax Rate">
                  <div className="relative">
                    <select name="taxRate" value={form.taxRate} onChange={handleChange} className={selectCls}>
                      {TAX_RATES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </Field>
              </div>

              {/* 4. Inventory & Stock */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <SectionHeader icon={BarChart2} label="Inventory & Stock" sub="Stock management settings" color="purple" />

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="SKU (Stock Keeping Unit)" required>
                    <input name="sku" value={form.sku} onChange={handleChange}
                      placeholder="Unique product identifier"
                      className={`${inputCls} ${errors.sku ? 'border-red-300 ring-2 ring-red-100' : ''}`} />
                    {errors.sku && <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.sku}</p>}
                  </Field>
                  <Field label="Barcode">
                    <input name="barcode" value={form.barcode} onChange={handleChange}
                      placeholder="UPC, EAN, ISBN or custom barcode"
                      className={inputCls} />
                  </Field>
                </div>

                {/* Track inventory toggle */}
                <div className="flex items-center justify-between mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-[13px] font-bold text-gray-800">Track inventory for this product</p>
                    <p className="text-[11px] text-gray-400">Enable stock quantity tracking</p>
                  </div>
                  <button type="button" onClick={() => set('trackInventory', !form.trackInventory)}
                    className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${form.trackInventory ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${form.trackInventory ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>

                {form.trackInventory && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Available Quantity">
                        <input name="initialStock" type="number" value={form.initialStock} onChange={handleChange}
                          className={inputCls} min="0" />
                      </Field>
                      <Field label="Alert when sold below">
                        <input name="minimumStock" type="number" value={form.minimumStock} onChange={handleChange}
                          className={inputCls} min="0" />
                      </Field>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      <button type="button" onClick={() => set('continueOOS', !form.continueOOS)}
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${form.continueOOS ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'}`}>
                        {form.continueOOS && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div>
                        <p className="text-[12.5px] font-bold text-gray-700">Continue selling when out of stock</p>
                        <p className="text-[11px] text-gray-400">Allows customers to purchase when stock hits 0</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Product Variants (expandable hint) */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                      <Layers className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-gray-900">Product Variants</p>
                      <p className="text-[11px] font-medium text-gray-400">Add variants like size, color, etc.</p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>

            </div>

            {/* ──── RIGHT COLUMN ──── */}
            <div className="w-[280px] flex-shrink-0 p-6 space-y-5 bg-gray-50/50">

              {/* Product Type */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-4">Product Type</p>

                {/* Fix Product */}
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all mb-3 ${form.productType === 'FIX' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="productType" value="FIX" checked={form.productType === 'FIX'}
                    onChange={handleChange} className="hidden" />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${form.productType === 'FIX' ? 'border-emerald-500' : 'border-gray-300'}`}>
                    {form.productType === 'FIX' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                  </div>
                  <div>
                    <p className="text-[12.5px] font-black text-gray-800">Fix Product</p>
                    <p className="text-[10.5px] text-gray-500 font-medium">Countable by Number</p>
                  </div>
                </label>

                {/* Loose Product */}
                <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${form.productType === 'LOOSE' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="productType" value="LOOSE" checked={form.productType === 'LOOSE'}
                    onChange={handleChange} className="hidden" />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${form.productType === 'LOOSE' ? 'border-emerald-500' : 'border-gray-300'}`}>
                    {form.productType === 'LOOSE' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                  </div>
                  <div>
                    <p className="text-[12.5px] font-black text-gray-800">Loose Product</p>
                    <p className="text-[10.5px] text-gray-500 font-medium">Countable by Measurement</p>
                  </div>
                </label>

                {form.productType === 'LOOSE' && (
                  <div className="mt-3">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Measurement Unit</label>
                    <div className="relative">
                      <select name="unit" value={form.unit} onChange={handleChange} className={selectCls}>
                        {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Product Organization */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-4">Product Organization</p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select name="categoryId" value={form.categoryId} onChange={handleChange}
                        className={`${selectCls} text-[12px] ${errors.categoryId ? 'border-red-300 ring-2 ring-red-100' : ''}`}>
                        <option value="">Select Category</option>
                        {loading && <option disabled>Loading…</option>}
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {errors.categoryId && <p className="text-[10.5px] text-red-500 mt-1 font-medium">{errors.categoryId}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Sales Category</label>
                    <div className="relative">
                      <select name="subCategoryId" value={form.subCategoryId} onChange={handleChange}
                        className={`${selectCls} text-[12px]`}>
                        <option value="">Select subcategory (optional)</option>
                        {subCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier Information */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-[12px] font-black text-gray-500 uppercase tracking-widest mb-4">Supplier Information</p>
                <div className="relative">
                  <select name="supplierId" value={form.supplierId} onChange={handleChange}
                    className={`${selectCls} text-[12px]`}>
                    <option value="">Select Supplier (optional)</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Live Validation Summary */}
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-[12px] font-black text-red-600">Please fix the following:</p>
                  </div>
                  <ul className="space-y-1">
                    {Object.values(errors).filter(Boolean).map((e, i) => (
                      <li key={i} className="text-[11px] text-red-500 font-medium">• {e}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── BOTTOM ACTION BAR ── */}
        <div className="border-t border-gray-100 px-7 py-4 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Last saved: just now
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose}
              className="py-2.5 px-5 rounded-xl text-[13px] font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={() => handleSubmit(true)} disabled={saving}
              className="py-2.5 px-5 rounded-xl text-[13px] font-bold text-gray-700 border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-all flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Save as Draft
            </button>
            <button onClick={() => handleSubmit(false)} disabled={saving}
              className="py-2.5 px-6 rounded-xl text-[13px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 active:scale-95">
              {saving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Check className="w-3.5 h-3.5" /> Save &amp; Publish</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
