import { PlusCircle, ArrowUpDown, CheckSquare, ArrowLeftRight, FileText, CloudUpload } from 'lucide-react';

interface InventoryActionRowProps {
  onAddProduct: () => void;
  onAdjustStock: () => void;
  onPhysicalStockCount: () => void;
  onTransferStock: () => void;
  onPurchaseOrder: () => void;
  onImportExport: () => void;
}

export default function InventoryActionRow({ 
  onAddProduct, 
  onAdjustStock,
  onPhysicalStockCount,
  onTransferStock,
  onPurchaseOrder,
  onImportExport
}: InventoryActionRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-8 mb-4">
      <button 
        onClick={onAddProduct}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold transition-all shadow-sm uppercase tracking-tight"
      >
        <PlusCircle className="w-4 h-4" />
        Add New Product
      </button>
      
      <button 
        onClick={onAdjustStock}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[13px] font-bold transition-all shadow-sm uppercase tracking-tight"
      >
        <ArrowUpDown className="w-4 h-4" />
        Adjust Stock
      </button>

      <button onClick={onPurchaseOrder} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-bold transition-all shadow-sm uppercase tracking-tight">
        <FileText className="w-4 h-4" />
        Create Purchase Order
      </button>

      <button onClick={onImportExport} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-black text-[13px] font-black transition-all shadow-sm uppercase tracking-tight">
        <CloudUpload className="w-4 h-4 text-emerald-600" />
        Import/Export
      </button>
    </div>
  );
}
