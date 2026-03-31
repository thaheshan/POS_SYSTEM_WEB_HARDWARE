'use client';

import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-[#f1f5f9] overflow-hidden">
        <Sidebar />
        <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-y-auto scrollbar-hide">
          <Header />
          <main className="p-10 flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
