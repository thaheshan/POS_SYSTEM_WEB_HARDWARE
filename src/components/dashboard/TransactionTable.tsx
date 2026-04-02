'use client';

import { cn } from '@/lib/utils';

const transactions = [
  { id: '#INV-2024-1245', customer: 'Anil Perera', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anil', date: 'Jan 16, 2026', amount: 'LKR 12,450', status: 'Paid' },
  { id: '#INV-2024-1244', customer: 'Sunil Fernando', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunil', date: 'Jan 16, 2026', amount: 'LKR 8,920', status: 'Paid' },
  { id: '#INV-2024-1243', customer: 'Nimal Silva', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nimal', date: 'Jan 15, 2026', amount: 'LKR 15,680', status: 'Pending' },
  { id: '#INV-2024-1242', customer: 'Kamal Rajapaksa', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kamal', date: 'Jan 15, 2026', amount: 'LKR 6,340', status: 'Paid' },
];

export default function TransactionTable() {
  return (
    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex-1 min-h-[450px] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Recent Transactions</h3>
        <button className="text-[14px] font-bold text-blue-600 hover:text-blue-700 transition-colors">View All</button>
      </div>

      <div className="overflow-x-auto flex-1 h-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[13px] font-bold text-[#64748b] border-b border-gray-100">
              <th className="pb-4 pt-2 font-semibold">Invoice</th>
              <th className="pb-4 pt-2 font-semibold text-center">Customer</th>
              <th className="pb-4 pt-2 font-semibold text-center">Date</th>
              <th className="pb-4 pt-2 font-semibold text-center">Amount</th>
              <th className="pb-4 pt-2 font-semibold text-right pr-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="group hover:bg-gray-50/50 transition-colors duration-200">
                <td className="py-5 text-[14px] font-bold text-gray-900 tracking-tight pl-2">{tx.id}</td>
                <td className="py-5">
                  <div className="flex items-center gap-3 justify-center">
                    <img src={tx.avatar} alt={tx.customer} className="w-8 h-8 rounded-full bg-gray-100 object-cover" />
                    <span className="text-[14px] font-medium text-[#334155]">{tx.customer}</span>
                  </div>
                </td>
                <td className="py-5 text-[14px] font-medium text-[#64748b] text-center">{tx.date}</td>
                <td className="py-5 text-[14px] font-bold text-gray-900 text-center">{tx.amount}</td>
                <td className="py-5 text-right pr-2">
                  <span className={cn(
                    "px-2.5 py-1 rounded text-[12px] font-semibold inline-block",
                    tx.status === 'Paid' 
                      ? "text-[#16a34a]" 
                      : "text-[#b45309]"
                  )}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
