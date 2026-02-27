import React from 'react'

const StepTwo = ({ data, updateFields, onNext, onBack }: any) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800">Step 2: Staff Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => updateFields({ fullName: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => updateFields({ email: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={data.phoneNumber}
            onChange={(e) => updateFields({ phoneNumber: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
          <select
            value={data.role}
            onChange={(e) => updateFields({ role: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-300 transition-colors duration-[.1s]"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!data.fullName || !data.email || !data.phoneNumber || !data.role}
            className={`px-4 py-2 rounded-md transition-colors duration-[.1s] ${
              !data.fullName || !data.email || !data.phoneNumber || !data.role
                ? "bg-slate-300 cursor-notallowed"
                : "bg-blue-600 hover:bg-blue-hover text-white"
            }`}
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  )
}

export default StepTwo