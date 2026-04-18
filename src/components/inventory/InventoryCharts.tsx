import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid 
} from 'recharts';

interface InventoryChartsProps {
  data: any[];
}

export default function InventoryCharts({ data }: InventoryChartsProps) {
  
  // 1. Dynamic Pie Chart Data (Status Distribution)
  const statusCounts = data.reduce((acc: any, item: any) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = [
    { name: 'In stock', value: statusCounts['In Stock'] || 0, color: '#10b981' }, 
    { name: 'Out of stock', value: statusCounts['Out of Stock'] || 0, color: '#3b82f6' }, 
    { name: 'Low stock', value: statusCounts['Low Stock'] || 0, color: '#f59e0b' }, 
    { name: 'Expired', value: Math.floor(data.length * 0.05), color: '#ef4444' }, // Mocked 5%
  ];

  // Calculate percentages for labels
  const totalItems = pieData.reduce((sum, item) => sum + item.value, 0);
  const pieDataWithPct = pieData.map(item => ({
    ...item,
    pct: totalItems > 0 ? Math.round((item.value / totalItems) * 100) : 0
  }));

  // 2. Dynamic Bar Chart Data (Value by Category)
  const categoryValues = data.reduce((acc: any, item: any) => {
    const val = parseFloat(item.totalValue.replace('Rs. ', '').replace(/,/g, ''));
    acc[item.category] = (acc[item.category] || 0) + (isNaN(val) ? 0 : val);
    return acc;
  }, {});

  const barData = Object.entries(categoryValues)
    .map(([name, value]: [string, any]) => ({
      name,
      value: Math.floor(value / 1000), // In thousands for graph scaling
      color: name.includes('Steel') ? '#8b5cf6' : 
             name.includes('Cement') ? '#3b82f6' :
             name.includes('Electric') ? '#1e3a8a' :
             name.includes('Paint') ? '#e11d48' : '#d97706'
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Top 6 categories

  // 3. Mocked Movement Trend (Visual consistency)
  const lineData = [
    { name: '0', in: 100, out: 80 },
    { name: '5', in: 110, out: 95 },
    { name: '10', in: 145, out: 115 },
    { name: '15', in: 175, out: 135 },
    { name: '20', in: 220, out: 165 },
    { name: '25', in: 250, out: 195 },
    { name: '30', in: 280, out: 225 },
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const pct = pieDataWithPct[index].pct;

    if (pct < 5) return null; // Don't show small labels
  
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-black">
        {`${pct}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      
      {/* 1. Stock Level Distribution */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
        <h3 className="text-[15px] font-black text-gray-900 mb-1">Stock Level Distribution</h3>
        <p className="text-[12px] font-bold text-gray-400 mb-6">Products by stock status</p>
        
        <div className="flex-1 min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieDataWithPct}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={90}
                dataKey="value"
                stroke="none"
              >
                {pieDataWithPct.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="flex justify-center flex-wrap gap-4 mt-2">
          {pieData.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
              {item.name}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Stock Value by Category (Thousands) */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
        <h3 className="text-[15px] font-black text-gray-900 mb-1">Stock Value by Category</h3>
        <p className="text-[12px] font-bold text-gray-400 mb-6">Inventory value (Rs. '000)</p>
        
        <div className="flex-1 min-h-[220px] -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 0, left: 10, bottom: 40 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 'bold' }} 
                interval={0}
                angle={-45}
                textAnchor="end"
                dy={10}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9ca3af', fontWeight: 'bold' }} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Stock Movement Trend */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
        <h3 className="text-[15px] font-black text-gray-900 mb-1">Stock Movement Trend</h3>
        <p className="text-[12px] font-bold text-gray-400 mb-4">Last 30 days activity</p>

        {/* Custom Legend */}
        <div className="flex items-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-[11px] text-gray-600 font-bold">
            <div className="w-6 h-1 bg-emerald-500 rounded-full"></div>
            Purchases
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-600 font-bold">
            <div className="w-6 h-1 bg-blue-500 rounded-full"></div>
            Sales/Used
          </div>
        </div>
        
        <div className="flex-1 min-h-[200px] -ml-5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="in" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="out" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
