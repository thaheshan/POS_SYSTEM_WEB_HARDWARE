'use client';

import MainLayout from '@/components/layout/MainLayout';
import { BarChart3, TrendingUp, DollarSign, Calendar } from 'lucide-react';

export default function ReportsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold">Sales Report</h2>
            </div>
            <p className="text-gray-600">View daily, weekly, and monthly sales reports</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Generate Report
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold">Revenue Analysis</h2>
            </div>
            <p className="text-gray-600">Analyze revenue trends and patterns</p>
            <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
              View Analysis
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
