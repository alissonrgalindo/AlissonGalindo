"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale, locales } from "@/i18n/config";

export default function LanguageSwitcher({
  currentLocale,
}: {
  currentLocale: Locale;
}) {
  const pathName = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const redirectedPathName = (locale: Locale) => {
    if (!pathName) return "/";
    
    const segments = pathName.split("/");
    segments[1] = locale;
    
    return segments.join("/");
  };

  const languageNames: Record<Locale, string> = {
    'en': 'English',
    'pt-BR': 'Português'
  };
  
  const shortCodes: Record<Locale, string> = {
    'en': 'EN',
    'pt-BR': 'PT'
  };

  if (!mounted) {
    return (
      <div className="fixed top-4 right-4 z-50 flex gap-2 pointer-events-auto h-8">
        {locales.map((locale) => (
          <div 
            key={locale}
            className="w-10 opacity-0"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className="fixed top-4 right-4 z-50 flex gap-2 pointer-events-auto"
      role="navigation"
      aria-label="Language selection"
    >
      {locales.map((locale) => {
        const isActive = currentLocale === locale;
        
        return (
          <Link
            key={locale}
            href={redirectedPathName(locale)}
            aria-label={`Switch to ${languageNames[locale]}${isActive ? ' (current language)' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            className={`
              px-3 py-1.5 rounded text-sm font-medium transition-all duration-300 
              ${isActive 
                ? "bg-orange-400 text-white shadow-md" 
                : "bg-black text-white border border-zinc-800 hover:bg-gray-100"
              }
            `}
            onClick={(e) => {
              if (isActive) {
                e.preventDefault();
              }
            }}
          >
            {shortCodes[locale]}
          </Link>
        );
      })}
    </div>
  );
}