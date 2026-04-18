import { Package, DollarSign, AlertTriangle, XCircle, CalendarX2, TrendingUp, TrendingDown, ArrowUp } from 'lucide-react';

interface InventoryKPICardsProps {
  data: any[];
}

export default function InventoryKPICards({ data }: InventoryKPICardsProps) {
  // Dynamic Calculations
  const totalSKUs = data.length;
  
  const totalValue = data.reduce((acc, item) => {
    const val = parseFloat(item.totalValue.replace('Rs. ', '').replace(/,/g, ''));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const lowStockCount = data.filter(item => item.status === 'Low Stock').length;
  const outOfStockCount = data.filter(item => item.status === 'Out of Stock').length;
  
  const highValueItems = data.filter(item => {
    const cost = parseFloat(item.unitCost.replace('Rs. ', '').replace(/,/g, ''));
    return cost > 5000; // Rs. 5,000 threshold for "High Value" in this context
  }).length;

  // Mocked some trends for visual consistency
  const kpiData = [
    {
      title: 'Total SKUs',
      value: totalSKUs.toLocaleString(),
      icon: <Package className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-100/50',
      trend: { value: '14%', isPositive: true },
      subtext: 'Active catalog',
      subtextClass: 'text-emerald-500',
    },
    {
      title: 'Total Stock Value',
      value: `Rs. ${(totalValue / 1000000).toFixed(1)}M`,
      icon: <DollarSign className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-100/50',
      trend: null,
      subtext: `Total: Rs. ${totalValue.toLocaleString()}`,
      subtextClass: 'text-amber-600',
    },
    {
      title: 'Low Stock Items',
      value: lowStockCount.toString(),
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
      iconBg: 'bg-yellow-100/50',
      trend: lowStockCount > 5 ? { value: 'Action', isPositive: false } : null,
      subtext: 'Below minimum level',
      subtextClass: 'text-amber-500',
    },
    {
      title: 'Expired Products',
      value: Math.floor(totalSKUs * 0.05).toString(), // Mocked as 5% for now
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      iconBg: 'bg-red-100/50',
      trend: { value: 'Alert', isPositive: false },
      subtext: 'Requires action',
      subtextClass: 'text-red-500',
    },
    {
      title: 'Out of Stock',
      value: outOfStockCount.toString(),
      icon: <CalendarX2 className="w-5 h-5 text-blue-500" />,
      iconBg: 'bg-blue-100/50',
      trend: outOfStockCount > 0 ? { value: 'Critical', isPositive: false } : null,
      subtext: '0 qty available',
      subtextClass: 'text-blue-500',
    },
    {
      title: 'High-Value Items',
      value: highValueItems.toString(),
      icon: <TrendingUp className="w-5 h-5 text-fuchsia-600" />,
      iconBg: 'bg-fuchsia-100/50',
      trend: { value: 'Premium', isPositive: true },
      subtext: 'Above Rs. 5,000',
      subtextClass: 'text-pink-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpiData.map((kpi, index) => (
        <div key={index} className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.iconBg}`}>
              {kpi.icon}
            </div>
            {kpi.trend && (
              <span className={`text-[12px] font-bold flex items-center gap-1 ${kpi.trend.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {kpi.trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.trend.value}
              </span>
            )}
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-400 mb-1">{kpi.title}</p>
            <h3 className="text-[22px] font-black text-gray-900 mb-0.5 leading-tight">{kpi.value}</h3>
            <p className={`text-[11px] font-bold leading-tight ${kpi.subtextClass}`}>{kpi.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
