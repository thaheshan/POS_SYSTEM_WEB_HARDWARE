"use client";

import { useEffect, useState } from "react";
import { Bell, Store, CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface ShopInfo {
  id: string;
  name: string;
  businessRegistration: string | null;
  selfReportedPaid: boolean;
  subscriptionStatus: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  link?: string;
  shop?: ShopInfo | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      setNotifications(data.data || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (shopId: string, shopName: string) => {
    if (!confirm(`Confirm payment received from "${shopName}"? This will mark their subscription as PAID and ACTIVE for the next month.`)) return;
    setConfirming(shopId);
    try {
      const res = await fetch(`/api/admin/confirm-payment/${shopId}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Payment confirmed for ${shopName}. Their account is now Active.`);
        await fetchNotifications(); // refresh list
      } else {
        alert(data.message || "Failed to confirm payment");
      }
    } catch {
      alert("Error confirming payment. Please try again.");
    } finally {
      setConfirming(null);
    }
  };

  const handleRejectPayment = async (shopId: string, shopName: string) => {
    if (!confirm(`Mark payment as NOT RECEIVED for "${shopName}"? They will be notified to try again.`)) return;
    setConfirming(shopId);
    try {
      const res = await fetch(`/api/admin/reject-payment/${shopId}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(`❌ Payment rejected for ${shopName}. They have been notified.`);
        await fetchNotifications(); // refresh list
      } else {
        alert(data.message || "Failed to reject payment");
      }
    } catch {
      alert("Error rejecting payment. Please try again.");
    } finally {
      setConfirming(null);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const pending = notifications.filter(n => !n.isRead && n.shop?.selfReportedPaid);
  const confirmed = notifications.filter(n => n.isRead || !n.shop?.selfReportedPaid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            Payment Notifications
            {pending.length > 0 && (
              <span className="bg-orange-100 text-orange-700 text-xs font-black px-2 py-0.5 rounded-full border border-orange-200">
                {pending.length} Pending
              </span>
            )}
          </h2>
          <p className="mt-1 text-gray-500 text-sm">
            Shop owners who have self-reported their subscription payment. Confirm to activate their account.
          </p>
        </div>
        <button
          onClick={fetchNotifications}
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm border border-red-100">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse flex gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-8 bg-gray-200 rounded w-36" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
          <p className="text-sm text-gray-500 mt-1">When a shop owner reports their payment, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Confirmations */}
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Awaiting Your Confirmation ({pending.length})
              </h3>
              <div className="grid gap-4">
                {pending.map((notif) => (
                  <div key={notif.id} className="bg-white rounded-xl shadow-sm border-2 border-orange-200 overflow-hidden p-6 flex gap-5 items-start">
                    <div className="h-12 w-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                      <AlertCircle className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-base">{notif.title}</h3>
                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{notif.message}</p>

                      {notif.shop && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 flex items-center gap-3">
                          <Store className="w-4 h-4 text-gray-500 shrink-0" />
                          <div>
                            <span className="text-sm font-bold text-gray-900">{notif.shop.name}</span>
                            <span className="text-xs text-gray-500 ml-2">Reg: {notif.shop.businessRegistration ?? "N/A"}</span>
                          </div>
                          <span className="ml-auto text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                            SELF-REPORTED
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 mt-4">
                        {notif.shop && (
                          <>
                            <button
                              onClick={() => handleConfirmPayment(notif.shop!.id, notif.shop!.name)}
                              disabled={confirming === notif.shop!.id}
                              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {confirming === notif.shop!.id ? "Processing..." : "Confirm Payment Received"}
                            </button>
                            <button
                              onClick={() => handleRejectPayment(notif.shop!.id, notif.shop!.name)}
                              disabled={confirming === notif.shop!.id}
                              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              Payment Not Received Yet
                            </button>
                          </>
                        )}
                        <Link
                          href="/dashboard/active-shops"
                          className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors"
                        >
                          <Store className="w-4 h-4" />
                          View Shop
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Already Confirmed */}
          {confirmed.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Already Confirmed ({confirmed.length})
              </h3>
              <div className="grid gap-3">
                {confirmed.map((notif) => (
                  <div key={notif.id} className="bg-gray-50 rounded-xl border border-gray-100 p-5 flex gap-4 items-start opacity-70">
                    <div className="h-10 w-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-gray-700 text-sm">{notif.shop?.name ?? "Unknown Shop"}</p>
                        <span className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Payment confirmed — Account active</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
