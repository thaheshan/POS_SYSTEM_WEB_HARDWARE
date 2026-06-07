import { ShieldCheck, Info } from 'lucide-react';


export default function RolesSettings() {
  const roles = [
    { name: 'Owner', desc: 'Full system access including billing', badge: 'Admin' },
    { name: 'Manager', desc: 'Manage inventory, staff, and view reports', badge: 'High' },
    { name: 'Cashier', desc: 'Access to POS terminal and basic receipts', badge: 'Standard' },
    { name: 'Store Keeper', desc: 'Inventory management and stock taking', badge: 'Standard' },
  ];

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f5f3ff]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-[12px] flex items-center justify-center border border-indigo-200">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900">Roles & Permissions</h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Control access levels and module authorizations for your staff
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-3 mb-8">
          <Info className="w-5 h-5 text-indigo-600 shrink-0" />
          <p className="text-[12px] font-bold text-indigo-900 leading-relaxed">
            By default, new staff are assigned the "Cashier" role. Changes to role permissions affect all users currently assigned to that role. Users must log out and log back in for changes to take effect.
          </p>
        </div>

        <h3 className="text-[16px] font-black text-gray-900 mb-4">System Roles</h3>
        
        <div className="space-y-4">
          {roles.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors cursor-pointer group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[14px] font-black text-gray-900">{r.name}</h4>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                    {r.badge}
                  </span>
                </div>
                <p className="text-[12px] font-bold text-gray-500">{r.desc}</p>
              </div>
              <button className="text-[12px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Edit Permissions →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
