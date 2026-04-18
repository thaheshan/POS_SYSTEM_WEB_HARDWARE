'use client';

import { useState } from 'react';
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
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const data = [
  { name: 'Jan', current: 380, last: 200 },
  { name: 'Feb', current: 420, last: 250 },
  { name: 'Mar', current: 390, last: 320 },
  { name: 'Apr', current: 460, last: 350 },
  { name: 'May', current: 487, last: 370 },
  { name: 'Jun', current: 510, last: 380 },
  { name: 'Jul', current: 540, last: 400 },
  { name: 'Aug', current: 520, last: 390 },
  { name: 'Sep', current: 580, last: 410 },
  { name: 'Oct', current: 610, last: 440 },
  { name: 'Nov', current: 650, last: 450 },
  { name: 'Dec', current: 720, last: 480 },
];

export default function RevenueTrendChart() {
  const [timeline, setTimeline] = useState('This Year');

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col h-full min-h-[400px]">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-[16px] font-black text-gray-900 tracking-tight">Revenue Trend</h3>
          <p className="text-[12px] font-medium text-gray-400 mt-1">Monthly revenue comparison - This Year vs Last Year</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
              <span className="text-[11px] font-bold text-gray-600">2026</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <span className="text-[11px] font-bold text-gray-600">2025</span>
            </div>
          </div>
          
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 text-[12px] font-bold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                {timeline} <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" className="bg-white rounded-lg shadow-lg border border-gray-100 p-1 py-1.5 min-w-[140px] z-[100] animate-in fade-in zoom-in-95">
                {['This Year', 'Last 12 Months', 'Year to Date'].map(opt => (
                  <DropdownMenu.Item 
                    key={opt}
                    onClick={() => setTimeline(opt)}
                    className="text-[12px] font-bold text-gray-700 px-3 py-2 cursor-pointer hover:bg-gray-50 hover:text-blue-600 outline-none rounded-md transition-colors w-full text-left"
                  >
                    {opt}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
      
      <div className="flex-1 w-full relative -left-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              tickFormatter={(val) => `${val}k`}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
              itemStyle={{ fontWeight: 'bold', fontSize: '13px' }}
              labelStyle={{ fontWeight: 'bold', color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="last" 
              name="2025"
              stroke="#e2e8f0" 
              strokeWidth={3} 
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
            />
            <Line 
              type="monotone" 
              dataKey="current"
              name="2026"
              stroke="#2563eb" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2, fill: '#2563eb' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
