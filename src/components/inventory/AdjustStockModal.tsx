import { X, ArrowUpDown, Search, Check, Package, RotateCcw, ChevronDown } from 'lucide-react';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '@/api/axiosInstance';
import { toastError, toastSuccess } from '@/lib/toast';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdjustStockModal({ isOpen, onClose, onSuccess }: AdjustStockModalProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [defaultWarehouseId, setDefaultWarehouseId] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '00000000-0000-0000-0000-000000000000',
    adjustmentType: 'add',
    quantity: '',
    reason: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      setFormData({
        productId: '',
        warehouseId: '00000000-0000-0000-0000-000000000000',
        adjustmentType: 'add',
        quantity: '',
        reason: '',
      });
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const [stockRes, productsRes, whRes] = await Promise.allSettled([
        api.get('/stock'),
        api.get('/products'),
        api.get('/warehouses'),
      ]);

      const stockItems: any[] = stockRes.status === 'fulfilled'
        ? (stockRes.value.data?.data || stockRes.value.data || [])
        : [];

      const allProducts: any[] = productsRes.status === 'fulfilled'
        ? (productsRes.value.data?.data || productsRes.value.data || [])
        : [];

      if (whRes.status === 'fulfilled') {
        const whItems = whRes.value.data?.data || whRes.value.data?.warehouses || whRes.value.data || [];
        if (whItems.length > 0) {
          setDefaultWarehouseId(whItems[0].id);
        }
      }

      // Deduplicate products using a Map by product id
      const productMap = new Map<string, any>();

      // 1. Process all products from /products catalog
      allProducts.forEach((p: any) => {
        const id = String(p.id);
        productMap.set(id, {
          id,
          name: p.name || 'Unknown',
          sku: p.sku || '',
          barcode: p.barcode || '',
          category: p.category || '',
          qty: Number(p.quantity ?? p.qty ?? 0),
          warehouseId: undefined,
          branchId: undefined,
        });
      });

      // 2. Merge stock data from /stock endpoint
      stockItems.forEach((item: any) => {
        const id = String(item.product_id || item.productId || item.id);
        const availableQty = Number(item.available_quantity ?? item.availableQuantity ?? item.quantity ?? 0);
        const name = item.product?.name || item.product_name || item.name;
        const sku = item.product?.sku || item.sku;

        if (productMap.has(id)) {
          const existing = productMap.get(id);
          existing.qty = Math.max(existing.qty, availableQty);
          if (item.warehouseId || item.warehouse_id) existing.warehouseId = item.warehouseId || item.warehouse_id;
          if (item.branchId || item.branch_id) existing.branchId = item.branchId || item.branch_id;
          if (name) existing.name = name;
          if (sku) existing.sku = sku;
        } else {
          productMap.set(id, {
            id,
            name: name || 'Unknown',
            sku: sku || '',
            barcode: item.barcode || '',
            category: item.category || '',
            qty: availableQty,
            warehouseId: item.warehouseId || item.warehouse_id,
            branchId: item.branchId || item.branch_id,
          });
        }
      });

      setProducts(Array.from(productMap.values()));
    } catch (error) {
      console.error('Failed to fetch products for stock adjustment', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === formData.productId),
    [products, formData.productId]
  );

  /* Fast Multi-token Search Optimization */
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return products;
    const tokens = q.split(/\s+/);
    return products.filter((p) => {
      const searchTarget = `${p.name} ${p.sku} ${p.barcode} ${p.category}`.toLowerCase();
      return tokens.every((token) => searchTarget.includes(token));
    });
  }, [products, searchQuery]);

  const handleSelectProduct = (product: any) => {
    setFormData((prev) => ({ ...prev, productId: product.id }));
  };

  const handleClearSelectedProduct = () => {
    setFormData((prev) => ({ ...prev, productId: '' }));
    setSearchQuery('');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredProducts.length > 0) {
      e.preventDefault();
      handleSelectProduct(filteredProducts[0]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.productId || !formData.quantity) {
      alert("Please select a product and enter a quantity.");
      return;
    }

    const item = products.find(p => p.id === formData.productId);
    
    const warehouseId = item?.warehouseId || defaultWarehouseId || "00000000-0000-0000-0000-000000000000";
    const branchId = item?.branchId || "00000000-0000-0000-0000-000000000000";

    setLoading(true);
    try {
      const endpoint = formData.adjustmentType === 'add' ? '/stock/add' : '/stock/deduct';
      const qtyKey = formData.adjustmentType === 'add' ? 'add_quantity' : 'deduct_quantity';
      await api.post(endpoint, {
        product_id: formData.productId,
        warehouse_id: warehouseId,
        branch_id: branchId,
        [qtyKey]: Number(formData.quantity),
        reason: formData.reason || 'Manual adjustment',
      });
      toastSuccess('Stock levels updated successfully.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to adjust stock', error);
      toastError(error, 'We couldn’t update the stock. Please check the available quantity and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          (activeEl as HTMLElement).isContentEditable);

      if (e.key === "Escape" || (e.key === "Backspace" && !isInput)) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Adjust Stock</h2>
              <p className="text-sm text-gray-500">Add or deduct inventory manually</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* SEARCHABLE PRODUCT SELECTOR */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Product <span className="text-red-500">*</span>
            </label>

            {selectedProduct ? (
              /* SELECTED PRODUCT CARD */
              <div className="bg-amber-50/70 border-2 border-amber-300 rounded-xl p-3.5 flex items-center justify-between transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-500 text-white rounded-lg flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
                      {selectedProduct.name}
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                    <div className="text-[11px] font-semibold text-amber-900/70 flex items-center gap-2 mt-0.5">
                      <span>Stock: <strong>{selectedProduct.qty}</strong> units</span>
                      {selectedProduct.sku && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-gray-500">{selectedProduct.sku}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearSelectedProduct}
                  className="flex items-center gap-1 text-[12px] font-bold text-amber-700 hover:text-amber-900 bg-white border border-amber-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-amber-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Change
                </button>
              </div>
            ) : (
              /* SEARCH & LIST SELECTION */
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-[11px] pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDownSearch}
                    placeholder="Search by name, SKU, or keyword... (Press Enter to select top result)"
                    className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-[10px] text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* MATCHING PRODUCTS LIST */}
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white max-h-52 overflow-y-auto shadow-inner divide-y divide-gray-100">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 font-medium">
                      No matching products found.
                    </div>
                  ) : (
                    filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProduct(p)}
                        className="p-3 hover:bg-amber-50/70 cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-[13px] font-bold text-gray-800 group-hover:text-amber-900 truncate">
                            {p.name}
                          </div>
                          {p.sku && (
                            <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                              SKU: {p.sku}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              p.qty > 0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {p.qty} in stock
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adjustment Type
              </label>
              <div className="relative">
                <select 
                  name="adjustmentType"
                  value={formData.adjustmentType}
                  onChange={handleChange}
                  className="w-full appearance-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="add">Add Stock</option>
                  <option value="deduct">Deduct Stock</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-[10px] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                min="1"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason / Notes
            </label>
            <input 
              type="text" 
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g. Received new shipment, Damaged goods, etc."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex justify-end gap-3 bg-gray-50">
          <button 
            onClick={onClose}
            className="py-2 px-6 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="py-2 px-6 rounded-lg text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-sm shadow-amber-500/30"
          >
            {loading ? "Processing..." : "Confirm Adjustment"}
          </button>
        </div>

      </div>
    </div>
  );
}
