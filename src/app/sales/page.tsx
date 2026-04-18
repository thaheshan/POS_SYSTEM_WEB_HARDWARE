import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import SalesDashboard from "@/components/sales/dashboard/SalesDashboard";

export default function SalesDashboardPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <SalesDashboard />
      </MainLayout>
    </ProtectedRoute>
  );
}
