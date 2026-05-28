'use client';

import { 
  Wrench, 
  Lightbulb, 
  Settings, 
  Cable, 
  Brush 
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useTopProducts } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductList() {
  const { products, loading } = useTopProducts();
  const getIconAndColors = (index: number) => {
    const configs = [
      { icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-50' },
      { icon: Lightbulb, color: 'text-green-500', bg: 'bg-green-50' },
      { icon: Settings, color: 'text-orange-500', bg: 'bg-orange-50' },
      { icon: Cable, color: 'text-purple-500', bg: 'bg-purple-50' },
      { icon: Brush, color: 'text-sky-500', bg: 'bg-sky-50' },
    ];
    return configs[index % configs.length];
  };
  return (
    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 min-w-[380px] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Top Products</h3>
        <button className="text-[13px] font-medium text-blue-600 hover:text-blue-700 transition-colors">View All</button>
      </div>

      <div className="space-y-4 flex-1">
        {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2 -mx-2">
                    <div className="w-12 h-12 rounded-[14px] bg-gray-100 animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
            ))
        ) : products.length === 0 ? (
            <div className="py-8 text-center text-gray-500 font-medium">No top products found for this period.</div>
        ) : (
            products.map((product, index) => {
                const { icon: Icon, color, bg } = getIconAndColors(index);
                return (
          <div key={product.id || index} className="flex items-center gap-4 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors">
            <div className={cn("w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0", bg)}>
              <Icon className={cn("w-5 h-5", color)} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-bold text-gray-900 tracking-tight truncate">{product.name || (product as any).product_name}</h4>
              <p className="text-[13px] text-[#94a3b8] font-medium mt-0.5">{product.totalQty || (product as any).quantity || 0} sold</p>
            </div>
            <div className="text-right pl-2">
              <p className="text-[14px] font-bold text-gray-900 tracking-tight">LKR {(product.totalRevenue || (product as any).revenue || 0).toLocaleString()}</p>
            </div>
          </div>
        )}))}
      </div>
    </div>
  );
}
