import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, ScrollView, Alert, Animated, Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Plus, Minus, Package, ShoppingCart, X, CheckCircle2,
  AlertTriangle, Banknote, CreditCard, ArrowLeft, ChevronDown, Users,
} from 'lucide-react-native';
import { RootState } from '../../src/store';
import { addToCart, updateQuantity, clearCart, setPaymentMethod, setSelectedCustomer } from '../../src/store/slices/cartSlice';
import api from '../../src/api/axiosInstance';

const { width, height } = Dimensions.get('window');

// ── Qty Popup Modal ─────────────────────────────────────────────────────────
function QtyPopup({ product, currentQty, onConfirm, onClose }: any) {
  const [qty, setQty] = useState<number | string>(currentQty > 0 ? currentQty : 1);
  const isLoose = product?.sellType === 'loose';
  const parsedQty = typeof qty === 'string' ? parseFloat(qty) || 0 : qty;
  const total = (product?.price || 0) * Math.max(0, parsedQty);

  const handleConfirm = () => {
    const finalQty = Math.max(isLoose ? 0.01 : 1, parsedQty);
    if (finalQty > (product?.stock || 0)) {
      Alert.alert('Stock Exceeded', `Cannot add ${parsedQty}. Only ${product?.stock} ${isLoose ? (product?.measurementUnit || 'units') : 'items'} in stock.`);
      return;
    }
    onConfirm(finalQty);
  };

  return (
    <Modal visible transparent animationType="fade">
      <TouchableOpacity style={styles.qtyOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.qtyModal} activeOpacity={1} onPress={e => e.stopPropagation()}>
          {/* Product Header */}
          <View style={styles.qtyHeader}>
            <View style={styles.qtyProductImg}>
              <Package size={32} color="#d1d5db" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.qtyCategory}>{product?.category}</Text>
              <Text style={styles.qtyProductName} numberOfLines={2}>{product?.name}</Text>
              <Text style={styles.qtyPrice}>Rs. {(product?.price || 0).toLocaleString()} / {isLoose ? (product?.measurementUnit || 'unit') : 'unit'}</Text>
              <Text style={styles.qtyAvailable}>Available: {product?.stock} {isLoose ? product?.measurementUnit : ''}</Text>
            </View>
            <TouchableOpacity style={styles.qtyClose} onPress={onClose}>
              <X size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Qty Input */}
          <View style={styles.qtyBody}>
            <Text style={styles.qtyInputLabel}>{isLoose ? `Enter Measurement (${product?.measurementUnit || 'kg/m'})` : 'Enter Quantity'}</Text>
            <View style={styles.qtyRow}>
              {!isLoose && (
                <TouchableOpacity
                  style={styles.qtyStepBtn}
                  onPress={() => setQty(q => Math.max(1, (typeof q === 'number' ? q : 1) - 1))}
                >
                  <Minus size={18} color="#374151" />
                </TouchableOpacity>
              )}
              <TextInput
                style={[styles.qtyInput, isLoose && { flex: 1 }]}
                value={String(qty)}
                onChangeText={setQty}
                keyboardType="numeric"
                selectTextOnFocus
              />
              {!isLoose && (
                <TouchableOpacity
                  style={[styles.qtyStepBtn, styles.qtyStepBtnGreen]}
                  onPress={() => setQty(q => (typeof q === 'number' ? q : 1) + 1)}
                >
                  <Plus size={18} color="#fff" strokeWidth={3} />
                </TouchableOpacity>
              )}
            </View>

            {/* Line Total */}
            <View style={styles.qtyTotalBox}>
              <View>
                <Text style={styles.qtyTotalCalc}>{parsedQty} × Rs. {(product?.price || 0).toLocaleString()}</Text>
                <Text style={styles.qtyTotalLabel}>LINE TOTAL</Text>
              </View>
              <Text style={styles.qtyTotalValue}>Rs. {total.toLocaleString()}</Text>
            </View>

            {/* Actions */}
            <View style={styles.qtyActions}>
              <TouchableOpacity style={styles.qtyCancelBtn} onPress={onClose}>
                <Text style={styles.qtyCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.qtyConfirmBtn} onPress={handleConfirm}>
                <Text style={styles.qtyConfirmText}>ADD TO CART</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Cart Sidebar ─────────────────────────────────────────────────────────────
