'use client';
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Package2 } from 'lucide-react';
import api from '@/api/axiosInstance';
import GlobalCatalogAddModal from './GlobalCatalogAddModal';

// Deterministic gradient per product name for nice "no image" placeholders
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

export default function GlobalCatalogSearch({ onProductAdded }: { onProductAdded: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length >= 2) searchCatalog(query.trim());
      else setResults([]);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const searchCatalog = async (q: string) => {
    setIsSearching(true);
    try {
      const res = await api.get(`/catalog/search?q=${encodeURIComponent(q)}`);
      // ResponseInterceptor wraps as { success, data }
      const raw = res.data;
      const list = Array.isArray(raw) ? raw
        : Array.isArray(raw?.data) ? raw.data
        : Array.isArray(raw?.data?.data) ? raw.data.data
        : [];
      setResults(list);
    } catch (err) {
      console.error('Catalog search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuccess = () => {
    setSelectedProduct(null);
    setQuery('');
    setResults([]);
    onProductAdded();
  };

  return (
    <div className="w-full bg-white rounded-[24px] shadow-sm border border-emerald-100 p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-4">
        <h2 className="text-[18px] font-black tracking-tight text-gray-900 flex items-center gap-2">
          Global Product Catalog
          <span className="text-[10px] uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">New</span>
        </h2>
        <p className="text-[13px] font-bold text-gray-400">Search 800+ master items to instantly add them to your shop</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, brand or category (e.g. cement, drill, nut)..."
          className="block w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[14px] font-bold text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {results.map((product) => {
            const gradient = getGradient(product.name);
            const initials = getInitials(product.name);
            const hasImage = product.images && product.images.length > 0 && product.images[0].imageUrl;

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white border border-gray-200 rounded-2xl p-3 cursor-pointer hover:border-emerald-400 hover:shadow-lg transition-all group flex flex-col"
              >
                {/* Image / Gradient Placeholder */}
                <div className={`w-full aspect-square rounded-xl mb-2.5 flex items-center justify-center overflow-hidden ${!hasImage ? `bg-gradient-to-br ${gradient}` : 'bg-gray-50'}`}>
                  {hasImage ? (
                    <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                  ) : (
                    <span className="text-white font-black text-[18px] drop-shadow">{initials}</span>
                  )}
                </div>

                {/* Product Info */}
                <h3 className="text-[12px] font-black text-gray-900 leading-tight mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-[10px] font-bold text-gray-400 mb-2 truncate">{product.category?.name || 'Hardware'}</p>

                <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${product.sellType === 'loose' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {product.sellType === 'loose' ? `/${product.measurementUnit}` : 'Fixed'}
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 group-hover:text-emerald-700">Add +</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isSearching && query.trim().length >= 2 && results.length === 0 && (
        <div className="mt-6 flex flex-col items-center py-8 text-center">
          <Package2 className="w-10 h-10 text-gray-200 mb-3" />
          <p className="text-[13px] font-black text-gray-400">No results for &quot;{query}&quot;</p>
          <p className="text-[11px] font-bold text-gray-300 mt-1">Try searching by a different term</p>
        </div>
      )}

      {selectedProduct && (
        <GlobalCatalogAddModal
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
