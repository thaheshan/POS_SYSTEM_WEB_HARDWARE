'use client';

import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Clock, RefreshCcw, PlusCircle } from 'lucide-react';
import InventoryKPICards from '@/components/inventory/InventoryKPICards';
import InventoryActionRow from '@/components/inventory/InventoryActionRow';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import InventoryTable from '@/components/inventory/InventoryTable';
import InventoryCharts from '@/components/inventory/InventoryCharts';
import InventoryAlertsAction from '@/components/inventory/InventoryAlertsAction';
import EditInventoryModal from '@/components/inventory/EditInventoryModal';
import DeleteInventoryModal from '@/components/inventory/DeleteInventoryModal';
import AddProductModal from '@/components/inventory/AddProductModal';
import AdjustStockModal from '@/components/inventory/AdjustStockModal';
import PhysicalStockCountModal from '@/components/inventory/PhysicalStockCountModal';
import TransferStockModal from '@/components/inventory/TransferStockModal';
import PurchaseOrderModal from '@/components/inventory/PurchaseOrderModal';
import ImportExportModal from '@/components/inventory/ImportExportModal';
import { DateRange } from 'react-day-picker';
import api from '@/api/axiosInstance';
import { format, parse, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import SalesDatePicker from '@/components/sales/SalesDatePicker';
import * as Popover from '@radix-ui/react-popover';
import { Calendar as CalendarIcon, FileDown } from 'lucide-react';
import InventoryReportView from '@/components/inventory/InventoryReportView';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [isPhysicalStockModalOpen, setIsPhysicalStockModalOpen] = useState(false);
  const [isTransferStockModalOpen, setIsTransferStockModalOpen] = useState(false);
  const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [prefillItems, setPrefillItems] = useState<string[]>([]);

  React.useEffect(() => {
    fetchInventory();
    
    // Check for purchase order prefill from dashboard
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('po') === 'true') {
        const items = params.get('items');
        if (items) {
          setPrefillItems(items.split(','));
        }
        setIsPurchaseOrderModalOpen(true);
        // Clean up URL without reloading
        window.history.replaceState({}, '', '/inventory');
      }
    }
  }, []);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);

      // Fetch both stock records and all products in parallel
      const [stockRes, productsRes] = await Promise.allSettled([
        api.get('/stock'),
        api.get('/products'),
      ]);

      const stockItems: any[] = stockRes.status === 'fulfilled'
        ? (stockRes.value.data?.data || stockRes.value.data || [])
        : [];

      const allProducts: any[] = productsRes.status === 'fulfilled'
        ? (productsRes.value.data?.data || productsRes.value.data || [])
        : [];

      // Build a set of productIds that already have stock records
      const stockProductIds = new Set(stockItems.map((s: any) => s.product_id || s.productId));

      // Map stock records to display shape
      const mappedStock = stockItems.map((item: any) => {
        const qty = item.available_quantity ?? item.quantity ?? 0;
        const minStock = item.minimum_stock_level ?? 0;
        const cost = item.selling_price ?? item.product?.sellingPrice ?? 0;
        const totalVal = qty * cost;
        const status =
          qty <= 0
            ? 'Out of Stock'
            : item.low_stock
            ? 'Low Stock'
            : 'In Stock';

        return {
          id: item.product_id || item.id,
          name: item.product_name || item.product?.name || 'Unknown',
          sku: item.sku || item.product?.sku || 'N/A',
          skuInfo: item.sku || item.product?.sku || 'N/A',
          category: item.category_name || item.product?.category?.name || 'Uncategorized',
          warehouse: item.warehouse_name || item.warehouse?.name || 'Main Warehouse',
          image: item.image_url || item.product?.image_url || item.image || null,
          qty,
          maxLevel: Math.max(minStock, qty, 1),
          minStock,
          unit: 'units',
          status,
          unitCost: `Rs. ${Number(cost).toLocaleString()}`,
          totalValue: `Rs. ${Number(totalVal).toLocaleString()}`,
          lastMovement: new Date().toLocaleDateString('en-GB'),
          reorder: qty <= 0 ? 'critical' : item.low_stock ? 'warning' : 'good',
          quantity: qty,
          price: cost,
          cost,
          purchasePrice: item.product?.purchasePrice ?? item.purchase_price ?? 0,
          sellingPrice: item.product?.sellingPrice ?? item.selling_price ?? 0,
          warehouseId: item.warehouse_id,
          productId: item.product_id,
        };
      });

      // Map products that have NO stock record yet
      const mappedNoStock = allProducts
        .filter((p: any) => !stockProductIds.has(p.id))
        .map((p: any) => {
          const cost = Number(p.sellingPrice) || 0;
          return {
            id: p.id,
            name: p.name || 'Unknown',
            sku: p.sku || 'N/A',
            skuInfo: p.sku || 'N/A',
            category: p.category?.name || 'Uncategorized',
            warehouse: '—',
            image: p.images?.[0]?.imageUrl || null,
            qty: 0,
            maxLevel: Number(p.minimumStockLevel) || 1,
            minStock: Number(p.minimumStockLevel) || 0,
            unit: 'units',
            status: 'Out of Stock',
            unitCost: `Rs. ${cost.toLocaleString()}`,
            totalValue: 'Rs. 0',
            lastMovement: new Date(p.createdAt).toLocaleDateString('en-GB'),
            reorder: 'critical',
            quantity: 0,
            price: cost,
            cost,
            purchasePrice: Number(p.purchasePrice) || 0,
            sellingPrice: cost,
            warehouseId: null,
            productId: p.id,
          };
        });

      setInventoryData([...mappedStock, ...mappedNoStock]);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };


  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()),
    to: new Date()
  });

  // Filter Stats
  const hasActiveFilters = !!(selectedCategory || selectedWarehouse || selectedStatus);
  const activeFilterCount = [selectedCategory, selectedWarehouse, selectedStatus].filter(Boolean).length;

  // Dynamic Filtering Logic
  const filteredData = useMemo(() => {
    return inventoryData.filter((item) => {
      // 1. Text Search
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Select Filters
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      const matchesWarehouse = !selectedWarehouse || item.warehouse === selectedWarehouse;
      const matchesStatus = !selectedStatus || item.status === selectedStatus;

      // 3. Date Range Filter — skip if no date range set
      let matchesDate = true;
      if (dateRange?.from && item.lastMovement && item.lastMovement !== 'Invalid Date') {
        try {
          const itemDate = parse(item.lastMovement, 'dd/MM/yyyy', new Date());
          if (!isNaN(itemDate.getTime())) {
            const start = startOfDay(dateRange.from);
            const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
            matchesDate = isWithinInterval(itemDate, { start, end });
          }
        } catch {
          matchesDate = true; // Don't filter if date can't be parsed
        }
      }

      return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus && matchesDate;
    });
  }, [searchTerm, selectedCategory, selectedWarehouse, selectedStatus, dateRange, inventoryData]);

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedWarehouse(null);
    setSelectedStatus(null);
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
      fetchInventory(); // Refresh inventory data list
    } catch (error: any) {
      console.error('Failed to update product details:', error);
      alert(error?.response?.data?.message || 'Failed to update product. Please try again.');
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
      console.error('Failed to delete product:', error);
      alert(error?.response?.data?.message || 'Failed to delete product. Please try again.');
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
            <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-none mb-2">Inventory Management</h1>
            <p className="text-[14px] font-bold text-gray-400">Track stock levels, manage products, and monitor inventory in real-time</p>
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
                        {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                      </>
                    ) : (
                      format(dateRange.from, 'MMM d, yyyy')
                    )
                  ) : (
                    "Select Date Range"
                  )}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className="bg-white p-6 rounded-[24px] shadow-2xl border border-gray-100 z-50 w-[360px] animate-in fade-in zoom-in-95 duration-200" sideOffset={8} align="end">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[15px] font-black text-gray-900">Reporting Period</h3>
                    <button onClick={() => setDateRange(undefined)} className="text-[11px] font-bold text-emerald-600 hover:underline">Reset</button>
                  </div>
                  <SalesDatePicker dateRange={dateRange} onSelect={setDateRange} />
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
        <InventoryActionRow 
          onAddProduct={() => setIsAddProductModalOpen(true)}
          onAdjustStock={() => setIsAdjustStockModalOpen(true)}
          onPhysicalStockCount={() => setIsPhysicalStockModalOpen(true)}
          onTransferStock={() => setIsTransferStockModalOpen(true)}
          onPurchaseOrder={() => setIsPurchaseOrderModalOpen(true)}
          onImportExport={() => setIsImportExportModalOpen(true)}
        />

        {/* 3. INVENTORY TABLE */}
        {isLoading ? (
          <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
          selectedStatus
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
        onClose={() => setIsTransferStockModalOpen(false)}
        onSuccess={() => {
          setIsTransferStockModalOpen(false);
          fetchInventory();
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
          fetchInventory();
        }}
        prefillProductIds={prefillItems}
      />

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        onSuccess={() => {
          setIsImportExportModalOpen(false);
          fetchInventory();
        }}
        inventoryData={inventoryData}
      />

      {/* HIDDEN PRINT VIEW */}
      <InventoryReportView 
        data={filteredData} 
        dateRange={dateRange} 
      />
    </MainLayout>
  );
}

