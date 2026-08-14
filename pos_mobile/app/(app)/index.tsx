import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../src/store/slices/authSlice';
import { RootState } from '../../src/store';
import api from '../../src/api/axiosInstance';
import { DollarSign, ShoppingBag, AlertTriangle, LogOut, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [metrics, setMetrics] = useState({
    todaySales: 'Rs. 0',
    totalOrders: 0,
    lowStockCount: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      const data = res.data?.data || res.data || {};
      setMetrics({
        todaySales: `Rs. ${(data.todaySales || 0).toLocaleString()}`,
        totalOrders: data.totalOrders || 0,
        lowStockCount: data.lowStockCount || 0,
      });
    } catch (e) {
      console.log('Dashboard fetch fallback:', e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.welcomeBanner}>
        <View>
          <Text style={styles.welcomeSubtitle}>Welcome Back,</Text>
          <Text style={styles.welcomeTitle}>{user?.firstName || user?.email || 'Store Owner'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => dispatch(logout())}>
          <LogOut size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Today's Overview</Text>

      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { backgroundColor: '#eff6ff' }]}>
          <View style={[styles.iconBox, { backgroundColor: '#3b82f6' }]}>
            <DollarSign size={20} color="#ffffff" />
          </View>
          <Text style={styles.metricValue}>{metrics.todaySales}</Text>
          <Text style={styles.metricLabel}>Today's Sales</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: '#f0fdf4' }]}>
          <View style={[styles.iconBox, { backgroundColor: '#22c55e' }]}>
            <ShoppingBag size={20} color="#ffffff" />
          </View>
          <Text style={styles.metricValue}>{metrics.totalOrders}</Text>
          <Text style={styles.metricLabel}>Total Orders</Text>
        </View>
      </View>

      {metrics.lowStockCount > 0 && (
        <View style={styles.alertCard}>
          <AlertTriangle size={24} color="#d97706" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.alertTitle}>Low Stock Warning</Text>
            <Text style={styles.alertSub}>
              {metrics.lowStockCount} items need stock reordering soon.
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionHeader}>Quick Actions</Text>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => router.push('/(app)/pos')}
      >
        <View style={[styles.actionIconBox, { backgroundColor: '#1e40af' }]}>
          <ShoppingBag size={24} color="#ffffff" />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.actionTitle}>Open POS Terminal</Text>
          <Text style={styles.actionSub}>Create sales invoices & process cash checkout</Text>
        </View>
        <ArrowRight size={20} color="#94a3b8" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => router.push('/(app)/inventory')}
      >
        <View style={[styles.actionIconBox, { backgroundColor: '#059669' }]}>
          <DollarSign size={24} color="#ffffff" />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.actionTitle}>Manage Inventory</Text>
          <Text style={styles.actionSub}>Adjust product stock & view low stock items</Text>
        </View>
        <ArrowRight size={20} color="#94a3b8" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  welcomeSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 2,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#b45309',
  },
  alertSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d97706',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  actionSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 2,
  },
});
