'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  Minus, Plus, X, ChevronDown, CheckCircle2, Pause, Printer, AlertTriangle,
  Package, SearchIcon, ArrowLeft, LayoutGrid, Banknote, CreditCard,
  Smartphone, ShoppingCart, Users, Zap, Scan, Tag, Pencil,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PaymentConfirmation from '@/components/pos/PaymentConfirmation';
import SuccessModal from '@/components/pos/SuccessModal';
import AddLabourModal from '@/components/sales/AddLabourModal';
import { toast } from 'sonner';
import api from '@/api/axiosInstance';
import AddCategoryModal from '@/components/pos/AddCategoryModal';
import ManageCategoriesModal from '@/components/inventory/ManageCategoriesModal';
import CustomerSearch, { CustomerMin } from '@/components/pos/CustomerSearch';
import AddCustomerModal from '@/components/customers/AddCustomerModal';
import { useBarcodeScanner, openCashDrawer } from '@/utils/hardwareIntegration';
import { matchAndScoreProduct } from '@/utils/searchUtils';


type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  img: string;
  warehouseId?: string;
  branchId?: string;
  sellType?: 'fixed' | 'loose';
  measurementUnit?: string;
  // Discount properties
  isDiscountEnabled?: boolean;
  isDiscountApproved?: boolean;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  maxAllowedDiscount?: number;
  defaultDiscountValue?: number;
  discountAmount?: number; // Total LKR discount amount per unit
  discountPercentage?: number; // Total applied percentage discount
  primaryDiscountValue?: number;
  primaryDiscountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  // Double / Secondary Discount properties
  hasSecondaryDiscount?: boolean;
  secondaryDiscountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  secondaryDiscountValue?: number;
  secondaryDiscountAmount?: number;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  stock: number;
  status: string;
  category: string;
  subCategory?: string | null;
  brand?: string | null;
  img: string;
  warehouseId?: string;
  branchId?: string;
  warehouseName?: string;
  sellType: 'fixed' | 'loose';
  measurementUnit?: string;
  // Discount properties
  isDiscountEnabled?: boolean;
  isDiscountApproved?: boolean;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  maxAllowedDiscount?: number;
  defaultDiscountValue?: number;
};

// ── Stock Error Modal ─────────────────────────────────────────────────────────
function StockErrorModal({ isOpen, onClose, message }: { isOpen: boolean; onClose: () => void; message: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">Stock Exceeded</h3>
        <p className="text-sm font-medium text-gray-500 mb-6">{message}</p>
        <button onClick={onClose} className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition-colors">
          Dismiss
        </button>
      </div>
    </div>
  );
}

function parseShortUnit(rawUnit?: any, isLoose?: boolean): string {
  if (!rawUnit) {
    return isLoose ? 'm' : 'pcs';
  }
  let unitStr = '';
  if (typeof rawUnit === 'string') {
    unitStr = rawUnit;
  } else if (typeof rawUnit === 'object') {
    unitStr = rawUnit.name || rawUnit.unit || rawUnit.label || rawUnit.symbol || rawUnit.value || '';
    if (!unitStr || unitStr === '[object Object]') unitStr = isLoose ? 'm' : 'pcs';
  } else {
    unitStr = String(rawUnit);
  }

  unitStr = unitStr.trim();
  if (!unitStr || unitStr.toLowerCase() === 'unit' || unitStr.toLowerCase() === 'units') {
    return isLoose ? 'm' : 'pcs';
  }
  const matchParen = unitStr.match(/\(([^)]+)\)/);
  if (matchParen && matchParen[1]) {
    return matchParen[1].trim();
  }
  const clean = unitStr.replace(/\s*\(.*\)/, '').trim().toLowerCase();
  if (clean === 'meters' || clean === 'meter') return 'm';
  if (clean === 'kilograms' || clean === 'kilogram') return 'kg';
  if (clean === 'liters' || clean === 'liter') return 'L';
  if (clean === 'pieces' || clean === 'piece') return 'pcs';
  if (clean === 'feet' || clean === 'foot') return 'ft';
  if (clean === 'inches' || clean === 'inch') return 'in';
  if (clean === 'yards' || clean === 'yard') return 'yd';
  if (clean === 'grams' || clean === 'gram') return 'g';
  if (clean === 'boxes' || clean === 'box') return 'box';
  if (clean === 'packs' || clean === 'pack') return 'pk';
  if (clean === 'rolls' || clean === 'roll') return 'roll';
  if (clean === 'sets' || clean === 'set') return 'set';
  if (clean === 'pairs' || clean === 'pair') return 'pr';
  if (clean === 'bags' || clean === 'bag') return 'bag';
  if (clean === 'bundles' || clean === 'bundle') return 'bdl';
  if (clean === 'cartons' || clean === 'carton') return 'ctn';
  return unitStr;
}

function extractProductSellTypeAndUnit(item: any, originalProduct: any) {
  const name = item?.product?.name || item?.product_name || item?.name || '';
  const nameLower = name.toLowerCase();

  const rawSellType = String(
    item?.product?.sellType ||
    item?.product?.sell_type ||
    item?.product?.productType ||
    item?.product?.product_type ||
    item?.sell_type ||
    item?.sellType ||
    item?.productType ||
    item?.product_type ||
    originalProduct?.sellType ||
    originalProduct?.sell_type ||
    originalProduct?.productType ||
    originalProduct?.product_type ||
    ''
  ).toUpperCase();

  let sellType: 'fixed' | 'loose' = 'fixed';
  if (
    rawSellType === 'LOOSE' ||
    rawSellType === 'MEASURED' ||
    rawSellType.includes('LOOSE') ||
    rawSellType.includes('MEASUR')
  ) {
    sellType = 'loose';
  } else if (
    rawSellType === 'FIX' ||
    rawSellType === 'FIXED' ||
    rawSellType === 'COUNTABLE'
  ) {
    sellType = 'fixed';
  } else {
    if (
      nameLower.includes('pipe') ||
      nameLower.includes('pype') ||
      nameLower.includes('hose') ||
      nameLower.includes('rod') ||
      nameLower.includes('wire') ||
      nameLower.includes('cable') ||
      nameLower.includes('rope') ||
      nameLower.includes('sand') ||
      nameLower.includes('metal') ||
      nameLower.includes('gravel') ||
      nameLower.includes('cement (loose)') ||
      nameLower.includes('nails') ||
      nameLower.includes('screws') ||
      nameLower.includes('(per m)') ||
      nameLower.includes('(per kg)') ||
      nameLower.includes('(per m³)') ||
      nameLower.includes('(per l)')
    ) {
      sellType = 'loose';
    }
  }

  const rawUnit = String(
    item?.product?.measurementUnit ||
    item?.product?.measurement_unit ||
    item?.product?.unit ||
    item?.measurement_unit ||
    item?.measurementUnit ||
    item?.unit ||
    originalProduct?.measurementUnit ||
    originalProduct?.measurement_unit ||
    originalProduct?.unit ||
    ''
  ).trim();

  let measurementUnit = 'pcs';
  if (rawUnit && rawUnit.toLowerCase() !== 'unit' && rawUnit.toLowerCase() !== 'units') {
    measurementUnit = rawUnit;
  } else {
    if (
      nameLower.includes('pipe') ||
      nameLower.includes('pype') ||
      nameLower.includes('hose') ||
      nameLower.includes('rod') ||
      nameLower.includes('wire') ||
      nameLower.includes('cable') ||
      nameLower.includes('rope') ||
      nameLower.includes('(per m)')
    ) {
      measurementUnit = 'Meters (m)';
    } else if (
      nameLower.includes('sand') ||
      nameLower.includes('metal') ||
      nameLower.includes('gravel') ||
      nameLower.includes('cement') ||
      nameLower.includes('nails') ||
      nameLower.includes('screws') ||
      nameLower.includes('(per kg)')
    ) {
      measurementUnit = 'Kilograms (kg)';
    } else if (nameLower.includes('(per m³)')) {
      measurementUnit = 'm³';
    } else if (nameLower.includes('(per l)') || nameLower.includes('liters') || nameLower.includes('liter')) {
      measurementUnit = 'Liters (L)';
    } else {
      measurementUnit = sellType === 'loose' ? 'Meters (m)' : 'Pieces (pcs)';
    }
  }

  return { sellType, measurementUnit };
}

