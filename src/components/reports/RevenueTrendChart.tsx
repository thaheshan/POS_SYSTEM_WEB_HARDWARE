'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ChevronDown, Loader2 } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import api from '@/api/axiosInstance';

interface ChartItem {
  name: string;
  current: number;
  last: number;
}

export default function RevenueTrendChart() {
  const [timeline, setTimeline] = useState('This Year');
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Mock data for revenue comparison since /reports/revenue-comparison endpoint does not exist yet
        const data = [
          { name: 'Jan', current: 4000, last: 2400 },
          { name: 'Feb', current: 3000, last: 1398 },
          { name: 'Mar', current: 2000, last: 9800 },
          { name: 'Apr', current: 2780, last: 3908 },
          { name: 'May', current: 1890, last: 4800 },
          { name: 'Jun', current: 2390, last: 3800 },
          { name: 'Jul', current: 3490, last: 4300 },
        ];
          
        setChartData(data);
      } catch (err: any) {
        console.error('Failed to fetch revenue comparison data', err);
        setError('Failed to load revenue data');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, [timeline]);

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-400 text-[12px] font-bold mt-4">Loading revenue data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col justify-center items-center h-full min-h-[400px]">
        <p className="text-red-500 text-[13px] font-black">{error}</p>
        <p className="text-gray-400 text-[12px] mt-1">Please try again later.</p>
      </div>
    );
  }

  const hasData = chartData.some(d => (d.current ?? 0) > 0 || (d.last ?? 0) > 0);

  if (!hasData) {
    return (
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col justify-center items-center h-full min-h-[400px]">
        <h3 className="text-[16px] font-black text-gray-900 tracking-tight mb-2">Revenue Trend</h3>
        <p className="text-gray-400 text-[12px] font-medium">No sales transactions found for this year or last year.</p>
      </div>
    );
  }

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
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
