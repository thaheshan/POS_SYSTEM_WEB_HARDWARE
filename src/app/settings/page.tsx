'use client';

import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { 
  Store,
  CreditCard,
  Receipt,
  Printer,
  ShieldCheck,
  Bell,
  Blocks,
  Database,
  Lock,
  Settings,
  ChevronRight
} from 'lucide-react';

const SETTING_MODULES = [
  { id: 'profile', label: 'Shop Profile', desc: 'Update your shop info, branding, and location details', icon: Store, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  { id: 'tax', label: 'Tax Configuration', desc: 'Configure IRD settings, VAT formats, and daily limits', icon: Receipt, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  { id: 'billing', label: 'Subscription & Billing', desc: 'Manage your plan, payment methods, and past invoices', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { id: 'printing', label: 'Printing & Receipts', desc: 'Setup POS thermal printers, receipt formats, and rules', icon: Printer, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  { id: 'roles', label: 'Roles & Permissions', desc: 'Control access levels and staff authorization grids', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  { id: 'security', label: 'Security', desc: 'Password policies, two-factor auth, and sessions tracker', icon: Lock, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  { id: 'backup', label: 'Backup & Data', desc: 'Configure automatic safe-backups and data exports', icon: Database, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
  { id: 'integrations', label: 'Integrations', desc: 'Connect third-party logistics and external CRM apps', icon: Blocks, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' },
  { id: 'notifications', label: 'Notifications', desc: 'Alert rules for low stock, urgent sales milestones, etc', icon: Bell, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  { id: 'system', label: 'System Preferences', desc: 'Timezones, locale settings, and units of measurement', icon: Settings, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
];

export default function SettingsHubPage() {
  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-24">
        
        {/* HEADER */}
        <div className="mb-10 text-center md:text-left">
           <h1 className="text-[32px] md:text-[38px] font-black text-gray-900 tracking-tighter leading-tight mb-2">Settings Hub</h1>
           <p className="text-[15px] font-medium text-gray-500 max-w-2xl">Manage your entire system infrastructure. Select a category below to configure your specific core application preferences.</p>
        </div>

        {/* SETTINGS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {SETTING_MODULES.map(mod => (
              <Link href="/settings/edit" key={mod.id} className="block group">
                 <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col relative overflow-hidden">
                    
                    {/* Hover Decoration */}
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${mod.bg} -mr-10 -mt-10`} />

                    <div className="flex items-start justify-between mb-6 relative">
                       <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center border ${mod.bg} ${mod.border}`}>
                          <mod.icon className={`w-6 h-6 ${mod.color}`} strokeWidth={2} />
                       </div>
                       <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white text-gray-300 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                       </div>
                    </div>
                    
                    <div className="relative mt-auto">
                       <h3 className="text-[18px] font-black tracking-tight text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{mod.label}</h3>
                       <p className="text-[13px] font-medium text-gray-500 leading-relaxed">{mod.desc}</p>
                    </div>
                 </div>
              </Link>
           ))}
        </div>

      </div>
    </MainLayout>
  );
}
