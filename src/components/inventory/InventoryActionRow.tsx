import { PlusCircle, ArrowUpDown, CheckSquare, ArrowLeftRight, FileText, CloudUpload } from 'lucide-react';

export default function InventoryActionRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-8 mb-4">
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold transition-all shadow-sm uppercase tracking-tight">
        <PlusCircle className="w-4 h-4" />
        Add New Product
      </button>
      
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[13px] font-bold transition-all shadow-sm uppercase tracking-tight">
        <ArrowUpDown className="w-4 h-4" />
        Adjust Stock
      </button>

      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-bold transition-all shadow-sm uppercase tracking-tight">
        <CheckSquare className="w-4 h-4" />
        Physical Stock Count
      </button>

      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-[13px] font-bold transition-all shadow-sm uppercase tracking-tight">
        <ArrowLeftRight className="w-4 h-4" />
        Transfer Stock
      </button>

      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-bold transition-all shadow-sm uppercase tracking-tight">
        <FileText className="w-4 h-4" />
        Create Purchase Order
      </button>

      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-black text-[13px] font-black transition-all shadow-sm uppercase tracking-tight">
        <CloudUpload className="w-4 h-4 text-emerald-600" />
        Import/Export
      </button>
    </div>
  );
}
