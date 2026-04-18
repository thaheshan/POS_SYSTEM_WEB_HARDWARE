import { PlusCircle, ArrowUpDown, CheckSquare, ArrowLeftRight, FileText, CloudUpload } from 'lucide-react';

export default function InventoryBottomActionBar() {
  return (
    <div className="flex flex-wrap items-center gap-3 mt-6 pb-6">
      <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium transition-colors shadow-sm">
        <PlusCircle className="w-4 h-4" />
        Add New Product
      </button>
      
      <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-medium transition-colors shadow-sm">
        <ArrowUpDown className="w-4 h-4" />
        Adjust Stock
      </button>

      <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-medium transition-colors shadow-sm">
        <CheckSquare className="w-4 h-4" />
        Physical Stock Count
      </button>

      <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#06b6d4] hover:bg-[#0891b2] text-white text-sm font-medium transition-colors shadow-sm">
        <ArrowLeftRight className="w-4 h-4" />
        Transfer Stock
      </button>

      <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#be123c] hover:bg-[#9f1239] text-white text-sm font-medium transition-colors shadow-sm">
        <FileText className="w-4 h-4" />
        Create Purchase Order
      </button>

      <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-emerald-500 hover:bg-emerald-50 text-emerald-600 text-sm font-medium transition-colors ml-auto shadow-sm">
        <CloudUpload className="w-4 h-4" />
        Import/Export
      </button>
    </div>
  );
}
