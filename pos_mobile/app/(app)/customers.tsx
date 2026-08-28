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
  ScrollView,
} from 'react-native';
import {
  Search,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  X,
  Check,
  User,
  Users,
  TrendingUp,
  CreditCard,
  RefreshCw,
} from 'lucide-react-native';
import api from '../../src/api/axiosInstance';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  totalPurchases?: number;
  totalOrders?: number;
  customerType?: string;
}

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      const data = res.data?.data || res.data || [];
      const items: Customer[] = Array.isArray(data)
        ? data.map((c: any) => ({
            id: String(c.id || c._id),
            name: c.name || c.customer_name || 'Unknown',
            phone: c.phone || c.phone_number || '',
            email: c.email || '',
            address: c.address || '',
            totalPurchases: Number(c.totalPurchases || c.total_purchases || 0),
            totalOrders: Number(c.totalOrders || c.total_orders || 0),
            customerType: c.customerType || c.customer_type || 'Individual',
          }))
        : [];
      setCustomers(items);
    } catch (e) {
      console.error('Failed to fetch customers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalSpent = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);

  const handleAddCustomer = async () => {
    if (!form.name || !form.phone) {
      Alert.alert('Required Fields', 'Please enter customer name and phone number.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/customers', form);
      Alert.alert('Success 🎉', 'Customer added successfully!');
      setModalVisible(false);
      setForm({ name: '', phone: '', email: '', address: '' });
      fetchCustomers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to add customer.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Add Customer Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add New Customer</Text>
                <Text style={styles.modalSubtitle}>Create a new client profile</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
                <X size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Kamal Perera"
                  placeholderTextColor="#9ca3af"
                  value={form.name}
                  onChangeText={(val) => setForm((f) => ({ ...f, name: val }))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 077 123 4567"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(val) => setForm((f) => ({ ...f, phone: val }))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="kamal@email.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={(val) => setForm((f) => ({ ...f, email: val }))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={[styles.input, { height: 70, textAlignVertical: 'top', paddingTop: 10 }]}
                  placeholder="123 Galle Road, Colombo"
                  placeholderTextColor="#9ca3af"
                  multiline
                  value={form.address}
                  onChangeText={(val) => setForm((f) => ({ ...f, address: val }))}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleAddCustomer}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Check size={16} color="#ffffff" strokeWidth={3} />
                    <Text style={styles.saveBtnText}>SAVE CUSTOMER</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Top Search & Add Row */}
      <View style={styles.topRow}>
        <View style={styles.searchBar}>
          <Search size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, phone, email..."
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

        <TouchableOpacity style={styles.refreshBtn} onPress={fetchCustomers}>
          <RefreshCw size={18} color="#6b7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <UserPlus size={18} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Clients</Text>
          <Text style={styles.metricValue}>{customers.length}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Revenue</Text>
          <Text style={[styles.metricValue, { color: '#059669' }]}>
            Rs. {totalSpent > 1000000 ? `${(totalSpent / 1000000).toFixed(1)}M` : totalSpent.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Customer List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : filteredCustomers.length === 0 ? (
        <View style={styles.emptyBox}>
          <Users size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No customers found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const initial = (item.name || 'C').charAt(0).toUpperCase();

            return (
              <View style={styles.customerCard}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>

                <View style={{ flex: 1, marginLeft: 14 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.customerName}>{item.name}</Text>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{item.customerType}</Text>
                    </View>
                  </View>

                  {item.phone ? (
                    <View style={styles.detailRow}>
                      <Phone size={12} color="#64748b" />
                      <Text style={styles.detailText}>{item.phone}</Text>
                    </View>
                  ) : null}

                  {item.email ? (
                    <View style={styles.detailRow}>
                      <Mail size={12} color="#64748b" />
                      <Text style={styles.detailText}>{item.email}</Text>
                    </View>
                  ) : null}

                  {item.address ? (
                    <View style={styles.detailRow}>
                      <MapPin size={12} color="#64748b" />
                      <Text style={styles.detailText} numberOfLines={1}>
                        {item.address}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.purchasesBadge}>
                  <Text style={styles.purchasesLabel}>Purchases</Text>
                  <Text style={styles.purchasesVal}>
                    Rs. {(item.totalPurchases || 0).toLocaleString()}
                  </Text>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
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
    height: 48,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', color: '#111827' },
  refreshBtn: {
    width: 46,
    height: 46,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 46,
    height: 46,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#9ca3af' },
  listContent: { paddingHorizontal: 12, paddingBottom: 24 },
  customerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2563eb',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  typeBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6b7280',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  purchasesBadge: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  purchasesLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  purchasesVal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 2,
  },
  modalCloseBtn: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 10,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: '#374151',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
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
  saveBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});
