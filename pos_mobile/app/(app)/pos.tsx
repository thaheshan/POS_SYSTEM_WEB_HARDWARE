import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { addToCart, updateQuantity, clearCart } from '../../src/store/slices/cartSlice';
import api from '../../src/api/axiosInstance';
import { Search, Plus, Minus, ShoppingCart, CheckCircle, Trash2, X } from 'lucide-react-native';

export default function POSScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      const data = res.data?.data || res.data || [];
      const items = Array.isArray(data) ? data : data.products || [];
      setProducts(items);
    } catch (e) {
      console.log('Failed to fetch products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Cart Empty', 'Please add products to cart first.');
      return;
    }

    setCheckoutLoading(true);
    try {
      const payload = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.qty,
          unitPrice: item.price,
        })),
        saleType: 'CASH',
        paymentStatus: 'PAID',
        subtotal,
        totalAmount: subtotal,
      };

      await api.post('/sales', payload);
      Alert.alert('Sale Completed! 🎉', `Invoice processed successfully for Rs. ${subtotal.toLocaleString()}`);
      dispatch(clearCart());
      setCartVisible(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Checkout failed. Please try again.';
      Alert.alert('Checkout Error', msg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchBar}>
        <Search size={18} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products or SKU..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Product Grid / List */}
      {loading ? (
        <ActivityIndicator size="large" color="#1e40af" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id || item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            const inCart = cart.find(c => c.id === (item.id || item._id));
            return (
              <View style={styles.productCard}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>SKU: {item.sku || 'N/A'}</Text>
                </View>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productPrice}>Rs. {Number(item.price || item.sellingPrice || 0).toLocaleString()}</Text>

                {inCart ? (
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => dispatch(updateQuantity({ id: inCart.id, qty: inCart.qty - 1 }))}
                    >
                      <Minus size={14} color="#1e40af" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{inCart.qty}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => dispatch(updateQuantity({ id: inCart.id, qty: inCart.qty + 1 }))}
                    >
                      <Plus size={14} color="#1e40af" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() =>
                      dispatch(
                        addToCart({
                          id: item.id || item._id,
                          name: item.name,
                          price: Number(item.price || item.sellingPrice || 0),
                          qty: 1,
                        })
                      )
                    }
                  >
                    <Plus size={16} color="#ffffff" />
                    <Text style={styles.addBtnText}>ADD TO CART</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Floating Cart Button */}
      {totalItemsCount > 0 && (
        <TouchableOpacity style={styles.floatingCart} onPress={() => setCartVisible(true)}>
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItemsCount}</Text>
          </View>
          <ShoppingCart size={22} color="#ffffff" />
          <Text style={styles.cartBarText}>VIEW CART • Rs. {subtotal.toLocaleString()}</Text>
        </TouchableOpacity>
      )}

      {/* Cart Modal */}
      <Modal visible={cartVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Checkout Cart ({totalItemsCount})</Text>
              <TouchableOpacity onPress={() => setCartVisible(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={cart}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.cartItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemSub}>Rs. {item.price.toLocaleString()} × {item.qty}</Text>
                  </View>
                  <Text style={styles.cartItemTotal}>Rs. {(item.price * item.qty).toLocaleString()}</Text>
                  <TouchableOpacity
                    style={{ marginLeft: 12 }}
                    onPress={() => dispatch(updateQuantity({ id: item.id, qty: 0 }))}
                  >
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              )}
            />

            <View style={styles.cartFooter}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>Rs. {subtotal.toLocaleString()}</Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <CheckCircle size={18} color="#ffffff" />
                    <Text style={styles.checkoutBtnText}>COMPLETE SALE</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  productName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1e40af',
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0f172a',
  },
  floatingCart: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#1e40af',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  cartBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  cartBarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  cartItemSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  cartItemTotal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1e40af',
  },
  cartFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748b',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#059669',
  },
  checkoutBtn: {
    backgroundColor: '#059669',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});
