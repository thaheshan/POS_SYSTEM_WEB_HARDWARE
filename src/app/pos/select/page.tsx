'use client';

import MainLayout from '@/components/layout/MainLayout';
import { 
  ShoppingCart, 
  RotateCcw, 
  FileText, 
  CreditCard, 
  Package, 
  PauseCircle, 
  ArrowLeftRight, 
  Archive,
  ArrowLeft,
  Check
} from 'lucide-react';
import Link from 'next/link';

const actions = [
  {
    title: 'New Sale Transaction',
    description: 'Process a new customer purchase with products selection and payment',
    icon: ShoppingCart,
    color: 'emerald',
    badge: 'Most Used',
    features: [
      'Product search & selection',
      'Quantity & discounts',
      'Multiple payment methods',
      'Receipt generation'
    ],
    buttonText: 'Start New Sale',
    shortcut: 'F2',
    href: '/pos'
  },
  {
    title: 'Process Return',
    description: 'Handle customer returns and refunds for previous purchases',
    icon: RotateCcw,
    color: 'rose',
    badge: 'Today 3 returns',
    features: [
      'Invoice lookup',
      'Item selection',
      'Refund calculation',
      'Return receipt'
    ],
    buttonText: 'New Return',
    shortcut: 'F4'
  },
  {
    title: 'Create Quotation',
    description: 'Generate price quotes for potential customers and bulk orders',
    icon: FileText,
    color: 'cyan',
    badge: '2 pending',
    features: [
      'Custom item list',
      'Bulk pricing',
      'Valid until date',
      'Email/SMS option'
    ],
    buttonText: 'New Quotation',
    shortcut: 'F5'
  },
  {
    title: 'Customer Credit Sales',
    description: 'Process sales on customer credit with terms and limits',
    icon: CreditCard,
    color: 'teal',
    badge: 'Today 8 sales',
    features: [
      'Credit limit check',
      'Payment terms',
      'Interest calculation',
      'Invoice generation'
    ],
    buttonText: 'Credit Sale'
  },
  {
    title: 'Bulk/Wholesale Sale',
    description: 'Process large orders with bulk pricing and special discounts',
    icon: Package,
    color: 'orange',
    badge: 'Today Rs. 85,000',
    features: [
      'Bulk discounts',
      'Quantity pricing',
      'Special terms',
      'Custom invoice'
    ],
    buttonText: 'Bulk Sale'
  },
  {
    title: 'Hold & Resume Sale',
    description: 'Temporarily hold sales transactions to resume later',
    icon: PauseCircle,
    color: 'violet',
    badge: 'Hold 5 sales',
    features: [
      'Save cart items',
      'Customer reference',
      'Resume anytime',
      'Auto-backup'
    ],
    buttonText: 'View Held Sales'
  },
  {
    title: 'Item Exchange',
    description: 'Exchange items from previous purchases without full refund',
    icon: ArrowLeftRight,
    color: 'pink',
    badge: 'Today 2 exchanges',
    features: [
      'Original invoice search',
      'Item comparison',
      'Price adjustment',
      'Exchange receipt'
    ],
    buttonText: 'New Exchange'
  },
  {
    title: 'Layaway/Backorder',
    description: 'Manage items kept on hold with partial or full payment',
    icon: Archive,
    color: 'emerald-light',
    badge: '12 active',
    features: [
      'Payment schedule',
      'Hold duration',
      'Deposit tracking',
      'Customer reminders'
    ],
    buttonText: 'Manage Layaway'
  }
];

