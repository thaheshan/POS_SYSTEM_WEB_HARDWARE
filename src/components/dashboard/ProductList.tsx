'use client';

import { 
  Wrench, 
  Lightbulb, 
  Settings, 
  Cable, 
  Brush 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const products = [
  { id: 1, name: 'PVC Pipe 1"', sold: 234, price: 'LKR 45K', icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, name: 'LED Bulb 15W', sold: 189, price: 'LKR 38K', icon: Lightbulb, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 3, name: 'Bolt Set M8', sold: 156, price: 'LKR 32K', icon: Settings, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 4, name: 'Wire Cable 2.5mm', sold: 142, price: 'LKR 29K', icon: Cable, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 5, name: 'Paint Brush Set', sold: 128, price: 'LKR 24K', icon: Brush, color: 'text-sky-500', bg: 'bg-sky-50' },
];

export default function ProductList() {
  return (
    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 min-w-[380px] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Top Products</h3>
        <button className="text-[13px] font-medium text-blue-600 hover:text-blue-700 transition-colors">View All</button>
      </div>

      <div className="space-y-4 flex-1">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-4 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors">
            <div className={cn("w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0", product.bg)}>
              <product.icon className={cn("w-5 h-5", product.color)} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[14px] font-bold text-gray-900 tracking-tight truncate">{product.name}</h4>
              <p className="text-[13px] text-[#94a3b8] font-medium mt-0.5">{product.sold} sold</p>
            </div>
            <div className="text-right pl-2">
              <p className="text-[14px] font-bold text-gray-900 tracking-tight">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
