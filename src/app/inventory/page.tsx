"use client";

import React, { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Clock,
  RefreshCcw,
  PlusCircle,
  Calendar as CalendarIcon,
  FileDown,
} from "lucide-react";
import InventoryKPICards from "@/components/inventory/InventoryKPICards";
import InventoryActionRow from "@/components/inventory/InventoryActionRow";
import InventoryFilters from "@/components/inventory/InventoryFilters";
import InventoryTable from "@/components/inventory/InventoryTable";
import InventoryCharts from "@/components/inventory/InventoryCharts";
import InventoryAlertsAction from "@/components/inventory/InventoryAlertsAction";
import EditInventoryModal from "@/components/inventory/EditInventoryModal";
import DeleteInventoryModal from "@/components/inventory/DeleteInventoryModal";
import AddProductModal from "@/components/inventory/AddProductModal";
import AdjustStockModal from "@/components/inventory/AdjustStockModal";
import PhysicalStockCountModal from "@/components/inventory/PhysicalStockCountModal";
import TransferStockModal from "@/components/inventory/TransferStockModal";
import PurchaseOrderModal from "@/components/inventory/PurchaseOrderModal";
import ImportExportModal from "@/components/inventory/ImportExportModal";
import { DateRange } from "react-day-picker";
import api from "@/api/axiosInstance";
import {
  format,
  parse,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import SalesDatePicker from "@/components/sales/SalesDatePicker";
import * as Popover from "@radix-ui/react-popover";
import InventoryReportView from "@/components/inventory/InventoryReportView";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";
import {
  useAdjustStockMutation,
  useGetInventoryQuery,
} from "@/lib/services/inventoryApi";
export default function InventoryPage() {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [isPhysicalStockModalOpen, setIsPhysicalStockModalOpen] =
    useState(false);
  const [isTransferStockModalOpen, setIsTransferStockModalOpen] =
    useState(false);
  const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] =
    useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [prefillItems, setPrefillItems] = useState<string[]>([]);

  const { data: response, isLoading, error, refetch } = useGetInventoryQuery();
  const [adjustStock] = useAdjustStockMutation();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("po") === "true") {
        const items = params.get("items");
        if (items) {
          setPrefillItems(items.split(","));
        }
        setIsPurchaseOrderModalOpen(true);
        window.history.replaceState({}, "", "/inventory");
      }
    }
  }, []);

  const inventoryData = useMemo(() => {
    const rawData = Array.isArray(response) ? response : response?.data || [];

    return rawData.map((item: any) => {
      const qty = Number(item.available_quantity ?? item.quantity) || 0;
      const cost = Number(item.selling_price) || 0;
      const totalVal = qty * cost;

      const status = item.out_of_stock
        ? "Out of Stock"
        : item.low_stock
        ? "Low Stock"
        : "In Stock";

      return {
        ...item,
        id: item.product_id || item.id,
        name: item.product_name || "Unknown",
        sku: item.sku || "N/A",
        skuInfo: item.sku || "N/A",
        category: item.category_name || "Uncategorized",
        warehouse: item.warehouse_name || "Main Warehouse",
        qty: qty,
        quantity: qty,
        maxLevel: Math.max(10, qty, 1),
        status: status,
        unit: "units",
        unitCost: `Rs. ${cost.toLocaleString()}`,
        totalValue: `Rs. ${totalVal.toLocaleString()}`,
        reorder: item.out_of_stock
          ? "critical"
          : item.low_stock
          ? "warning"
          : "good",
      };
    });
  }, [response]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(
      new Date().getFullYear() - 1,
      new Date().getMonth(),
      new Date().getDate()
    ),
    to: new Date(),
  });

  // Filter Stats
  const hasActiveFilters = !!(
    selectedCategory ||
    selectedWarehouse ||
    selectedStatus
  );
  const activeFilterCount = [
    selectedCategory,
    selectedWarehouse,
    selectedStatus,
  ].filter(Boolean).length;

  // Dynamic Filtering Logic
  const filteredData = useMemo(() => {
    return inventoryData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory || item.category === selectedCategory;
      const matchesWarehouse =
        !selectedWarehouse || item.warehouse === selectedWarehouse;
      const matchesStatus = !selectedStatus || item.status === selectedStatus;

      let matchesDate = true;
      if (
        dateRange?.from &&
        item.createdAt &&
        item.createdAt !== "Invalid Date"
      ) {
        try {
          const itemDate = new Date(item.createdAt);
          if (!isNaN(itemDate.getTime())) {
            const start = startOfDay(dateRange.from);
            const end = dateRange.to
              ? endOfDay(dateRange.to)
              : endOfDay(dateRange.from);
            matchesDate = isWithinInterval(itemDate, { start, end });
          }
        } catch {
          matchesDate = true;
        }
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesWarehouse &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    searchTerm,
    selectedCategory,
    selectedWarehouse,
    selectedStatus,
    dateRange,
    inventoryData,
  ]);

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setSelectedWarehouse(null);
    setSelectedStatus(null);
  };

