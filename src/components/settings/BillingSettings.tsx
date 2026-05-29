import { CreditCard, Edit2, Download } from 'lucide-react';

interface Props {
  setHasUnsavedChanges: (val: boolean) => void;
}

export default function BillingSettings({ setHasUnsavedChanges }: Props) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-[12px] flex items-center justify-center border border-emerald-100">
            <CreditCard className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900">Subscription & Billing</h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Manage your current plan, payment methods, and invoices
            </p>
          </div>
        </div>
        <span className="bg-[#eff6ff] text-[#1e40af] border border-blue-200 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest">
          Active Plan
        </span>
      </div>

      <div className="p-8">
        <div className="bg-[#ecfdf5] rounded-[20px] p-6 border border-emerald-100 relative mb-8">
          <button className="absolute top-6 right-6 text-emerald-600 font-bold text-[12px] hover:underline">
            Upgrade Plan
          </button>
          <p className="text-[12px] font-black text-emerald-800 mb-1">Current Plan</p>
          <h3 className="text-[32px] font-black tracking-tight text-emerald-600 leading-none mb-2 mt-2">Professional</h3>
          <p className="text-[12px] font-bold text-emerald-700 mb-6">Rs. 15,000 / month • Next billing date: Jun 1, 2026</p>
          
          <div className="flex gap-4">
            <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-[13px] font-black transition-colors hover:bg-emerald-700">
              Manage Subscription
            </button>
            <button className="bg-white border border-emerald-200 text-emerald-700 px-5 py-2.5 rounded-lg text-[13px] font-black hover:bg-emerald-50 transition-colors">
              Cancel Plan
            </button>
          </div>
        </div>

        <h3 className="text-[16px] font-black text-gray-900 mb-4">Payment Methods</h3>
        <div className="bg-gray-50 rounded-[20px] p-6 mb-8 border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-10 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm font-black text-[12px] text-blue-800 italic">
              VISA
            </div>
            <div>
              <p className="text-[14px] font-black text-gray-900">•••• •••• •••• 4242</p>
              <p className="text-[11px] font-bold text-gray-500">Expires 12/28</p>
            </div>
          </div>
          <button className="text-[12px] font-bold text-blue-600 hover:underline">Edit Method</button>
        </div>

        <h3 className="text-[16px] font-black text-gray-900 mb-4">Recent Invoices</h3>
        <div className="border border-gray-100 rounded-[20px] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="py-3 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="py-3 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 px-6 text-[13px] font-bold text-gray-900">May 1, 2026</td>
                <td className="py-4 px-6 text-[13px] font-bold text-gray-900">Rs. 15,000</td>
                <td className="py-4 px-6"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black uppercase">Paid</span></td>
                <td className="py-4 px-6 text-right">
                  <button className="text-gray-400 hover:text-blue-600"><Download className="w-4 h-4 ml-auto" /></button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="py-4 px-6 text-[13px] font-bold text-gray-900">Apr 1, 2026</td>
                <td className="py-4 px-6 text-[13px] font-bold text-gray-900">Rs. 15,000</td>
                <td className="py-4 px-6"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black uppercase">Paid</span></td>
                <td className="py-4 px-6 text-right">
                  <button className="text-gray-400 hover:text-blue-600"><Download className="w-4 h-4 ml-auto" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
