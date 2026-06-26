import React from 'react';
import { StaffReportData } from '@/types/report';

interface StaffReportTableProps {
  data: StaffReportData;
}

export default function StaffReportTable({ data }: StaffReportTableProps) {
  return (
    <div className="w-full mt-2 flex-grow">
      
      {/* 1. Sub-Header: Staff Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 print:mb-4">
        <div className="border border-slate-200 p-3 rounded bg-slate-50 print:bg-white print:border-slate-300 text-center">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Staff Members</h3>
          <p className="text-lg font-bold text-slate-900">{data.summary.totalStaff}</p>
        </div>
        <div className="border border-slate-200 p-3 rounded bg-slate-50 print:bg-white print:border-slate-300 text-center">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active / On Duty</h3>
          <p className="text-lg font-bold text-emerald-700">{data.summary.activeStaff}</p>
        </div>
        <div className="border border-slate-200 p-3 rounded bg-slate-50 print:bg-white print:border-slate-300 text-center">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Currently On Leave</h3>
          <p className="text-lg font-bold text-amber-600">{data.summary.onLeave}</p>
        </div>
      </div>

      {/* 2. Staff Directory Table */}
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-800 text-slate-800 uppercase tracking-wider text-[11px]">
            <th className="py-2 px-3 font-bold">Staff ID</th>
            <th className="py-2 px-3 font-bold">Name</th>
            <th className="py-2 px-3 font-bold">Role</th>
            <th className="py-2 px-3 font-bold">Contact Info</th>
            <th className="py-2 px-3 font-bold">Joined Date</th>
            <th className="py-2 px-3 font-bold text-center">Status</th>
          </tr>
        </thead>
        <tbody className="text-slate-700 text-xs">
          {data.items.map((item, index) => (
            <tr 
              key={item.staffId} 
              className={`border-b border-slate-200 break-inside-avoid ${
                index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              }`}
            >
              <td className="py-2 px-3 font-mono text-[10px] font-bold text-slate-900">{item.staffId}</td>
              <td className="py-2 px-3 font-medium text-slate-900">{item.staffName}</td>
              <td className="py-2 px-3 font-medium text-indigo-700">{item.role}</td>
              <td className="py-2 px-3">
                <div className="flex flex-col space-y-0.5">
                  <span>{item.contactNumber}</span>
                  <span className="text-[10px] text-slate-500">{item.email}</span>
                </div>
              </td>
              <td className="py-2 px-3 text-[11px]">{item.registrationDate}</td>
              <td className="py-2 px-3 text-center">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider print:border ${
                  item.status === 'Active' ? 'bg-emerald-100 text-emerald-800 print:border-emerald-800' :
                  item.status === 'On Leave' ? 'bg-amber-100 text-amber-800 print:border-amber-800' :
                  'bg-slate-200 text-slate-600 print:border-slate-400'
                }`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
