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
import { Search, UserPlus, Phone, Mail, MapPin, X, Check, User } from 'lucide-react-native';

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Add Customer Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      const data = res.data?.data || res.data || [];
      const items = Array.isArray(data) ? data : data.customers || [];
      setCustomers(items);
    } catch (e) {
      console.log('Failed to fetch customers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  const handleAddCustomer = async () => {
    if (!form.name || !form.phone) {
      Alert.alert('Required Fields', 'Please enter customer name and phone number.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/customers', form);
      Alert.alert('Success', 'Customer added successfully!');
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
      <View style={styles.topRow}>
        <View style={styles.searchBar}>
          <Search size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name or phone..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <UserPlus size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1e40af" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={item => item.id || item._id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.customerCard}>
              <View style={styles.avatarCircle}>
                <User size={20} color="#1e40af" />
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.customerName}>{item.name}</Text>

                <View style={styles.detailRow}>
                  <Phone size={12} color="#64748b" />
                  <Text style={styles.detailText}>{item.phone || 'N/A'}</Text>
                </View>

                {item.email && (
                  <View style={styles.detailRow}>
                    <Mail size={12} color="#64748b" />
                    <Text style={styles.detailText}>{item.email}</Text>
                  </View>
                )}

                {item.address && (
                  <View style={styles.detailRow}>
                    <MapPin size={12} color="#64748b" />
                    <Text style={styles.detailText}>{item.address}</Text>
                  </View>
                )}
              </View>

              <View style={styles.purchasesBadge}>
                <Text style={styles.purchasesLabel}>Purchases</Text>
                <Text style={styles.purchasesVal}>
                  Rs. {Number(item.totalPurchases || 0).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
        />
      )}

      {/* Add Customer Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Customer</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Kamal Perera"
              value={form.name}
              onChangeText={val => setForm(f => ({ ...f, name: val }))}
            />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 077 123 4567"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={val => setForm(f => ({ ...f, phone: val }))}
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="kamal@email.com"
              keyboardType="email-address"
              value={form.email}
              onChangeText={val => setForm(f => ({ ...f, email: val }))}
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Galle Road, Colombo"
              value={form.address}
              onChangeText={val => setForm(f => ({ ...f, address: val }))}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddCustomer} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Check size={18} color="#ffffff" />
                  <Text style={styles.saveBtnText}>SAVE CUSTOMER</Text>
                </>
              )}
            </TouchableOpacity>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  addBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#1e40af',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  detailText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  purchasesBadge: {
    alignItems: 'flex-end',
  },
  purchasesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  purchasesVal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: '#1e40af',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});
