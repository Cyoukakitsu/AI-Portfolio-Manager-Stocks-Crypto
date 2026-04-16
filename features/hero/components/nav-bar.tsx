"use client";

import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/features/dashboard/components/locale-switcher";
import { ModeToggle } from "@/features/dashboard/components/mode-toggle";

export function NavBar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#f5f0e8]/80 backdrop-blur-md border-b border-[#c9a84c]/30">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <span className="text-xl font-bold text-[#c9a84c] tracking-wider">
          AIPM
        </span>

        {/* Nav Links (desktop only) */}
        <div className="hidden md:flex items-center gap-8 text-sm text-stone-600">
          <a
            href="#features"
            className="hover:text-[#c9a84c] transition-colors"
          >
            Features
          </a>
          <a href="#" className="hover:text-[#c9a84c] transition-colors">
            Pricing
          </a>
          <a href="#" className="hover:text-[#c9a84c] transition-colors">
            Partners
          </a>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-stone-600 hover:text-[#c9a84c] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 bg-[#c9a84c] text-white text-sm font-semibold rounded-lg hover:bg-[#b8973b] transition-colors"
          >
            Get Started
          </Link>
          <LocaleSwitcher />
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
