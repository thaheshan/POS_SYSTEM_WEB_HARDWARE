'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Minus, Plus, X, ChevronDown, CheckCircle2, 
  Package, SearchIcon, ArrowLeft, LayoutGrid, Banknote, CreditCard, 
  Smartphone, ShoppingCart, Users, Trash2
} from 'lucide-react';
import Link from 'next/link';
import PaymentConfirmation from '@/components/pos/PaymentConfirmation';
import SuccessModal from '@/components/pos/SuccessModal';
import AddLabourModal from '@/components/sales/AddLabourModal';
import { toast } from 'sonner';

const mockProducts = [
  { id: '1', name: 'Holcim Cement 50kg', sku: 'HCM-50-001', price: 1650, stock: 45, status: 'In Stock', category: 'Cement', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=640&auto=format&fit=crop' },
  { id: '2', name: 'Tokyo Super Cement', sku: 'TKY-50-002', price: 1720, stock: 20, status: 'In Stock', category: 'Cement', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=640&auto=format&fit=crop' },
  { id: '3', name: 'Steel Rods 12mm', sku: 'STL-12-002', price: 2450, stock: 120, status: 'In Stock', category: 'Steel', img: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=640&auto=format&fit=crop' },
  { id: '4', name: 'Steel Rods 16mm', sku: 'STL-16-003', price: 3200, stock: 85, status: 'In Stock', category: 'Steel', img: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=640&auto=format&fit=crop' },
  { id: '5', name: 'Bosch Power Drill 18V', sku: 'BSH-DR-001', price: 14500, stock: 12, status: 'In Stock', category: 'Tools', img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=640&auto=format&fit=crop' },
  { id: '6', name: 'Stanley Hammer 20oz', sku: 'STY-HM-005', price: 1850, stock: 40, status: 'In Stock', category: 'Tools', img: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?q=80&w=640&auto=format&fit=crop' },
  { id: '7', name: 'PVC Pipe 2 inch (10ft)', sku: 'PVC-2I-005', price: 1850, stock: 200, status: 'In Stock', category: 'Plumbing', img: 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=640&auto=format&fit=crop' },
  { id: '8', name: 'Water Tap Brass 1/2"', sku: 'TAP-BR-001', price: 1250, stock: 25, status: 'In Stock', category: 'Plumbing', img: 'https://images.unsplash.com/photo-1585338447937-7082f8fc763d?q=80&w=640&auto=format&fit=crop' },
  { id: '9', name: 'Circuit Breaker 32A', sku: 'ELE-CB-032', price: 2100, stock: 15, status: 'In Stock', category: 'Electrical', img: 'https://images.unsplash.com/photo-1558489580-faa74691fdc5?q=80&w=640&auto=format&fit=crop' },
  { id: '10', name: 'Copper Wire 1.5mm 1Roll', sku: 'ELE-WR-015', price: 5800, stock: 10, status: 'Low Stock', category: 'Electrical', img: 'https://images.unsplash.com/photo-1620619864205-594ff8aebdce?q=80&w=640&auto=format&fit=crop' },
  { id: '11', name: 'Asian Paint White 4L', sku: 'PNT-WH-003', price: 3200, stock: 5, status: 'Low Stock', category: 'Paint', img: 'https://images.unsplash.com/photo-1562591176-ed2da0f878f7?q=80&w=640&auto=format&fit=crop' },
  { id: '12', name: 'Paint Roller 9 inch', sku: 'PNT-RL-009', price: 850, stock: 35, status: 'In Stock', category: 'Paint', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=640&auto=format&fit=crop' },
  { id: '13', name: 'Nails 3 inch (1kg)', sku: 'NLS-3I-004', price: 450, stock: 80, status: 'In Stock', category: 'Tools', img: 'https://images.unsplash.com/photo-1581244273443-c7h399dd52ad?q=80&w=640&auto=format&fit=crop' },
];

const categories = ['All', 'Cement', 'Steel', 'Tools', 'Plumbing', 'Electrical', 'Paint'];

type CartItem = { id: string; name: string; price: number; qty: number; img: string };
type Product = typeof mockProducts[0];

// ── Quantity Popup ─────────────────────────────────────────────────────────────
function QtyPopup({
  product,
  currentQty,
  onConfirm,
  onClose,
}: {
  product: Product;
  currentQty: number;
  onConfirm: (qty: number) => void;
  onClose: () => void;
}) {
  const [qty, setQtyLocal] = useState(currentQty > 0 ? currentQty : 1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.select(), 50);
  }, []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onConfirm(Math.max(1, qty));
    if (e.key === 'Escape') onClose();
  };

  const total = product.price * Math.max(1, qty);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Product header — horizontal card, no image overflow */}
        <div className="flex items-center gap-4 p-5 bg-gray-50 border-b border-gray-100">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-gray-200 shadow-sm">
            <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-[#059669] uppercase tracking-widest mb-1">{product.category}</p>
            <h3 className="text-[15px] font-black text-gray-900 leading-snug mb-1 line-clamp-2">{product.name}</h3>
            <p className="text-[12px] font-bold text-gray-400">Rs. {product.price.toLocaleString()} / unit</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-500 p-1.5 rounded-full transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Enter Quantity</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQtyLocal(q => Math.max(1, q - 1))}
                className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-all active:scale-90 shrink-0 border border-gray-200"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input
                ref={inputRef}
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQtyLocal(Math.max(1, parseInt(e.target.value) || 1))}
                onKeyDown={handleKey}
                onFocus={(e) => e.target.select()}
                className="flex-1 w-full h-16 text-center text-[32px] font-black text-gray-900 border-2 border-gray-200 rounded-2xl outline-none focus:border-[#059669] focus:ring-4 focus:ring-emerald-500/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => setQtyLocal(q => q + 1)}
                className="w-14 h-14 rounded-xl bg-[#059669] hover:bg-emerald-700 flex items-center justify-center text-white transition-all active:scale-90 shrink-0 shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-6 h-6" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Cost Preview */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-400">{qty} × Rs. {product.price.toLocaleString()}</p>
              <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest mt-0.5">Line Total</p>
            </div>
            <span className="text-[22px] font-black text-[#059669]">Rs. {total.toLocaleString()}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button 
              onClick={onClose} 
              className="flex-1 py-4 rounded-2xl border border-gray-200 text-gray-500 font-bold text-[14px] hover:bg-gray-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(Math.max(1, qty))}
              className="flex-[1.5] py-4 rounded-2xl bg-[#059669] text-white font-black text-[14px] hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] uppercase tracking-wider"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function POSPage() {
  const [viewState, setViewState] = useState<'pos' | 'confirm'>('pos');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Qty Popup state
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [isLabourModalOpen, setIsLabourModalOpen] = useState(false);

  // Checkout/sidebar state
  const [activeTab, setActiveTab] = useState<'items' | 'checkout'>('items');
  const [customerMode, setCustomerMode] = useState<'walkin' | 'new'>('walkin');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('0');
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [heldOrders, setHeldOrders] = useState<CartItem[][]>([]);

  // ── Cart helpers
  const addToCartWithQty = (product: Product, qty: number) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty, img: product.img }];
    });
    setActiveTab('items');
    setPendingProduct(null);
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
    alert("Transaction put on Hold successfully.");
  };

  const handlePrint = () => {
    window.print();
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * (discountValue / 100)) 
    : discountValue;
  const tax = (subtotal - discountAmount) * 0.15;
  const total = subtotal - discountAmount + tax;
  const change = Math.max(0, Number(amountPaid) - total);

  const hasLowStockItems = useMemo(() => {
    return cart.some(item => {
      const product = mockProducts.find(p => p.id === item.id);
      return product?.status === 'Low Stock';
    });
  }, [cart]);

  const filteredProducts = useMemo(() => mockProducts.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  }), [activeCategory, searchQuery]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'F1') { e.preventDefault(); setCart([]); setViewState('pos'); }
      if (e.key === 'F2') { e.preventDefault(); setActiveTab(prev => prev === 'items' ? 'checkout' : 'items'); }
      if (e.key === 'F9' && activeTab === 'checkout') { e.preventDefault(); setViewState('confirm'); }
      if (e.key === 'Escape') setPendingProduct(null);
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [activeTab]);

  return (
    <>
      <AddLabourModal 
        isOpen={isLabourModalOpen} 
        onClose={() => setIsLabourModalOpen(false)} 
      />

      {/* Qty Popup — rendered OUTSIDE MainLayout to escape stacking contexts */}
      {pendingProduct && (
        <QtyPopup
          product={pendingProduct}
          currentQty={cart.find(c => c.id === pendingProduct.id)?.qty ?? 0}
          onConfirm={(qty) => addToCartWithQty(pendingProduct, qty)}
          onClose={() => setPendingProduct(null)}
        />
      )}

      <MainLayout>
      {viewState === 'confirm' ? (
        <div className="flex h-[calc(100vh-96px)] -m-10 overflow-hidden bg-[#f8fafc] relative z-50">
          <PaymentConfirmation
            onBack={() => setViewState('pos')}
            onProcess={() => {
              setShowSuccess(true);
              setTimeout(() => {
                setCart([]);
                setViewState('pos');
                setShowSuccess(false);
                setActiveTab('items');
              }, 2000);
            }}
            items={cart}
            customerType={customerMode === 'walkin' ? 'Walk-In' : 'New Customer'}
            paymentMethod={paymentMethod}
            amountTendered={Number(amountPaid)}
            change={change}
            subtotal={subtotal}
            discount={discountAmount}
            tax={tax}
            total={total}
            notes={notes}
          />
        </div>
      ) : (
        <div className="flex h-[calc(100vh-96px)] -m-10 overflow-hidden bg-[#f8fafc]">

          {/* ── LEFT: PRODUCT GRID ── */}
          <div className={`flex-1 flex flex-col bg-[#f8fafc] ${cart.length > 0 ? 'border-r border-gray-200' : ''}`}>
            {/* Top Bar */}
            <div className="p-6 pb-2">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-xl">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search product name, SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
            
            <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-white/90">
              <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 -mb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl font-black text-[12px] uppercase tracking-widest transition-all shrink-0 border-2 ${
                      activeCategory === cat ? 'bg-[#059669] text-white border-[#059669] shadow-lg shadow-emerald-200' : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-200 hover:text-emerald-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const inCart = cart.find(c => c.id === product.id);
                  return (
                    <div
                      key={product.id}
                      className={`bg-white rounded-[16px] border shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col ${
                        inCart ? 'border-[#059669] ring-2 ring-emerald-500/15' : 'border-gray-200'
                      }`}
                    >
                      {/* Image */}
                      <div className="h-[160px] w-full bg-gray-100 relative overflow-hidden">
                        <img src={product.img} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        {/* Status badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm border ${
                            product.status === 'In Stock' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-amber-500 text-white border-amber-400'
                          }`}>{product.status}</span>
                        </div>
                        {/* In-cart indicator */}
                        {inCart && (
                          <div className="absolute top-3 left-3 bg-[#059669] text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md">
                            {inCart.qty} {inCart.qty === 1 ? 'pc' : 'pcs'}
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black text-[#059669] uppercase tracking-[0.15em] bg-emerald-50 px-2 py-0.5 rounded-md">
                              {product.category}
                            </span>
                            <span className="text-[11px] font-bold text-gray-400 font-mono">
                              {product.sku}
                            </span>
                          </div>
                          <h3 className="text-[15px] font-black text-gray-900 leading-tight h-10 overflow-hidden line-clamp-2">
                            {product.name}
                          </h3>
                        </div>

                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Price</span>
                            <span className="text-[18px] font-black text-gray-900 tracking-tighter">
                              Rs. {product.price.toLocaleString()}
                            </span>
                          </div>
                          <button
                            onClick={() => setPendingProduct(product)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-sm border-2 ${
                              inCart 
                                ? 'bg-emerald-50 border-emerald-200 text-[#059669] shadow-emerald-100' 
                                : 'bg-white border-gray-100 text-[#059669] hover:bg-emerald-50 hover:border-emerald-200'
                            }`}
                          >
                            <Plus className="w-5 h-5" strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredProducts.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center py-20 text-gray-400">
                  <Package className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg font-bold">No products found</p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: TABBED CHECKOUT SIDEBAR ── */}
          {cart.length > 0 && (
            <div className="w-[600px] bg-white flex flex-col relative shadow-2xl z-20 border-l border-gray-200 h-full overflow-hidden">

              {/* Tab Switcher */}
              <div className="flex bg-gray-50 p-1.5 m-3 rounded-2xl border border-gray-100 gap-1 shrink-0">
                <button
                  onClick={() => setActiveTab('items')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-black tracking-tight transition-all duration-200 ${
                    activeTab === 'items' ? 'bg-white text-[#059669] shadow-md border border-emerald-100' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  CART ({cart.length})
                </button>
                <button
                  onClick={() => setActiveTab('checkout')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-black tracking-tight transition-all duration-200 ${
                    activeTab === 'checkout' ? 'bg-[#059669] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  CHECKOUT
                </button>
              </div>

              {/* Scrollable Tab Content */}
              <div className="flex-1 overflow-y-auto scroll-smooth">

                {/* ─── ITEMS TAB ─── */}
                {activeTab === 'items' && (
                  <div className="p-5 space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[13px] font-black text-gray-700 uppercase tracking-widest">Cart Items</h3>
                      <button onClick={() => setCart([])} className="text-[11px] font-bold text-red-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Clear All</button>
                    </div>

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

                    <div className="space-y-3">
                      {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 opacity-40">
                            <ShoppingCart className="w-10 h-10 text-[#059669]" />
                          </div>
                          <h4 className="text-[16px] font-black text-gray-900 mb-2">Cart is empty</h4>
                          <p className="text-[12px] font-medium text-gray-400 leading-relaxed">
                            Start adding hardware products to build a new invoice.
                          </p>
                        </div>
                      ) : (
                        cart.map((item) => (
                        <div key={item.id} className="flex gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 relative group hover:bg-white hover:shadow-md transition-all">
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                            <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-[13px] font-bold text-gray-900 leading-tight">{item.name}</h4>
                              <p className="text-[11px] font-semibold text-[#059669]">Rs. {item.price.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => updateQty(item.id, -1)} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-90 transition-all border border-gray-200"><Minus className="w-4 h-4" /></button>
                                <input
                                  type="number"
                                  min={1}
                                  value={item.qty}
                                  onChange={(e) => setQty(item.id, e.target.value)}
                                  onBlur={() => ensureMinQty(item.id)}
                                  onFocus={(e) => e.target.select()}
                                  className="w-14 h-10 text-center font-black text-[15px] text-gray-900 bg-white border-2 border-gray-100 rounded-xl outline-none focus:border-[#059669] transition-all"
                                />
                                <button onClick={() => updateQty(item.id, 1)} className="w-10 h-10 rounded-xl bg-[#059669] flex items-center justify-center text-white hover:bg-emerald-700 active:scale-90 transition-all shadow-sm"><Plus className="w-4 h-4" /></button>
                              </div>
                              <span className="text-[14px] font-black text-[#059669]">Rs. {(item.price * item.qty).toLocaleString()}</span>
                            </div>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="absolute top-2 right-2 p-1 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"><X className="w-4 h-4" /></button>
                        </div>
                      ))
                    )}
                    </div>
                    <button
                      onClick={() => setActiveTab('checkout')}
                      className="w-full bg-emerald-50 border border-emerald-200 text-[#059669] py-4 rounded-xl flex items-center justify-center gap-2 font-black text-[13px] hover:bg-emerald-100 transition-all group mt-4"
                    >
                      Next: Payment Details
                      <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                )}

                {/* ─── CHECKOUT TAB ─── */}
                {activeTab === 'checkout' && (
                  <div className="p-5 space-y-6">
                    {/* Customer */}
                    <div className="space-y-3">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Customer</h3>
                      <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#059669]" />
                        <input type="text" placeholder="Search customer name or phone..." className="w-full border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-[13px] font-medium outline-none focus:border-[#059669] transition-all bg-gray-50" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setCustomerMode('walkin')} className={`flex-1 py-3 rounded-xl text-[12px] font-black uppercase border transition-all ${customerMode === 'walkin' ? 'bg-emerald-50 border-[#059669] text-[#059669]' : 'bg-white border-gray-200 text-gray-400'}`}>Walk-In</button>
                        <button onClick={() => setCustomerMode('new')} className={`flex-1 py-3 rounded-xl text-[12px] font-black uppercase border transition-all ${customerMode === 'new' ? 'bg-amber-50 border-[#d97706] text-[#d97706]' : 'bg-white border-gray-200 text-gray-400'}`}>+ New</button>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-3">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2"><Banknote className="w-3.5 h-3.5" /> Payment Method</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'cash', icon: Banknote, label: 'Cash' },
                          { id: 'card', icon: CreditCard, label: 'Card' },
                          { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                        ].map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id as any)}
                            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                              paymentMethod === method.id ? 'bg-[#059669] border-[#059669] text-white shadow-lg scale-105' : 'bg-white border-gray-100 text-gray-500 hover:border-emerald-200 hover:bg-emerald-50/30'
                            }`}
                          >
                            <method.icon className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-wider">{method.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cash Received */}
                    <div className="space-y-3">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Amount Received</h3>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-[16px]">Rs.</span>
                        <input
                          type="number"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                          className="w-full bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl py-4 pl-14 pr-4 text-[22px] font-black text-gray-900 outline-none focus:border-[#059669] transition-all"
                        />
                      </div>
                      <div className="bg-[#059669] rounded-2xl py-4 px-5 flex items-center justify-between shadow-lg shadow-emerald-500/20">
                        <div>
                          <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">Change Return</p>
                          <p className="text-[11px] text-white/60 italic mt-0.5">Hardware Store POS</p>
                        </div>
                        <span className="text-[26px] font-black text-white tracking-tight">
                          Rs. {Math.max(0, Number(amountPaid) - total).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Discount */}
                    <div>
                      <button onClick={() => setIsDiscountOpen(!isDiscountOpen)} className="w-full flex items-center justify-between py-3 border-t border-gray-100 group">
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] group-hover:text-[#059669] transition-colors">Apply Discount</span>
                        <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${isDiscountOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isDiscountOpen && (
                        <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-3">
                          <div className="flex gap-2">
                            <button onClick={() => setDiscountType('percentage')} className={`flex-1 py-2 rounded-lg text-[11px] font-black uppercase ${discountType === 'percentage' ? 'bg-[#059669] text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>% Percent</button>
                            <button onClick={() => setDiscountType('fixed')} className={`flex-1 py-2 rounded-lg text-[11px] font-black uppercase ${discountType === 'fixed' ? 'bg-[#059669] text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>Amount</button>
                          </div>
                          <div className="flex gap-2">
                            <input 
                              type="number"
                              placeholder="Enter value" 
                              value={discountValue || ''}
                              onChange={(e) => setDiscountValue(Number(e.target.value))}
                              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-[13px] font-bold outline-none focus:border-[#059669]" 
                            />
                            <button 
                              onClick={() => setIsDiscountOpen(false)}
                              className="bg-[#059669] text-white px-4 rounded-lg text-[11px] font-black uppercase shrink-0"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2 pb-4">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">Notes</h3>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="Add delivery notes or special requests..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-[13px] font-medium text-gray-700 outline-none focus:border-gray-300 transition-all resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] shrink-0">
                <div className="px-5 pt-4 pb-2 space-y-1.5">
                  <div className="flex justify-between text-[12px] font-bold text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-gray-700">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[12px] font-bold text-red-400">
                    <span>Discount {discountType === 'percentage' ? `(${discountValue}%)` : ''}</span>
                    <span>-Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="px-5 py-4 bg-emerald-50/50 flex items-center justify-between border-y border-emerald-100">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#059669] opacity-60">Total Payable</p>
                    <p className="text-[11px] font-bold text-emerald-700">incl. 15% Tax</p>
                  </div>
                  <span className="text-[30px] font-black tracking-tighter text-[#059669]">Rs. {total.toLocaleString()}</span>
                </div>
                <div className="p-5 space-y-3">
                  <button
                    onClick={() => setViewState('confirm')}
                    disabled={activeTab === 'items'}
                    className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-[17px] transition-all duration-300 ${
                      activeTab === 'items'
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-[#059669] text-white shadow-xl shadow-emerald-500/30 hover:bg-emerald-700 active:scale-[0.98]'
                    }`}
                  >
                    <CheckCircle2 className={`w-6 h-6 ${activeTab === 'items' ? 'opacity-20' : ''}`} />
                    COMPLETE SALE
                  </button>
                  {activeTab === 'items' && (
                    <p className="text-center text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                      ↑ Switch to Checkout tab to proceed
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button 
                      onClick={handleHold}
                      className="flex-1 bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-500 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="text-[14px]">⏸</span> Hold {heldOrders.length > 0 && `(${heldOrders.length})`}
                    </button>
                    <button 
                      onClick={handlePrint}
                      className="flex-1 bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-500 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="text-[14px]">🖨</span> Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <SuccessModal isOpen={showSuccess} total={total} />
    </MainLayout>
    </>
  );
}
