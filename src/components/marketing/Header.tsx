"use client";

import { Menu, Store, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/marketing/ui/button";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Hero");

  const navLinks = useMemo(
    () => [
      { label: "Home", href: "#Hero", sectionId: "Hero" },
      { label: "Features", href: "#features", sectionId: "features" },
      { label: "Benefits", href: "#benefits", sectionId: "benefits" },
      { label: "Modules", href: "#modules", sectionId: "modules" },
      { label: "Pricing", href: "#pricing", sectionId: "pricing" },
      {
        label: "Testimonials",
        href: "#testimonials",
        sectionId: "testimonials",
      },
      { label: "FAQ", href: "#faq", sectionId: "faq" },
      { label: "CTA", href: "#cta", sectionId: "cta" },
    ],
    [],
  );

  useEffect(() => {
    const sectionIds = navLinks.map((link) => link.sectionId);
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const updateFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (sectionIds.includes(hash)) {
        setActiveSection(hash);
      }
    };

    updateFromHash();

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0.15, 0.3, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section));
    window.addEventListener("hashchange", updateFromHash);

    return () => {
      sections.forEach((section) => observer.unobserve(section));
      observer.disconnect();
      window.removeEventListener("hashchange", updateFromHash);
    };
  }, [navLinks]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-4 py-2.5 lg:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#025d47]">
            <Store size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <p className="text-[20px] font-extrabold uppercase tracking-[-0.02em] text-[#025d47]">
              Futura Hardware
            </p>
            <p className="text-[11px] font-medium text-[#025d47]">
              Management System
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setActiveSection(link.sectionId)}
              className={`relative pb-0.5 text-[13px] font-medium transition-colors ${
                activeSection === link.sectionId
                  ? "text-[#059669] after:absolute after:-bottom-[2px] after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-[#059669]"
                  : "text-[#6b7280] hover:text-[#059669] after:absolute after:-bottom-[2px] after:left-0 after:h-[2px] after:w-full after:scale-x-0 after:rounded-full after:bg-[#059669] after:transition-transform after:duration-300 hover:after:scale-x-100 after:origin-left"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <Button
            asChild
            variant="outline"
            className="h-9 border-[#0f766e] px-7 text-[13px] font-medium text-[#0f766e] transition-colors hover:bg-[#f0fdfb]"
          >
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button
            asChild
            className="h-9 bg-[#0f8f6d] px-7 text-[13px] font-medium text-white transition-colors hover:bg-[#0d7c5f]"
          >
            <Link href="/auth/register/role">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden rounded-md p-2 text-[#374151]"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-3 px-4 py-4 lg:px-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => {
                  setActiveSection(link.sectionId);
                  setIsOpen(false);
                }}
                className={`block w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === link.sectionId
                    ? "text-[#059669] bg-emerald-50"
                    : "text-[#6b7280] hover:text-[#059669] hover:bg-gray-50"
                }`}
              >
                {link.label}
              </a>
            ))}
            <Button
              asChild
              variant="outline"
              className="h-10 w-full border-[#0f766e] px-4 text-sm font-medium text-[#0f766e]"
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button
              asChild
              className="h-10 w-full bg-[#0f8f6d] px-4 text-sm font-medium text-white"
            >
              <Link href="/auth/register/role">Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
