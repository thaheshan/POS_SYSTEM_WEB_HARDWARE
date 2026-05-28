import { Database, DownloadCloud, Clock, HardDrive } from 'lucide-react';

interface Props {
  setHasUnsavedChanges: (val: boolean) => void;
}

export default function BackupSettings({ setHasUnsavedChanges }: Props) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#ecfeff]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-100 rounded-[12px] flex items-center justify-center border border-cyan-200">
            <Database className="w-6 h-6 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900">Backup & Data Exports</h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Configure automatic safe-backups, retention policies, and data exports
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <h3 className="text-[16px] font-black text-gray-900 mb-4">Automatic Backups</h3>
        
        <div className="bg-cyan-50/50 border border-cyan-100 rounded-[20px] p-6 mb-8 flex items-center justify-between">
          <div>
            <h4 className="text-[15px] font-black text-gray-900 mb-1">Cloud Daily Backup</h4>
            <p className="text-[12px] font-bold text-gray-500 mb-3 max-w-md">
              Automatically backup your entire database, inventory, and sales history securely to the cloud every night at 2:00 AM.
            </p>
            <div className="flex gap-2 items-center text-[11px] font-black text-cyan-700 bg-cyan-100 px-3 py-1 rounded w-fit">
              <Clock className="w-3.5 h-3.5" /> Next Backup: Today at 02:00 AM
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" onChange={() => setHasUnsavedChanges(true)} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        <h3 className="text-[16px] font-black text-gray-900 mb-4">Manual Data Export</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-xl p-5 hover:border-blue-400 transition-colors cursor-pointer group">
            <DownloadCloud className="w-6 h-6 text-blue-500 mb-3" />
            <h4 className="text-[13px] font-black text-gray-900">Export Inventory (CSV)</h4>
            <p className="text-[11px] font-bold text-gray-500 mt-1 mb-4">Download a complete list of all current stock levels.</p>
            <button className="text-[12px] font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg w-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
              Generate Export
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-xl p-5 hover:border-emerald-400 transition-colors cursor-pointer group">
            <HardDrive className="w-6 h-6 text-emerald-500 mb-3" />
            <h4 className="text-[13px] font-black text-gray-900">Export Sales Data (CSV)</h4>
            <p className="text-[11px] font-bold text-gray-500 mt-1 mb-4">Download historical sales and invoice data.</p>
            <button className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg w-full group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              Generate Export
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