function CartSidebar({ visible, onClose, products }: any) {
  const cart = useSelector((state: RootState) => state.cart.items);
  const paymentMethod = useSelector((state: RootState) => state.cart.paymentMethod);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'items' | 'checkout'>('items');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const total = subtotal;
  const change = amountPaid ? Math.max(0, Number(amountPaid) - total) : 0;

  const hasLowStock = useMemo(() => {
    return cart.some(item => {
      const p = products.find((p: any) => p.id === item.id);
      return p?.status === 'Low Stock';
    });
  }, [cart, products]);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Cart Empty', 'Please add products to cart.');
      return;
    }
    setCheckoutLoading(true);
    try {
      const payload = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.qty,
          unitPrice: item.price,
          warehouseId: item.warehouseId,
        })),
        saleType: paymentMethod === 'card' ? 'CARD' : 'CASH',
        paymentMethod: paymentMethod.toUpperCase(),
        paymentStatus: 'PAID',
        subtotal: total,
        totalAmount: total,
        notes,
        amountTendered: Number(amountPaid) || total,
        change,
      };
      await api.post('/sales', payload);
      setShowSuccess(true);
      dispatch(clearCart());
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setActiveTab('items');
        setAmountPaid('');
        setNotes('');
      }, 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Checkout failed. Please try again.';
      Alert.alert('Checkout Error', msg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!visible) return null;

  if (showSuccess) {
    return (
      <Modal visible transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successBox}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Sale Completed!</Text>
            <Text style={styles.successMsg}>Invoice processed successfully.</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.sidebarOverlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <View style={styles.sidebar}>
          {/* Tab Switcher */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'items' && styles.tabActive]}
              onPress={() => setActiveTab('items')}
            >
              <ShoppingCart size={14} color={activeTab === 'items' ? '#059669' : '#9ca3af'} />
              <Text style={[styles.tabText, activeTab === 'items' && styles.tabTextActive]}>
                CART ({cart.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'checkout' && styles.tabActiveGreen]}
              onPress={() => setActiveTab('checkout')}
            >
              <CheckCircle2 size={14} color={activeTab === 'checkout' ? '#ffffff' : '#9ca3af'} />
              <Text style={[styles.tabText, activeTab === 'checkout' && styles.tabTextWhite]}>
                CHECKOUT
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabClose} onPress={onClose}>
              <X size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {activeTab === 'items' ? (
              <View style={styles.cartPanel}>
                <View style={styles.cartPanelHeader}>
                  <Text style={styles.cartPanelTitle}>Cart Items</Text>
                  <TouchableOpacity onPress={() => dispatch(clearCart())}>
                    <Text style={styles.clearAllBtn}>Clear All</Text>
                  </TouchableOpacity>
                </View>

                {hasLowStock && (
                  <View style={styles.lowStockWarning}>
                    <AlertTriangle size={14} color="#b45309" />
                    <Text style={styles.lowStockText}>Some items are low on stock</Text>
                  </View>
                )}

                {cart.map((item) => (
                  <View key={item.id} style={styles.cartItem}>
                    <View style={styles.cartItemImg}>
                      <Package size={20} color="#d1d5db" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.cartItemPrice}>Rs. {item.price.toLocaleString()}</Text>
                    </View>
                    <View style={styles.cartQtyRow}>
                      <TouchableOpacity
                        style={styles.cartQtyBtn}
                        onPress={() => dispatch(updateQuantity({ id: item.id, qty: item.qty - 1 }))}
                      >
                        <Minus size={12} color="#374151" />
                      </TouchableOpacity>
                      <Text style={styles.cartQtyText}>{item.qty}</Text>
                      <TouchableOpacity
                        style={[styles.cartQtyBtn, styles.cartQtyBtnGreen]}
                        onPress={() => dispatch(updateQuantity({ id: item.id, qty: item.qty + 1 }))}
                      >
                        <Plus size={12} color="#fff" strokeWidth={3} />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.cartRemoveBtn}
                      onPress={() => dispatch(updateQuantity({ id: item.id, qty: 0 }))}
                    >
                      <X size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Subtotal */}
                <View style={styles.cartSubtotalRow}>
                  <Text style={styles.cartSubtotalLabel}>Subtotal</Text>
                  <Text style={styles.cartSubtotalValue}>Rs. {subtotal.toLocaleString()}</Text>
                </View>

                <TouchableOpacity
                  style={styles.proceedBtn}
                  onPress={() => setActiveTab('checkout')}
                >
                  <CheckCircle2 size={16} color="#fff" />
                  <Text style={styles.proceedBtnText}>PROCEED TO CHECKOUT</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.checkoutPanel}>
                <Text style={styles.checkoutSectionLabel}>PAYMENT METHOD</Text>
                <View style={styles.paymentRow}>
                  <TouchableOpacity
                    style={[styles.paymentBtn, paymentMethod === 'cash' && styles.paymentBtnActive]}
                    onPress={() => dispatch(setPaymentMethod('CASH'))}
                  >
                    <Banknote size={16} color={paymentMethod === 'cash' ? '#fff' : '#374151'} />
                    <Text style={[styles.paymentBtnText, paymentMethod === 'cash' && styles.paymentBtnTextWhite]}>Cash</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.paymentBtn, paymentMethod === 'card' && styles.paymentBtnActive]}
                    onPress={() => dispatch(setPaymentMethod('CARD'))}
                  >
                    <CreditCard size={16} color={paymentMethod === 'card' ? '#fff' : '#374151'} />
                    <Text style={[styles.paymentBtnText, paymentMethod === 'card' && styles.paymentBtnTextWhite]}>Card</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.paymentBtn, paymentMethod === 'credit' && styles.paymentBtnActive]}
                    onPress={() => dispatch(setPaymentMethod('CREDIT'))}
                  >
                    <CreditCard size={16} color={paymentMethod === 'credit' ? '#fff' : '#374151'} />
                    <Text style={[styles.paymentBtnText, paymentMethod === 'credit' && styles.paymentBtnTextWhite]}>Credit</Text>
                  </TouchableOpacity>
                </View>

                {paymentMethod === 'cash' && (
                  <View style={styles.coField}>
                    <Text style={styles.checkoutSectionLabel}>AMOUNT TENDERED</Text>
                    <TextInput
                      style={styles.coInput}
                      placeholder="0.00"
                      placeholderTextColor="#9ca3af"
                      value={amountPaid}
                      onChangeText={setAmountPaid}
                      keyboardType="numeric"
                    />
                    {amountPaid ? (
                      <View style={styles.changeRow}>
                        <Text style={styles.changeLabel}>Change Due</Text>
                        <Text style={[styles.changeValue, change < 0 ? { color: '#ef4444' } : {}]}>
                          Rs. {change.toLocaleString()}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                )}

                <View style={styles.coField}>
                  <Text style={styles.checkoutSectionLabel}>NOTES (OPTIONAL)</Text>
                  <TextInput
                    style={[styles.coInput, { height: 70, textAlignVertical: 'top', paddingTop: 10 }]}
                    placeholder="Add any notes..."
                    placeholderTextColor="#9ca3af"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                  />
                </View>

                {/* Order Summary */}
                <View style={styles.orderSummary}>
                  <View style={styles.orderSummaryRow}>
                    <Text style={styles.orderSummaryLabel}>Items ({cart.length})</Text>
                    <Text style={styles.orderSummaryValue}>Rs. {subtotal.toLocaleString()}</Text>
                  </View>
                  <View style={[styles.orderSummaryRow, styles.orderSummaryTotal]}>
                    <Text style={styles.orderTotalLabel}>TOTAL</Text>
                    <Text style={styles.orderTotalValue}>Rs. {total.toLocaleString()}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.completeSaleBtn, checkoutLoading && { opacity: 0.7 }]}
                  onPress={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading
                    ? <ActivityIndicator color="#fff" />
                    : <>
                        <CheckCircle2 size={18} color="#fff" />
                        <Text style={styles.completeSaleBtnText}>COMPLETE SALE</Text>
                      </>
                  }
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── Main POS Screen ─────────────────────────────────────────────────────────
export default function POSScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingProduct, setPendingProduct] = useState<any>(null);
  const [cartVisible, setCartVisible] = useState(false);

  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  const fetchProducts = async () => {
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

      const stockIds = new Set(stockItems.map((s: any) => String(s.product_id || s.productId)));

      const mapped = stockItems.map((item: any, i: number) => {
        const name = item.product?.name || item.product_name || 'Unknown';
        const qty = Number(item.available_quantity || item.availableQuantity || item.quantity || 0);
        const prodId = String(item.product?.id || item.product_id || item.productId || item.id || `f-${i}`);

        return {
          id: prodId,
          name,
          sku: item.product?.sku || item.sku || 'N/A',
          price: Number(item.product?.selling_price || item.product?.sellingPrice || item.selling_price || 0),
          stock: qty,
          status: qty > 10 ? 'In Stock' : (qty > 0 ? 'Low Stock' : 'Out of Stock'),
          category: item.product?.category?.name || item.category_name || 'All',
          img: item.image_url || item.product?.image_url || null,
          warehouseId: item.warehouseId || item.warehouse_id,
          sellType: 'fixed',
          measurementUnit: 'unit',
        };
      });

      const noStock = allProducts
        .filter((p: any) => !stockIds.has(String(p.id)))
        .map((p: any) => ({
          id: String(p.id),
          name: p.name || 'Unknown',
          sku: p.sku || 'N/A',
          price: Number(p.sellingPrice || 0),
          stock: 0,
          status: 'Out of Stock',
          category: p.category?.name || 'All',
          img: p.images?.[0]?.imageUrl || null,
          warehouseId: undefined,
          sellType: 'fixed',
          measurementUnit: 'unit',
        }));

      setProducts([...mapped, ...noStock]);
    } catch (e) {
      console.error('POS fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      const items = res.data?.data || res.data || [];
      const names = items.map((c: any) => c.name).filter(Boolean);
      setCategories(['All', ...Array.from(new Set(names)) as string[]]);
    } catch (e) {}
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const s = search.toLowerCase();
      const matchSearch = (p.name || '').toLowerCase().includes(s) || (p.sku || '').toLowerCase().includes(s);
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, search]);

  const totalItems = cart.reduce((a, b) => a + b.qty, 0);
  const subtotal = cart.reduce((a, b) => a + b.price * b.qty, 0);

  const handleAddToCart = (product: any, qty: number) => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty,
      sku: product.sku,
      warehouseId: product.warehouseId,
    }));
    setPendingProduct(null);
    setCartVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Qty Popup */}
      {pendingProduct && (
        <QtyPopup
          product={pendingProduct}
          currentQty={cart.find(c => c.id === pendingProduct.id)?.qty ?? 0}
          onConfirm={(qty: number) => handleAddToCart(pendingProduct, qty)}
          onClose={() => setPendingProduct(null)}
        />
      )}

      {/* Cart Sidebar */}
      <CartSidebar visible={cartVisible} onClose={() => setCartVisible(false)} products={products} />

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search product name, SKU..."
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
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((cat, i) => (
          <TouchableOpacity
            key={`${cat}-${i}`}
            style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.catPillText, activeCategory === cat && styles.catPillTextActive]}>
              {cat.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product Grid */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Package size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => `${item.id}-${item.warehouseId || 'x'}`}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: totalItems > 0 ? 100 : 16 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const inCart = cart.find(c => c.id === item.id);
            const isOutOfStock = item.stock === 0;

            return (
              <TouchableOpacity
                style={[
                  styles.productCard,
                  inCart && styles.productCardInCart,
                  isOutOfStock && styles.productCardOOS,
                ]}
                onPress={() => !isOutOfStock && setPendingProduct(item)}
                activeOpacity={0.85}
              >
                {/* Product Image Area */}
                <View style={styles.productImgArea}>
                  <View style={styles.productImgPlaceholder}>
                    <Package size={36} color="#d1d5db" />
                  </View>
                  {/* Status Badge */}
                  <View style={[styles.stockBadge,
                    item.status === 'In Stock' ? styles.stockBadgeGreen :
                    item.status === 'Low Stock' ? styles.stockBadgeAmber :
                    styles.stockBadgeRed
                  ]}>
                    <Text style={styles.stockBadgeText}>{item.status}</Text>
                  </View>
                  {/* In-Cart Badge */}
                  {inCart && (
                    <View style={styles.inCartBadge}>
                      <Text style={styles.inCartBadgeText}>{inCart.qty} pcs</Text>
                    </View>
                  )}
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
                  <View style={styles.productMetaRow}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{item.category}</Text>
                    </View>
                    <Text style={styles.skuText}>{item.sku}</Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabelSmall}>Price</Text>
                    <Text style={styles.priceValue}>Rs. {item.price.toLocaleString()}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Floating Cart Bar */}
      {totalItems > 0 && (
        <TouchableOpacity style={styles.floatingCartBar} onPress={() => setCartVisible(true)} activeOpacity={0.9}>
          <View style={styles.floatingCartLeft}>
            <ShoppingCart size={18} color="#fff" />
            <Text style={styles.floatingCartLabel}>VIEW CART ({cart.length})</Text>
          </View>
          <Text style={styles.floatingCartTotal}>Rs. {subtotal.toLocaleString()}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  // Search
  searchSection: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', color: '#111827' },

  // Categories
  categoryScroll: { flexGrow: 0 },
  categoryContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  catPillActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  catPillTextActive: { color: '#ffffff' },

  // Loading/Empty
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#9ca3af' },

  // Product Grid
  productRow: { justifyContent: 'space-between', marginBottom: 14 },
  productCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  productCardInCart: {
    borderColor: '#059669',
    shadowColor: '#059669',
    shadowOpacity: 0.15,
  },
  productCardOOS: { opacity: 0.55 },
  productImgArea: {
    height: 140,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productImgPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  stockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockBadgeGreen: { backgroundColor: '#059669' },
  stockBadgeAmber: { backgroundColor: '#f59e0b' },
  stockBadgeRed: { backgroundColor: '#ef4444' },
  stockBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
  inCartBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  inCartBadgeText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  productInfo: { padding: 12 },
  productMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryTag: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryTagText: { fontSize: 9, fontWeight: '900', color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5 },
  skuText: { fontSize: 10, fontWeight: '700', color: '#9ca3af', fontFamily: 'monospace' },
  productName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 18,
    marginBottom: 10,
    minHeight: 36,
  },
  priceRow: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
  priceLabelSmall: { fontSize: 9, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  priceValue: { fontSize: 16, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },

  // Floating Cart
  floatingCartBar: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    right: 12,
    backgroundColor: '#059669',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  floatingCartLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  floatingCartLabel: { fontSize: 13, fontWeight: '900', color: '#ffffff', letterSpacing: 0.5 },
  floatingCartTotal: { fontSize: 14, fontWeight: '900', color: '#ffffff' },

  // Qty Popup
  qtyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  qtyModal: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  qtyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  qtyProductImg: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qtyClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    padding: 6,
  },
  qtyCategory: { fontSize: 9, fontWeight: '900', color: '#059669', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 },
  qtyProductName: { fontSize: 14, fontWeight: '900', color: '#111827', lineHeight: 19, marginBottom: 4 },
  qtyPrice: { fontSize: 11, fontWeight: '700', color: '#9ca3af' },
  qtyAvailable: { fontSize: 11, fontWeight: '700', color: '#f59e0b', marginTop: 2 },
  qtyBody: { padding: 20, gap: 16 },
  qtyInputLabel: { fontSize: 10, fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyStepBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qtyStepBtnGreen: {
    backgroundColor: '#059669',
    borderColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  qtyInput: {
    width: 100,
    height: 60,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  qtyTotalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#d1fae5',
    borderRadius: 16,
    padding: 16,
  },
  qtyTotalCalc: { fontSize: 11, fontWeight: '700', color: '#9ca3af' },
  qtyTotalLabel: { fontSize: 10, fontWeight: '900', color: '#059669', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  qtyTotalValue: { fontSize: 22, fontWeight: '900', color: '#059669' },
  qtyActions: { flexDirection: 'row', gap: 12 },
  qtyCancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyCancelText: { fontSize: 14, fontWeight: '700', color: '#6b7280' },
  qtyConfirmBtn: {
    flex: 1.5,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  qtyConfirmText: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },

  // Cart Sidebar
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sidebar: {
    width: width > 600 ? 420 : width * 0.92,
    backgroundColor: '#ffffff',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    margin: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 6,
    gap: 4,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  tabActiveGreen: { backgroundColor: '#059669' },
  tabText: { fontSize: 11, fontWeight: '900', color: '#9ca3af', letterSpacing: 0.3 },
  tabTextActive: { color: '#059669' },
  tabTextWhite: { color: '#ffffff' },
  tabClose: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },

  // Cart Panel
  cartPanel: { padding: 16 },
  cartPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartPanelTitle: { fontSize: 12, fontWeight: '900', color: '#374151', textTransform: 'uppercase', letterSpacing: 1 },
  clearAllBtn: { fontSize: 12, fontWeight: '700', color: '#ef4444' },
  lowStockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  lowStockText: { fontSize: 12, fontWeight: '600', color: '#b45309', flex: 1 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cartItemImg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartItemName: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 },
  cartItemPrice: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  cartQtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 8 },
  cartQtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartQtyBtnGreen: { backgroundColor: '#059669' },
  cartQtyText: { fontSize: 14, fontWeight: '900', color: '#111827', minWidth: 24, textAlign: 'center' },
  cartRemoveBtn: { padding: 6, marginLeft: 4 },
  cartSubtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
  },
  cartSubtotalLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },
  cartSubtotalValue: { fontSize: 18, fontWeight: '900', color: '#111827' },
  proceedBtn: {
    backgroundColor: '#059669',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedBtnText: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },

  // Checkout Panel
  checkoutPanel: { padding: 16, gap: 16 },
  checkoutSectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  paymentRow: { flexDirection: 'row', gap: 10 },
  paymentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  paymentBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentBtnText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  paymentBtnTextWhite: { color: '#ffffff' },
  coField: { gap: 4 },
  coInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 6,
  },
  changeLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  changeValue: { fontSize: 14, fontWeight: '900', color: '#059669' },
  orderSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  orderSummaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  orderSummaryLabel: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  orderSummaryValue: { fontSize: 13, fontWeight: '700', color: '#111827' },
  orderSummaryTotal: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 2,
  },
  orderTotalLabel: { fontSize: 13, fontWeight: '900', color: '#111827', textTransform: 'uppercase', letterSpacing: 0.5 },
  orderTotalValue: { fontSize: 22, fontWeight: '900', color: '#059669' },
  completeSaleBtn: {
    backgroundColor: '#059669',
    borderRadius: 14,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeSaleBtnText: { fontSize: 15, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },

  // Success
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBox: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  successEmoji: { fontSize: 56, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 8 },
  successMsg: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
});
