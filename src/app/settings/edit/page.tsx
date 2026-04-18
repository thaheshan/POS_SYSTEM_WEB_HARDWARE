'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState } from 'react';
import { 
  Search, 
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
  History,
  Check,
  Image as ImageIcon,
  Edit2,
  Info
} from 'lucide-react';
import Link from 'next/link';

const MENU_ITEMS = [
  { id: 'profile', label: 'Shop Profile', icon: Store },
  { id: 'billing', label: 'Subscription & Billing', icon: CreditCard },
  { id: 'tax', label: 'Tax Configuration', icon: Receipt },
  { id: 'printing', label: 'Printing & Receipts', icon: Printer },
  { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: Blocks },
  { id: 'backup', label: 'Backup & Data', icon: Database },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'system', label: 'System Preferences', icon: Settings },
];

export default function EditSettingsPage() {
  const [activeMenu, setActiveMenu] = useState('profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-24 relative">
        
        {/* HEADER & TOP ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <Link href="/settings" className="text-[13px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest">← Back to Hub</Link>
              </div>
              <h1 className="text-[28px] md:text-[32px] font-black text-gray-900 tracking-tighter leading-tight">Edit Settings</h1>
              <p className="text-[14px] font-medium text-gray-500 tracking-wide mt-1">Manage shop configuration, billing, integrations, and system preferences</p>
           </div>
           <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 border border-gray-200 px-4 py-2.5 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors bg-white shadow-sm">
                 <History className="w-4 h-4" /> Activity Log
              </button>
              <button className="flex items-center gap-2 bg-[#1e40af] hover:bg-blue-800 text-white px-6 py-2.5 rounded-[12px] text-[13px] font-black transition-colors shadow-sm shadow-blue-200">
                 <Check className="w-4 h-4" /> Save Changes
              </button>
           </div>
        </div>

        {/* SPLIT LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-8">
           
           {/* LEFT SIDEBAR navigation inside page */}
           <div className="w-full lg:w-[280px] shrink-0">
              <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-4 sticky top-6">
                 
                 <div className="relative mb-6">
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search settings..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400"
                    />
                 </div>

                 <nav className="space-y-1">
                    {MENU_ITEMS.map(item => (
                       <button
                         key={item.id}
                         onClick={() => setActiveMenu(item.id)}
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[13px] font-bold transition-all ${
                            activeMenu === item.id 
                            ? 'bg-[#eff6ff] text-[#1e40af]' 
                            : 'text-gray-600 hover:bg-gray-50'
                         }`}
                       >
                          <item.icon className="w-4 h-4 shrink-0" />
                          {item.label}
                       </button>
                    ))}
                 </nav>
              </div>
           </div>

           {/* MAIN CONTENT AREA */}
           <div className="flex-1 space-y-6">
              
              {/* Card 1: Shop Profile */}
              <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                 
                 {/* Card Header */}
                 <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-blue-50 rounded-[12px] flex items-center justify-center border border-blue-100">
                          <Store className="w-6 h-6 text-blue-600" />
                       </div>
                       <div>
                          <h2 className="text-[18px] font-black tracking-tight text-gray-900">Shop Profile</h2>
                          <p className="text-[12px] font-bold text-gray-400 mt-0.5">Update your shop information, branding, and business details</p>
                       </div>
                    </div>
                    <button className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-[10px] text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                       <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                 </div>

                 <div className="p-8">
                    {/* Logo Section */}
                    <div className="bg-gray-50 rounded-[20px] p-6 mb-8 border border-gray-100 flex items-center gap-6">
                       <div className="w-24 h-24 bg-white border border-gray-200 rounded-[16px] flex items-center justify-center shadow-sm shrink-0">
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                       </div>
                       <div>
                          <h4 className="text-[14px] font-bold text-gray-900">Shop Logo</h4>
                          <p className="text-[11px] font-medium text-gray-400 mt-1 mb-4">Recommended: 200x200px PNG or JPG, max 2MB</p>
                          <div className="flex gap-3">
                             <button className="bg-[#1e40af] text-white px-4 py-2 rounded-lg text-[12px] font-bold transition-colors">Upload New Logo</button>
                             <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-[12px] font-bold hover:bg-gray-50 transition-colors">Remove</button>
                          </div>
                       </div>
                    </div>

                    {/* Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                       <div className="space-y-2">
                          <label className="text-[12px] font-black text-gray-700">Shop Name <span className="text-red-500">*</span></label>
                          <input type="text" defaultValue="ABC Hardware Store" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[12px] font-black text-gray-700">Business Registration No. <span className="text-red-500">*</span></label>
                          <input type="text" defaultValue="BR-2024-001234" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[12px] font-black text-gray-700">Business Phone <span className="text-red-500">*</span></label>
                          <input type="text" defaultValue="+94 11 234 5678" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[12px] font-black text-gray-700">Business Email <span className="text-red-500">*</span></label>
                          <input type="email" defaultValue="info@abchardware.lk" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors" />
                       </div>
                    </div>

                    <div className="space-y-2 mb-6">
                       <label className="text-[12px] font-black text-gray-700">Shop Address <span className="text-red-500">*</span></label>
                       <input type="text" defaultValue="123 Galle Road, Dehiwala" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-2">
                          <label className="text-[12px] font-black text-gray-700">City</label>
                          <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors">
                             <option>Dehiwala</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[12px] font-black text-gray-700">District</label>
                          <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors">
                             <option>Colombo</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[12px] font-black text-gray-700">Province</label>
                          <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors">
                             <option>Western</option>
                          </select>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Card 2: Tax Configuration */}
              <div id="tax-config" className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                 
                 <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fafafa]">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-purple-100 rounded-[12px] flex items-center justify-center border border-purple-200">
                          <Receipt className="w-6 h-6 text-purple-600" />
                       </div>
                       <div>
                          <h2 className="text-[18px] font-black tracking-tight text-gray-900">Tax Configuration (Sri Lanka)</h2>
                          <p className="text-[12px] font-bold text-gray-400 mt-0.5">Configure IRD tax settings, VAT rate, and daily threshold amounts</p>
                       </div>
                    </div>
                    <span className="bg-[#ecfdf5] text-[#059669] border border-green-200 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                       <ShieldCheck className="w-3.5 h-3.5" /> IRD Compliant
                    </span>
                 </div>

                 <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* VAT Rate Block */}
                    <div className="bg-gray-50 rounded-[20px] p-6 border border-gray-100 relative">
                       <button className="absolute top-6 right-6 text-gray-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                       <p className="text-[12px] font-black text-gray-600 mb-1">VAT Rate</p>
                       <h3 className="text-[42px] font-black tracking-tighter text-[#1e40af] leading-none mb-2">18%</h3>
                       <p className="text-[11px] font-bold text-gray-400 mb-6">Standard Sri Lanka VAT rate per IRD guidelines</p>
                       
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-gray-600">Update VAT Rate (%)</label>
                          <input type="text" defaultValue="18" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[14px] font-black outline-none focus:border-blue-500 transition-colors font-mono" />
                       </div>
                    </div>

                    {/* Tax Threshold Block */}
                    <div className="bg-[#eff6ff] rounded-[20px] p-6 border border-blue-100 relative">
                       <button className="absolute top-6 right-6 text-blue-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                       <p className="text-[12px] font-black text-blue-800 mb-1">Daily Tax Threshold</p>
                       <h3 className="text-[36px] font-black tracking-tighter text-[#2563eb] leading-none mb-2 mt-2">Rs. 2,00,000</h3>
                       <p className="text-[11px] font-bold text-blue-600 mb-6">Sales above this amount per day move to Category B</p>
                       
                       <div className="bg-blue-100/50 rounded-xl p-3 flex items-start gap-3 border border-blue-200">
                          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] font-bold text-blue-800 leading-tight">Regulated by IRD Sri Lanka. Change requires IRD authorization.</p>
                       </div>
                    </div>

                    {/* TIN Input */}
                    <div className="bg-gray-50 rounded-[20px] p-6 border border-gray-100">
                       <p className="text-[12px] font-black text-gray-600 mb-1">Tax Identification Number (TIN)</p>
                       <h4 className="text-[18px] font-black text-gray-900 tracking-wider mb-6">TAX-ABC-123456</h4>
                       
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-gray-600">Update TIN Number</label>
                          <input type="text" defaultValue="TAX-ABC-123456" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors uppercase font-mono" />
                       </div>
                    </div>

                    {/* VAT Reg Input */}
                    <div className="bg-gray-50 rounded-[20px] p-6 border border-gray-100">
                       <p className="text-[12px] font-black text-gray-600 mb-1">VAT Registration Number</p>
                       <h4 className="text-[18px] font-black text-gray-900 tracking-wider mb-6">VAT-LK-987654</h4>
                       
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-gray-600">Update VAT Number</label>
                          <input type="text" defaultValue="VAT-LK-987654" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors uppercase font-mono" />
                       </div>
                    </div>

                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* FIXED BOTTOM ACTION BAR */}
      {hasUnsavedChanges && (
         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 ml-0 md:ml-[130px] z-40 bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border-2 border-orange-200 py-4 px-6 md:px-8 w-[90%] md:w-auto max-w-[800px] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
               <span className="text-[13px] font-black text-gray-900">You have unsaved changes</span>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
               <button onClick={() => setHasUnsavedChanges(false)} className="flex-1 md:flex-none border border-gray-200 px-6 py-3 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors bg-white">
                  Discard Changes
               </button>
               <button onClick={() => setHasUnsavedChanges(false)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-blue-800 text-white px-8 py-3 rounded-[12px] text-[13px] font-black transition-colors shadow-sm">
                  <Check className="w-4 h-4" /> Save All Changes
               </button>
            </div>
         </div>
      )}

    </MainLayout>
  );
}
