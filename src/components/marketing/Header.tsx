'use client';

import { Button } from '@/components/marketing/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">P</span>
          </div>
          <span className="font-bold text-sm text-gray-900 tracking-wide">HARDWARE</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-700 hover:text-teal-600 transition">Features</a>
          <a href="#benefits" className="text-gray-700 hover:text-teal-600 transition">Benefits</a>
          <a href="#modules" className="text-gray-700 hover:text-teal-600 transition">Modules</a>
          <a href="#pricing" className="text-gray-700 hover:text-teal-600 transition">Pricing</a>
          <a href="#faq" className="text-gray-700 hover:text-teal-600 transition">FAQ</a>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-gray-700">
              Login
            </Button>
          </Link>
          <Link href="/auth/register/staff">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <a href="#features" className="text-gray-700 hover:text-teal-600">Features</a>
            <a href="#benefits" className="text-gray-700 hover:text-teal-600">Benefits</a>
            <a href="#modules" className="text-gray-700 hover:text-teal-600">Modules</a>
            <a href="#pricing" className="text-gray-700 hover:text-teal-600">Pricing</a>
            <a href="#faq" className="text-gray-700 hover:text-teal-600">FAQ</a>
            <Link href="/auth/login">
              <Button variant="ghost" className="w-full text-gray-700">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}