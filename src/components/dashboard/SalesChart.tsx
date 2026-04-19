'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Defs,
  LinearGradient
} from 'recharts';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Using mock data, but structure updated for Cost, Sales, Revenue
const data = [
  { name: 'Jan 11', cost: 200, sales: 100, revenue: 150 },
  { name: 'Jan 12', cost: 250, sales: 150, revenue: 200 },
  { name: 'Jan 13', cost: 220, sales: 180, revenue: 180 },
  { name: 'Jan 14', cost: 380, sales: 120, revenue: 300 },
  { name: 'Jan 15', cost: 350, sales: 220, revenue: 250 },
  { name: 'Jan 16', cost: 280, sales: 320, revenue: 380 },
];

interface SalesChartProps {
  title?: string;
}

export default function SalesChart({ title = "Sales Overview" }: SalesChartProps) {
  const [timeframe, setTimeframe] = useState('Last 7 Days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Recharts needs to be mounted on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const options = ['Last 7 Days', 'Last 28 Days', 'Last 90 Days'];

  if (!mounted) {
    return (
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex-1 min-h-[450px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 w-full bg-gray-50 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex-1 min-h-[450px] flex flex-col">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-1">{title}</h3>
          <p className="text-[14px] text-gray-400 font-medium">{timeframe} performance</p>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 transition-all rounded-[10px] text-[13px] font-semibold text-gray-700 border border-gray-200 shadow-sm active:scale-95"
          >
            <span>{timeframe}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 shadow-xl rounded-[12px] overflow-hidden z-20 py-1">
              {options.map((option) => (
                <button
                  key={option}
                  className="w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-gray-50 text-gray-700"
                  onClick={() => {
                    setTimeframe(option);
                    setIsDropdownOpen(false);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-[320px] -ml-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
              dx={-5}
            />
            <Tooltip 
              cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                padding: '12px',
                fontWeight: '700',
                fontSize: '12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="cost" 
              name="Cost"
              stroke="#f97316" 
              strokeWidth={4} 
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#f97316' }} 
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="sales" 
              name="Sales"
              stroke="#3b82f6" 
              strokeWidth={4} 
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Revenue"
              stroke="#ec4899" 
              strokeWidth={4} 
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#ec4899' }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-8 mt-8 justify-center border-t border-gray-50 pt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f97316]" />
          <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Cost</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
          <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ec4899]" />
          <span className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">Revenue</span>
        </div>
      </div>
    </div>
  );
}
