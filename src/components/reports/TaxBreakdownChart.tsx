'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function TaxBreakdownChart() {
  const data = [
    { name: 'Category A', value: 2839824, color: '#2563eb' },
    { name: 'Category B', value: 1335012, color: '#059669' },
    { name: 'Category C', value: 697614, color: '#dc2626' },
  ];

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col h-full min-h-[400px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[16px] font-black text-gray-900 tracking-tight">Tax Category Breakdown</h3>
          <p className="text-[12px] font-medium text-gray-400 mt-1">Category A, B, C revenue distribution this month</p>
        </div>
        <div className="bg-[#f3e8ff] px-3 py-1.5 rounded-lg">
          <span className="text-[10px] font-black text-[#9333ea] uppercase tracking-widest">IRD View</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-14">
        <div className="w-[200px] h-[200px] relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(val: any) => `Rs. ${val?.toLocaleString()}`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '13px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
            <span className="text-[18px] font-black text-gray-900 tracking-tight">Rs. 4.87M</span>
            <span className="text-[11px] font-bold text-gray-400">Total</span>
          </div>
        </div>

        <div className="flex flex-col gap-5 w-full max-w-[220px]">
          <div className="flex items-start gap-4">
            <div className="w-1.5 h-10 bg-[#2563eb] rounded-full shrink-0" />
            <div>
              <p className="text-[12px] font-black text-gray-900 leading-tight mb-1">Category A<br/>(Taxable)</p>
              <p className="text-[11px] font-bold text-[#2563eb]">Rs. 2,839,824 (58.2%)</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-1.5 h-10 bg-[#059669] rounded-full shrink-0" />
            <div>
              <p className="text-[12px] font-black text-gray-900 leading-tight mb-1">Category B (Non-<br/>Tax)</p>
              <p className="text-[11px] font-bold text-[#059669]">Rs. 1,335,012 (27.4%)</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-1.5 h-10 bg-[#dc2626] rounded-full shrink-0" />
            <div>
              <p className="text-[12px] font-black text-gray-900 leading-tight mb-1">Category C<br/>(Labour)</p>
              <p className="text-[11px] font-bold text-[#dc2626]">Rs. 697,614 (14.4%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
