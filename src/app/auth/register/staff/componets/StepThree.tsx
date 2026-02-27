import React from 'react'

const StepThree = ({ data }: { data: any }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800">Step 3: Confirm Details</h2>
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <p className="text-sm text-slate-600 mb-1">Shop ID:</p>
        <p className="font-medium">{data.shopId}</p>
        <p className="text-sm text-slate-600 mb-1 mt-3">Full Name:</p>
        <p className="font-medium">{data.fullName}</p>
        <p className="text-sm text-slate-600 mb-1 mt-3">Email:</p>
        <p className="font-medium">{data.email}</p>
        <p className="text-sm text-slate-600 mb-1 mt-3">Phone Number:</p>
        <p className="font-medium">{data.phoneNumber}</p>
        <p className="text-sm text-slate-600 mb-1 mt-3">Role:</p>
        <p className="font-medium">{data.role}</p>
      </div>
    </div>
  )
}

export default StepThree