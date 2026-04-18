"use client";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // POS screen uses tighter bottom spacing because its own panels manage height.
  const isPOS = pathname === "/pos";

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-[#f1f5f9] overflow-hidden print:bg-white print:overflow-visible">
        <div className="print:hidden">
          <Sidebar />
        </div>
        <div className="flex-1 ml-[260px] print:ml-0 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible">
          <div className="print:hidden">
            <Header />
          </div>
          {/* Main Scrollable Area */}
          <div className="flex-1 overflow-y-auto print:overflow-visible">
            <main className={`${isPOS ? "p-10 pb-0" : "p-10"} print:p-0`}>
              {children}
            </main>
            <div className="print:hidden">
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}