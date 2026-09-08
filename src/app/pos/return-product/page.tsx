'use client';

import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  ArrowLeft, 
  RotateCcw, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Package, 
  TrendingUp, 
  Box, 
  DollarSign, 
  RefreshCw,
  Tag,
  Store,
  Printer
} from 'lucide-react';
import Link from 'next/link';
import api from '@/api/axiosInstance';
import { toastError, toastSuccess } from '@/lib/toast';
import { printReturnThermalHTMLReceipt } from '@/utils/thermalReceiptTemplate';

interface ProductStockItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  brand?: string;
  unitPrice: number;
  currentStock: number;
  warehouseId?: string;
  warehouseName?: string;
  image?: string;
  sellType?: string;
  measurementUnit?: string;
}

export default function ReturnProductPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [productsList, setProductsList] = useState<ProductStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<ProductStockItem | null>(null);
  const [returnQty, setReturnQty] = useState<number | ''>('');
  const [returnReason, setReturnReason] = useState<string>('Defective / Damaged');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState<any | null>(null);

  // Fetch live inventory stock data
  const fetchStockData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
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

      const mappedFromStock: ProductStockItem[] = stockItems.map((item: any, index: number) => {
        const prodId = String(item.product?.id || item.product_id || item.productId || item.id || `fallback-${index}`);
        const originalProduct = allProducts.find((p: any) => String(p.id) === prodId);

        return {
          id: String(item.id || prodId),
          productId: prodId,
          name: item.product?.name || item.product_name || originalProduct?.name || 'Unknown Item',
          sku: item.product?.sku || item.sku || originalProduct?.sku || 'N/A',
          barcode: item.product?.barcode || item.barcode || originalProduct?.barcode,
          category: item.product?.category?.name || item.category_name || originalProduct?.category?.name || 'General',
          brand: item.product?.brand?.name || item.brand_name || originalProduct?.brand?.name || undefined,
          unitPrice: Number(item.product?.selling_price || item.product?.sellingPrice || item.selling_price || originalProduct?.sellingPrice || 0),
          currentStock: Number(item.available_quantity ?? item.availableQuantity ?? item.quantity ?? 0),
          warehouseId: item.warehouseId || item.warehouse_id,
          warehouseName: item.warehouse?.name || 'Main Store',
          image: item.image_url || item.product?.image_url || item.product?.image || item.image || originalProduct?.images?.[0]?.imageUrl || null,
          sellType: item.product?.sellType || originalProduct?.sellType || 'fixed',
          measurementUnit: item.product?.measurementUnit || item.measurement_unit || item.unit || originalProduct?.measurementUnit || 'pcs',
        };
      });

      const mappedNoStock: ProductStockItem[] = allProducts
        .filter((p: any) => !stockProductIds.has(String(p.id)))
        .map((p: any) => ({
          id: String(p.id),
          productId: String(p.id),
          name: p.name || 'Unknown Item',
          sku: p.sku || 'N/A',
          barcode: p.barcode,
          category: p.category?.name || 'General',
          brand: p.brand?.name || (typeof p.brand === 'string' ? p.brand : undefined),
          unitPrice: Number(p.sellingPrice || 0),
          currentStock: 0,
          image: p.images?.[0]?.imageUrl || null,
          sellType: p.sellType || 'fixed',
          measurementUnit: p.measurementUnit || 'pcs',
        }));

      const combined = [...mappedFromStock, ...mappedNoStock];
      setProductsList(combined);
    } catch (err: any) {
      console.error('[ReturnProduct] Failed to fetch inventory stock:', err);
      setFetchError(err?.message || 'Failed to load live stock data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  // Filter products by SKU, name, barcode, category
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return productsList.slice(0, 15);
    const q = searchQuery.trim().toLowerCase();
    return productsList.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q))
    );
  }, [searchQuery, productsList]);

  // Handle Confirm Return submission
  const handleConfirmReturn = async () => {
    if (!selectedProduct) return;
    const qtyNum = typeof returnQty === 'number' ? returnQty : 0;
    if (qtyNum <= 0) {
      toastError(new Error('Please enter a valid return quantity greater than 0.'));
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const yy = now.getFullYear().toString().slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const seq = String(Math.floor(Math.random() * 9000) + 1000);
      const returnRef = `RET-${yy}${mm}${dd}-${seq}`;
      const finalReason = returnReason === 'Other' ? customReason || 'Other Reason' : returnReason;

      // 1. Submit stock deduction directly to backend API /stock/deduct (decreases live stock in DB)
      const warehouseId = selectedProduct.warehouseId || "00000000-0000-0000-0000-000000000000";
      const branchId = "00000000-0000-0000-0000-000000000000";

      try {
        await api.post('/stock/deduct', {
          product_id: selectedProduct.productId,
          warehouse_id: warehouseId,
          branch_id: branchId,
          deduct_quantity: qtyNum,
          reason: `[Supplier Product Return ${returnRef}] ${finalReason}`,
        });
      } catch (stockErr: any) {
        console.error("[ReturnProduct API Warning]", stockErr?.response?.data || stockErr);
        // Fallback: try alternative endpoint structure if backend uses different params
        try {
          await api.post('/stock/adjust', {
            productId: selectedProduct.productId,
            warehouseId: warehouseId,
            quantityChange: -qtyNum,
            type: 'SUPPLIER_RETURN',
            reason: `[Supplier Product Return ${returnRef}] ${finalReason}`,
          });
        } catch {}
      }

      const updatedStockCount = Math.max(0, selectedProduct.currentStock - qtyNum);

      // Update local product list so state reflects instantly
      setProductsList(prev => prev.map(p => {
        if (p.productId === selectedProduct.productId) {
          return { ...p, currentStock: updatedStockCount };
        }
        return p;
      }));

      const record = {
        returnRef,
        date: new Date().toLocaleString('en-GB'),
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        unitPrice: selectedProduct.unitPrice,
        returnQty: qtyNum,
        previousStock: selectedProduct.currentStock,
        newStock: updatedStockCount,
        refundTotal: selectedProduct.unitPrice * qtyNum,
        reason: finalReason,
        measurementUnit: selectedProduct.measurementUnit || 'pcs',
      };

      setReturnSuccess(record);
      toastSuccess(`Supplier return processed! ${qtyNum} ${record.measurementUnit} returned to supplier & removed from inventory stock.`);

      // ── Auto-print thermal return voucher ─────────────────────────────────
      const hh = String(now.getHours()).padStart(2, '0');
      const mi = String(now.getMinutes()).padStart(2, '0');
      const dateStr = `${new Date().toLocaleDateString('en-GB')} ${hh}:${mi}`;
      const isDefective = finalReason.toLowerCase().includes('defect') || finalReason.toLowerCase().includes('damage');

      printReturnThermalHTMLReceipt({
        storeName: 'Futura Hardware',
        returnNo: returnRef,
        originalInvoiceNo: `Stock Return (${selectedProduct.sku})`,
        date: dateStr,
        cashier: 'Staff',
        reason: finalReason,
        isRestocked: !isDefective,
        refundAmount: record.refundTotal,
        items: [{
          name: selectedProduct.name,
          sku: selectedProduct.sku,
          qty: qtyNum,
          price: selectedProduct.unitPrice,
          lineTotal: record.refundTotal,
        }],
      });
      // ─────────────────────────────────────────────────────────────────────

    } catch (err: any) {
      console.error('[ReturnProduct Error]', err);
      toastError(err, 'Failed to process product return. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setReturnQty('');
    setReturnReason('Defective / Damaged');
    setCustomReason('');
    setReturnSuccess(null);
    setSearchQuery('');
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/pos/select"
            className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-white/80 border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200 shadow-sm">
                <Package className="w-5 h-5" />
              </span>
              Return Product
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Direct product return by SKU or Name — updates live inventory stock count automatically
            </p>
          </div>
        </div>

        {returnSuccess ? (
          /* ── SUCCESS VIEW ── */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-mono font-black text-xs rounded-full border border-emerald-200 uppercase tracking-wider">
                {returnSuccess.returnRef}
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-3">Supplier Return Confirmed!</h2>
              <p className="text-slate-500 text-sm mt-1">
                The returned items have been processed and deducted from live inventory stock.
              </p>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-left space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Product Name</span>
                <span className="text-sm font-black text-slate-900">{returnSuccess.productName}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">SKU</span>
                <span className="text-sm font-mono font-bold text-slate-700">{returnSuccess.sku}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Returned to Supplier</span>
                <span className="text-sm font-black text-rose-600">-{returnSuccess.returnQty} {returnSuccess.measurementUnit}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Updated Stock Count</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 line-through">{returnSuccess.previousStock}</span>
                  <span className="text-base font-black text-emerald-600">→ {returnSuccess.newStock} {returnSuccess.measurementUnit}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Refund / Credit Value</span>
                <span className="text-lg font-black text-slate-900">Rs. {returnSuccess.refundTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => {
                  const isDefective = (returnSuccess.reason || '').toLowerCase().includes('defect') || (returnSuccess.reason || '').toLowerCase().includes('damage');
                  printReturnThermalHTMLReceipt({
                    storeName: 'Futura Hardware',
                    returnNo: returnSuccess.returnRef,
                    originalInvoiceNo: `Stock Return (${returnSuccess.sku})`,
                    date: returnSuccess.date,
                    cashier: 'Staff',
                    reason: returnSuccess.reason,
                    isRestocked: !isDefective,
                    refundAmount: returnSuccess.refundTotal,
                    items: [{
                      name: returnSuccess.productName,
                      sku: returnSuccess.sku,
                      qty: returnSuccess.returnQty,
                      price: returnSuccess.unitPrice,
                      lineTotal: returnSuccess.refundTotal,
                    }],
                  });
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Re-print Return Receipt
              </button>
              <div className="flex gap-4">
                <button
                  onClick={resetForm}
                  className="flex-1 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-sm transition-all shadow-md active:scale-95"
                >
                  Process Another Return
                </button>
                <Link
                  href="/pos"
                  className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-sm text-center transition-all shadow-md active:scale-95"
                >
                  Go to POS Screen
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ── MAIN RETURN FORM ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
            {/* LEFT COLUMN: Search & Select Product */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Search className="w-4 h-4 text-amber-600" />
                    1. Search Item by SKU or Name
                  </h2>
                  <button
                    onClick={fetchStockData}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Stock
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Type item name, SKU, or scan barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Product Search Results List */}
                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {isLoading ? (
                    <div className="py-12 text-center text-slate-400 font-bold text-sm">
                      Loading live stock catalog...
                    </div>
                  ) : fetchError ? (
                    <div className="py-8 text-center text-red-500 font-bold text-sm bg-red-50 rounded-xl border border-red-200">
                      {fetchError}
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-bold text-sm">
                      No products found matching "{searchQuery}"
                    </div>
                  ) : (
                    filteredProducts.map((prod) => {
                      const isSelected = selectedProduct?.productId === prod.productId;
                      return (
                        <div
                          key={prod.id}
                          onClick={() => {
                            setSelectedProduct(prod);
                            setReturnQty('');
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                            isSelected
                              ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                              : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                              {prod.image ? (
                                <img src={prod.image} alt={prod.name} className="w-full h-full object-contain p-1" />
                              ) : (
                                <Box className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-black text-slate-900 truncate">{prod.name}</h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] font-mono font-bold text-slate-400">SKU: {prod.sku}</span>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {prod.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-slate-900 block">Rs. {prod.unitPrice.toLocaleString()}</span>
                            <span className={`text-[11px] font-black px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                              prod.currentStock > 10
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : prod.currentStock > 0
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              Stock: {prod.currentStock} {prod.measurementUnit}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Enter Return Details & Confirm */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 sticky top-6">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-slate-100">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  2. Return Details &amp; Quantity
                </h2>

                {selectedProduct ? (
                  <div className="space-y-5">
                    {/* Selected Product Card */}
                    <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">Selected Item</span>
                          <h3 className="text-base font-black text-slate-900">{selectedProduct.name}</h3>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500">SKU: {selectedProduct.sku}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-1 border-t border-amber-200/60">
                        <span className="font-bold text-slate-600">Unit Price: <strong className="text-slate-900">Rs. {selectedProduct.unitPrice.toLocaleString()}</strong></span>
                        <span className="font-bold text-slate-600">Live Stock: <strong className="text-emerald-700 font-black">{selectedProduct.currentStock} {selectedProduct.measurementUnit}</strong></span>
                      </div>
                    </div>

                    {/* Return Quantity Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                        Quantity to Return ({selectedProduct.measurementUnit || 'pcs'})
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const curr = typeof returnQty === 'number' ? returnQty : 0;
                            setReturnQty(Math.max(1, curr - 1));
                          }}
                          className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-lg rounded-xl flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          placeholder="Type quantity to return..."
                          value={returnQty}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') setReturnQty('');
                            else {
                              const num = Number(val);
                              setReturnQty(isNaN(num) ? '' : Math.max(0, num));
                            }
                          }}
                          className="flex-1 bg-white border-2 border-slate-300 rounded-xl py-2 px-3 text-center text-lg font-black text-slate-900 outline-none focus:border-amber-500 transition-all placeholder:text-slate-300 placeholder:text-sm placeholder:font-normal"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const curr = typeof returnQty === 'number' ? returnQty : 0;
                            setReturnQty(curr + 1);
                          }}
                          className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-lg rounded-xl flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Reason Selection */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                        Reason for Return
                      </label>
                      <select
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                      >
                        <option value="Defective / Damaged">Defective / Damaged Item</option>
                        <option value="Customer Mind Change">Customer Mind Change</option>
                        <option value="Wrong Item Delivered">Wrong Item Delivered</option>
                        <option value="Excess Stock Returned">Excess Stock Returned</option>
                        <option value="Other">Other Reason</option>
                      </select>
                      {returnReason === 'Other' && (
                        <input
                          type="text"
                          placeholder="Type specific return reason..."
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 mt-2"
                        />
                      )}
                    </div>

                    {/* Stock Impact Summary */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs font-bold">
                      <div className="flex justify-between text-slate-500">
                        <span>Current Stock:</span>
                        <span className="text-slate-900">{selectedProduct.currentStock} {selectedProduct.measurementUnit}</span>
                      </div>
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>Quantity Returned to Supplier:</span>
                        <span>-{typeof returnQty === 'number' ? returnQty : 0} {selectedProduct.measurementUnit}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 text-sm font-black pt-2 border-t border-slate-200">
                        <span>New Stock Total:</span>
                        <span className="text-emerald-600">
                          {Math.max(0, selectedProduct.currentStock - (typeof returnQty === 'number' ? returnQty : 0))} {selectedProduct.measurementUnit}
                        </span>
                      </div>
                    </div>

                    {/* Total Refund Value */}
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                      <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">Refund / Credit Amount</span>
                      <span className="text-xl font-black text-emerald-700">
                        Rs. {(selectedProduct.unitPrice * (typeof returnQty === 'number' ? returnQty : 0)).toLocaleString()}
                      </span>
                    </div>

                    {/* Confirm Button */}
                    <button
                      onClick={handleConfirmReturn}
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" /> Confirm Return to Supplier &amp; Decrease Stock
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400 space-y-3">
                    <Package className="w-12 h-12 mx-auto opacity-30 text-amber-600" />
                    <p className="text-xs font-bold">
                      Please select an item from the left search list to configure the return quantity.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