const colorMap = {
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', iconBg: 'bg-emerald-50', button: 'bg-[#059669] hover:bg-emerald-700', check: 'text-emerald-500' },
  rose: { bg: 'bg-rose-50', icon: 'text-rose-500', iconBg: 'bg-rose-50', button: 'bg-[#e11d48] hover:bg-rose-700', check: 'text-rose-500' },
  cyan: { bg: 'bg-cyan-50', icon: 'text-cyan-500', iconBg: 'bg-cyan-50', button: 'bg-[#0891b2] hover:bg-cyan-700', check: 'text-cyan-500' },
  teal: { bg: 'bg-emerald-50', icon: 'text-emerald-600', iconBg: 'bg-emerald-50', button: 'bg-[#047857] hover:bg-emerald-800', check: 'text-emerald-600' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-500', iconBg: 'bg-orange-50', button: 'bg-[#d97706] hover:bg-orange-600', check: 'text-orange-500' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-500', iconBg: 'bg-violet-50', button: 'bg-[#7c3aed] hover:bg-violet-700', check: 'text-violet-500' },
  pink: { bg: 'bg-pink-50', icon: 'text-pink-500', iconBg: 'bg-pink-50', button: 'bg-[#db2777] hover:bg-pink-700', check: 'text-pink-500' },
  'emerald-light': { bg: 'bg-emerald-50', icon: 'text-emerald-400', iconBg: 'bg-emerald-50', button: 'bg-[#10b981] hover:bg-emerald-600', check: 'text-emerald-400' },
};

export default function POSSelectionPage() {
  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Back Button Area */}
        <div className="mb-8">
           <Link href="/sales" className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
           </Link>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 pb-20">
          {actions.map((action, idx) => {
            const colors = colorMap[action.color as keyof typeof colorMap];
            const CardWrapper = action.href ? Link : 'div';
            
            return (
              <div key={idx} className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 flex flex-col relative group transition-all hover:shadow-xl hover:-translate-y-1">
                 
                 {/* Card Header Info */}
                 <div className="flex justify-between items-start mb-8">
                    <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center`}>
                       <action.icon className={`w-7 h-7 ${colors.icon}`} strokeWidth={2.5} />
                    </div>
                    <div className="text-right">
                       <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{action.badge?.split(' ')[0]}</span>
                       <div className="text-[13px] font-black text-gray-900 mt-1">{action.badge}</div>
                    </div>
                 </div>

                 {/* Title & Description */}
                 <div className="mb-8">
                    <h3 className="text-[22px] font-black text-gray-900 tracking-tight mb-3">{action.title}</h3>
                    <p className="text-[14.5px] font-medium text-gray-400 leading-relaxed max-w-[340px]">
                       {action.description}
                    </p>
                 </div>

                 {/* Feature Checklist */}
                 <div className="space-y-3 mb-10">
                    {action.features.map((feature, fIdx) => (
                       <div key={fIdx} className="flex items-center gap-3">
                          <div className={`shrink-0 w-5 h-5 rounded-full bg-transparent flex items-center justify-center`}>
                             <Check className={`w-4 h-4 ${colors.check}`} strokeWidth={4} />
                          </div>
                          <span className="text-[14px] font-bold text-gray-600">{feature}</span>
                       </div>
                    ))}
                 </div>

                 {/* Action Button */}
                 <div className="mt-auto flex justify-center">
                    {action.href ? (
                      <Link 
                        href={action.href}
                        className={`${colors.button} text-white px-10 py-3.5 rounded-xl font-black text-[15px] tracking-tight shadow-lg shadow-black/5 flex items-center gap-3 transition-all active:scale-95`}
                      >
                         {action.buttonText}
                         {action.shortcut && <span className="text-[11px] font-bold opacity-60 tracking-widest uppercase">{action.shortcut}</span>}
                      </Link>
                    ) : (
                      <button 
                        className={`${colors.button} text-white px-10 py-3.5 rounded-xl font-black text-[15px] tracking-tight shadow-lg shadow-black/5 flex items-center gap-3 transition-all active:scale-95`}
                      >
                         {action.buttonText}
                         {action.shortcut && <span className="text-[11px] font-bold opacity-60 tracking-widest uppercase">{action.shortcut}</span>}
                      </button>
                    )}
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
