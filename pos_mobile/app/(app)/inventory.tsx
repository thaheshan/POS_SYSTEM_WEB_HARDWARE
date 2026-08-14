import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import api from '../../src/api/axiosInstance';
import { Search, Package, Edit, X, Check } from 'lucide-react-native';

export default function InventoryScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      const data = res.data?.data || res.data || [];
      const items = Array.isArray(data) ? data : data.products || [];
      setProducts(items);
    } catch (e) {
      console.log('Failed to fetch inventory:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredProducts = products.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdjustStock = async () => {
    if (!newStock || isNaN(Number(newStock))) {
      Alert.alert('Error', 'Please enter a valid stock quantity.');
      return;
    }

    setAdjusting(true);
    try {
      await api.patch(`/products/${selectedProduct.id || selectedProduct._id}`, {
        stock: Number(newStock),
      });
      Alert.alert('Success', 'Stock level adjusted successfully!');
      setSelectedProduct(null);
      fetchInventory();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to adjust stock.';
      Alert.alert('Error', msg);
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Search size={18} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stock by name or SKU..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1e40af" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id || item._id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            const stockQty = Number(item.stock ?? item.quantity ?? 0);
            const isLow = stockQty <= (item.minimumStockLevel || 5);
            return (
              <View style={styles.stockCard}>
                <View style={styles.cardInfo}>
                  <View style={{ flexDirection: 'row', items: 'center', gap: 6 }}>
                    <Package size={16} color="#64748b" />
                    <Text style={styles.skuText}>SKU: {item.sku || 'N/A'}</Text>
                  </View>
                  <Text style={styles.productTitle}>{item.name}</Text>
                  <Text style={styles.priceText}>Selling Price: Rs. {Number(item.price || item.sellingPrice || 0).toLocaleString()}</Text>
                </View>

                <View style={styles.rightSide}>
                  <View style={[styles.stockBadge, isLow ? styles.lowStock : styles.normalStock]}>
                    <Text style={[styles.stockText, isLow ? styles.lowStockText : styles.normalStockText]}>
                      Qty: {stockQty}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.adjustBtn}
                    onPress={() => {
                      setSelectedProduct(item);
                      setNewStock(String(stockQty));
                    }}
                  >
                    <Edit size={14} color="#1e40af" />
                    <Text style={styles.adjustBtnText}>Adjust</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Inline Adjust Stock Modal */}
      {selectedProduct && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Adjust Stock</Text>
                <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <Text style={styles.productNameModal}>{selectedProduct.name}</Text>
              <Text style={styles.label}>New Stock Quantity</Text>
              <TextInput
                style={styles.input}
                value={newStock}
                onChangeText={setNewStock}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleAdjustStock}
                disabled={adjusting}
              >
                {adjusting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Check size={18} color="#ffffff" />
                    <Text style={styles.saveBtnText}>SAVE STOCK</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  stockCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginRight: 10,
  },
  skuText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4,
  },
  rightSide: {
    alignItems: 'flex-end',
    gap: 8,
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  normalStock: {
    backgroundColor: '#f0fdf4',
  },
  lowStock: {
    backgroundColor: '#fef2f2',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '900',
  },
  normalStockText: {
    color: '#16a34a',
  },
  lowStockText: {
    color: '#dc2626',
  },
  adjustBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  adjustBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e40af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  productNameModal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: '#1e40af',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});
