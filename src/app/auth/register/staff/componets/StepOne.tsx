import React from 'react'
import { StaffRegisterData } from '../page';

interface StepOneProps {
  data: StaffRegisterData;
  updateFields: (fields: Partial<StaffRegisterData>) => void;
  onNext: () => void;
}

const StepOne = ({ data, updateFields, onNext }: StepOneProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800">Step 1: Shop Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Shop ID</label>
          <input
            type="text"
            value={data.shopId}
            readOnly
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Shop Private ID</label>
          <input
            type="text"
            value={data.shopPrivateId}
            readOnly
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Shop Name Verification</label>
          <input
            type="text"
            value={data.shopNameVerification}
            readOnly
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}

export default StepOne