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
import { INVENTORY_MOCK_DATA } from '@/components/inventory/inventoryData';
import { DateRange } from 'react-day-picker';
import { format, parse, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import SalesDatePicker from '@/components/sales/SalesDatePicker';
import * as Popover from '@radix-ui/react-popover';
import { Calendar as CalendarIcon, FileDown } from 'lucide-react';
import InventoryReportView from '@/components/inventory/InventoryReportView';

export default function InventoryPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState(INVENTORY_MOCK_DATA);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 11, 1), // Dec 1, 2025
    to: new Date(2026, 0, 31)   // Jan 31, 2026
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

      // 3. Date Range Filter
      let matchesDate = true;
      if (dateRange?.from) {
        const itemDate = parse(item.lastMovement, 'dd/MM/yyyy', new Date());
        const start = startOfDay(dateRange.from);
        const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        matchesDate = isWithinInterval(itemDate, { start, end });
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

  const handleSaveEdit = () => {
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  const handleConfirmDelete = () => {
    setInventoryData(prev => prev.filter(item => item.id !== selectedItem.id));
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
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

      {/* HIDDEN PRINT VIEW */}
      <InventoryReportView 
        data={filteredData} 
        dateRange={dateRange} 
      />
    </MainLayout>
  );
}

