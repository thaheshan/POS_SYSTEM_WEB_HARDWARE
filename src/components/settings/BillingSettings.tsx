import { CreditCard, Edit2, Download, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function BillingSettings() {
  const [subStatus, setSubStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    fetchSub();
  }, []);

  const fetchSub = async () => {
    try {
      const res = await fetch('/api/shop/subscription-status');
      if (res.ok) {
        const data = await res.json();
        setSubStatus(data.data || data);
      }
    } catch (err) {
      console.error("Failed to fetch sub status", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfReportPayment = async () => {
    setReporting(true);
    try {
      const res = await fetch('/api/shop/self-report-payment', { method: 'POST' });
      if (res.ok) {
        alert("Payment reported successfully! It is now pending admin verification.");
        await fetchSub();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to report payment");
      }
    } catch (err) {
      console.error(err);
      alert("Error reporting payment");
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-12 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const isDueSoon = subStatus?.daysUntilDue === null || subStatus?.daysUntilDue <= 14;

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f8fafc]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-[12px] flex items-center justify-center border border-emerald-100">
            <CreditCard className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900">Subscription & Billing</h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Manage your current plan and report payments
            </p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest ${subStatus?.subscriptionStatus === 'ACTIVE' ? 'bg-[#eff6ff] text-[#1e40af] border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {subStatus?.subscriptionStatus || 'UNKNOWN'}
        </span>
      </div>

      <div className="p-8">
        <div className="bg-[#ecfdf5] rounded-[20px] p-6 border border-emerald-100 relative mb-8">
          <p className="text-[12px] font-black text-emerald-800 mb-1">Current Status</p>
          <h3 className="text-[32px] font-black tracking-tight text-emerald-600 leading-none mb-2 mt-2">
            {subStatus?.paymentStatus === 'PAID' ? 'Account Active' : 'Payment Pending'}
          </h3>
          
          <div className="text-[12px] font-bold text-emerald-700 mb-6 space-y-1">
            <p>Next billing date: {subStatus?.nextPaymentDue ? new Date(subStatus.nextPaymentDue).toLocaleDateString() : 'Pending setup'}</p>
            {subStatus?.daysUntilDue !== null && (
              <p>{subStatus.daysUntilDue < 0 ? `${Math.abs(subStatus.daysUntilDue)} days overdue` : `${subStatus.daysUntilDue} days remaining`}</p>
            )}
          </div>
          
          {isDueSoon && (
            <div className={`p-4 rounded-xl mb-6 ${
              subStatus?.paymentRejected ? 'bg-red-50 border border-red-200 text-red-800' :
              subStatus?.selfReportedPaid ? 'bg-blue-50 border border-blue-200 text-blue-800' : 
              'bg-orange-50 border border-orange-200 text-orange-800'
            }`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[14px] mb-1">
                    {subStatus?.paymentRejected ? "Payment Not Received" :
                     subStatus?.selfReportedPaid ? "Payment Under Review" : "Payment Due"}
                  </h4>
                  <p className="text-[12px]">
                    {subStatus?.paymentRejected
                      ? "The admin has reviewed your self-reported payment and marked it as not received. Please try again or contact support."
                      : subStatus?.selfReportedPaid 
                      ? "You have marked this month's payment as PAID. We are waiting for the admin to verify and confirm your payment."
                      : "Your subscription payment is due. If you have completed the payment outside the system (via bank transfer or cash), please report it below."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={handleSelfReportPayment}
              disabled={reporting || subStatus?.selfReportedPaid || !isDueSoon}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-[13px] font-black transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {reporting && <Loader2 className="w-4 h-4 animate-spin" />}
              {subStatus?.selfReportedPaid ? "Payment Reported" : "I Have Paid"}
            </button>
            <button className="bg-white border border-emerald-200 text-emerald-700 px-5 py-2.5 rounded-lg text-[13px] font-black hover:bg-emerald-50 transition-colors">
              Contact Support
            </button>
          </div>
        </div>

        <h3 className="text-[16px] font-black text-gray-900 mb-4">Last Recorded Payment</h3>
        {subStatus?.lastPayment ? (
          <div className="bg-gray-50 rounded-[20px] p-6 mb-8 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-10 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm font-black text-[12px] text-green-700">
                PAID
              </div>
              <div>
                <p className="text-[14px] font-black text-gray-900">Rs. {subStatus.lastPayment.amount.toLocaleString()}</p>
                <p className="text-[11px] font-bold text-gray-500">Recorded on {new Date(subStatus.lastPayment.paidAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-8">No payments recorded yet.</p>
        )}
      </div>
    </div>
  );
}
