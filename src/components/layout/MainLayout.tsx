"use client";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useState } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // POS screen uses tighter bottom spacing because its own panels manage height.
  const isPOS = pathname === "/pos";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-[#f1f5f9] overflow-hidden print:bg-white print:overflow-visible relative">
        <div className="print:hidden">
          <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </div>
        <div className="flex-1 lg:ml-[260px] ml-0 print:ml-0 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible transition-all duration-300">
          <div className="print:hidden">
            <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
          </div>
          {/* Main Scrollable Area */}
          <div className="flex-1 overflow-y-auto print:overflow-visible">
            <main className={`${isPOS ? "p-4 md:p-10 pb-0" : "p-4 md:p-10"} print:p-0`}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}