"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // POS screen uses tighter bottom spacing because its own panels manage height.
  const isPOS = pathname === "/pos";

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] overflow-hidden">
      {/* Sidebar remains fixed while content area scrolls independently. */}
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <Header />
        {/* Main Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          <main className={`${isPOS ? "p-10 pb-0" : "p-10"}`}>{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
