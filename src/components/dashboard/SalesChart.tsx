'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
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

export default function SalesChart() {
  const [timeframe, setTimeframe] = useState('Last 7 Days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex-1 min-h-[450px] flex flex-col">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-1">Sales Overview</h3>
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

      <div className="flex-1 w-full -ml-6 -mr-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '16px',
                fontWeight: '600',
                fontSize: '13px'
              }}
            />
            <Line 
              type="linear" 
              dataKey="cost" 
              name="Cost"
              stroke="#ea580c" 
              strokeWidth={2.5} 
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#ea580c' }} 
            />
            <Line 
              type="linear" 
              dataKey="sales" 
              name="Sales"
              stroke="#2563eb" 
              strokeWidth={2.5} 
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
            />
            <Line 
              type="linear" 
              dataKey="revenue" 
              name="Revenue"
              stroke="#db2777" 
              strokeWidth={2.5} 
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#db2777' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-8 mt-8 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" />
          <span className="text-[13px] font-medium text-gray-700">Cost</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
          <span className="text-[13px] font-medium text-gray-700">Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#db2777]" />
          <span className="text-[13px] font-medium text-gray-700">Revenue</span>
        </div>
      </div>
    </div>
  );
}
