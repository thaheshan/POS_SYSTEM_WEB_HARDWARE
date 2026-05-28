import { Receipt, ShieldCheck, Edit2, Info } from 'lucide-react';

interface Props {
  setHasUnsavedChanges: (val: boolean) => void;
}

export default function TaxSettings({ setHasUnsavedChanges }: Props) {
  return (
    <div id="tax-config" className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fafafa]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-[12px] flex items-center justify-center border border-purple-200">
            <Receipt className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900">Tax Configuration (Sri Lanka)</h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Configure IRD tax settings, VAT rate, and daily threshold amounts
            </p>
          </div>
        </div>
        <span className="bg-[#ecfdf5] text-[#059669] border border-green-200 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" /> IRD Compliant
        </span>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VAT Rate Block */}
        <div className="bg-gray-50 rounded-[20px] p-6 border border-gray-100 relative">
          <button className="absolute top-6 right-6 text-gray-400 hover:text-blue-600">
            <Edit2 className="w-4 h-4" />
          </button>
          <p className="text-[12px] font-black text-gray-600 mb-1">VAT Rate</p>
          <h3 className="text-[42px] font-black tracking-tighter text-[#1e40af] leading-none mb-2">18%</h3>
          <p className="text-[11px] font-bold text-gray-400 mb-6">Standard Sri Lanka VAT rate per IRD guidelines</p>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-600">Update VAT Rate (%)</label>
            <input
              type="text"
              defaultValue="18"
              onChange={() => setHasUnsavedChanges(true)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[14px] font-black outline-none focus:border-blue-500 transition-colors font-mono"
            />
          </div>
        </div>

        {/* Tax Threshold Block */}
        <div className="bg-[#eff6ff] rounded-[20px] p-6 border border-blue-100 relative">
          <button className="absolute top-6 right-6 text-blue-400 hover:text-blue-600">
            <Edit2 className="w-4 h-4" />
          </button>
          <p className="text-[12px] font-black text-blue-800 mb-1">Daily Tax Threshold</p>
          <h3 className="text-[36px] font-black tracking-tighter text-[#2563eb] leading-none mb-2 mt-2">Rs. 2,00,000</h3>
          <p className="text-[11px] font-bold text-blue-600 mb-6">Sales above this amount per day move to Category B</p>

          <div className="bg-blue-100/50 rounded-xl p-3 flex items-start gap-3 border border-blue-200">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-blue-800 leading-tight">
              Regulated by IRD Sri Lanka. Change requires IRD authorization.
            </p>
          </div>
        </div>

        {/* TIN Input */}
        <div className="bg-gray-50 rounded-[20px] p-6 border border-gray-100">
          <p className="text-[12px] font-black text-gray-600 mb-1">Tax Identification Number (TIN)</p>
          <h4 className="text-[18px] font-black text-gray-900 tracking-wider mb-6">TAX-ABC-123456</h4>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-600">Update TIN Number</label>
            <input
              type="text"
              defaultValue="TAX-ABC-123456"
              onChange={() => setHasUnsavedChanges(true)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors uppercase font-mono"
            />
          </div>
        </div>

        {/* VAT Reg Input */}
        <div className="bg-gray-50 rounded-[20px] p-6 border border-gray-100">
          <p className="text-[12px] font-black text-gray-600 mb-1">VAT Registration Number</p>
          <h4 className="text-[18px] font-black text-gray-900 tracking-wider mb-6">VAT-LK-987654</h4>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-600">Update VAT Number</label>
            <input
              type="text"
              defaultValue="VAT-LK-987654"
              onChange={() => setHasUnsavedChanges(true)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors uppercase font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
