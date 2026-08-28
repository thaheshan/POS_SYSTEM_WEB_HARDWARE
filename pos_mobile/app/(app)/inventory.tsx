import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, Alert, ScrollView,
} from 'react-native';
import {
  Search, Package, Edit3, X, Check, AlertTriangle, RefreshCw,
} from 'lucide-react-native';
import api from '../../src/api/axiosInstance';

interface StockProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  minStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  category: string;
}

export default function InventoryScreen() {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<StockProduct | null>(null);
  const [newStock, setNewStock] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Low Stock' | 'Out of Stock'>('All');

  const fetchInventory = async () => {
    setLoading(true);
    try {
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

      const mapped: StockProduct[] = stockItems.map((item: any) => {
        const qty = Number(item.available_quantity || item.availableQuantity || item.quantity || 0);
        const min = Number(item.minimum_stock_level || item.minimumStockLevel || 5);
        return {
          id: String(item.product?.id || item.product_id || item.id),
          name: item.product?.name || item.product_name || 'Unknown',
          sku: item.product?.sku || item.sku || 'N/A',
          price: Number(item.product?.selling_price || item.product?.sellingPrice || 0),
          stock: qty,
          minStock: min,
          status: qty > min ? 'In Stock' : (qty > 0 ? 'Low Stock' : 'Out of Stock'),
          category: item.product?.category?.name || 'Uncategorized',
        };
      });

      // Products without stock records
      const stockIds = new Set(stockItems.map((s: any) => String(s.product?.id || s.product_id)));
      const noStock: StockProduct[] = allProducts
        .filter((p: any) => !stockIds.has(String(p.id)))
        .map((p: any) => ({
          id: String(p.id),
          name: p.name || 'Unknown',
          sku: p.sku || 'N/A',
          price: Number(p.sellingPrice || 0),
          stock: 0,
          minStock: 5,
          status: 'Out of Stock',
          category: p.category?.name || 'Uncategorized',
        }));

      setProducts([...mapped, ...noStock]);
    } catch (e) {
      console.error('Inventory fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const filtered = products.filter(p => {
    const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const lowCount = products.filter(p => p.status === 'Low Stock').length;
  const outCount = products.filter(p => p.status === 'Out of Stock').length;

  const handleAdjustStock = async () => {
    if (!newStock || isNaN(Number(newStock))) {
      Alert.alert('Error', 'Please enter a valid stock quantity.');
      return;
    }
    setAdjusting(true);
    try {
      await api.patch(`/products/${selectedProduct!.id}`, {
        stock: Number(newStock),
        quantity: Number(newStock),
      });
      Alert.alert('Success', 'Stock level updated successfully!');
      setSelectedProduct(null);
      fetchInventory();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update stock.';
      Alert.alert('Error', msg);
    } finally {
      setAdjusting(false);
    }
  };

  const getStatusColors = (status: string) => {
    if (status === 'In Stock') return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' };
    if (status === 'Low Stock') return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
    return { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' };
  };

  return (
    <View style={styles.container}>
      {/* Adjust Stock Modal */}
      {selectedProduct && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Adjust Stock</Text>
                <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedProduct(null)}>
                  <X size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalProductName}>{selectedProduct.name}</Text>

              <View style={styles.currentStockRow}>
                <View style={styles.currentStockBlock}>
                  <Text style={styles.currentStockLabel}>Current Stock</Text>
                  <Text style={styles.currentStockValue}>{selectedProduct.stock}</Text>
                </View>
                <View style={styles.currentStockBlock}>
                  <Text style={styles.currentStockLabel}>Min Level</Text>
                  <Text style={[styles.currentStockValue, { color: '#b45309' }]}>{selectedProduct.minStock}</Text>
                </View>
                <View style={styles.currentStockBlock}>
                  <Text style={styles.currentStockLabel}>Status</Text>
                  <View style={[styles.statusDot, {
                    backgroundColor: getStatusColors(selectedProduct.status).bg
                  }]}>
                    <Text style={[styles.statusDotText, { color: getStatusColors(selectedProduct.status).text }]}>
                      {selectedProduct.status}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>NEW STOCK QUANTITY</Text>
              <TextInput
                style={styles.stockInput}
                value={newStock}
                onChangeText={setNewStock}
                keyboardType="numeric"
                placeholder="e.g. 50"
                placeholderTextColor="#9ca3af"
                selectTextOnFocus
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedProduct(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, adjusting && { opacity: 0.7 }]}
                  onPress={handleAdjustStock}
                  disabled={adjusting}
                >
                  {adjusting ? <ActivityIndicator color="#fff" size="small" /> : (
                    <>
                      <Check size={16} color="#fff" strokeWidth={3} />
                      <Text style={styles.saveBtnText}>SAVE STOCK</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Search */}
      <View style={styles.topBar}>
        <View style={styles.searchBar}>
          <Search size={17} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or SKU..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchInventory}>
          <RefreshCw size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['All', 'Low Stock', 'Out of Stock'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f}
              {f === 'Low Stock' && lowCount > 0 ? ` (${lowCount})` : ''}
              {f === 'Out of Stock' && outCount > 0 ? ` (${outCount})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Low Stock Alert */}
      {lowCount > 0 && filter === 'All' && (
        <View style={styles.alertBanner}>
          <AlertTriangle size={16} color="#b45309" />
          <Text style={styles.alertText}>
            {lowCount} product{lowCount !== 1 ? 's are' : ' is'} low on stock and need reordering.
          </Text>
        </View>
      )}

      {/* List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Package size={44} color="#d1d5db" />
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const sc = getStatusColors(item.status);
            const pct = item.minStock > 0 ? Math.min(1, item.stock / (item.minStock * 3)) : 1;

            return (
              <View style={styles.stockCard}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  {/* Category + SKU */}
                  <View style={styles.metaRow}>
                    <View style={styles.categoryChip}>
                      <Package size={10} color="#2563eb" />
                      <Text style={styles.categoryChipText}>{item.category}</Text>
                    </View>
                    <Text style={styles.skuText}>{item.sku}</Text>
                  </View>

                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.priceText}>Rs. {item.price.toLocaleString()}</Text>

                  {/* Stock Bar */}
                  <View style={styles.stockBarRow}>
                    <View style={styles.stockBarBg}>
                      <View style={[styles.stockBarFill, {
                        width: `${Math.round(pct * 100)}%`,
                        backgroundColor: item.status === 'In Stock' ? '#059669' : item.status === 'Low Stock' ? '#f59e0b' : '#ef4444',
                      }]} />
                    </View>
                    <Text style={styles.stockBarLabel}>
                      Min: {item.minStock}
                    </Text>
                  </View>
                </View>

                <View style={styles.rightCol}>
                  {/* Stock Badge */}
                  <View style={[styles.stockBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                    <Text style={[styles.stockBadgeQty, { color: sc.text }]}>{item.stock}</Text>
                    <Text style={[styles.stockBadgeLabel, { color: sc.text }]}>units</Text>
                  </View>

                  {/* Status Chip */}
                  <View style={[styles.statusChip, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusChipText, { color: sc.text }]}>{item.status}</Text>
                  </View>

                  {/* Adjust Button */}
                  <TouchableOpacity
                    style={styles.adjustBtn}
                    onPress={() => { setSelectedProduct(item); setNewStock(String(item.stock)); }}
                  >
                    <Edit3 size={13} color="#2563eb" />
                    <Text style={styles.adjustBtnText}>Adjust</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', color: '#111827' },
  refreshBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  filterTabActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterTabText: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  filterTabTextActive: { color: '#ffffff' },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
  },
  alertText: { fontSize: 12, fontWeight: '600', color: '#b45309', flex: 1 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#9ca3af' },
  listContent: { paddingHorizontal: 12, paddingBottom: 24 },
  stockCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryChipText: { fontSize: 10, fontWeight: '700', color: '#2563eb' },
  skuText: { fontSize: 11, fontWeight: '700', color: '#9ca3af', fontFamily: 'monospace' },
  productName: { fontSize: 14, fontWeight: '900', color: '#111827', marginBottom: 4 },
  priceText: { fontSize: 12, fontWeight: '700', color: '#059669', marginBottom: 8 },
  stockBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stockBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  stockBarFill: { height: '100%', borderRadius: 3 },
  stockBarLabel: { fontSize: 10, fontWeight: '600', color: '#94a3b8' },
  rightCol: { alignItems: 'flex-end', gap: 8 },
  stockBadge: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 60,
  },
  stockBadgeQty: { fontSize: 22, fontWeight: '900', lineHeight: 26 },
  stockBadgeLabel: { fontSize: 10, fontWeight: '600' },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusChipText: { fontSize: 10, fontWeight: '700' },
  statusDot: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDotText: { fontSize: 10, fontWeight: '700' },
  adjustBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  adjustBtnText: { fontSize: 12, fontWeight: '800', color: '#2563eb' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  modalClose: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 10,
  },
  modalProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 16,
  },
  currentStockRow: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  currentStockBlock: { flex: 1, alignItems: 'center' },
  currentStockLabel: { fontSize: 10, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  currentStockValue: { fontSize: 20, fontWeight: '900', color: '#111827' },
  inputLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  stockInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 16,
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  saveBtn: {
    flex: 1.5,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
});