const handleIncrement = async (item: any) => {
    try {
      await adjustStock({
        action: 'add',
        product_id: item.product_id || item.id,
        warehouse_id: item.warehouse_id || item.warehouseId,
        branch_id: item.branch_id || item.branchId, 
        add_quantity: 1, 
        reason: 'Manual adjustment via dashboard',
      }).unwrap();
      
      toast.success(`Added 1 to ${item.name} stock`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to adjust stock');
    }
  };

  const handleDecrement = async (item: any) => {
    if (item.quantity <= 0) {
      toast.error('Stock cannot go below zero');
      return;
    }

    try {
      await adjustStock({
        action: 'deduct',
        product_id: item.product_id || item.id,
        warehouse_id: item.warehouse_id || item.warehouseId,
        branch_id: item.branch_id || item.branchId,
        deduct_quantity: 1,
        reason: 'Manual adjustment via dashboard',
      }).unwrap();

      toast.success(`Removed 1 from ${item.name} stock`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to adjust stock');
    }
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = async (updatedData: any) => {
    try {
      if (!selectedItem) return;
      await api.patch(`/products/${selectedItem.id}`, updatedData);
      setIsEditModalOpen(false);
      setSelectedItem(null);
      refetch(); // Use RTK refetch
    } catch (error: any) {
      console.error("Failed to update product details:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to update product. Please try again."
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem || isDeleting) return;
    try {
      setIsDeleting(true);
      await api.delete(`/products/${selectedItem.id}`);
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      refetch(); // Use RTK refetch
    } catch (error: any) {
      console.error("Failed to delete product:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to delete product. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto py-8 px-6 space-y-10">
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-none mb-2">
              Inventory Management
            </h1>
            <p className="text-[14px] font-bold text-gray-400">
              Track stock levels, manage products, and monitor inventory in
              real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-black text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
                  <CalendarIcon className="w-4 h-4 text-emerald-600" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM d, yyyy")} -{" "}
                        {format(dateRange.to, "MMM d, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    "Select Date Range"
                  )}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="bg-white p-6 rounded-[24px] shadow-2xl border border-gray-100 z-50 w-[360px] animate-in fade-in zoom-in-95 duration-200"
                  sideOffset={8}
                  align="end"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[15px] font-black text-gray-900">
                      Reporting Period
                    </h3>
                    <button
                      onClick={() => setDateRange(undefined)}
                      className="text-[11px] font-bold text-emerald-600 hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                  <SalesDatePicker
                    dateRange={dateRange}
                    onSelect={setDateRange}
                  />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-xl text-[13px] font-black shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all active:scale-95"
            >
              <FileDown className="w-4 h-4" /> Download Report
            </button>
          </div>
        </div>

        {/* 1. KPI CARDS */}
        <InventoryKPICards data={filteredData} />

        {/* 2. ACTION ROW */}
        <InventoryActionRow
          onAddProduct={() => setIsAddProductModalOpen(true)}
          onAdjustStock={() => setIsAdjustStockModalOpen(true)}
          onPhysicalStockCount={() => setIsPhysicalStockModalOpen(true)}
          onTransferStock={() => setIsTransferStockModalOpen(true)}
          onPurchaseOrder={() => setIsPurchaseOrderModalOpen(true)}
          onImportExport={() => setIsImportExportModalOpen(true)}
        />

        {/* 3. INVENTORY TABLE with RTK Error Handling */}
        {isLoading ? (
          <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 p-8 rounded-[24px] text-center font-bold">
            Failed to load inventory data from the server.
          </div>
        ) : (
          <InventoryTable
            data={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onFilterToggle={() => setIsFilterModalOpen(true)}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearAllFilters}
            activeFilterCount={activeFilterCount}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        )}

        {/* 4. ANALYSIS SECTION */}
        <div className="space-y-10">
          <InventoryCharts data={filteredData} dateRange={dateRange} />
          <InventoryAlertsAction />
        </div>
      </div>

      {/* Modals & Overlays */}
      <InventoryFilters
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        activeFilters={{
          selectedCategory,
          selectedWarehouse,
          selectedStatus,
        }}
        onStatusChange={setSelectedStatus}
        onCategoryChange={setSelectedCategory}
        onWarehouseChange={setSelectedWarehouse}
        onClearAll={handleClearAllFilters}
      />

      <EditInventoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        item={selectedItem}
      />

      <DeleteInventoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        item={selectedItem}
      />

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSuccess={() => {
          setIsAddProductModalOpen(false);
          refetch();
        }}
      />

      <AdjustStockModal
        isOpen={isAdjustStockModalOpen}
        onClose={() => setIsAdjustStockModalOpen(false)}
        onSuccess={() => {
          setIsAdjustStockModalOpen(false);
          refetch();
        }}
      />

      <PhysicalStockCountModal
        isOpen={isPhysicalStockModalOpen}
        onClose={() => setIsPhysicalStockModalOpen(false)}
        onSuccess={() => {
          setIsPhysicalStockModalOpen(false);
          refetch();
        }}
      />

      <TransferStockModal
        isOpen={isTransferStockModalOpen}
        onClose={() => setIsTransferStockModalOpen(false)}
        onSuccess={() => {
          setIsTransferStockModalOpen(false);
          refetch();
        }}
      />

      <PurchaseOrderModal
        isOpen={isPurchaseOrderModalOpen}
        onClose={() => {
          setIsPurchaseOrderModalOpen(false);
          setPrefillItems([]);
        }}
        onSuccess={() => {
          setIsPurchaseOrderModalOpen(false);
          setPrefillItems([]);
          refetch();
        }}
        prefillProductIds={prefillItems}
      />

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        onSuccess={() => {
          setIsImportExportModalOpen(false);
          refetch();
        }}
        inventoryData={inventoryData}
      />

      <InventoryReportView data={filteredData} dateRange={dateRange} />
    </MainLayout>
  );
}
