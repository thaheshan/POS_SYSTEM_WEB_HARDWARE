"use client";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { usePathname, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useState, useEffect, useRef } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // POS screen uses tighter bottom spacing because its own panels manage height.
  const isPOS = pathname === "/pos";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Whenever user navigates via Sidebar or links, automatically reset scroll to top & transfer focus to main content container
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
    const timer = setTimeout(() => {
      if (document.activeElement instanceof HTMLElement && document.activeElement !== scrollContainerRef.current) {
        document.activeElement.blur();
      }
      if (scrollContainerRef.current) {
        scrollContainerRef.current.focus({ preventScroll: true });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          (activeEl as HTMLElement).isContentEditable);

      // Check if user is inside a multi-line textarea or dropdown select where Up/Down is needed for option selection
      const isTextareaOrSelect =
        activeEl &&
        (activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.getAttribute("role") === "listbox" ||
          activeEl.getAttribute("role") === "combobox");

      // 1. Backspace Key Navigation: Go back to previous page if user is not actively typing inside an input
      if (e.key === "Backspace" && !isInputActive) {
        if (e.defaultPrevented || isPOS) {
          return;
        }
        e.preventDefault();
        router.back();
        return;
      }

      // 2. Up & Down Arrow Key Page Scrolling (works immediately after clicking any sidebar link)
      if (!isTextareaOrSelect) {
        // If focus is stuck on a sidebar link/button or header element, blur it so main page scrolls immediately
        if (activeEl && activeEl !== scrollContainerRef.current && (activeEl.tagName === "A" || activeEl.tagName === "BUTTON" || activeEl.closest("nav") || activeEl.closest("header"))) {
          (activeEl as HTMLElement).blur();
          if (scrollContainerRef.current) {
            scrollContainerRef.current.focus({ preventScroll: true });
          }
        }

        const container = scrollContainerRef.current;
        if (container) {
          const key = e.key;
          if (key === "ArrowDown" || key === "Down") {
            e.preventDefault();
            container.scrollBy(0, 150);
          } else if (key === "ArrowUp" || key === "Up") {
            e.preventDefault();
            container.scrollBy(0, -150);
          } else if (key === "ArrowLeft" || key === "Left") {
            // Find horizontally scrollable elements on page (like data tables)
            const scrollables = Array.from(document.querySelectorAll<HTMLElement>('.overflow-x-auto, [class*="overflow-x"]'));
            let scrolled = false;
            for (const el of scrollables) {
              if (el.scrollWidth > el.clientWidth && el.offsetParent !== null) {
                el.scrollBy(-150, 0);
                scrolled = true;
              }
            }
            if (scrolled) e.preventDefault();
          } else if (key === "ArrowRight" || key === "Right") {
            const scrollables = Array.from(document.querySelectorAll<HTMLElement>('.overflow-x-auto, [class*="overflow-x"]'));
            let scrolled = false;
            for (const el of scrollables) {
              if (el.scrollWidth > el.clientWidth && el.offsetParent !== null) {
                el.scrollBy(150, 0);
                scrolled = true;
              }
            }
            if (scrolled) e.preventDefault();
          } else if (key === "PageDown") {
            e.preventDefault();
            container.scrollBy(0, 500);
          } else if (key === "PageUp") {
            e.preventDefault();
            container.scrollBy(0, -500);
          } else if (key === "Home") {
            e.preventDefault();
            container.scrollTo(0, 0);
          } else if (key === "End") {
            e.preventDefault();
            container.scrollTo(0, container.scrollHeight);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

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
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto print:overflow-visible scroll-smooth focus:outline-none" tabIndex={-1}>
            <main className={`${isPOS ? "p-4 md:p-10 pb-0" : "p-4 md:p-10"} print:p-0`}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}