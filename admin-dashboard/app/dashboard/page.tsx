"use client";

import { useEffect, useState } from "react";
import { Store, CheckCircle, XCircle, AlertCircle, Building2, User, Loader2 } from "lucide-react";

interface PendingShop {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
  shop: {
    id: string;
    name: string;
    businessRegistration: string;
  };
}

export default function DashboardPage() {
  const [shops, setShops] = useState<PendingShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchShops = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Call our Next.js proxy — it reads the HttpOnly cookie and forwards to NestJS
      const res = await fetch("/api/admin/pending-shops", { cache: "no-store" });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to fetch pending shops");
      }

      const data = await res.json();
      setShops(Array.isArray(data) ? data : data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load pending shops");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleAction = async (userId: string, action: "approve" | "reject") => {
    setActionLoading(userId + action);
    try {
      const res = await fetch(`/api/admin/${action}-shop/${userId}`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to ${action} shop`);
      }

      setShops((prev) => prev.filter((s) => s.userId !== userId));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pending Shop Approvals</h2>
        <p className="mt-1 text-gray-500 text-sm">Review and approve new hardware store registrations.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
          <button
            onClick={fetchShops}
            className="ml-auto underline text-red-500 hover:text-red-700 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {shops.length === 0 && !error ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
          <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900">No pending approvals</h3>
          <p className="mt-2 text-gray-500 text-sm">All registrations have been processed. You&apos;re caught up!</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {shops.map((shop) => (
            <div key={shop.userId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Store className="h-7 w-7 text-emerald-600" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{shop.shop?.name || "N/A"}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Building2 className="h-4 w-4" />
                          <span>Reg No: {shop.shop?.businessRegistration || "N/A"}</span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border border-gray-100">
                        <div>
                          <p className="text-gray-500 mb-1 flex items-center gap-1"><User className="h-3.5 w-3.5" /> Owner</p>
                          <p className="font-semibold text-gray-900">{shop.firstName} {shop.lastName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Email</p>
                          <p className="font-semibold text-gray-900">{shop.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Phone</p>
                          <p className="font-semibold text-gray-900">{shop.phone || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Registered</p>
                          <p className="font-semibold text-gray-900">{new Date(shop.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-3 shrink-0">
                    <button
                      onClick={() => handleAction(shop.userId, "approve")}
                      disabled={!!actionLoading}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60"
                    >
                      {actionLoading === shop.userId + "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(shop.userId, "reject")}
                      disabled={!!actionLoading}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60"
                    >
                      {actionLoading === shop.userId + "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
