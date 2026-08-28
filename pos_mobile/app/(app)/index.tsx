import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import {
  FileText,
  Package,
  Users,
  TrendingUp,
  Terminal,
  Plus,
  UserPlus,
  PieChart,
  ArrowRight,
  AlertTriangle,
  Clock,
  RefreshCw,
  LogOut,
} from 'lucide-react-native';
import { RootState } from '../../src/store';
import { logout } from '../../src/store/slices/authSlice';
import api from '../../src/api/axiosInstance';

interface StatsCardProps {
  title: string;
  value: string;
  subtext?: string;
  iconBg: string;
  iconColor: string;
  Icon: any;
  trend?: { value: string; isUp: boolean };
  onPress?: () => void;
}

function StatsCard({ title, value, subtext, iconBg, iconColor, Icon, trend, onPress }: StatsCardProps) {
  return (
    <View style={styles.statsCard}>
      <View style={styles.statsCardTop}>
        <View style={[styles.statsIcon, { backgroundColor: iconBg }]}>
          <Icon size={22} color={iconColor} strokeWidth={2.5} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, trend.isUp ? styles.trendUp : styles.trendDown]}>
            <Text style={[styles.trendText, trend.isUp ? styles.trendUpText : styles.trendDownText]}>
              {trend.isUp ? '↑' : '↓'} {trend.value}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.statsCardBody}>
        <Text style={styles.statsTitle}>{title}</Text>
        <Text style={styles.statsValue}>{value}</Text>
        {subtext && <Text style={styles.statsSubtext}>{subtext}</Text>}
      </View>
      <View style={styles.statsCardFooter}>
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.viewAllBtn}>View All →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface QuickActionProps {
  label: string;
  Icon: any;
  iconBg: string;
  isPrimary?: boolean;
  onPress: () => void;
}

function QuickActionItem({ label, Icon, iconBg, isPrimary, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity
      style={[styles.quickAction, isPrimary && styles.quickActionPrimary]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.quickActionLeft}>
        <View style={[styles.quickActionIcon, { backgroundColor: isPrimary ? 'rgba(255,255,255,0.2)' : iconBg }]}>
          <Icon size={18} color={isPrimary ? '#ffffff' : '#ffffff'} strokeWidth={2.5} />
        </View>
        <Text style={[styles.quickActionLabel, isPrimary && styles.quickActionLabelPrimary]}>
          {label}
        </Text>
      </View>
      <ArrowRight size={18} color={isPrimary ? 'rgba(255,255,255,0.7)' : '#94a3b8'} />
    </TouchableOpacity>
  );
}