// ── Quantity Popup ──────────────────────────────────────────────────────────────
// ── Quantity Popup ──────────────────────────────────────────────────────────────
function QtyPopup({
  product,
  currentQty,
  initialEditMode = false,
  onConfirm,
  onClose,
}: {
  product: Product;
  currentQty: number;
  initialEditMode?: boolean;
  onConfirm: (qty: number, customPrice?: number, customName?: string, customUnit?: string) => void;
  onClose: () => void;
}) {
  const shortUnit = parseShortUnit(product.measurementUnit || (product as any).unit, product.sellType === 'loose');
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [productName, setProductName] = useState<string>(product.name);
  const [measurementUnit, setMeasurementUnit] = useState<string>(shortUnit);
  const [unitPrice, setUnitPrice] = useState<number | string>(product.price);

  const activeUnit = measurementUnit.trim() || shortUnit;
  const isLoose = product.sellType === 'loose' || activeUnit === 'm' || activeUnit === 'kg' || activeUnit === 'L' || activeUnit === 'ft' || activeUnit === 'in' || activeUnit === 'yd' || activeUnit === 'g' || activeUnit === 'mm' || activeUnit === 'litre';

  const [qty, setQtyLocal] = useState<number | string>(currentQty > 0 ? currentQty : (isLoose ? '' : 1));
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.select(), 50);
  }, []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') onClose();
  };

  const parsedQty = typeof qty === 'string' ? parseFloat(qty) || 0 : qty;
  const parsedUnitPrice = typeof unitPrice === 'string' ? (parseFloat(unitPrice) >= 0 ? parseFloat(unitPrice) : product.price) : unitPrice;
  const total = (parsedUnitPrice || 0) * Math.max(0, parsedQty);

  const handleConfirm = () => {
    const finalQty = Math.max(isLoose ? 0.01 : 1, parsedQty);
    if (finalQty > product.stock) {
      setShowError(true);
      return;
    }
    onConfirm(finalQty, parsedUnitPrice, productName, activeUnit);
  };

  const quickChips = useMemo(() => {
    const u = activeUnit.toLowerCase();
    if (u === 'kg' || u === 'g') return [0.25, 0.5, 1, 2.5, 5, 10];
    if (u === 'm' || u === 'ft' || u === 'yd' || u === 'in' || u === 'mm' || u === 'inch') return [0.5, 1, 2, 5, 10, 25];
    if (u === 'l' || u === 'litre' || u === 'liters') return [0.5, 1, 2, 5, 10, 20];
    if (isLoose) return [0.25, 0.5, 1, 2.5, 5, 10];
    return [1, 2, 5, 10, 25, 50];
  }, [activeUnit, isLoose]);

  return (
    <>
      <StockErrorModal 
        isOpen={showError} 
        onClose={() => setShowError(false)} 
        message={`Cannot add ${parsedQty}. Only ${product.stock} ${activeUnit} available in stock.`} 
      />
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div
          className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-4 p-4 bg-gray-50 border-b border-gray-100 shrink-0 relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-gray-200 shadow-sm bg-white">
              {product.img ? (
                <img src={product.img} alt={productName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pr-16">
              <p className="text-[10px] font-black text-[#059669] uppercase tracking-widest mb-0.5">{product.category}</p>
              <h3 className="text-[14px] font-black text-gray-900 leading-snug line-clamp-1">{productName}</h3>
              <p className="text-[11px] font-bold text-gray-500 mt-0.5">
                Price: Rs. {(parsedUnitPrice || 0).toLocaleString()} / <span className="text-emerald-700 font-extrabold">{activeUnit}</span>
              </p>
              <p className="text-[10px] font-bold text-amber-600">Stock: {product.stock} {shortUnit}</p>
            </div>
            
            <div className="absolute top-4 right-4 flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                title={isEditing ? "Close Edit Mode" : "Edit Name, Unit & Price"}
                className={`p-1.5 rounded-full transition-all text-xs font-bold flex items-center gap-1 ${
                  isEditing
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-gray-200 hover:bg-emerald-100 text-gray-600 hover:text-emerald-700'
                }`}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-500 p-1.5 rounded-full transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-3.5 overflow-y-auto flex-1">

            {/* Editable sections only visible if isEditing is true */}
            {isEditing && (
              <div className="space-y-3 p-3 bg-amber-50/50 border border-amber-200/70 rounded-2xl animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-1 border-b border-amber-200/50">
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <Pencil className="w-3 h-3 text-amber-600" /> Edit Product Details
                  </span>
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                    Saves to Inventory
                  </span>
                </div>

                {/* Editable Product Name */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                      Product Name
                    </p>
                    {productName.trim() !== product.name && (
                      <button
                        type="button"
                        onClick={() => setProductName(product.name)}
                        className="text-[9px] font-bold text-gray-500 hover:text-gray-800 underline ml-1"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    onKeyDown={handleKey}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-[13px] text-gray-900 outline-none focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/10 transition-all"
                    placeholder="Product name..."
                  />
                </div>

                {/* Editable Unit / Count Type */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                      Unit / Count Type
                    </p>
                    {activeUnit.toLowerCase() !== shortUnit.toLowerCase() && (
                      <button
                        type="button"
                        onClick={() => setMeasurementUnit(shortUnit)}
                        className="text-[9px] font-bold text-gray-500 hover:text-gray-800 underline ml-1"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={measurementUnit}
                    onChange={(e) => setMeasurementUnit(e.target.value)}
                    onKeyDown={handleKey}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-bold text-[13px] text-gray-900 outline-none focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/10 transition-all"
                    placeholder="e.g. pcs, litre, mm, inch, m, kg, box..."
                  />
                  <div className="flex gap-1 overflow-x-auto no-scrollbar pt-0.5">
                    {['pcs', 'litre', 'mm', 'inch', 'm', 'kg', 'ft', 'yd', 'box', 'pk', 'g', 'set'].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setMeasurementUnit(u)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors shrink-0 ${
                          activeUnit.toLowerCase() === u.toLowerCase()
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-emerald-50 hover:border-emerald-200'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editable Unit Selling Price */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                      Unit Selling Price (Rs.)
                    </p>
                    {Number(parsedUnitPrice) !== product.price && (
                      <button
                        type="button"
                        onClick={() => setUnitPrice(product.price)}
                        className="text-[9px] font-bold text-gray-500 hover:text-gray-800 underline ml-1"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-sm font-black text-gray-400">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      onKeyDown={handleKey}
                      className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-right font-black text-[15px] text-gray-900 outline-none focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quantity Input Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {isLoose ? `Enter Measurement (${activeUnit})` : `Enter Quantity (${activeUnit})`}
                </p>
                <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {activeUnit}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const cur = typeof qty === 'number' ? qty : parseFloat(String(qty)) || 1;
                    const step = isLoose ? 0.5 : 1;
                    const nextVal = parseFloat((cur - step).toFixed(2));
                    setQtyLocal(Math.max(isLoose ? 0.1 : 1, nextVal));
                  }}
                  className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-all active:scale-90 shrink-0 border border-gray-200"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <input
                  ref={inputRef}
                  type="number"
                  min={isLoose ? 0.01 : 1}
                  step={isLoose ? "any" : "1"}
                  value={qty}
                  onChange={(e) => setQtyLocal(e.target.value)}
                  onKeyDown={handleKey}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 w-full h-14 text-center text-[28px] font-black text-gray-900 border-2 border-gray-200 rounded-2xl outline-none focus:border-[#059669] focus:ring-4 focus:ring-emerald-500/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => {
                    const cur = typeof qty === 'number' ? qty : parseFloat(String(qty)) || 1;
                    const step = isLoose ? 0.5 : 1;
                    const nextVal = parseFloat((cur + step).toFixed(2));
                    setQtyLocal(nextVal);
                  }}
                  className="w-12 h-12 rounded-2xl bg-[#059669] hover:bg-emerald-700 flex items-center justify-center text-white transition-all active:scale-90 shrink-0 shadow-lg shadow-emerald-500/20"
                >
                  <Plus className="w-5 h-5" strokeWidth={3} />
                </button>
              </div>

              {/* Quick increment chips */}
              <div className="flex gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
                {quickChips.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQtyLocal(val.toString())}
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border transition-all shrink-0 ${
                      parsedQty === val
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700'
                    }`}
                  >
                    +{val} {activeUnit}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Total Summary */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-500">
                  {parsedQty} {activeUnit} × Rs. {(parsedUnitPrice || 0).toLocaleString()}
                </p>
                <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mt-0.5">Line Total</p>
              </div>
              <span className="text-[18px] font-black text-[#059669] font-mono">
                Rs. {total.toLocaleString()}
              </span>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-500 font-bold text-[13px] hover:bg-gray-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-[1.5] py-3 rounded-2xl bg-[#059669] text-white font-black text-[13px] hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] uppercase tracking-wider"
              >
                Confirm & Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function POSPage() {
  const router = useRouter();
  const [viewState, setViewState] = useState<'pos' | 'confirm'>('pos');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [activeBrand, setActiveBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pos_draft_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const posProductGridRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const focusSearchInput = () => {
    setTimeout(() => {
      if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 10);
  };

  const [categoriesData, setCategoriesData] = useState<{ id: string; name: string; subcategories?: { id: string; name: string; brands?: { id: string; name: string }[] }[]; brands?: { id: string; name: string }[] }[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedParentIdForModal, setSelectedParentIdForModal] = useState<string | undefined>(undefined);
  const [openBrandInputDirectly, setOpenBrandInputDirectly] = useState(false);

  const categories = useMemo(() => {
    const apiCatNames = categoriesData.map(c => c.name);
    const prodCatNames = productsList.map(p => p.category).filter(Boolean);
    return Array.from(new Set(['All', ...apiCatNames, ...prodCatNames]));
  }, [categoriesData, productsList]);

  const activeCategoryObj = useMemo(() => {
    return categoriesData.find(c => c.name.trim().toLowerCase() === activeCategory.trim().toLowerCase());
  }, [categoriesData, activeCategory]);

  const activeSubcategoryObj = useMemo(() => {
    return activeCategoryObj?.subcategories?.find(s => s.name.trim().toLowerCase() === activeSubcategory.trim().toLowerCase());
  }, [activeCategoryObj, activeSubcategory]);

  const availableSubcategories = useMemo(() => {
    if (activeCategory === 'All') return [];
    
    const catSubs = activeCategoryObj?.subcategories || [];
    const subMap = new Map<string, { id: string; name: string }>();
    catSubs.forEach(s => {
      if (s.name) subMap.set(s.name.trim().toLowerCase(), { id: s.id || s.name, name: s.name.trim() });
    });

    const targetCat = activeCategory.trim().toLowerCase();
    productsList.forEach(p => {
      if ((p.category || '').trim().toLowerCase() === targetCat && p.subCategory) {
        const key = p.subCategory.trim().toLowerCase();
        if (!subMap.has(key)) {
          subMap.set(key, { id: key, name: p.subCategory.trim() });
        }
      }
    });

    return Array.from(subMap.values());
  }, [activeCategory, activeCategoryObj, productsList]);

  const availableBrands = useMemo(() => {
    if (activeCategory === 'All') return [];

    let catBrandObjects: { id: string; name: string }[] = [];
    if (activeSubcategory !== 'All' && activeSubcategoryObj) {
      catBrandObjects = activeSubcategoryObj.brands || [];
    } else if (activeCategoryObj) {
      const subBrands = (activeCategoryObj.subcategories || []).flatMap(s => s.brands || []);
      const catBrands = activeCategoryObj.brands || [];
      catBrandObjects = [...catBrands, ...subBrands];
    }

    const targetCat = activeCategory.trim().toLowerCase();
    const targetSubCat = activeSubcategory.trim().toLowerCase();

    const brandMap = new Map<string, { id: string; name: string }>();
    catBrandObjects.forEach(b => {
      if (b.name) brandMap.set(b.name.trim().toLowerCase(), { id: b.id || b.name, name: b.name.trim() });
    });

    productsList.forEach(p => {
      const matchCat = targetCat === 'all' || (p.category || '').trim().toLowerCase() === targetCat;
      const matchSubCat = targetSubCat === 'all' || (p.subCategory || '').trim().toLowerCase() === targetSubCat;
      if (matchCat && matchSubCat && p.brand) {
        const key = p.brand.trim().toLowerCase();
        if (!brandMap.has(key)) {
          brandMap.set(key, { id: key, name: p.brand.trim() });
        }
      }
    });

    return Array.from(brandMap.values());
  }, [activeCategory, activeSubcategory, activeCategoryObj, activeSubcategoryObj, productsList]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Auto-focus search bar on page mount & when returning to POS view
  useEffect(() => {
    if (viewState === 'pos') {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [viewState]);

  // Auto-focus search bar when products finish loading
  useEffect(() => {
    if (!isLoading && viewState === 'pos') {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading, viewState]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      const items = res.data?.data || res.data || [];
      if (Array.isArray(items)) {
        setCategoriesData(items);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setFetchError(null);
      
      const [stockRes, productsRes] = await Promise.allSettled([
        api.get('/stock'),
        api.get('/products'),
      ]);

      const stockItems: any[] = stockRes.status === 'fulfilled'
        ? (stockRes.value.data?.data || stockRes.value.data || [])
        : [];

      const allProducts: any[] = productsRes.status === 'fulfilled'
        ? (productsRes.value.data?.data || productsRes.value.data || [])
        : [];

      const stockProductIds = new Set(stockItems.map((s: any) => String(s.product_id || s.productId)));

      // Map products that have stock records
      const mappedStockProducts: Product[] = stockItems.map((item: any, index: number) => {
        const name = item.product?.name || item.product_name || 'Unknown';
        const prodId = String(item.product?.id || item.product_id || item.productId || item.id || `fallback-${index}`);
        const originalProduct = allProducts.find((p: any) => String(p.id) === prodId);

        const { sellType, measurementUnit } = extractProductSellTypeAndUnit(item, originalProduct);
        const qty = Number(item.available_quantity || item.availableQuantity || item.quantity || 0);

        return {
          id: prodId,
          name: name,
          sku: item.product?.sku || item.sku || 'N/A',
          price: Number(item.product?.selling_price || item.product?.sellingPrice || item.selling_price || 0),
          stock: qty,
          status: qty > 10 ? 'In Stock' : (qty > 0 ? 'Low Stock' : 'Out of Stock'),
          category: item.product?.category?.name || item.category_name || 'All',
          subCategory: item.product?.subCategory?.name || item.product?.subcategory?.name || item.subCategory?.name || item.subcategory?.name || item.subcategory_name || item.subCategoryName || originalProduct?.subCategory?.name || originalProduct?.subcategory?.name || originalProduct?.subCategoryName || null,
          brand: item.product?.brand?.name || item.brand?.name || item.brand_name || item.brandName || originalProduct?.brand?.name || originalProduct?.brandName || (typeof item.product?.brand === 'string' ? item.product?.brand : (typeof originalProduct?.brand === 'string' ? originalProduct?.brand : null)) || null,
          img: item.image_url || item.product?.image_url || item.product?.image || item.image || null,
          warehouseId: item.warehouseId || item.warehouse_id,
          branchId: item.branchId || item.branch_id,
          warehouseName: item.warehouse?.name || 'Main Store',
          sellType,
          measurementUnit,
          barcode: originalProduct?.barcode || item.product?.barcode || item.barcode || undefined,
          // Discount configurations (fall back to stock/product API values if not found in allProducts)
          isDiscountEnabled: originalProduct?.isDiscountEnabled || item.product?.isDiscountEnabled || item.isDiscountEnabled || false,
          isDiscountApproved: originalProduct?.isDiscountApproved || item.product?.isDiscountApproved || item.isDiscountApproved || false,
          discountType: originalProduct?.discountType || item.product?.discountType || item.discountType || 'PERCENTAGE',
          maxAllowedDiscount: Number(originalProduct?.maxAllowedDiscount || item.product?.maxAllowedDiscount || item.maxAllowedDiscount || 0),
          defaultDiscountValue: Number(originalProduct?.defaultDiscountValue || item.product?.defaultDiscountValue || item.defaultDiscountValue || 0),
        };
      });

      // Map products that do NOT have a stock record yet
      const mappedNoStockProducts: Product[] = allProducts
        .filter((p: any) => !stockProductIds.has(String(p.id)))
        .map((p: any) => {
          const name = p.name || 'Unknown';
          const { sellType, measurementUnit } = extractProductSellTypeAndUnit(p, p);

          return {
            id: String(p.id),
            name: name,
            sku: p.sku || 'N/A',
            barcode: p.barcode || undefined,
            price: Number(p.sellingPrice || 0),
            stock: 0,
            status: 'Out of Stock',
            category: p.category?.name || 'All',
            subCategory: p.subCategory?.name || p.subcategory?.name || p.subCategoryName || null,
            brand: p.brand?.name || p.brandName || (typeof p.brand === 'string' ? p.brand : null) || null,
            img: p.images?.[0]?.imageUrl || null,
            warehouseId: undefined,
            branchId: undefined,
            warehouseName: undefined,
            sellType,
            measurementUnit,
            // Discount configurations
            isDiscountEnabled: p.isDiscountEnabled || false,
            isDiscountApproved: p.isDiscountApproved || false,
            discountType: p.discountType || 'PERCENTAGE',
            maxAllowedDiscount: Number(p.maxAllowedDiscount || 0),
            defaultDiscountValue: Number(p.defaultDiscountValue || 0),
          };
        });

      console.log("[POS] Mapped products:", {
        mappedStockProducts,
        mappedNoStockProducts,
      });
      setProductsList([...mappedStockProducts, ...mappedNoStockProducts]);
    } catch (err: any) {
      console.error('[POS] Failed to fetch products:', err);
      setFetchError(err.message || 'Failed to connect to API');
    } finally {
      setIsLoading(false);
    }
  };

  // Qty Popup state
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [pendingProductEditMode, setPendingProductEditMode] = useState<boolean>(false);
  const [selectedCartItemForDiscount, setSelectedCartItemForDiscount] = useState<CartItem | null>(null);
  const [isLabourModalOpen, setIsLabourModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'items' | 'checkout'>('items');

  // ── localStorage-backed cart draft (persists across navigation, refresh, internet interruption)
  const POS_DRAFT_KEY = 'pos_draft_cart';
  const POS_DRAFT_DISCOUNT_TYPE = 'pos_draft_discount_type';
  const POS_DRAFT_DISCOUNT_VALUE = 'pos_draft_discount_value';
  const POS_DRAFT_NOTES = 'pos_draft_notes';
  const POS_DRAFT_CUSTOMER = 'pos_draft_customer';

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerMin | null>(() => {
    try {
      const saved = localStorage.getItem(POS_DRAFT_CUSTOMER);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('0');
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(() => {
    try {
      const saved = localStorage.getItem(POS_DRAFT_DISCOUNT_TYPE);
      return (saved === 'fixed' ? 'fixed' : 'percentage') as 'percentage' | 'fixed';
    } catch { return 'percentage'; }
  });
  const [discountValue, setDiscountValue] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(POS_DRAFT_DISCOUNT_VALUE);
      return saved ? Number(saved) : 0;
    } catch { return 0; }
  });
  const [notes, setNotes] = useState(() => {
    try { return localStorage.getItem(POS_DRAFT_NOTES) || ''; }
    catch { return ''; }
  });
  const [heldOrders, setHeldOrders] = useState<CartItem[][]>([]);

  // Persist draft cart to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(POS_DRAFT_KEY, JSON.stringify(cart)); }
    catch {}
  }, [cart]);

  useEffect(() => {
    try { localStorage.setItem(POS_DRAFT_DISCOUNT_TYPE, discountType); }
    catch {}
  }, [discountType]);

  useEffect(() => {
    try { localStorage.setItem(POS_DRAFT_DISCOUNT_VALUE, String(discountValue)); }
    catch {}
  }, [discountValue]);

  useEffect(() => {
    try { localStorage.setItem(POS_DRAFT_NOTES, notes); }
    catch {}
  }, [notes]);

  useEffect(() => {
    try {
      if (selectedCustomer) localStorage.setItem(POS_DRAFT_CUSTOMER, JSON.stringify(selectedCustomer));
      else localStorage.removeItem(POS_DRAFT_CUSTOMER);
    } catch {}
  }, [selectedCustomer]);


  // ── Cart helpers
  const handleApplyItemDiscount = (
    itemId: string,
    val: number,
    type: 'PERCENTAGE' | 'FIXED_AMOUNT',
    hasSecondary?: boolean,
    secVal?: number,
    secType?: 'PERCENTAGE' | 'FIXED_AMOUNT'
  ) => {
    setCart((prev) => prev.map(item => {
      if (item.id === itemId) {
        const originalPrice = item.price;
        const parsedVal = val || 0;

        let primaryDiscountAmount = 0;
        let primaryDiscountPercentage = 0;
        if (type === 'PERCENTAGE') {
          primaryDiscountPercentage = parsedVal;
          primaryDiscountAmount = Number(((originalPrice * parsedVal) / 100).toFixed(2));
        } else {
          primaryDiscountAmount = parsedVal;
          primaryDiscountPercentage = Number(((parsedVal / originalPrice) * 100).toFixed(2));
        }

        const priceAfterPrimary = Math.max(0, originalPrice - primaryDiscountAmount);

        let secondaryDiscountAmount = 0;
        let secondaryDiscountPercentage = 0;
        const parsedSecVal = secVal || 0;

        if (hasSecondary && parsedSecVal > 0) {
          if (secType === 'PERCENTAGE') {
            secondaryDiscountPercentage = parsedSecVal;
            secondaryDiscountAmount = Number(((priceAfterPrimary * parsedSecVal) / 100).toFixed(2));
          } else {
            secondaryDiscountAmount = parsedSecVal;
            secondaryDiscountPercentage = Number(((parsedSecVal / (priceAfterPrimary || 1)) * 100).toFixed(2));
          }
        }

        const totalDiscountAmount = Number((primaryDiscountAmount + secondaryDiscountAmount).toFixed(2));
        const totalDiscountPercentage = Number(((totalDiscountAmount / originalPrice) * 100).toFixed(2));

        return {
          ...item,
          discountAmount: totalDiscountAmount,
          discountPercentage: totalDiscountPercentage,
          primaryDiscountValue: val,
          primaryDiscountType: type,
          hasSecondaryDiscount: hasSecondary,
          secondaryDiscountType: secType,
          secondaryDiscountValue: secVal,
          secondaryDiscountAmount: secondaryDiscountAmount,
        };
      }
      return item;
    }));
  };

  const addToCartWithQty = (
    product: Product,
    qty: number,
    customPrice?: number,
    customName?: string,
    customUnit?: string
  ) => {
    if (!product || !product.id) {
      toast.error('Invalid product. Cannot add to cart.');
      setPendingProduct(null);
      return;
    }

    const finalPrice = customPrice !== undefined && !isNaN(customPrice) && customPrice >= 0 ? customPrice : product.price;
    const finalName = customName && customName.trim() ? customName.trim() : product.name;
    const finalUnit = customUnit && customUnit.trim() ? customUnit.trim() : (product.measurementUnit || 'pcs');

    const isNameChanged = finalName !== product.name;
    const isPriceChanged = finalPrice !== product.price;
    const isUnitChanged = finalUnit !== (product.measurementUnit || 'pcs');

    // Permanently update product details in database and POS inventory list if changed
    if (isNameChanged || isPriceChanged || isUnitChanged) {
      const updatePayload: Record<string, any> = {};
      if (isNameChanged) updatePayload.name = finalName;
      if (isPriceChanged) updatePayload.sellingPrice = finalPrice;
      if (isUnitChanged) updatePayload.measurementUnit = finalUnit;

      api.patch(`/products/${product.id}`, updatePayload).then(() => {
        toast.success(`Product updated in Inventory! (${finalName}, ${finalUnit}, Rs. ${finalPrice.toLocaleString()})`);
      }).catch((err) => {
        console.error("Failed to permanently update product details in database:", err);
      });

      setProductsList((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, name: finalName, price: finalPrice, measurementUnit: finalUnit } : p))
      );
    }

    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, name: finalName, qty, price: finalPrice, measurementUnit: finalUnit } : item);
      }

      let discountAmount = 0;
      let discountPercentage = 0;
      const defaultVal = Number(product.defaultDiscountValue ?? 0);
      if (product.isDiscountEnabled && product.isDiscountApproved && defaultVal > 0) {
        if (product.discountType === 'PERCENTAGE') {
          discountPercentage = defaultVal;
          discountAmount = Number(((finalPrice * defaultVal) / 100).toFixed(2));
        } else {
          discountAmount = defaultVal;
          discountPercentage = Number(((defaultVal / finalPrice) * 100).toFixed(2));
        }
      }

      return [...prev, {
        id: product.id,
        name: finalName,
        price: finalPrice,
        qty,
        img: product.img,
        warehouseId: product.warehouseId,
        branchId: product.branchId,
        warehouseName: product.warehouseName,
        sellType: product.sellType,
        measurementUnit: finalUnit,
        isDiscountEnabled: product.isDiscountEnabled,
        isDiscountApproved: product.isDiscountApproved,
        discountType: product.discountType,
        maxAllowedDiscount: product.maxAllowedDiscount,
        defaultDiscountValue: product.defaultDiscountValue,
        discountAmount,
        discountPercentage,
      }];
    });
    setActiveTab('items');
    setPendingProduct(null);
    setIsMobileCartOpen(true);
    toast.success(`${qty} ${finalUnit} x ${finalName} (Rs. ${finalPrice.toLocaleString()}) added to cart!`);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map(item => {
      if (item.id === id) return { ...item, qty: Math.max(1, item.qty + delta) };
      return item;
    }));
  };

  const setQty = (id: string, value: string) => {
    const parsed = parseInt(value, 10);
    setCart((prev) => prev.map(item => {
      if (item.id === id) {
        if (!value || isNaN(parsed)) return item;
        return { ...item, qty: Math.max(1, parsed) };
      }
      return item;
    }));
  };

  const ensureMinQty = (id: string) => {
    setCart((prev) => prev.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty) } : item));
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter(item => item.id !== id));

  const handleHold = () => {
    if (cart.length === 0) return;
    setHeldOrders(prev => [...prev, cart]);
    setCart([]);
    toast.success('Transaction put on hold.');
  };

  const handlePrint = () => { window.print(); };

  const subtotal = Number(cart.reduce((acc, item) => acc + (item.price - Number((item.discountAmount ?? 0).toFixed(2))) * item.qty, 0).toFixed(2));
  const discountAmount = Number((discountType === 'percentage'
    ? (subtotal * (discountValue / 100))
    : discountValue).toFixed(2));
  const tax = 0;
  const total = Math.max(0, Number((subtotal - discountAmount).toFixed(2)));

  const hasLowStockItems = useMemo(() => {
    return cart.some(item => {
      const product = productsList.find(p => p.id === item.id);
      return product?.status === 'Low Stock';
    });
  }, [cart, productsList]);

  const filteredProducts = useMemo(() => {
    const targetCat = activeCategory.trim().toLowerCase();
    const targetSubCat = activeSubcategory.trim().toLowerCase();
    const targetBrand = activeBrand.trim().toLowerCase();

    const scored: Array<{ product: typeof productsList[0]; score: number }> = [];

    for (const p of productsList) {
      const pCat = (p.category || '').trim().toLowerCase();
      const pSubCat = (p.subCategory || '').trim().toLowerCase();
      const pBrand = (p.brand || '').trim().toLowerCase();

      const matchCat = targetCat === 'all' || pCat === targetCat;
      const matchSubCat = targetSubCat === 'all' || pSubCat === targetSubCat;
      const matchBrand = targetBrand === 'all' || pBrand === targetBrand;

      if (!matchCat || !matchSubCat || !matchBrand) continue;

      const { matches, score } = matchAndScoreProduct(p, searchQuery);
      if (matches) {
        scored.push({ product: p, score });
      }
    }

    if (searchQuery.trim()) {
      scored.sort((a, b) => b.score - a.score);
    }

    return scored.map(s => s.product);
  }, [activeCategory, activeSubcategory, activeBrand, searchQuery, productsList]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'F1') { e.preventDefault(); setCart([]); setViewState('pos'); }
      if (e.key === 'F2') { e.preventDefault(); setActiveTab(prev => prev === 'items' ? 'checkout' : 'items'); }
      if (e.key === 'F9' && activeTab === 'checkout') { e.preventDefault(); setViewState('confirm'); }
      if (e.key === 'Escape') setPendingProduct(null);

      const activeEl = document.activeElement;
      const isInputActive =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          (activeEl as HTMLElement).isContentEditable);

      // Backspace Sub-view Navigation (Returns from Confirm Payment screen to POS items view, or closes popups/modals)
      if (e.key === "Backspace" && !isInputActive) {
        if (pendingProduct) {
          e.preventDefault();
          e.stopPropagation();
          setPendingProduct(null);
          return;
        }
        if (isCustomerModalOpen) {
          e.preventDefault();
          e.stopPropagation();
          setIsCustomerModalOpen(false);
          return;
        }
        if (isCategoryModalOpen) {
          e.preventDefault();
          e.stopPropagation();
          setIsCategoryModalOpen(false);
          return;
        }
        if (isLabourModalOpen) {
          e.preventDefault();
          e.stopPropagation();
          setIsLabourModalOpen(false);
          return;
        }
        if (viewState === "confirm") {
          e.preventDefault();
          e.stopPropagation();
          setViewState("pos");
          return;
        }
        if (viewState === "pos") {
          e.preventDefault();
          e.stopPropagation();
          router.back();
          return;
        }
      }

      // Up & Down Arrow Key Scrolling for POS Product Grid
      const isTextareaOrSelect =
        activeEl &&
        (activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.getAttribute("role") === "listbox" ||
          activeEl.getAttribute("role") === "combobox");

      if (!isTextareaOrSelect && posProductGridRef.current) {
        const key = e.key;
        const step = e.repeat ? 280 : 180;
        if (key === "ArrowDown" || key === "Down") {
          e.preventDefault();
          posProductGridRef.current.scrollBy(0, step);
        } else if (key === "ArrowUp" || key === "Up") {
          e.preventDefault();
          posProductGridRef.current.scrollBy(0, -step);
        } else if (key === "PageDown") {
          e.preventDefault();
          posProductGridRef.current.scrollBy(0, 500);
        } else if (key === "PageUp") {
          e.preventDefault();
          posProductGridRef.current.scrollBy(0, -500);
        } else if (key === "Home") {
          e.preventDefault();
          posProductGridRef.current.scrollTo(0, 0);
        } else if (key === "End") {
          e.preventDefault();
          posProductGridRef.current.scrollTo(0, posProductGridRef.current.scrollHeight);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [activeTab, viewState, pendingProduct, isCustomerModalOpen, isCategoryModalOpen, isLabourModalOpen]);

  // Hardware Barcode Scanner Listener
  useBarcodeScanner({
    onScan: (scannedCode) => {
      const raw = scannedCode.trim();
      const code = raw.toLowerCase();
      const cleanCode = code.replace(/[^a-z0-9]/g, "");

      const found = productsList.find((p) => {
        const pBarcode = (p.barcode || "").toLowerCase();
        const pSku = (p.sku || "").toLowerCase();
        const pId = (p.id || "").toLowerCase();
        const pName = (p.name || "").toLowerCase();

        const cleanBarcode = pBarcode.replace(/[^a-z0-9]/g, "");
        const cleanSku = pSku.replace(/[^a-z0-9]/g, "");
        const cleanId = pId.replace(/[^a-z0-9]/g, "");

        return (
          pBarcode === code ||
          pSku === code ||
          pId === code ||
          cleanBarcode === cleanCode ||
          cleanSku === cleanCode ||
          cleanId === cleanCode ||
          pName === code ||
          pName.includes(code)
        );
      });
      if (found) {
        if (found.stock <= 0) {
          toast.error(`Scanned item "${found.name}" is out of stock!`);
        } else {
          setPendingProduct(found);
          toast.success(`Scanned: ${found.name}. Enter quantity.`);
        }
      } else {
        toast.error(`Barcode / SKU '${scannedCode}' not found in inventory.`);
      }
    },
    enabled: viewState === 'pos',
    minCharLength: 2,
    maxDelayMs: 150,
  });

  // Keep search input continuously active / focused for barcode scanning & rapid typing
  useEffect(() => {
    if (viewState !== 'pos') return;

    if (!pendingProduct && !isCustomerModalOpen && !isCategoryModalOpen && !isLabourModalOpen) {
      focusSearchInput();
    }

    const handleGlobalMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable ||
        !!target.closest('[role="dialog"]') ||
        !!target.closest('.modal-content');

      if (!isInput) {
        focusSearchInput();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [viewState, pendingProduct, isCustomerModalOpen, isCategoryModalOpen, isLabourModalOpen]);

  // Smooth scroll highlighted card into view when navigating grid with arrow keys
  useEffect(() => {
    if (viewState === 'pos' && posProductGridRef.current) {
      const gridContainer = posProductGridRef.current;
      const cards = gridContainer.querySelectorAll('.product-card');
      const activeCard = cards[highlightedIndex] as HTMLElement;
      if (activeCard) {
        activeCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex, viewState]);


  return (
    <>
      <AddLabourModal
        isOpen={isLabourModalOpen}
        onClose={() => setIsLabourModalOpen(false)}
      />
      <ManageCategoriesModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedParentIdForModal(undefined);
          setOpenBrandInputDirectly(false);
        }}
        onRefresh={() => {
          fetchCategories();
          fetchProducts();
        }}
        initialSubcategoryId={selectedParentIdForModal}
        openBrandInputDirectly={openBrandInputDirectly}
      />
      {isCustomerModalOpen && (
        <AddCustomerModal 
          onClose={() => setIsCustomerModalOpen(false)} 
          onSuccess={(newCustomer) => {
            if (newCustomer) {
              setSelectedCustomer({
                id: newCustomer.id || newCustomer.customer_id,
                name: newCustomer.name || newCustomer.customer_name || 'Walk-in',
                phone: newCustomer.phone || '',
                customerType: newCustomer.customerType || newCustomer.customer_type || 'Individual'
              });
            }
          }} 
        />
      )}

      {/* Qty Popup — outside MainLayout to escape stacking contexts */}
      {pendingProduct && (
        <QtyPopup
          product={pendingProduct}
          currentQty={cart.find(c => c.id === pendingProduct.id)?.qty ?? 0}
          initialEditMode={pendingProductEditMode}
          onConfirm={(qty, customPrice, customName, customUnit) =>
            addToCartWithQty(pendingProduct, qty, customPrice, customName, customUnit)
          }
          onClose={() => {
            setPendingProduct(null);
            setPendingProductEditMode(false);
          }}
        />
      )}

      <MainLayout>
        {viewState === 'confirm' ? (
          <div className="flex h-[calc(100vh-96px)] -m-4 md:-m-10 overflow-hidden bg-[#f8fafc] relative z-50">
            <PaymentConfirmation
              onBack={() => setViewState('pos')}
              onProcess={() => {
                setShowSuccess(true);
                setTimeout(() => {
                  // Clear cart state
                  setCart([]);
                  setSelectedCustomer(null);
                  setDiscountValue(0);
                  setDiscountType('percentage');
                  setNotes('');
                  setViewState('pos');
                  setShowSuccess(false);
                  setActiveTab('items');
                  // Clear localStorage draft after successful sale
                  try {
                    localStorage.removeItem('pos_draft_cart');
                    localStorage.removeItem('pos_draft_discount_type');
                    localStorage.removeItem('pos_draft_discount_value');
                    localStorage.removeItem('pos_draft_notes');
                    localStorage.removeItem('pos_draft_customer');
                  } catch {}
                }, 2000);
              }}
              items={cart}
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
              onAddNewCustomer={() => setIsCustomerModalOpen(true)}
              customerId={selectedCustomer?.id}
              customerName={selectedCustomer?.name}
              customerPhone={selectedCustomer?.phone}
              customerType={selectedCustomer ? selectedCustomer.customerType : 'Walk-In'}
              paymentMethod={paymentMethod}
              amountTendered={Number(amountPaid)}
              change={Math.max(0, Number(amountPaid) - total)}
              subtotal={subtotal}
              discount={discountAmount}
              total={total}
              notes={notes}
              orderDiscountType={discountType}
              orderDiscountValue={discountValue}
            />
          </div>
        ) : (
          /* ── POS Main Layout ── */
          <div className="flex h-[calc(100vh-96px)] -m-4 md:-m-10 overflow-hidden bg-[#f8fafc] relative">

            {/* ── LEFT: PRODUCT GRID ── */}
            <div className="flex-1 flex flex-col bg-[#f8fafc] border-r border-gray-200 overflow-hidden">

              {/* Search + Switch */}
              <div className="p-6 pb-2">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="relative flex-1 max-w-xl">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      autoFocus
                      type="text"
                      placeholder="Search product name, SKU, or scan barcode..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setHighlightedIndex(0);
                      }}
                      onKeyDown={(e) => {
                        let numCols = 1;
                        const isCartOpen = cart.length > 0;
                        if (window.innerWidth >= 1536) numCols = isCartOpen ? 4 : 5;
                        else if (window.innerWidth >= 1280) numCols = isCartOpen ? 3 : 4;
                        else if (window.innerWidth >= 1024) numCols = isCartOpen ? 2 : 3;
                        else if (window.innerWidth >= 640) numCols = 2;

                        if (e.key === 'ArrowRight') {
                          e.preventDefault();
                          setHighlightedIndex((prev) => Math.min(prev + 1, Math.max(0, filteredProducts.length - 1)));
                        } else if (e.key === 'ArrowLeft') {
                          e.preventDefault();
                          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                        } else if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setHighlightedIndex((prev) => Math.min(prev + numCols, Math.max(0, filteredProducts.length - 1)));
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setHighlightedIndex((prev) => Math.max(prev - numCols, 0));
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          const target = filteredProducts[highlightedIndex] || filteredProducts[0];
                          if (target) {
                            if (target.stock <= 0) {
                              toast.error(`"${target.name}" is out of stock!`);
                            } else {
                              setPendingProduct(target);
                              setSearchQuery('');
                              setHighlightedIndex(0);
                            }
                          }
                        }
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg py-3.5 pl-12 pr-4 text-[14px] font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
                    />
                  </div>
                  <Link
                    href="/pos/select"
                    className="bg-white border border-gray-200 text-gray-700 px-5 py-3.5 rounded-lg font-bold text-[14px] flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-all active:scale-95 whitespace-nowrap"
                  >
                    <LayoutGrid className="w-4 h-4 text-[#059669]" />
                    Switch Method
                  </Link>
                </div>
              </div>

              {/* Categories & Subcategories Section */}
              <div className="bg-white border-b border-gray-100 px-6 py-2.5 space-y-1.5 sticky top-0 z-20 backdrop-blur-md bg-white/95 shadow-sm">
                {/* Main Categories Row */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pb-0.5 flex-1">
                    {categories.map((cat, index) => (
                      <button
                        key={`${cat}-${index}`}
                        onClick={() => {
                          setActiveCategory(cat);
                          setActiveSubcategory('All');
                          setActiveBrand('All');
                        }}
                        className={`px-3.5 py-1.5 rounded-lg font-black text-[11px] uppercase tracking-wider transition-all shrink-0 border-2 ${
                          activeCategory === cat
                            ? 'bg-[#059669] text-white border-[#059669] shadow-sm'
                            : 'bg-white text-gray-500 border-gray-100 hover:border-emerald-200 hover:text-emerald-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedParentIdForModal(undefined);
                      setIsCategoryModalOpen(true);
                    }}
                    className="ml-3 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-2 border-emerald-200 rounded-lg font-black text-[10.5px] uppercase tracking-wider transition-all shrink-0 flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                    Category
                  </button>
                </div>

                {/* Subcategories Row (shown when any category except 'All' is selected) */}
                {activeCategory !== 'All' && (
                  <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pb-0.5 flex-1 items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-blue-600" /> Subcategory:
                      </span>
                      <button
                        onClick={() => { setActiveSubcategory('All'); setActiveBrand('All'); }}
                        className={`px-3 py-1 rounded-lg font-black text-[10.5px] uppercase tracking-wider transition-all shrink-0 border-2 ${
                          activeSubcategory === 'All'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-blue-200 hover:text-blue-600'
                        }`}
                      >
                        All {activeCategory}
                      </button>
                      {availableSubcategories.map((sub, idx) => (
                        <button
                          key={`${sub.id}-${idx}`}
                          onClick={() => { setActiveSubcategory(sub.name); setActiveBrand('All'); }}
                          className={`px-3 py-1 rounded-lg font-black text-[10.5px] uppercase tracking-wider transition-all shrink-0 border-2 ${
                            activeSubcategory.trim().toLowerCase() === sub.name.trim().toLowerCase()
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-gray-400 border-gray-100 hover:border-blue-200 hover:text-blue-600'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedParentIdForModal(activeCategoryObj?.id);
                        setIsCategoryModalOpen(true);
                      }}
                      className="ml-3 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all shrink-0 flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3 h-3" strokeWidth={3} />
                      Subcategory
                    </button>
                  </div>
                )}

                {/* Brand Row (shown when any category except 'All' is selected) */}
                {activeCategory !== 'All' && (
                  <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pb-0.5 flex-1 items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-purple-500" /> Brand:
                      </span>
                      <button
                        onClick={() => setActiveBrand('All')}
                        className={`px-3 py-1 rounded-lg font-black text-[10.5px] uppercase tracking-wider transition-all shrink-0 border-2 ${
                          activeBrand === 'All'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-purple-200 hover:text-purple-600'
                        }`}
                      >
                        All Brands
                      </button>
                      {availableBrands.map((brand, idx) => (
                        <button
                          key={`${brand.id}-${idx}`}
                          onClick={() => setActiveBrand(brand.name)}
                          className={`px-3 py-1 rounded-lg font-black text-[10.5px] uppercase tracking-wider transition-all shrink-0 border-2 ${
                            activeBrand.trim().toLowerCase() === brand.name.trim().toLowerCase()
                              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                              : 'bg-white text-gray-400 border-gray-100 hover:border-purple-200 hover:text-purple-600'
                          }`}
                        >
                          {brand.name}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedParentIdForModal(activeSubcategoryObj?.id);
                        setOpenBrandInputDirectly(true);
                        setIsCategoryModalOpen(true);
                      }}
                      className="ml-3 px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 border-2 border-purple-200 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all shrink-0 flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3 h-3" strokeWidth={3} />
                      Brand
                    </button>
                  </div>
                )}
              </div>

              {/* Product Grid */}
              <div ref={posProductGridRef} className="flex-1 overflow-y-auto p-6 pt-4 scroll-smooth focus:outline-none" tabIndex={-1}>
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                  </div>
                ) : fetchError ? (
                  <div className="flex flex-col items-center justify-center py-20 text-red-500">
                    <p className="text-lg font-bold">API Connection Error</p>
                    <p className="text-sm mt-2">{fetchError}</p>
                    <button
                      onClick={fetchProducts}
                      className="mt-4 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Package className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-bold">No products found</p>
                  </div>
                ) : (
                  <div className={`grid gap-4 ${
                    cart.length > 0
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                  }`}>
                    {filteredProducts.map((product, idx) => {
                      const inCart = cart.find(c => c.id === product.id);
                      const isHighlighted = idx === highlightedIndex;
                      const displayUnit = product.measurementUnit || (product as any).unit;
                      return (
                        <div
                          key={`${product.id}-${product.warehouseId || 'no-wh'}`}
                          onClick={() => {
                            setPendingProduct(product);
                            setPendingProductEditMode(false);
                          }}
                          className={`product-card bg-white rounded-[16px] border shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col h-full cursor-pointer min-w-0 ${
                            isHighlighted
                              ? 'border-blue-500 ring-4 ring-blue-500/25 shadow-lg scale-[1.01]'
                              : inCart
                              ? 'border-[#059669] ring-2 ring-emerald-500/15'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="h-[160px] w-full bg-gray-100 relative overflow-hidden shrink-0">
                            {product.img ? (
                              <img src={product.img} alt={product.name} className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 transition-transform duration-500 group-hover:scale-110">
                                <Package className="w-12 h-12 text-gray-300 mb-1" />
                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">No Image</span>
                              </div>
                            )}
                            {/* Top Right: Edit Pencil Button */}
                            <button
                              type="button"
                              title="Edit product name, unit & price"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingProduct(product);
                                setPendingProductEditMode(true);
                              }}
                              className="absolute top-2.5 right-2.5 z-20 bg-white/90 hover:bg-amber-500 text-gray-600 hover:text-white p-1.5 rounded-lg shadow-md border border-gray-200/80 backdrop-blur-sm transition-all active:scale-90"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {/* Top Right (shifted left): Status Badge */}
                            <div className="absolute top-2.5 right-10 z-10">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm border ${
                                product.status === 'In Stock' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-amber-500 text-white border-amber-400'
                              }`}>{product.status}</span>
                            </div>
                            {inCart && (
                              <div className="absolute top-2.5 left-2.5 z-10 bg-[#059669] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md max-w-[120px] truncate">
                                {inCart.qty} {parseShortUnit(displayUnit, product.sellType === 'loose')}
                              </div>
                            )}
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between pointer-events-none min-w-0">
                            <div>
                              <div className="flex items-center justify-between gap-1 h-[22px] mb-2 overflow-hidden">
                                <div className="flex items-center gap-1 overflow-hidden">
                                  <span className="text-[9px] font-black text-[#059669] uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded shrink-0 max-w-[85px] truncate">
                                    {product.category}
                                  </span>
                                  {product.brand && (
                                    <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded truncate max-w-[75px]">
                                      {product.brand}
                                    </span>
                                  )}
                                  {!product.brand && product.subCategory && (
                                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded truncate max-w-[75px]">
                                      {product.subCategory}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 font-mono shrink-0 ml-auto truncate max-w-[65px]">
                                  {product.sku}
                                </span>
                              </div>
                              <h3 className="text-[14px] font-black text-gray-900 leading-tight h-10 overflow-hidden line-clamp-2 flex items-center">
                                {product.name}
                              </h3>
                            </div>

                            <div className="mt-3 pt-3 flex items-end justify-between border-t border-gray-100 min-w-0 gap-1">
                              <div className="min-w-0">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1 block">Price</span>
                                <span className="text-[16px] xl:text-[17px] font-black text-gray-900 tracking-tight whitespace-nowrap">
                                  Rs. {product.price.toLocaleString()}
                                </span>
                              </div>
                              {displayUnit && (
                                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md mb-0.5 shrink-0 max-w-[70px] truncate">
                                  / {parseShortUnit(displayUnit, product.sellType === 'loose')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {/* Floating mobile cart trigger */}
              {cart.length > 0 && (
                <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-sm">
                  <button
                    onClick={() => setIsMobileCartOpen(true)}
                    className="w-full bg-[#059669] hover:bg-emerald-700 text-white py-4 px-6 rounded-2xl flex items-center justify-between shadow-2xl shadow-emerald-500/40 font-black text-[14px] transition-all active:scale-[0.98] border border-emerald-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      <span>VIEW CART ({cart.length})</span>
                    </div>
                    <span>Rs. {total.toLocaleString()}</span>
                  </button>
                </div>
              )}
            </div>
            {/* END LEFT PANEL */}

            {/* Drawer Overlay */}
            {cart.length > 0 && isMobileCartOpen && (
              <div
                className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                onClick={() => setIsMobileCartOpen(false)}
              />
            )}

            {/* ── RIGHT: CART SIDEBAR ── */}
            {cart.length > 0 && (
              <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md lg:max-w-none lg:w-[400px] xl:w-[450px] lg:relative lg:translate-x-0 bg-white flex flex-col shadow-2xl border-l border-gray-200 h-full overflow-hidden transition-transform duration-300 ${isMobileCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>

                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center font-black">
                      <ShoppingCart className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-wider">Cart Items ({cart.length})</h3>
                      <p className="text-[10px] text-gray-400 font-semibold">Review basket items</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCart([])} className="text-[11px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors">Clear All</button>
                    <button onClick={() => setIsMobileCartOpen(false)} className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Cart Content */}
                <div className="flex-1 overflow-y-auto scroll-smooth p-4 space-y-4">
                  {hasLowStockItems && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-amber-900">Low Stock Alert</p>
                        <p className="text-[11px] text-amber-700 mt-0.5">Some items in basket require immediate reordering.</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {cart.map((item) => {
                      const handleEditCartItem = () => {
                        const matchingProduct = productsList.find(p => p.id === item.id) || {
                          id: item.id,
                          name: item.name,
                          sku: 'N/A',
                          price: item.price,
                          stock: 9999,
                          status: 'In Stock',
                          category: 'General',
                          img: item.img,
                          sellType: item.sellType || 'fixed',
                          measurementUnit: item.measurementUnit,
                        };
                        setPendingProduct(matchingProduct as Product);
                      };

                      return (
                        <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 relative group hover:bg-white hover:shadow-sm hover:border-emerald-200 transition-all">
                          <div
                            onClick={handleEditCartItem}
                            className="w-9 h-9 rounded-md overflow-hidden shrink-0 border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center justify-between gap-1">
                              <h4
                                onClick={handleEditCartItem}
                                className="text-[12px] font-bold text-gray-900 truncate leading-tight cursor-pointer hover:text-[#059669] hover:underline"
                                title="Click to edit name, unit, price or quantity"
                              >
                                {item.name}
                              </h4>
                              <span className="text-[12px] font-black text-[#059669] shrink-0">
                                Rs. {((item.price - (item.discountAmount ?? 0)) * item.qty).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1 gap-1">
                              <div className="flex items-center gap-1">
                                {item.discountAmount && item.discountAmount > 0 ? (
                                  <span className="text-[10px] font-black text-emerald-600">
                                    Rs. {(item.price - item.discountAmount).toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold text-gray-500">
                                    Rs. {item.price.toLocaleString()}
                                  </span>
                                )}
                                <span className="text-[9px] font-bold text-gray-400">
                                  / {parseShortUnit(item.measurementUnit, item.sellType === 'loose')}
                                </span>
                                {item.isDiscountEnabled && item.isDiscountApproved && (
                                  <button
                                    onClick={() => setSelectedCartItemForDiscount(item)}
                                    className="text-[8px] font-black uppercase text-[#059669] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1 py-0.2 rounded"
                                  >
                                    {item.discountAmount ? `-Rs.${item.discountAmount}` : 'Disc'}
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-90 transition-all border border-gray-200">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  value={item.qty}
                                  onChange={(e) => setQty(item.id, e.target.value)}
                                  onBlur={() => ensureMinQty(item.id)}
                                  onFocus={(e) => e.target.select()}
                                  className="w-10 h-6 text-center font-black text-[12px] text-gray-900 bg-white border border-gray-200 rounded-md outline-none focus:border-[#059669] transition-all"
                                />
                                <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-md bg-[#059669] flex items-center justify-center text-white hover:bg-emerald-700 active:scale-90 transition-all shadow-sm">
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="absolute top-1 right-1 p-0.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Discount Option in Cart */}
                  <div className="pt-2.5 border-t border-gray-100 space-y-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Order Discount</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDiscountType('percentage')}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${
                          discountType === 'percentage'
                            ? 'bg-[#059669] text-white border-[#059669] shadow-sm'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        % Percent
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType('fixed')}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${
                          discountType === 'fixed'
                            ? 'bg-[#059669] text-white border-[#059669] shadow-sm'
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Rs Amount
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-[12px] font-black text-gray-400 select-none">
                        {discountType === 'percentage' ? '%' : 'Rs.'}
                      </span>
                      <input
                        type="number"
                        min={0}
                        placeholder={discountType === 'percentage' ? 'Enter percentage (e.g. 10)...' : 'Enter amount (e.g. 500)...'}
                        value={discountValue || ''}
                        onChange={(e) => setDiscountValue(Number(e.target.value))}
                        className="w-full bg-white border-2 border-gray-200 rounded-xl py-2 pl-9 pr-14 text-[13px] font-black text-gray-900 outline-none focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-xs"
                      />
                      {discountValue > 0 && (
                        <button
                          type="button"
                          onClick={() => setDiscountValue(0)}
                          className="absolute right-2 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-[10px] font-black uppercase transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sticky Compact Footer */}
                <div className="bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] shrink-0">
                  <div className="px-3 pt-2 pb-1 space-y-0.5 text-[11px] font-bold">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span className="text-gray-700">Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-red-400">
                        <span>Discount {discountType === 'percentage' ? `(${discountValue}%)` : ''}</span>
                        <span>-Rs. {discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-50/60 flex items-center justify-between border-y border-emerald-100">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#059669]">Total Payable</span>
                    <span className="text-[18px] font-black tracking-tight text-[#059669]">Rs. {total.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 space-y-1.5">
                    <button
                      onClick={() => setViewState('confirm')}
                      className="w-full py-2.5 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-1.5 font-black text-[13px] transition-all active:scale-[0.98]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      COMPLETE SALE
                    </button>
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleHold}
                        className="flex-1 bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-500 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                      >
                        <Pause className="w-3 h-3" /> Hold {heldOrders.length > 0 && `(${heldOrders.length})`}
                      </button>
                      <button
                        onClick={handlePrint}
                        className="flex-1 bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-500 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                      >
                        <Printer className="w-3 h-3" /> Print
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* END RIGHT SIDEBAR */}

          </div>
          /* END POS Main Layout */
        )}

        <SuccessModal isOpen={showSuccess} total={total} />
        {selectedCartItemForDiscount && (
          <ProductDiscountModal
            item={selectedCartItemForDiscount}
            onConfirm={(val, type, hasSecondary, secVal, secType) =>
              handleApplyItemDiscount(
                selectedCartItemForDiscount.id,
                val,
                type,
                hasSecondary,
                secVal,
                secType
              )
            }
            onClose={() => setSelectedCartItemForDiscount(null)}
          />
        )}
      </MainLayout>
    </>
  );
}

// ── Product Discount Popup Modal (With Primary & Double Secondary Discounting) ─────────────
function ProductDiscountModal({
  item,
  onConfirm,
  onClose,
}: {
  item: CartItem;
  onConfirm: (
    val: number,
    type: "PERCENTAGE" | "FIXED_AMOUNT",
    hasSecondary?: boolean,
    secVal?: number,
    secType?: "PERCENTAGE" | "FIXED_AMOUNT"
  ) => void;
  onClose: () => void;
}) {
  // Primary discount state
  const [val, setVal] = useState<number | string>(
    item.primaryDiscountValue !== undefined
      ? item.primaryDiscountValue
      : item.discountPercentage && item.discountPercentage > 0
      ? item.discountPercentage
      : item.discountAmount && item.discountAmount > 0
      ? item.discountAmount
      : ""
  );
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">(
    item.primaryDiscountType || item.discountType || "PERCENTAGE"
  );

  // Double / Secondary discount state
  const [hasSecondary, setHasSecondary] = useState<boolean>(
    Boolean(item.hasSecondaryDiscount)
  );
  const [secVal, setSecVal] = useState<number | string>(
    item.secondaryDiscountValue !== undefined ? item.secondaryDiscountValue : ""
  );
  const [secType, setSecType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">(
    item.secondaryDiscountType || "PERCENTAGE"
  );

  const [error, setError] = useState<string | null>(null);

  const originalPrice = item.price;
  const maxAllowed = Number(item.maxAllowedDiscount ?? 0);

  // 1. Primary Discount Calculation
  const parsedVal = parseFloat(String(val)) || 0;
  const primaryDiscountAmount = Number(
    (type === "PERCENTAGE" ? (originalPrice * parsedVal) / 100 : parsedVal).toFixed(2)
  );
  const priceAfterPrimary = Math.max(
    0,
    Number((originalPrice - primaryDiscountAmount).toFixed(2))
  );

  // 2. Secondary (Double) Discount Calculation on Leftover Price
  const parsedSecVal = parseFloat(String(secVal)) || 0;
  const secondaryDiscountAmount = Number(
    (hasSecondary && parsedSecVal > 0
      ? secType === "PERCENTAGE"
        ? (priceAfterPrimary * parsedSecVal) / 100
        : parsedSecVal
      : 0
    ).toFixed(2)
  );

  const finalDiscountedPrice = Math.max(
    0,
    Number((priceAfterPrimary - secondaryDiscountAmount).toFixed(2))
  );
  const totalDiscountAmount = Number(
    (primaryDiscountAmount + secondaryDiscountAmount).toFixed(2)
  );
  const effectiveDiscountPercentage = Number(
    ((totalDiscountAmount / originalPrice) * 100).toFixed(2)
  );
  const totalAmount = Number((finalDiscountedPrice * item.qty).toFixed(2));

  const handleApply = () => {
    if (val === "" || isNaN(parsedVal) || parsedVal < 0) {
      setError("Please enter a valid positive discount value.");
      return;
    }

    if (hasSecondary && (secVal === "" || isNaN(parsedSecVal) || parsedSecVal < 0)) {
      setError("Please enter a valid double discount value.");
      return;
    }

    // Limit Validation
    if (maxAllowed > 0) {
      if (item.discountType === "PERCENTAGE" && effectiveDiscountPercentage > maxAllowed) {
        setError(
          `Combined discount (${effectiveDiscountPercentage}%) exceeds maximum approved limit of ${maxAllowed}%`
        );
        return;
      }
      if (item.discountType === "FIXED_AMOUNT" && totalDiscountAmount > maxAllowed) {
        setError(
          `Combined discount (Rs. ${totalDiscountAmount}) exceeds maximum approved limit of Rs. ${maxAllowed}`
        );
        return;
      }
    }

    if (totalDiscountAmount > originalPrice) {
      setError("Total discount cannot exceed original unit price.");
      return;
    }

    onConfirm(parsedVal, type, hasSecondary, parsedSecVal, secType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-gray-900">
              Configure Product Discount
            </h3>
            <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              Eligibility: Approved
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Product Info Card */}
          <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-0.5">
              Product Details
            </p>
            <h4 className="text-[14px] font-black text-emerald-950 leading-snug">
              {item.name}
            </h4>
            <div className="flex justify-between items-center mt-3 text-[12px] font-semibold text-emerald-900 border-t border-emerald-100/60 pt-2.5">
              <span>Original Price: <strong className="font-mono">Rs. {originalPrice.toLocaleString()}</strong></span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold text-[11px]">
                Limit:{" "}
                {item.discountType === "PERCENTAGE"
                  ? `${maxAllowed}%`
                  : `Rs. ${maxAllowed}`}
              </span>
            </div>
          </div>

          {/* 1. Primary Discount Section */}
          <div className="space-y-2 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Primary Discount
              </label>
              {type === "PERCENTAGE" && parsedVal > 0 && (
                <span className="text-[11px] font-bold text-emerald-700">
                  -Rs. {primaryDiscountAmount.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setType("PERCENTAGE"); setError(null); }}
                className={`flex-1 py-2 text-[11px] font-black uppercase rounded-lg border transition-all ${
                  type === "PERCENTAGE"
                    ? "bg-[#059669] text-white border-[#059669] shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                % Percent
              </button>
              <button
                type="button"
                onClick={() => { setType("FIXED_AMOUNT"); setError(null); }}
                className={`flex-1 py-2 text-[11px] font-black uppercase rounded-lg border transition-all ${
                  type === "FIXED_AMOUNT"
                    ? "bg-[#059669] text-white border-[#059669] shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                LKR Amount
              </button>
            </div>
            <div className="relative">
              {type === "FIXED_AMOUNT" && (
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  Rs.
                </span>
              )}
              <input
                type="number"
                value={val}
                onChange={(e) => {
                  setVal(e.target.value);
                  setError(null);
                }}
                placeholder={type === "PERCENTAGE" ? "e.g. 53" : "e.g. 26.50"}
                className={`w-full bg-white border border-gray-200 rounded-xl py-2.5 pr-4 text-sm font-black text-gray-800 outline-none focus:border-[#059669] focus:ring-2 focus:ring-emerald-500/10 transition-all ${
                  type === "FIXED_AMOUNT" ? "pl-9" : "pl-3.5"
                }`}
                min="0"
              />
            </div>
            <p className="text-[11px] font-bold text-gray-500 text-right">
              Price after 1st discount: <strong className="font-mono text-gray-800">Rs. {priceAfterPrimary.toLocaleString()}</strong>
            </p>
          </div>

          {/* 2. Secondary (Double) Discount Section */}
          <div className="space-y-2.5 bg-blue-50/40 p-3.5 rounded-2xl border border-blue-100/70">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSecondary}
                  onChange={(e) => {
                    setHasSecondary(e.target.checked);
                    setError(null);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] font-black text-blue-900 uppercase tracking-widest">
                  + Add Double Discount (Secondary)
                </span>
              </label>
              {hasSecondary && secondaryDiscountAmount > 0 && (
                <span className="text-[11px] font-bold text-blue-700">
                  -Rs. {secondaryDiscountAmount.toLocaleString()}
                </span>
              )}
            </div>

            {hasSecondary && (
              <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <p className="text-[10px] text-blue-600 font-bold">
                  Applied on leftover balance (Rs. {priceAfterPrimary.toLocaleString()}) after 1st discount
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setSecType("PERCENTAGE"); setError(null); }}
                    className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all ${
                      secType === "PERCENTAGE"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    % Percent
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSecType("FIXED_AMOUNT"); setError(null); }}
                    className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all ${
                      secType === "FIXED_AMOUNT"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    LKR Amount
                  </button>
                </div>
                <div className="relative">
                  {secType === "FIXED_AMOUNT" && (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                      Rs.
                    </span>
                  )}
                  <input
                    type="number"
                    value={secVal}
                    onChange={(e) => {
                      setSecVal(e.target.value);
                      setError(null);
                    }}
                    placeholder={secType === "PERCENTAGE" ? "e.g. 6" : "e.g. 1.41"}
                    className={`w-full bg-white border border-gray-200 rounded-xl py-2.5 pr-4 text-sm font-black text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all ${
                      secType === "FIXED_AMOUNT" ? "pl-9" : "pl-3.5"
                    }`}
                    min="0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Validation Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
              <p className="text-[11px] text-red-700 font-bold leading-tight">{error}</p>
            </div>
          )}

          {/* Dynamic Calculations Summary */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-gray-500">
              <span>Primary Discount ({type === 'PERCENTAGE' ? `${parsedVal}%` : `Rs. ${parsedVal}`}):</span>
              <span className="font-mono text-red-600">-Rs. {primaryDiscountAmount.toLocaleString()}</span>
            </div>
            {hasSecondary && (
              <div className="flex justify-between text-xs font-semibold text-gray-500">
                <span>Double Discount ({secType === 'PERCENTAGE' ? `${parsedSecVal}% of Rs. ${priceAfterPrimary}` : `Rs. ${parsedSecVal}`}):</span>
                <span className="font-mono text-red-600">-Rs. {secondaryDiscountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold text-gray-700 border-t border-gray-200/60 pt-2">
              <span>Discounted Unit Price:</span>
              <span className="font-mono text-emerald-700">
                Rs. {finalDiscountedPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Quantity:</span>
              <span className="font-bold text-gray-800">{item.qty}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-200 pt-2">
              <span>New Line Total:</span>
              <span className="font-mono text-emerald-600 text-base">
                Rs. {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-3 text-xs font-black uppercase text-white bg-[#059669] hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
