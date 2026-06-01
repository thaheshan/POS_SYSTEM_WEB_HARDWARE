"use client";

import { useEffect, useState } from "react";
import { Store, Building2, User, Loader2, AlertCircle, ChevronDown, CheckCircle, Ban, XCircle, CreditCard } from "lucide-react";

interface ActiveShop {
  id: string;
  name: string;
  businessRegistration: string;
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  nextPaymentDue: string | null;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null;
  lastPayment: {
    amount: number;
    paidAt: string;
  } | null;
  selfReportedPaid?: boolean;
  address?: string;
  city?: string;
  district?: string;
  province?: string;
}

export default function ActiveShopsPage() {
  const [shops, setShops] = useState<ActiveShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState<ActiveShop | null>(null);
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ACTIVE');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  const fetchShops = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/active-shops", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch active shops");
      const data = await res.json();
      setShops(Array.isArray(data) ? data : data.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load active shops");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleUpdateStatus = async () => {
    if (!selectedShop) return;
    setActionLoading("status");
    try {
      const res = await fetch(`/api/admin/update-shop-status/${selectedShop.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setShops(shops.map(s => s.id === selectedShop.id ? { ...s, subscriptionStatus: newStatus } : s));
      setShowStatusModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedShop || !paymentAmount) return;
    setActionLoading("payment");
    try {
      const res = await fetch(`/api/admin/record-payment/${selectedShop.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(paymentAmount), method: "Manual Admin Record" }),
      });
      if (!res.ok) throw new Error("Failed to record payment");
      
      const data = await res.json();
      
      // Update local state to reflect new payment and ACTIVE status
      setShops(shops.map(s => {
        if (s.id === selectedShop.id) {
          const nextDue = new Date();
          nextDue.setMonth(nextDue.getMonth() + 1);
          return { 
            ...s, 
            subscriptionStatus: 'ACTIVE',
            nextPaymentDue: nextDue.toISOString(),
            lastPayment: { amount: parseFloat(paymentAmount), paidAt: new Date().toISOString() }
          };
        }
        return s;
      }));
      
      setShowPaymentModal(false);
      setPaymentAmount("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle className="w-3.5 h-3.5"/> Active</span>;
      case 'INACTIVE': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800"><Ban className="w-3.5 h-3.5"/> Inactive</span>;
      case 'SUSPENDED': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><XCircle className="w-3.5 h-3.5"/> Suspended</span>;
      default: return null;
    }
  };

  const getDaysUntilDue = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const due = new Date(dateStr);
    const diff = due.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    
    if (days < 0) return <span className="text-red-600 font-bold">{Math.abs(days)} days overdue</span>;
    if (days === 0) return <span className="text-amber-600 font-bold">Due today</span>;
    if (days <= 5) return <span className="text-amber-600 font-bold">Due in {days} days</span>;
    return <span className="text-emerald-600">Due in {days} days</span>;
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
        <h2 className="text-2xl font-bold text-gray-900">Active Shops & Subscriptions</h2>
        <p className="mt-1 text-gray-500 text-sm">Manage existing shops, subscription statuses, and manual payments.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
          <button onClick={fetchShops} className="ml-auto underline text-red-500 hover:text-red-700 font-medium">Retry</button>
        </div>
      )}

      <div className="grid gap-5">
        {shops.map((shop) => (
          <div key={shop.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                
                {/* Info Section */}
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Store className="h-7 w-7 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">{shop.name}</h3>
                        {getStatusBadge(shop.subscriptionStatus)}
                        {shop.selfReportedPaid && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            Self-Reported Paid
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-gray-500 mt-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>Reg No: {shop.businessRegistration || "N/A"}</span>
                        </div>
                        {(shop.address || shop.city) && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs">📍 {shop.address}, {shop.city} {shop.province ? `(${shop.province})` : ""}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border border-gray-100">
                      <div>
                        <p className="text-gray-500 mb-1 flex items-center gap-1"><User className="h-3.5 w-3.5" /> Owner</p>
                        <p className="font-semibold text-gray-900">{shop.owner?.firstName} {shop.owner?.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{shop.owner?.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Phone</p>
                        <p className="font-semibold text-gray-900">{shop.owner?.phone || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Last Payment</p>
                        {shop.lastPayment ? (
                          <>
                            <p className="font-semibold text-gray-900">Rs. {shop.lastPayment.amount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{new Date(shop.lastPayment.paidAt).toLocaleDateString()}</p>
                          </>
                        ) : (
                          <p className="font-semibold text-gray-900">Never</p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Next Payment</p>
                        <p className="font-semibold text-gray-900">
                          {shop.nextPaymentDue ? new Date(shop.nextPaymentDue).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-xs mt-0.5">{getDaysUntilDue(shop.nextPaymentDue)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex md:flex-col gap-3 shrink-0">
                  <button
                    onClick={() => { setSelectedShop(shop); setNewStatus(shop.subscriptionStatus); setShowStatusModal(true); }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Change Status <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setSelectedShop(shop); setShowPaymentModal(true); }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    <CreditCard className="w-4 h-4" /> Record Payment
                  </button>
                </div>

              </div>
            </div>
          </div>
        ))}

        {shops.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No active shops found</h3>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Change Shop Status</h3>
            <p className="text-sm text-gray-500 mb-6">Update subscription status for <b>{selectedShop.name}</b></p>
            
            <div className="space-y-3 mb-8">
              {(['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const).map(status => (
                <label key={status} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${newStatus === status ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-200'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="status" value={status} checked={newStatus === status} onChange={() => setNewStatus(status)} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                    <span className="font-bold text-gray-900">{status}</span>
                  </div>
                  {status === 'SUSPENDED' && <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-md">Blocks Login</span>}
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowStatusModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleUpdateStatus} disabled={!!actionLoading} className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2">
                {actionLoading === 'status' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Record Manual Payment</h3>
            <p className="text-sm text-gray-500 mb-6">Record a subscription payment for <b>{selectedShop.name}</b></p>
            
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Payment Amount (Rs.)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rs.</span>
                <input 
                  type="number" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Recording a payment will automatically set the shop to ACTIVE and extend the next due date by 1 month.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleRecordPayment} disabled={!!actionLoading || !paymentAmount} className="flex-1 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
                {actionLoading === 'payment' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