function AlertBannerComp({ type, title, message, actionText, onActionPress }: any) {
  const styleMap: Record<string, any> = {
    stock:   { bg: '#fff5f5', border: '#fecaca', iconBg: '#ef4444', textColor: '#7f1d1d', msgColor: '#b91c1c', btnBg: '#dc2626' },
    payment: { bg: '#f0f7ff', border: '#bfdbfe', iconBg: '#3b82f6', textColor: '#1e3a8a', msgColor: '#1d4ed8', btnBg: '#2563eb' },
  };
  const s = styleMap[type] || styleMap.payment;

  return (
    <View style={[styles.alertBanner, { backgroundColor: s.bg, borderColor: s.border }]}>
      <View style={styles.alertTop}>
        <View style={[styles.alertIcon, { backgroundColor: s.iconBg }]}>
          {type === 'stock' ? <AlertTriangle size={20} color="#fff" /> : <Clock size={20} color="#fff" />}
        </View>
        <Text style={[styles.alertTitle, { color: s.textColor }]}>{title}</Text>
      </View>
      <Text style={[styles.alertMsg, { color: s.msgColor }]}>{message}</Text>
      {onActionPress && (
        <TouchableOpacity style={[styles.alertBtn, { backgroundColor: s.btnBg }]} onPress={onActionPress}>
          <Text style={styles.alertBtnText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function DashboardScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const [salesRes, stockRes, customersRes, txRes] = await Promise.allSettled([
        api.get('/sales/stats/today'),
        api.get('/stock'),
        api.get('/customers'),
        api.get('/sales?limit=6'),
      ]);

      // Today's sales
      if (salesRes.status === 'fulfilled') {
        const d = salesRes.value.data?.data || salesRes.value.data || {};
        setStats({
          todaySales: d.totalRevenue || d.todaySales || d.total || 0,
          todayTransactions: d.totalTransactions || d.count || 0,
          monthlyRevenue: d.monthlyRevenue || 0,
        });
      }

      // Low stock count
      if (stockRes.status === 'fulfilled') {
        const items = stockRes.value.data?.data || stockRes.value.data || [];
        const count = Array.isArray(items) ? items.filter((item: any) => {
          const qty = item.available_quantity ?? item.quantity ?? 0;
          const min = item.minimum_stock_level ?? 5;
          return qty <= min;
        }).length : 0;
        setLowStockCount(count);
      }

      // Total customers
      if (customersRes.status === 'fulfilled') {
        const d = customersRes.value.data?.data || customersRes.value.data || [];
        const total = Array.isArray(d) ? d.length : (d.total || 0);
        setStats((prev: any) => ({ ...(prev || {}), totalCustomers: total }));
      }

      // Recent transactions
      if (txRes.status === 'fulfilled') {
        const d = txRes.value.data?.data || txRes.value.data || [];
        setRecentTx(Array.isArray(d) ? d.slice(0, 6) : []);
      }
    } catch (e) {
      console.error('Dashboard fetch error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: () => { dispatch(logout()); router.replace('/(auth)/login'); }
      },
    ]);
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'PAID' || s === 'COMPLETED') return { text: '#166534', bg: '#f0fdf4' };
    if (s === 'PARTIAL') return { text: '#1d4ed8', bg: '#eff6ff' };
    return { text: '#b45309', bg: '#fffbeb' };
  };

  const isStaff = user?.role === 'staff' || user?.role === 'cashier';
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
      showsVerticalScrollIndicator={false}
    >
      {/* Page Header */}
      <View style={styles.pageHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>
            {isStaff ? 'Employee Dashboard' : 'Dashboard Overview'}
          </Text>
          <Text style={styles.pageSubtitle} numberOfLines={2}>
            {user?.role === 'admin'
              ? 'Welcome back, Shop Owner! Management mode active.'
              : `Welcome back, ${user?.name || 'Member'}! Here are your stats.`
            }
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.newSaleBtn}
            onPress={() => router.push('/(app)/pos')}
            activeOpacity={0.85}
          >
            <Text style={styles.newSaleText}>New Sale</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Grid */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <View style={styles.statsGrid}>
          <StatsCard
            title={isStaff ? 'Your Sales' : "Today's Sales"}
            value={`LKR ${(stats?.todaySales || 0).toLocaleString()}`}
            subtext={`${stats?.todayTransactions || 0} transactions`}
            iconBg="#eff6ff"
            iconColor="#2563eb"
            Icon={FileText}
            onPress={() => router.push('/(app)/pos')}
          />
          <StatsCard
            title="Low Stock Items"
            value={`${lowStockCount} Products`}
            subtext="Need reordering"
            iconBg="#f0fdf4"
            iconColor="#059669"
            Icon={Package}
            onPress={() => router.push('/(app)/inventory')}
          />
          <StatsCard
            title="Active Customers"
            value={(stats?.totalCustomers || 0).toLocaleString()}
            subtext="Registered customers"
            iconBg="#eff6ff"
            iconColor="#2563eb"
            Icon={Users}
            onPress={() => router.push('/(app)/customers')}
          />
          {isAdmin && (
            <StatsCard
              title="Monthly Revenue"
              value={`LKR ${(stats?.monthlyRevenue || 0).toLocaleString()}`}
              subtext="Target: LKR 6M"
              iconBg="#faf5ff"
              iconColor="#9333ea"
              Icon={TrendingUp}
              trend={{ value: '15.3%', isUp: true }}
              onPress={() => {}}
            />
          )}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickActionItem
            label="New Sale"
            Icon={Terminal}
            iconBg="#2563eb"
            isPrimary
            onPress={() => router.push('/(app)/pos')}
          />
          <QuickActionItem
            label="Add Product"
            Icon={Plus}
            iconBg="#10b981"
            onPress={() => router.push('/(app)/inventory')}
          />
          <QuickActionItem
            label="Add Customer"
            Icon={UserPlus}
            iconBg="#f97316"
            onPress={() => router.push('/(app)/customers')}
          />
          {isAdmin && (
            <QuickActionItem
              label="View Reports"
              Icon={PieChart}
              iconBg="#3b82f6"
              onPress={() => {}}
            />
          )}
        </View>
      </View>

      {/* Alert Banners */}
      {lowStockCount > 0 && (
        <View style={styles.section}>
          <AlertBannerComp
            type="stock"
            title="Low Stock Alert"
            message={`${lowStockCount} product${lowStockCount !== 1 ? 's are' : ' is'} running low on stock and need immediate reordering.`}
            actionText="View Inventory"
            onActionPress={() => router.push('/(app)/inventory')}
          />
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <RefreshCw size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.txCard}>
          {recentTx.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📄</Text>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptyMsg}>Complete a sale in the POS to see it here.</Text>
            </View>
          ) : (
            recentTx.map((tx, i) => {
              const s = getStatusStyle(tx.status || tx.paymentStatus);
              return (
                <View key={tx.id || i} style={[styles.txRow, i < recentTx.length - 1 && styles.txRowBorder]}>
                  <View style={styles.txAvatar}>
                    <Text style={styles.txAvatarText}>
                      {(tx.customerName || tx.customer_name || 'W').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.txCustomer} numberOfLines={1}>
                      {tx.customerName || tx.customer_name || 'Walk-in Customer'}
                    </Text>
                    <Text style={styles.txId} numberOfLines={1}>
                      {tx.invoiceNumber || tx.invoice_number || tx.id?.slice(0, 8)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.txAmount}>
                      LKR {Number(tx.totalAmount || tx.total_amount || tx.amount || 0).toLocaleString()}
                    </Text>
                    <View style={[styles.txStatus, { backgroundColor: s.bg }]}>
                      <Text style={[styles.txStatusText, { color: s.text }]}>
                        {(tx.status || tx.paymentStatus || 'Pending').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 32 },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 4,
    maxWidth: 200,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newSaleBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  newSaleText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: { paddingVertical: 40, alignItems: 'center' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  statsCard: {
    width: '47.5%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 190,
    justifyContent: 'space-between',
  },
  statsCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  trendUp: { backgroundColor: '#f0fdf4' },
  trendDown: { backgroundColor: '#fef2f2' },
  trendText: { fontSize: 12, fontWeight: '800' },
  trendUpText: { color: '#166534' },
  trendDownText: { color: '#991b1b' },
  statsCardBody: { marginTop: 12 },
  statsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  statsSubtext: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 4,
  },
  statsCardFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    alignItems: 'center',
  },
  viewAllBtn: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: { marginBottom: 16 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  refreshBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  quickActions: { gap: 8 },
  quickAction: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  quickActionPrimary: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  quickActionLabelPrimary: {
    color: '#ffffff',
  },
  alertBanner: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  alertTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  alertMsg: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    marginBottom: 14,
  },
  alertBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  alertBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  txCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  txRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  txAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txAvatarText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#2563eb',
  },
  txCustomer: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  txId: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  txStatus: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  txStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  emptyMsg: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
