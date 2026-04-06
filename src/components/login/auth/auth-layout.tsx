import React from "react";
import { Globe } from "lucide-react";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  showLanguageSwitcher?: boolean;
}

export default function AuthLayout({
  children,
  showLanguageSwitcher = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header with Language Switcher */}
      <header className="flex justify-end items-center px-6 py-4 sm:px-8">
        {showLanguageSwitcher && (
          <button
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-gray-700 hover:text-gray-900"
            aria-label="Language Settings"
            title="Language settings"
          >
            <Globe className="w-6 h-6" />
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-lg">{children}</div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center justify-center gap-1 py-6 px-4 text-center border-t border-gray-200 bg-gray-50">
        <p className="text-xs font-medium text-gray-600">v1.0.0</p>
        <p className="text-xs text-gray-500">© 2026 Futura Solutions PVT LTD</p>
      </footer>
    </div>
  );
}
