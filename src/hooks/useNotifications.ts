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

  const fetchNotifications = useCallback(async () => {
    try {
      // 1. Fetch base notifications from DB
      const res = await api.get('/notifications');
      let data = Array.isArray(res.data?.data || res.data) ? res.data?.data || res.data : [];
      let baseUnreadCount = 0;
      
      try {
        const countRes = await api.get('/notifications/unread-count');
        baseUnreadCount = countRes.data?.count || 0;
      } catch (e) {
        console.error('Failed to fetch unread count', e);
      }

      const synthesizedNotifications: Notification[] = [];
      const clearedIds = JSON.parse(localStorage.getItem('clearedNotifications') || '[]');
      const readIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');

      // 2. Fetch Recent Transactions to simulate Sale Notifications
      try {
        const txRes = await api.get('/dashboard/recent-transactions', { params: { limit: 5 } });
        const txs = Array.isArray(txRes.data) ? txRes.data : (txRes.data?.data || []);
        
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
      } catch (err) {
        console.error('Failed to fetch recent transactions for notifications', err);
      }

      // 3. Fetch Low Stock to simulate Low Stock Alerts
      try {
        const stockRes = await api.get('/stock?low_stock=true&out_of_stock=true');
        const lowStockItems = Array.isArray(stockRes.data) ? stockRes.data : (stockRes.data?.data || []);
        
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
      } catch (err) {
        console.error('Failed to fetch low stock for notifications', err);
      }

      // 3.5 Fetch Subscription Status for alerts
      try {
        const subRes = await api.get('/api/shop/subscription-status');
        const subData = subRes.data?.data || subRes.data;
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
      } catch (err) {
        // May fail for non-admins, which is fine
      }

      // 4. Merge and sort
      const allNotifications = [...synthesizedNotifications, ...data];
      
      // Sort by descending date
      allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const unreadSynthesizedCount = synthesizedNotifications.filter(n => !n.isRead).length;

      // Only show the top 20 to avoid flooding the modal
      setNotifications(allNotifications.slice(0, 20));
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

  return {
    notifications,
    unreadCount,
    loading,
    refresh: fetchNotifications,
    markAllAsRead,
    clearAll,
  };
}
