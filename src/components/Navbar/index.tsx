"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/types";

interface NavbarProps {
  locale: Locale;
  dictionary: Dictionary;
}

export default function Navbar({ locale, dictionary }: NavbarProps) {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    const basePath = `/${locale}${path}`;
    return pathname === basePath;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md py-4 px-6 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          href={`/${locale}`}
          className="text-lg font-bold flex items-center gap-2"
        >
          <span className="hidden sm:inline">Alison Galindo</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}`}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive("")
                ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {dictionary.navbar.home}
          </Link>
          
        </div>
      </div>
    </nav>
  );
}