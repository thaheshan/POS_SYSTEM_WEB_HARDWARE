"use client";

import { useEffect, useState } from "react";
import { Store, CheckCircle, XCircle, AlertCircle, Building2, User } from "lucide-react";
import { Button } from "@/components/marketing/ui/button";

import { adminApi, PendingShop } from "@/api/admin";

export default function AdminDashboard() {
  const [shops, setShops] = useState<PendingShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchShops = async () => {
    try {
      const data = await adminApi.getPendingShops();
      setShops(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleAction = async (userId: string, action: "approve" | "reject") => {
    try {
      if (action === "approve") {
        await adminApi.approveShop(userId);
      } else {
        await adminApi.rejectShop(userId);
      }
      
      // Remove the processed shop from the list
      setShops(shops.filter(shop => shop.userId !== userId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pending Shop Approvals</h2>
        <p className="mt-1 text-gray-500">Review and approve new hardware store registrations.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {shops.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No pending approvals</h3>
          <p className="mt-1 text-gray-500">All shop registrations have been processed.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {shops.map((shop) => (
            <div key={shop.userId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <Store className="h-7 w-7 text-emerald-600" />
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{shop.shop.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Building2 className="h-4 w-4" />
                          <span>Reg No: {shop.shop.businessRegistration || "N/A"}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 grid sm:grid-cols-2 gap-4 text-sm border border-gray-100">
                        <div>
                          <p className="text-gray-500 mb-1 flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Owner Name</p>
                          <p className="font-medium text-gray-900">{shop.firstName} {shop.lastName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Email</p>
                          <p className="font-medium text-gray-900">{shop.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Phone</p>
                          <p className="font-medium text-gray-900">{shop.phone || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Registered At</p>
                          <p className="font-medium text-gray-900">{new Date(shop.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 shrink-0 ml-6">
                    <Button 
                      onClick={() => handleAction(shop.userId, "approve")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white w-32 flex justify-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleAction(shop.userId, "reject")}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-32 flex justify-center"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
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
