import { Settings, Globe, Clock, Scale } from 'lucide-react';

interface Props {
  setHasUnsavedChanges: (val: boolean) => void;
}

export default function SystemPreferencesSettings({ setHasUnsavedChanges }: Props) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f3f4f6]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-[12px] flex items-center justify-center border border-gray-300">
            <Settings className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900">System Preferences</h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Configure localization, timezones, and display formats
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[12px] font-black text-gray-700 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" /> Language / Locale
              </label>
              <select 
                onChange={() => setHasUnsavedChanges(true)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-gray-500 transition-colors"
              >
                <option value="en-LK">English (Sri Lanka)</option>
                <option value="si-LK">Sinhala</option>
                <option value="ta-LK">Tamil</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-black text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" /> Timezone
              </label>
              <select 
                onChange={() => setHasUnsavedChanges(true)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-gray-500 transition-colors"
              >
                <option value="Asia/Colombo">(UTC+05:30) Sri Jayawardenepura Kotte, Colombo</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[12px] font-black text-gray-700 flex items-center gap-2">
                <Scale className="w-4 h-4 text-gray-400" /> Default Currency
              </label>
              <select 
                onChange={() => setHasUnsavedChanges(true)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-gray-500 transition-colors"
              >
                <option value="LKR">Sri Lankan Rupee (LKR / Rs.)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-black text-gray-700">Date Format</label>
              <select 
                onChange={() => setHasUnsavedChanges(true)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-gray-500 transition-colors"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 27/05/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 05/27/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-05-27)</option>
              </select>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
