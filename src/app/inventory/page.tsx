"use client";

import React, { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  Clock,
  RefreshCcw,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Search,
  Edit2,
  Tag,
  ShoppingBag,
  Percent,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import InventoryKPICards from "@/components/inventory/InventoryKPICards";
import InventoryActionRow from "@/components/inventory/InventoryActionRow";
import InventoryFilters from "@/components/inventory/InventoryFilters";
import InventoryTable from "@/components/inventory/InventoryTable";
import InventoryCharts from "@/components/inventory/InventoryCharts";
import InventoryAlertsAction from "@/components/inventory/InventoryAlertsAction";
import EditInventoryModal from "@/components/inventory/EditInventoryModal";
import DeleteInventoryModal from "@/components/inventory/DeleteInventoryModal";
import AddProductModal from "@/components/inventory/AddProductModal";
import AddWarehouseModal from "@/components/inventory/AddWarehouseModal";
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
import { Calendar as CalendarIcon, FileDown } from "lucide-react";
import InventoryReportView from "@/components/inventory/InventoryReportView";
import { useRouter } from "next/navigation";

export default function InventoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isOwnerOrAdmin = user?.role === "owner" || user?.role === "admin";
  const [activeTab, setActiveTab] = useState<"inventory" | "approvals">(
    "inventory",
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [isPhysicalStockModalOpen, setIsPhysicalStockModalOpen] = useState(false);
  const [isTransferStockModalOpen, setIsTransferStockModalOpen] = useState(false);
  const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isAddWarehouseModalOpen, setIsAddWarehouseModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [prefillItems, setPrefillItems] = useState<string[]>([]);

  // Approvals Tab States
  const [approvalsList, setApprovalsList] = useState<any[]>([]);
  const [isApprovalsLoading, setIsApprovalsLoading] = useState(false);
  const [approvalsSearch, setApprovalsSearch] = useState("");
  const [editingApproval, setEditingApproval] = useState<any | null>(null);
  const [editMaxDiscount, setEditMaxDiscount] = useState<number | "">("");
  const [editDefaultValue, setEditDefaultValue] = useState<number | "">("");
  const [editType, setEditType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">(
    "PERCENTAGE",
  );

  React.useEffect(() => {
    fetchInventory();

    if (isOwnerOrAdmin) {
      fetchDiscountProducts();
    }

    // Check for purchase order prefill from dashboard
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "approvals") {
        setActiveTab("approvals");
      }
      if (params.get("po") === "true") {
        const items = params.get("items");
        if (items) {
          setPrefillItems(items.split(","));
        }
        setIsPurchaseOrderModalOpen(true);
        // Clean up URL without reloading
        window.history.replaceState({}, "", "/inventory");
      }
    }
  }, [user, isOwnerOrAdmin]);

  const fetchDiscountProducts = async () => {
    setIsApprovalsLoading(true);
    try {
      const res = await api.get("/products");
      const allProducts = res.data?.data || res.data || [];
      const discountProducts = allProducts.filter(
        (p: any) => p.isDiscountEnabled,
      );
      setApprovalsList(discountProducts);
    } catch (err) {
      console.error("Failed to fetch products for approvals", err);
      toast.error("Failed to load discount products.");
    } finally {
      setIsApprovalsLoading(false);
    }
  };

  const handleToggleApproval = async (product: any) => {
    const nextApprovalState = !product.isDiscountApproved;
    try {
      await api.patch(`/products/${product.id}/discount-approval`, {
        isDiscountApproved: nextApprovalState,
      });

      setApprovalsList((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, isDiscountApproved: nextApprovalState }
            : p,
        ),
      );
      setInventoryData((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, isDiscountApproved: nextApprovalState }
            : item,
        ),
      );
      toast.success(
        `Discount approval ${nextApprovalState ? "granted" : "revoked"} for "${product.name}"`,
      );
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to update approval status.",
      );
    }
  };

  const handleOpenEditApproval = (product: any) => {
    setEditingApproval(product);
    setEditType(product.discountType || "PERCENTAGE");
    setEditMaxDiscount(
      product.maxAllowedDiscount !== null &&
        product.maxAllowedDiscount !== undefined
        ? Number(product.maxAllowedDiscount)
        : "",
    );
    setEditDefaultValue(
      product.defaultDiscountValue !== null &&
        product.defaultDiscountValue !== undefined
        ? Number(product.defaultDiscountValue)
        : "",
    );
  };

  const handleSaveApprovalConfig = async () => {
    if (!editingApproval) return;

    const maxVal = parseFloat(String(editMaxDiscount));
    if (editMaxDiscount === "" || isNaN(maxVal) || maxVal < 0) {
      toast.error("Please enter a valid positive maximum discount.");
      return;
    }
    if (editType === "PERCENTAGE" && maxVal > 100) {
      toast.error("Percentage discount cannot exceed 100%.");
      return;
    }

    let defaultVal = 0;
    if (editDefaultValue !== "") {
      defaultVal = parseFloat(String(editDefaultValue));
      if (isNaN(defaultVal) || defaultVal < 0) {
        toast.error("Please enter a valid positive default discount.");
        return;
      }
      if (defaultVal > maxVal) {
        toast.error("Default discount cannot exceed maximum allowed discount.");
        return;
      }
    }

    try {
      await api.patch(`/products/${editingApproval.id}/discount-config`, {
        isDiscountEnabled: true,
        discountType: editType,
        maxAllowedDiscount: maxVal,
        defaultDiscountValue: defaultVal,
      });

      setApprovalsList((prev) =>
        prev.map((p) =>
          p.id === editingApproval.id
            ? {
                ...p,
                discountType: editType,
                maxAllowedDiscount: maxVal,
                defaultDiscountValue: defaultVal,
              }
            : p,
        ),
      );

      setInventoryData((prev) =>
        prev.map((item) =>
          item.id === editingApproval.id
            ? {
                ...item,
                discountType: editType,
                maxAllowedDiscount: maxVal,
                defaultDiscountValue: defaultVal,
              }
            : item,
        ),
      );

      toast.success("Discount limits updated successfully.");
      setEditingApproval(null);
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          "Failed to update discount configurations.",
      );
    }
  };

  const fetchInventory = async () => {
    try {
      setIsLoading(true);

      // Fetch stock records, all products, and warehouses in parallel
      const [stockRes, productsRes, warehousesRes] = await Promise.allSettled([
        api.get("/stock"),
        api.get("/products"),
        api.get("/warehouses"),
      ]);

      const stockItems: any[] =
        stockRes.status === "fulfilled"
          ? stockRes.value.data?.data || stockRes.value.data || []
          : [];

      const allProducts: any[] =
        productsRes.status === "fulfilled"
          ? productsRes.value.data?.data || productsRes.value.data || []
          : [];

      if (warehousesRes.status === 'fulfilled') {
        const whData = warehousesRes.value.data?.data || warehousesRes.value.data || [];
        setWarehouses(whData);
      }

      // Build a set of productIds that already have stock records
      const stockProductIds = new Set(
        stockItems.map((s: any) => s.product_id || s.productId),
      );

      // Map stock records to display shape
      const mappedStock = stockItems.map((item: any) => {
        const qty = item.available_quantity ?? item.quantity ?? 0;
        const minStock = item.minimum_stock_level ?? 0;
        const cost = item.selling_price ?? item.product?.sellingPrice ?? 0;
        const totalVal = qty * cost;
        const status =
          qty <= 0 ? "Out of Stock" : item.low_stock ? "Low Stock" : "In Stock";

        return {
          id: item.product_id || item.id,
          name: item.product_name || item.product?.name || "Unknown",
          sku: item.sku || item.product?.sku || "N/A",
          skuInfo: item.sku || item.product?.sku || "N/A",
          category:
            item.category_name ||
            item.product?.category?.name ||
            "Uncategorized",
          warehouse:
            item.warehouse_name || item.warehouse?.name || "Main Warehouse",
          image:
            item.image_url || item.product?.image_url || item.image || null,
          qty,
          maxLevel: Math.max(minStock, qty, 1),
          minStock,
          unit: "units",
          status,
          unitCost: `Rs. ${Number(cost).toLocaleString()}`,
          totalValue: `Rs. ${Number(totalVal).toLocaleString()}`,
          lastMovement: new Date().toLocaleDateString("en-GB"),
          reorder: qty <= 0 ? "critical" : item.low_stock ? "warning" : "good",
          quantity: qty,
          price: cost,
          cost,
          purchasePrice:
            item.product?.purchasePrice ?? item.purchase_price ?? 0,
          sellingPrice: item.product?.sellingPrice ?? item.selling_price ?? 0,
          warehouseId: item.warehouse_id,
          productId: item.product_id,
          isDiscountEnabled: item.isDiscountEnabled || item.product?.isDiscountEnabled || false,
          isDiscountApproved: item.isDiscountApproved || item.product?.isDiscountApproved || false,
          discountType: item.discountType || item.product?.discountType || "PERCENTAGE",
          maxAllowedDiscount: Number(item.maxAllowedDiscount || item.product?.maxAllowedDiscount || 0),
          defaultDiscountValue: Number(item.defaultDiscountValue || item.product?.defaultDiscountValue || 0),
        };
      });

      // Map products that have NO stock record yet
      const mappedNoStock = allProducts
        .filter((p: any) => !stockProductIds.has(p.id))
        .map((p: any) => {
          const cost = Number(p.sellingPrice) || 0;
          return {
            id: p.id,
            name: p.name || "Unknown",
            sku: p.sku || "N/A",
            skuInfo: p.sku || "N/A",
            category: p.category?.name || "Uncategorized",
            warehouse: "—",
            image: p.images?.[0]?.imageUrl || null,
            qty: 0,
            maxLevel: Number(p.minimumStockLevel) || 1,
            minStock: Number(p.minimumStockLevel) || 0,
            unit: "units",
            status: "Out of Stock",
            unitCost: `Rs. ${cost.toLocaleString()}`,
            totalValue: "Rs. 0",
            lastMovement: new Date(p.createdAt).toLocaleDateString("en-GB"),
            reorder: "critical",
            quantity: 0,
            price: cost,
            cost,
            purchasePrice: Number(p.purchasePrice) || 0,
            sellingPrice: cost,
            warehouseId: null,
            productId: p.id,
            isDiscountEnabled: p.isDiscountEnabled || false,
            isDiscountApproved: p.isDiscountApproved || false,
            discountType: p.discountType || 'PERCENTAGE',
            maxAllowedDiscount: Number(p.maxAllowedDiscount || 0),
            defaultDiscountValue: Number(p.defaultDiscountValue || 0),
          };
        });

      setInventoryData([...mappedStock, ...mappedNoStock]);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    null,
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(
      new Date().getFullYear() - 1,
      new Date().getMonth(),
      new Date().getDate(),
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
      // 1. Text Search
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Select Filters
      const matchesCategory =
        !selectedCategory || item.category === selectedCategory;
      const matchesWarehouse =
        !selectedWarehouse || item.warehouse === selectedWarehouse;
      const matchesStatus = !selectedStatus || item.status === selectedStatus;

      // 3. Date Range Filter — skip if no date range set
      let matchesDate = true;
      if (
        dateRange?.from &&
        item.lastMovement &&
        item.lastMovement !== "Invalid Date"
      ) {
        try {
          const itemDate = parse(item.lastMovement, "dd/MM/yyyy", new Date());
          if (!isNaN(itemDate.getTime())) {
            const start = startOfDay(dateRange.from);
            const end = dateRange.to
              ? endOfDay(dateRange.to)
              : endOfDay(dateRange.from);
            matchesDate = isWithinInterval(itemDate, { start, end });
          }
        } catch {
          matchesDate = true; // Don't filter if date can't be parsed
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

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleTransfer = (item: any) => {
    setSelectedItem(item);
    setIsTransferStockModalOpen(true);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = async (updatedData: any) => {
    try {
      if (!selectedItem) return;

      const {
        isDiscountEnabled,
        discountType,
        maxAllowedDiscount,
        defaultDiscountValue,
        ...coreData
      } = updatedData;

      // 1. Update core product details
      await api.patch(`/products/${selectedItem.id}`, coreData);

      // 2. Update discount configuration (always update this if provided)
      await api.patch(`/products/${selectedItem.id}/discount-config`, {
        isDiscountEnabled,
        discountType,
        maxAllowedDiscount: Number(maxAllowedDiscount || 0),
        defaultDiscountValue: Number(defaultDiscountValue || 0),
      });

      // 3. Handle Auto-Approval for Shop Owner role
      const isOwner = user?.role === "owner";
      if (isDiscountEnabled && isOwner) {
        await api.patch(`/products/${selectedItem.id}/discount-approval`, {
          isDiscountApproved: true,
        });
      }

      setIsEditModalOpen(false);
      setSelectedItem(null);
      fetchInventory(); // Refresh inventory data list
    } catch (error: any) {
      console.error("Failed to update product details:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to update product. Please try again.",
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
      fetchInventory(); // Refresh from server
    } catch (error: any) {
      console.error("Failed to delete product:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to delete product. Please try again.",
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
            {/* Date Range Picker - Sales Style */}
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

        {/* TAB NAVIGATION (Only for Owner / Admin) */}
        {isOwnerOrAdmin && (
          <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200/50 gap-1.5 max-w-md">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 py-3 px-4 rounded-xl text-[13px] font-black tracking-tight uppercase transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "inventory"
                  ? "bg-white text-blue-900 shadow-md border border-blue-50"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Inventory List
            </button>
            <button
              onClick={() => setActiveTab("approvals")}
              className={`flex-1 py-3 px-4 rounded-xl text-[13px] font-black tracking-tight uppercase transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "approvals"
                  ? "bg-white text-emerald-700 shadow-md border border-emerald-50"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Discount Approvals
            </button>
          </div>
        )}

        {activeTab === "inventory" ? (
          <>
            {/* 1. KPI CARDS - Now Dynamic */}
            <InventoryKPICards data={filteredData} />
            
            {/* 2. ACTION ROW - Re-implemented */}
            <InventoryActionRow 
              onAddProduct={() => setIsAddProductModalOpen(true)}
              onAdjustStock={() => setIsAdjustStockModalOpen(true)}
              onPhysicalStockCount={() => setIsPhysicalStockModalOpen(true)}
              onTransferStock={() => setIsTransferStockModalOpen(true)}
              onPurchaseOrder={() => setIsPurchaseOrderModalOpen(true)}
              onAddWarehouse={() => setIsAddWarehouseModalOpen(true)}
            />

            {/* 3. WAREHOUSE SELECTOR & INVENTORY TABLE */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedWarehouse(null)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-colors border ${!selectedWarehouse ? 'bg-[#1e40af] text-white border-[#1e40af]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  All Warehouses
                </button>
                {warehouses.map(wh => (
                  <button
                    key={wh.id}
                    onClick={() => setSelectedWarehouse(wh.name)}
                    className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-colors border ${selectedWarehouse === wh.name ? 'bg-[#1e40af] text-white border-[#1e40af]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {wh.name}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex items-center justify-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <InventoryTable 
                  data={filteredData}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTransfer={handleTransfer}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onFilterToggle={() => setIsFilterModalOpen(true)}
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={handleClearAllFilters}
                  activeFilterCount={activeFilterCount}
                />
              )}
            </div>

            {/* 4. ANALYSIS SECTION */}
            <div className="space-y-10">
              <InventoryCharts data={filteredData} dateRange={dateRange} />
              <InventoryAlertsAction />
            </div>
          </>
        ) : (
          /* DISCOUNT APPROVALS VIEW */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Action Row */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search product name, SKU..."
                  value={approvalsSearch}
                  onChange={(e) => setApprovalsSearch(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-gray-700 outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>
              <div className="flex gap-2 text-xs font-bold text-gray-400 items-center whitespace-nowrap">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <span>
                  {
                    approvalsList.filter(
                      (p) =>
                        p.name
                          .toLowerCase()
                          .includes(approvalsSearch.toLowerCase()) ||
                        p.sku
                          .toLowerCase()
                          .includes(approvalsSearch.toLowerCase()),
                    ).length
                  }{" "}
                  Products with Discounts Configured
                </span>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {isApprovalsLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent" />
                  <span className="text-sm font-bold text-gray-400">
                    Loading discount settings...
                  </span>
                </div>
              ) : approvalsList.filter(
                  (p) =>
                    p.name
                      .toLowerCase()
                      .includes(approvalsSearch.toLowerCase()) ||
                    p.sku.toLowerCase().includes(approvalsSearch.toLowerCase()),
                ).length === 0 ? (
                <div className="text-center py-20 bg-gray-50/30">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-[17px] font-black text-gray-800">
                    No products found
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                    {approvalsSearch
                      ? "Try adjusting your search criteria"
                      : "Enable discount configurations inside the Inventory table or edit product dialog first."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        <th className="py-4.5 px-6">Product Details</th>
                        <th className="py-4.5 px-6">Selling Price</th>
                        <th className="py-4.5 px-6">Default Discount</th>
                        <th className="py-4.5 px-6">Max Allowed Limit</th>
                        <th className="py-4.5 px-6 text-center">Status</th>
                        <th className="py-4.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {approvalsList
                        .filter(
                          (p) =>
                            p.name
                              .toLowerCase()
                              .includes(approvalsSearch.toLowerCase()) ||
                            p.sku
                              .toLowerCase()
                              .includes(approvalsSearch.toLowerCase()),
                        )
                        .map((product) => {
                          const catName =
                            typeof product.category === "object"
                              ? (product.category as any)?.name
                              : product.category || "Uncategorized";

                          return (
                            <tr
                              key={product.id}
                              className="hover:bg-gray-50/50 transition-colors group"
                            >
                              <td className="py-5 px-6">
                                <div className="max-w-md">
                                  <h4 className="text-sm font-black text-gray-850 group-hover:text-emerald-700 transition-colors leading-snug">
                                    {product.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                                      {product.sku}
                                    </span>
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                      {catName}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-5 px-6 font-mono text-sm font-bold text-gray-800">
                                Rs.{" "}
                                {Number(product.sellingPrice).toLocaleString()}
                              </td>
                              <td className="py-5 px-6 font-mono text-sm font-semibold text-gray-500">
                                {product.defaultDiscountValue ? (
                                  product.discountType === "PERCENTAGE" ? (
                                    `${product.defaultDiscountValue}%`
                                  ) : (
                                    `Rs. ${product.defaultDiscountValue}`
                                  )
                                ) : (
                                  <span className="text-gray-300 italic text-xs">
                                    —
                                  </span>
                                )}
                              </td>
                              <td className="py-5 px-6 font-mono text-sm font-bold text-gray-900">
                                {product.discountType === "PERCENTAGE"
                                  ? `${product.maxAllowedDiscount}%`
                                  : `Rs. ${product.maxAllowedDiscount.toLocaleString()}`}
                              </td>
                              <td className="py-5 px-6">
                                <div className="flex justify-center">
                                  <button
                                    onClick={() =>
                                      handleToggleApproval(product)
                                    }
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border ${
                                      product.isDiscountApproved
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                                        : "bg-red-50 text-red-600 border-red-200"
                                    }`}
                                  >
                                    {product.isDiscountApproved ? (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Approved
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="w-3.5 h-3.5" />
                                        Pending Approval
                                      </>
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="py-5 px-6 text-right">
                                <div className="flex justify-end gap-2.5">
                                  <button
                                    onClick={() =>
                                      handleOpenEditApproval(product)
                                    }
                                    className="p-2 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100"
                                    title="Edit limits"
                                  >
                                    <Edit2 className="w-4.5 h-4.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
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
          fetchInventory();
        }}
      />

      <AdjustStockModal
        isOpen={isAdjustStockModalOpen}
        onClose={() => setIsAdjustStockModalOpen(false)}
        onSuccess={() => {
          setIsAdjustStockModalOpen(false);
          fetchInventory();
        }}
      />

      <PhysicalStockCountModal
        isOpen={isPhysicalStockModalOpen}
        onClose={() => setIsPhysicalStockModalOpen(false)}
        onSuccess={() => {
          setIsPhysicalStockModalOpen(false);
          fetchInventory();
        }}
      />

      <TransferStockModal
        isOpen={isTransferStockModalOpen}
        onClose={() => {
          setIsTransferStockModalOpen(false);
          setSelectedItem(null);
        }}
        onSuccess={() => {
          setIsTransferStockModalOpen(false);
          setSelectedItem(null);
          fetchInventory();
        }}
        initialProductId={selectedItem?.productId || selectedItem?.id}
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
          fetchInventory();
        }}
        prefillProductIds={prefillItems}
      />

      <AddWarehouseModal
        isOpen={isAddWarehouseModalOpen}
        onClose={() => setIsAddWarehouseModalOpen(false)}
        onSuccess={() => {
          setIsAddWarehouseModalOpen(false);
          fetchInventory();
        }}
      />

      {editingApproval && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditingApproval(null)}
          />
          <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-[17px] font-black text-gray-900">
                  Adjust Discount Limits
                </h3>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                  {editingApproval.sku}
                </p>
              </div>
              <button
                onClick={() => setEditingApproval(null)}
                className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <XCircle className="w-4 h-4 text-gray-400 hover:text-gray-650" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest mb-0.5">
                  Product Name
                </p>
                <p className="text-[13.5px] font-black text-emerald-950 leading-snug">
                  {editingApproval.name}
                </p>
                <p className="text-[12px] font-bold text-emerald-700 mt-2">
                  Selling Price: Rs.{" "}
                  {Number(editingApproval.sellingPrice).toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
                {/* Discount Type Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Discount Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditType("PERCENTAGE")}
                      className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-black uppercase transition-all ${
                        editType === "PERCENTAGE"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                          : "bg-white text-gray-400 border-gray-200"
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      Percentage (%)
                    </button>
                    <button
                      onClick={() => setEditType("FIXED_AMOUNT")}
                      className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-black uppercase transition-all ${
                        editType === "FIXED_AMOUNT"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                          : "bg-white text-gray-400 border-gray-200"
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Fixed LKR
                    </button>
                  </div>
                </div>

                {/* Limit Input */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Maximum Allowed Discount
                  </label>
                  <div className="relative">
                    {editType === "FIXED_AMOUNT" && (
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                        Rs.
                      </span>
                    )}
                    <input
                      type="number"
                      value={editMaxDiscount}
                      onChange={(e) =>
                        setEditMaxDiscount(
                          e.target.value !== "" ? Number(e.target.value) : "",
                        )
                      }
                      className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-4 text-sm font-bold text-gray-800 outline-none focus:bg-white focus:border-emerald-600 transition-all ${
                        editType === "FIXED_AMOUNT" ? "pl-10" : "pl-4"
                      }`}
                      placeholder={
                        editType === "PERCENTAGE" ? "e.g. 15%" : "e.g. 250"
                      }
                      min="0"
                    />
                  </div>
                </div>

                {/* Default Input */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Default Discount Value (Optional)
                  </label>
                  <div className="relative">
                    {editType === "FIXED_AMOUNT" && (
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                        Rs.
                      </span>
                    )}
                    <input
                      type="number"
                      value={editDefaultValue}
                      onChange={(e) =>
                        setEditDefaultValue(
                          e.target.value !== "" ? Number(e.target.value) : "",
                        )
                      }
                      className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-4 text-sm font-bold text-gray-850 outline-none focus:bg-white focus:border-emerald-600 transition-all ${
                        editType === "FIXED_AMOUNT" ? "pl-10" : "pl-4"
                      }`}
                      placeholder={
                        editType === "PERCENTAGE" ? "e.g. 5%" : "e.g. 50"
                      }
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button
                onClick={() => setEditingApproval(null)}
                className="py-2.5 px-5 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApprovalConfig}
                className="py-2.5 px-5 text-xs font-black uppercase text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md"
              >
                Save Config
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINT VIEW */}
      <InventoryReportView data={filteredData} dateRange={dateRange} />
    </MainLayout>
  );
}
