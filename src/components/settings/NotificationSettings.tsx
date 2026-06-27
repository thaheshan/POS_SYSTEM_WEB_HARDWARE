import { Bell, BellRing, Mail, Smartphone } from 'lucide-react';

export default function NotificationSettings() {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fff7ed]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-[12px] flex items-center justify-center border border-orange-200">
            <Bell className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900">Notification Rules</h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Configure system alerts for low stock, sales milestones, and approvals
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <h3 className="text-[16px] font-black text-gray-900 mb-4">Inventory Alerts</h3>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-4">
              <BellRing className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-[13px] font-black text-gray-900">Low Stock Warning</h4>
                <p className="text-[11px] font-bold text-gray-500">Trigger alert when any item falls below its minimum threshold.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500"><Mail className="w-3.5 h-3.5" /> Email</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>

        <h3 className="text-[16px] font-black text-gray-900 mb-4">Sales & Cash Drawer</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-4">
              <BellRing className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-[13px] font-black text-gray-900">End of Day Summary</h4>
                <p className="text-[11px] font-bold text-gray-500">Receive daily sales report when shift closes.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500"><Mail className="w-3.5 h-3.5" /> Email</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-4">
              <BellRing className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-[13px] font-black text-gray-900">Large Transaction Alert</h4>
                <p className="text-[11px] font-bold text-gray-500">Alert when a single sale exceeds Rs. 100,000</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500"><Smartphone className="w-3.5 h-3.5" /> App Push</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
