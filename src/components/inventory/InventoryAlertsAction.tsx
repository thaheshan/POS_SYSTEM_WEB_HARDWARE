import { XCircle, AlertTriangle, CalendarX2, HelpCircle } from 'lucide-react';

export default function InventoryAlertsAction() {
  const alerts = [
    {
      id: 1,
      title: 'Out of Stock',
      description: '8 products require immediate action',
      linkText: 'Create Purchase Order →',
      linkUrl: '#',
      icon: <XCircle className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-100',
      bgColor: 'bg-blue-50',
      borderColor: 'border-l-[6px] border-l-blue-500 border-gray-100',
      linkColor: 'text-blue-600'
    },
    {
      id: 2,
      title: 'Low Stock Items',
      description: '23 products below minimum level',
      linkText: 'View All Low Stock →',
      linkUrl: '#',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      iconBg: 'bg-amber-100',
      bgColor: 'bg-amber-50',
      borderColor: 'border-l-[6px] border-l-amber-500 border-gray-100',
      linkColor: 'text-amber-500'
    },
    {
      id: 3,
      title: 'Items Expiring Soon',
      description: '12 items expiring within 30 days',
      linkText: 'Manage Expiry →',
      linkUrl: '#',
      icon: <CalendarX2 className="w-5 h-5 text-red-500" />,
      iconBg: 'bg-red-100',
      bgColor: 'bg-red-50',
      borderColor: 'border-l-[6px] border-l-red-500 border-gray-100',
      linkColor: 'text-red-500'
    },
    {
      id: 4,
      title: 'Slow Moving Items',
      description: '45 products with no sales in 30 days',
      linkText: 'View Slow Movers →',
      linkUrl: '#',
      icon: <HelpCircle className="w-5 h-5 text-teal-500" />,
      iconBg: 'bg-teal-100',
      bgColor: 'bg-teal-50',
      borderColor: 'border-l-[6px] border-l-teal-500 border-gray-100',
      linkColor: 'text-teal-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {alerts.map((alert) => (
        <div 
          key={alert.id} 
          className={`rounded-r-xl border-y border-r flex p-4 ${alert.bgColor} ${alert.borderColor}`}
        >
          <div className="mr-3">
            <div className={`p-2 rounded-full ${alert.iconBg}`}>
              {alert.icon}
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{alert.title}</h4>
            <p className="text-xs text-gray-500 mb-2">{alert.description}</p>
            <a href={alert.linkUrl} className={`text-xs font-semibold hover:underline ${alert.linkColor}`}>
              {alert.linkText}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
