"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale, locales } from "@/i18n/config";

export default function LanguageSwitcher({
  currentLocale,
}: {
  currentLocale: Locale;
}) {
  const pathName = usePathname();
  
  const redirectedPathName = (locale: Locale) => {
    if (!pathName) return "/";
    
    const segments = pathName.split("/");
    segments[1] = locale;
    
    return segments.join("/");
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2 pointer-events-auto">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={redirectedPathName(locale)}
          className={`px-2 py-1 rounded ${
            currentLocale === locale
              ? "bg-black text-white"
              : "bg-white text-black border border-black"
          }`}
        >
          {locale === "en" ? "EN" : "PT"}
        </Link>
      ))}
    </div>
  );
}