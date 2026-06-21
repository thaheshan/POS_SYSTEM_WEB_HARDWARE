"use client";

import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Clock, RefreshCcw, PlusCircle } from "lucide-react";
import InventoryKPICards from "@/components/inventory/InventoryKPICards";
import InventoryActionRow from "@/components/inventory/InventoryActionRow";
import InventoryFilters from "@/components/inventory/InventoryFilters";
import InventoryTable from "@/components/inventory/InventoryTable";
import InventoryCharts from "@/components/inventory/InventoryCharts";
import InventoryAlertsAction from "@/components/inventory/InventoryAlertsAction";
import EditInventoryModal from "@/components/inventory/EditInventoryModal";
import DeleteInventoryModal from "@/components/inventory/DeleteInventoryModal";
import { INVENTORY_MOCK_DATA } from "@/components/inventory/inventoryData";
import { DateRange } from "react-day-picker";
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
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from "@/lib/services/productApi";
import { useGetCategoriesQuery } from "@/store/services/settingsApi";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import type { Product } from "@/types";

type InventoryRow = {
  id: number | string;
  name: string;
  skuInfo: string;
  sku: string;
  category: string;
  warehouse: string;
  qty: number;
  minLevel: number;
  maxLevel: number;
  unitCost: string;
  totalValue: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  lastMovement: string;
  reorder: "good" | "warning" | "critical";
  image: string;
};

const formatLkr = (value: number) =>
  `Rs. ${Math.round(value).toLocaleString("en-US")}`;

const getStatus = (qty: number, minLevel: number): InventoryRow["status"] => {
  if (qty <= 0) return "Out of Stock";
  if (qty <= minLevel) return "Low Stock";
  return "In Stock";
};

const getReorder = (
  status: InventoryRow["status"],
): InventoryRow["reorder"] => {
  if (status === "Out of Stock") return "critical";
  if (status === "Low Stock") return "warning";
  return "good";
};

const buildFallbackCategoryMap = () => {
  const map = new Map<string, string>();
  for (const category of MOCK_CATEGORIES) {
    map.set(category.id, category.name);
  }
  return map;
};

const mapProductToInventoryRow = (
  product: Product,
  categoryMap: Map<string, string>,
): InventoryRow => {
  const qty = product.stockQty ?? 0;
  const minLevel = product.reorderLevel ?? 0;
  const maxLevel = Math.max(minLevel * 4 || 1, qty || 1);
  const status = getStatus(qty, minLevel);

  return {
    id: product.id,
    name: product.name,
    skuInfo: product.sku,
    sku: product.sku,
    category:
      categoryMap.get(product.categoryId) ||
      product.categoryId ||
      "Uncategorized",
    warehouse: "Main Store",
    qty,
    minLevel,
    maxLevel,
    unitCost: formatLkr(product.costPrice ?? 0),
    totalValue: formatLkr((product.costPrice ?? 0) * qty),
    status,
    lastMovement: format(new Date(), "dd/MM/yyyy"),
    reorder: getReorder(status),
    image: product.imageUrl || "/placeholder.png",
  };
};

const mapInventoryRowToProductPayload = (
  item: InventoryRow,
  categoryNameToId: Map<string, string>,
) => {
  const categoryId = categoryNameToId.get(item.category) || item.category;
  const parsedCost = Number(item.unitCost.replace(/[^0-9.]/g, "")) || 0;

  return {
    name: item.name,
    sku: item.sku,
    barcode: "",
    categoryId,
    price: parsedCost,
    costPrice: parsedCost,
    unit: "pcs",
    stockQty: item.qty,
    reorderLevel: item.minLevel,
    supplierId: "",
    imageUrl: item.image || "",
    isActive: item.status !== "Out of Stock",
  };
};

export default function InventoryPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryRow | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryRow[]>(
    INVENTORY_MOCK_DATA as InventoryRow[],
  );
  const [usingMockData, setUsingMockData] = useState<boolean>(true);

  const { data: categories = [] } = useGetCategoriesQuery();
  const {
    data: inventoryFromApi = [],
    isLoading: isInventoryLoading,
    isError: isInventoryError,
  } = useGetProductsQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const categoryMap = useMemo(() => {
    const map = buildFallbackCategoryMap();
    for (const category of categories) {
      map.set(category.id, category.name);
    }
    return map;
  }, [categories]);

  const categoryNameToIdMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories) {
      map.set(category.name, category.id);
    }
    for (const category of MOCK_CATEGORIES) {
      if (!map.has(category.name)) {
        map.set(category.name, category.id);
      }
    }
    return map;
  }, [categories]);

  useEffect(() => {
    if (isInventoryLoading) {
      return;
    }

    if (isInventoryError || inventoryFromApi.length === 0) {
      if (!usingMockData && inventoryData.length === 0) {
        setInventoryData(INVENTORY_MOCK_DATA as InventoryRow[]);
      }
      setUsingMockData(true);
      return;
    }

    const mapped = inventoryFromApi.map((item) =>
      mapProductToInventoryRow(item, categoryMap),
    );
    setInventoryData(mapped);
    setUsingMockData(false);
  }, [isInventoryLoading, isInventoryError, inventoryFromApi, categoryMap]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    null,
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 11, 1), // Dec 1, 2025
    to: new Date(2026, 0, 31), // Jan 31, 2026
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

      // 3. Date Range Filter
      let matchesDate = true;
      if (dateRange?.from) {
        const itemDate = parse(item.lastMovement, "dd/MM/yyyy", new Date());
        const start = startOfDay(dateRange.from);
        const end = dateRange.to
          ? endOfDay(dateRange.to)
          : endOfDay(dateRange.from);
        matchesDate = isWithinInterval(itemDate, { start, end });
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

  const handleEdit = (item: InventoryRow) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: InventoryRow) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) {
      setIsEditModalOpen(false);
      return;
    }

    if (!usingMockData) {
      try {
        await updateProduct({
          sku: selectedItem.sku,
          ...mapInventoryRowToProductPayload(
            selectedItem,
            categoryNameToIdMap,
          ),
        }).unwrap();
      } catch {
        setUsingMockData(true);
      }
    }

    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    if (usingMockData) {
      setInventoryData((prev) =>
        prev.filter((item) => item.id !== selectedItem.id),
      );
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      return;
    }

    try {
      await deleteProduct(selectedItem.sku).unwrap();
      setInventoryData((prev) =>
        prev.filter((item) => item.id !== selectedItem.id),
      );
    } catch {
      setUsingMockData(true);
      setInventoryData((prev) =>
        prev.filter((item) => item.id !== selectedItem.id),
      );
    }

    setIsDeleteModalOpen(false);
    setSelectedItem(null);
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

        {/* 1. KPI CARDS - Now Dynamic */}
        <InventoryKPICards data={filteredData} />

        {/* 2. ACTION ROW - Re-implemented */}
        <InventoryActionRow />

        {/* 3. INVENTORY TABLE */}
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
        />

        {/* 4. ANALYSIS SECTION */}
        <div className="space-y-10">
          <InventoryCharts data={filteredData} />
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

      {/* HIDDEN PRINT VIEW */}
      <InventoryReportView data={filteredData} dateRange={dateRange} />
    </MainLayout>
  );
}
