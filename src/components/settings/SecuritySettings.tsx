import { Lock, Smartphone, Key } from 'lucide-react';

interface Props {
  setHasUnsavedChanges: (val: boolean) => void;
}

export default function SecuritySettings({ setHasUnsavedChanges }: Props) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fef2f2]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-[12px] flex items-center justify-center border border-red-200">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900">Security Configuration</h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Manage password policies, two-factor authentication, and sessions
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <h3 className="text-[16px] font-black text-gray-900 mb-4">Authentication</h3>
        
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 mb-8 flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h4 className="text-[14px] font-black text-gray-900 mb-1">Two-Factor Authentication (2FA)</h4>
              <p className="text-[12px] font-bold text-gray-500 mb-3 max-w-lg">
                Require all staff with "Manager" and "Owner" roles to use an authenticator app when logging in.
              </p>
              <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                Currently Disabled
              </span>
            </div>
          </div>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-[12px] font-bold hover:bg-gray-100 transition-colors">
            Enable 2FA
          </button>
        </div>

        <h3 className="text-[16px] font-black text-gray-900 mb-4">Password Policy</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-gray-400" />
              <div>
                <h4 className="text-[13px] font-black text-gray-900">Minimum Password Length</h4>
                <p className="text-[11px] font-bold text-gray-500">Require at least 8 characters</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" onChange={() => setHasUnsavedChanges(true)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-gray-400" />
              <div>
                <h4 className="text-[13px] font-black text-gray-900">Require Special Characters</h4>
                <p className="text-[11px] font-bold text-gray-500">Must include symbols (!@#$%^&*)</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" onChange={() => setHasUnsavedChanges(true)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-gray-400" />
              <div>
                <h4 className="text-[13px] font-black text-gray-900">Password Expiration</h4>
                <p className="text-[11px] font-bold text-gray-500">Force password change every 90 days</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" onChange={() => setHasUnsavedChanges(true)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
