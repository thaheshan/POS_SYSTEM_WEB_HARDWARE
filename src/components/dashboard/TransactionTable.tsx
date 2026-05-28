'use client';

import { cn } from '@/lib/utils';
import { useRecentTransactions } from '@/hooks/useDashboard';
import { format } from 'date-fns';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

export default function TransactionTable() {
  const { transactions: allTx, loading, refresh } = useRecentTransactions();
  const transactions = allTx.slice(0, 6);

  const getStatusStyle = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'PAID' || s === 'COMPLETED') return 'text-green-700 bg-green-50 border border-green-100';
    if (s === 'PARTIAL') return 'text-blue-600 bg-blue-50 border border-blue-100';
    if (s === 'UNPAID' || s === 'PENDING') return 'text-amber-600 bg-amber-50 border border-amber-100';
    return 'text-gray-600 bg-gray-50 border border-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'COMPLETED') return 'Paid';
    return s?.charAt(0) + s?.slice(1).toLowerCase();
  };

  return (
    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex-1 min-h-[450px] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Recent Transactions</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/sales" className="text-[14px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
            View All
          </Link>
        </div>
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
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="group hover:bg-gray-50/50 transition-colors duration-200">
                  <td className="py-5 pl-2"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
                  <td className="py-5">
                    <div className="flex items-center gap-3 justify-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </td>
                  <td className="py-5 text-center"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div></td>
                  <td className="py-5 text-center"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div></td>
                  <td className="py-5 text-right pr-2"><div className="h-6 w-16 bg-gray-200 rounded animate-pulse ml-auto"></div></td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <RefreshCw className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-[14px] font-semibold text-gray-500">No transactions yet</p>
                    <p className="text-[12px] text-gray-400">Complete a sale in the POS to see it here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-gray-50/50 transition-colors duration-200">
                  <td className="py-5 text-[14px] font-bold text-gray-900 tracking-tight pl-2">{tx.invoiceNumber}</td>
                  <td className="py-5">
                    <div className="flex items-center gap-3 justify-center">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tx.customerName}`}
                        alt={tx.customerName || 'Walk-in'}
                        className="w-8 h-8 rounded-full bg-gray-100 object-cover"
                      />
                      <span className="text-[14px] font-medium text-[#334155]">{tx.customerName}</span>
                    </div>
                  </td>
                  <td className="py-5 text-[14px] font-medium text-[#64748b] text-center">
                    {tx.date ? format(new Date(tx.date), 'MMM dd, yyyy') : '—'}
                  </td>
                  <td className="py-5 text-[14px] font-bold text-gray-900 text-center">
                    LKR {tx.amount.toLocaleString()}
                  </td>
                  <td className="py-5 text-right pr-2">
                    <span className={cn('px-2.5 py-1 rounded-lg text-[12px] font-semibold inline-block', getStatusStyle(tx.status))}>
                      {getStatusLabel(tx.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

