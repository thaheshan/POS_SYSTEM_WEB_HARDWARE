import { useState, useEffect, useCallback } from 'react';
import api from '@/api/axiosInstance';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchNotifications = useCallback(async () => {
    try {
      const clearedIds: string[] = JSON.parse(localStorage.getItem('clearedNotifications') || '[]');
      const readIds: string[] = JSON.parse(localStorage.getItem('readNotifications') || '[]');

      // Fast parallel fetch using Promise.allSettled for maximum speed
      const [notifRes, countRes, txRes, stockRes, subRes] = await Promise.allSettled([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
        api.get('/dashboard/recent-transactions', { params: { limit: 15 } }),
        api.get('/stock?low_stock=true&out_of_stock=true'),
        api.get('/api/shop/subscription-status'),
      ]);

      // 1. Base DB Notifications
      let data: Notification[] = [];
      if (notifRes.status === 'fulfilled') {
        const raw = notifRes.value.data?.data || notifRes.value.data || [];
        if (Array.isArray(raw)) data = raw;
      }

      let baseUnreadCount = 0;
      if (countRes.status === 'fulfilled') {
        baseUnreadCount = countRes.value.data?.count || 0;
      }

      const synthesizedNotifications: Notification[] = [];

      // 2. Recent Transactions (Sales / Returns)
      if (txRes.status === 'fulfilled') {
        const txs = Array.isArray(txRes.value.data)
          ? txRes.value.data
          : txRes.value.data?.data || [];

        txs.forEach((tx: any) => {
          const id = `tx-${tx.id}`;
          if (clearedIds.includes(id)) return;

          const isReturn = tx.status === 'RETURNED' || tx.status === 'REFUNDED';
          synthesizedNotifications.push({
            id,
            title: isReturn ? 'Sale Returned' : 'Sale Created',
            message: `Invoice ${tx.invoiceNumber} for Rs. ${tx.amount || tx.totalAmount}`,
            type: isReturn ? 'WARNING' : 'SUCCESS',
            isRead: readIds.includes(id),
            createdAt: tx.createdAt || tx.date || new Date().toISOString(),
          });
        });
      }

      // 3. Low Stock & Out of Stock Alerts
      if (stockRes.status === 'fulfilled') {
        const lowStockItems = Array.isArray(stockRes.value.data)
          ? stockRes.value.data
          : stockRes.value.data?.data || [];

        lowStockItems.forEach((item: any) => {
          const id = `stock-${item.id}`;
          if (clearedIds.includes(id)) return;

          const itemName = item.product_name ?? item.product?.name ?? item.name ?? 'Unknown Product';
          const stockLeft = item.available_quantity ?? item.currentStock ?? 0;

          synthesizedNotifications.push({
            id,
            title: 'Low Stock Alert',
            message: `${itemName} is running critically low (${stockLeft} remaining).`,
            type: 'ERROR',
            isRead: readIds.includes(id),
            createdAt: new Date().toISOString(),
          });
        });
      }

      // 4. Subscription Alerts
      if (subRes.status === 'fulfilled') {
        const subData = subRes.value.data?.data || subRes.value.data;
        if (subData && !subData.selfReportedPaid) {
          const isOverdue = subData.paymentStatus === 'OVERDUE';
          const isDueSoon = subData.paymentStatus === 'PENDING' && subData.daysUntilDue !== null && subData.daysUntilDue <= 7;

          if (isOverdue || isDueSoon) {
            const id = `sub-alert-${subData.nextPaymentDue || 'now'}`;
            if (!clearedIds.includes(id)) {
              synthesizedNotifications.push({
                id,
                title: isOverdue ? 'Subscription Overdue' : 'Subscription Payment Due',
                message: isOverdue
                  ? 'Your subscription is overdue! Please pay immediately.'
                  : `Please complete your subscription payment before ${new Date(subData.nextPaymentDue).toLocaleDateString()} to avoid account suspension.`,
                type: 'WARNING',
                isRead: readIds.includes(id),
                createdAt: new Date().toISOString(),
              });
            }
          }
        }
      }

      // 5. Merge and sort all notifications by date (newest first)
      const allNotifications = [...synthesizedNotifications, ...data];
      allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const unreadSynthesizedCount = synthesizedNotifications.filter(n => !n.isRead).length;

      // Store ALL notifications (no arbitrary slice truncation)
      setNotifications(allNotifications);
      setUnreadCount(baseUnreadCount + unreadSynthesizedCount);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = async () => {
    try {
      // Mark synthesized as read locally
      const currentReadIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      const newReadIds = [...new Set([...currentReadIds, ...notifications.map(n => n.id)])];
      localStorage.setItem('readNotifications', JSON.stringify(newReadIds));

      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const notif = notifications.find(n => n.id === id);
      if (!notif || notif.isRead) return;

      if (id.startsWith('tx-') || id.startsWith('stock-') || id.startsWith('sub-alert-')) {
        const currentReadIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        const newReadIds = [...new Set([...currentReadIds, id])];
        localStorage.setItem('readNotifications', JSON.stringify(newReadIds));
      } else {
        await api.patch(`/notifications/${id}/read`);
      }

      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const clearAll = async () => {
    try {
      // Clear synthesized locally
      const currentClearedIds = JSON.parse(localStorage.getItem('clearedNotifications') || '[]');
      const newClearedIds = [...new Set([...currentClearedIds, ...notifications.map(n => n.id)])];
      localStorage.setItem('clearedNotifications', JSON.stringify(newClearedIds));

      await api.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Auto refresh notifications every 10 seconds for near real-time updates
    const interval = setInterval(fetchNotifications, 10_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const totalCount = notifications.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedNotifications = notifications.slice((page - 1) * pageSize, page * pageSize);

  return {
    notifications: paginatedNotifications,
    allNotifications: notifications,
    unreadCount,
    loading,
    page,
    pageSize,
    totalPages,
    totalCount,
    setPage,
    setPageSize,
    refresh: fetchNotifications,
    markAllAsRead,
    clearAll,
    markAsRead,
  };
}
