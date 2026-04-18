'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState, useMemo } from 'react';
import { Search, Trash2, Plus, Minus, X, Check, ChevronDown, CheckCircle2, Package, SearchIcon, ArrowLeft, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import CheckoutModal from '@/components/pos/CheckoutModal';
import PaymentConfirmation from '@/components/pos/PaymentConfirmation';
import SuccessModal from '@/components/pos/SuccessModal';

const mockProducts = [
  // CEMENT
  { id: '1', name: 'Holcim Cement 50kg', sku: 'HCM-50-001', price: 1650, stock: 45, status: 'In Stock', category: 'Cement', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=640&auto=format&fit=crop' },
  { id: '2', name: 'Tokyo Super Cement', sku: 'TKY-50-002', price: 1720, stock: 20, status: 'In Stock', category: 'Cement', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=640&auto=format&fit=crop' },
  
  // STEEL
  { id: '3', name: 'Steel Rods 12mm', sku: 'STL-12-002', price: 2450, stock: 120, status: 'In Stock', category: 'Steel', img: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?q=80&w=640&auto=format&fit=crop' },
  { id: '4', name: 'Steel Rods 16mm', sku: 'STL-16-003', price: 3200, stock: 85, status: 'In Stock', category: 'Steel', img: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=640&auto=format&fit=crop' },
  
  // TOOLS
  { id: '5', name: 'Bosch Power Drill 18V', sku: 'BSH-DR-001', price: 14500, stock: 12, status: 'In Stock', category: 'Tools', img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=640&auto=format&fit=crop' },
  { id: '6', name: 'Stanley Hammer 20oz', sku: 'STY-HM-005', price: 1850, stock: 40, status: 'In Stock', category: 'Tools', img: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?q=80&w=640&auto=format&fit=crop' },
  
  // PLUMBING
  { id: '7', name: 'PVC Pipe 2 inch (10ft)', sku: 'PVC-2I-005', price: 1850, stock: 200, status: 'In Stock', category: 'Plumbing', img: 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=640&auto=format&fit=crop' },
  { id: '8', name: 'Water Tap Brass 1/2"', sku: 'TAP-BR-001', price: 1250, stock: 25, status: 'In Stock', category: 'Plumbing', img: 'https://images.unsplash.com/photo-1585338447937-7082f8fc763d?q=80&w=640&auto=format&fit=crop' },
  
  // ELECTRICAL
  { id: '9', name: 'Circuit Breaker 32A', sku: 'ELE-CB-032', price: 2100, stock: 15, status: 'In Stock', category: 'Electrical', img: 'https://images.unsplash.com/photo-1558489580-faa74691fdc5?q=80&w=640&auto=format&fit=crop' },
  { id: '10', name: 'Copper Wire 1.5mm 1Roll', sku: 'ELE-WR-015', price: 5800, stock: 10, status: 'Low Stock', category: 'Electrical', img: 'https://images.unsplash.com/photo-1620619864205-594ff8aebdce?q=80&w=640&auto=format&fit=crop' },
  
  // PAINT
  { id: '11', name: 'Asian Paint White 4L', sku: 'PNT-WH-003', price: 3200, stock: 5, status: 'Low Stock', category: 'Paint', img: 'https://images.unsplash.com/photo-1562591176-ed2da0f878f7?q=80&w=640&auto=format&fit=crop' },
  { id: '12', name: 'Paint Roller 9 inch', sku: 'PNT-RL-009', price: 850, stock: 35, status: 'In Stock', category: 'Paint', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=640&auto=format&fit=crop' },

  { id: '13', name: 'Nails 3 inch (1kg)', sku: 'NLS-3I-004', price: 450, stock: 80, status: 'In Stock', category: 'Tools', img: 'https://images.unsplash.com/photo-1581244273443-c7h399dd52ad?q=80&w=640&auto=format&fit=crop' },
];

const categories = ['All', 'Cement', 'Steel', 'Tools', 'Plumbing', 'Electrical', 'Paint'];

export default function POSPage() {
  const [viewState, setViewState] = useState<'pos' | 'checkout' | 'confirm'>('pos');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Cart State
  const [cart, setCart] = useState<{ id: string, name: string, price: number, qty: number, img: string }[]>([]);

  const addToCart = (product: typeof mockProducts[0]) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, img: product.img }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discount = subtotal * 0.05; // 5% mock discount
  const tax = (subtotal - discount) * 0.15; // 15% mock tax
  const total = subtotal - discount + tax;

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
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
              }, 2000);
            }}
            subtotal={subtotal} 
            tax={tax} 
            total={total} 
          />
        </div>
      ) : (
        <div className="flex h-[calc(100vh-96px)] -m-10 overflow-hidden bg-[#f8fafc]">
          
          {/* LEFT PANEL: POS GRID */}
          <div className={`flex-1 flex flex-col bg-[#f8fafc] ${cart.length > 0 ? 'border-r border-gray-200' : ''}`}>
            
            {/* Top Bar: Search & Categories */}
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
                  <span>Switch Method</span>
                </Link>
              </div>
              
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
                {categories.map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all border shadow-sm ${
                      activeCategory === cat 
                        ? 'bg-[#059669] text-white border-[#059669] scale-105' 
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
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
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-[16px] border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer flex flex-col">
                    {/* Image Area (Full Bleed) */}
                    <div className="h-[160px] w-full bg-gray-100 relative">
                      <img 
                        src={product.img} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute top-3 right-3">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm border ${
                            product.status === 'In Stock' 
                              ? 'bg-emerald-500 text-white border-emerald-400' 
                              : 'bg-amber-500 text-white border-amber-400'
                         }`}>
                           {product.status}
                         </span>
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="mb-2">
                        <p className="text-[10px] font-black text-[#059669] uppercase tracking-widest mb-1">{product.category}</p>
                        <h3 className="text-[14px] font-bold text-gray-900 leading-tight h-10 overflow-hidden line-clamp-2">{product.name}</h3>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">SKU: {product.sku}</p>
                      
                      <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
                        <span className="text-[17px] font-black text-[#059669]">Rs. {product.price.toLocaleString()}</span>
                        <button 
                          onClick={() => addToCart(product)}
                          className="w-[36px] h-[36px] rounded-full bg-[#d97706] hover:bg-amber-600 text-white flex items-center justify-center shadow-lg transition-all active:scale-90"
                        >
                          <Plus className="w-5 h-5" strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center py-20 text-gray-400">
                   <Package className="w-16 h-16 mb-4 opacity-20" />
                   <p className="text-lg font-bold">No products found</p>
                </div>
              )}

              {/* Load More */}
              {filteredProducts.length > 0 && (
                <div className="w-full flex justify-center py-8">
                  <button className="text-[14px] font-bold text-[#059669] hover:underline">Load More</button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: CART & CHECKOUT (Only visible if cart has items) */}
          {cart.length > 0 && (
            <div className="w-[420px] bg-white flex flex-col relative shadow-xl z-20 transition-all duration-300 ease-in-out">
              
              {/* Cart Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-[18px] font-black tracking-tight text-gray-900">Shopping Cart</h2>
                  <p className="text-[12px] font-bold text-gray-500">{cart.length} items</p>
                </div>
                <button 
                  onClick={() => setCart([])}
                  className="flex items-center gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-[12px] font-bold"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 relative pb-4 border-b border-gray-100 last:border-0">
                    {/* Item Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1">
                      <div className="pr-6">
                        <h4 className="text-[13px] font-bold text-gray-900 leading-tight mb-0.5">{item.name}</h4>
                        <p className="text-[11px] font-semibold text-gray-400">Rs. {item.price.toLocaleString()} per unit</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        {/* Qty Controls */}
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => updateQty(item.id, -1)}
                            className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors border border-gray-200"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input 
                            type="text" 
                            value={item.qty} 
                            readOnly
                            className="w-10 h-7 text-center font-bold text-[13px] bg-transparent outline-none text-gray-900" 
                          />
                          <button 
                            onClick={() => updateQty(item.id, 1)}
                            className="w-7 h-7 rounded bg-[#d97706] hover:bg-amber-600 flex items-center justify-center text-white transition-colors border border-transparent"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        {/* Item Total */}
                        <span className="text-[13.5px] font-bold text-[#059669]">
                          Rs. {(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-0 right-0 p-1 text-red-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total & Action Footer */}
              <div className="bg-white">
                <div className="border-t-[3px] border-[#d97706] p-5 space-y-3 pb-4">
                  <div className="flex justify-between text-[13px] font-bold text-gray-500">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[13px] font-bold text-red-500">
                    <span>Discount (5%)</span>
                    <span>-Rs. {discount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[13px] font-bold text-[#059669]">
                    <span>Tax (15%)</span>
                    <span>+Rs. {tax.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="p-5 py-4 bg-[#ecfdf5] flex items-center justify-between border-y border-emerald-100">
                  <span className="text-[14px] font-black uppercase tracking-widest text-[#059669]">TOTAL</span>
                  <span className="text-[24px] font-black tracking-tight text-[#059669]">Rs. {total.toLocaleString()}</span>
                </div>

                {/* Actions */}
                <div className="p-5 bg-white flex flex-col gap-3">
                  <button 
                    onClick={() => setViewState('checkout')}
                    className="w-full bg-[#059669] hover:bg-emerald-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] shadow-sm transition-all active:scale-[0.98]"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Complete Sale
                  </button>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-[13px] transition-colors shadow-sm">
                      || Hold
                    </button>
                    <button className="flex-1 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-[13px] transition-colors shadow-sm">
                      🖨 Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Modal Overlay */}
      <CheckoutModal 
        isOpen={viewState === 'checkout'}
        onClose={() => setViewState('pos')}
        subtotal={subtotal}
        onComplete={() => setViewState('confirm')}
      />
      <SuccessModal 
        isOpen={showSuccess}
        total={total}
      />
    </MainLayout>
  );
}
