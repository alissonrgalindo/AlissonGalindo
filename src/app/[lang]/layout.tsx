import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import "@/app/globals.css";
import { getTranslations } from "@/i18n/utils";
import { Locale, locales, defaultLocale } from "@/i18n/config";
import en from "@/i18n/dictionaries/en";  // Import default dictionary as fallback

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Fallback dictionary for metadata generation
const fallbackDictionary = en;

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: Locale }> 
}): Promise<Metadata> {
  try {
    // Properly await the params object before destructuring
    const { lang } = await params;
    
    // Get translations with error handling
    let dictionary;
    try {
      dictionary = await getTranslations(lang);
    } catch (error) {
      console.error("Error getting translations for metadata:", error);
      dictionary = fallbackDictionary;
    }
    
    // Fallback to default dictionary if needed
    if (!dictionary || !dictionary.meta) {
      console.warn(`Using fallback dictionary for metadata (lang: ${lang})`);
      dictionary = fallbackDictionary;
    }
    
    const canonicalUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alisongalindo.com";
    
    return {
      title: {
        default: dictionary.meta.title,
        template: `%s | ${dictionary.meta.title}`,
      },
      description: dictionary.meta.description,
      metadataBase: new URL(canonicalUrl),
      alternates: {
        canonical: '/',
        languages: {
          'en': '/en',
          'pt-BR': '/pt-BR',
          'x-default': '/',
        },
      },
      openGraph: {
        type: 'website',
        locale: lang === 'en' ? 'en_US' : 'pt_BR',
        url: canonicalUrl,
        title: dictionary.meta.title,
        description: dictionary.meta.description,
        siteName: 'Alison Galindo',
        images: [
          {
            url: '/assets/images/og-image.jpg',
            width: 1200,
            height: 630,
            alt: dictionary.accessibility.photoAlt,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: dictionary.meta.title,
        description: dictionary.meta.description,
        images: ['/assets/images/og-image.jpg'],
      },
      icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
      },
      manifest: '/site.webmanifest',
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    
    // Provide minimal fallback metadata in case of errors
    return {
      title: "Alison Galindo",
      description: "Senior Front end developer"
    };
  }
}

// Add viewport export to fix the theme color warning
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export async function generateStaticParams() {
  return locales.map(lang => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}>) {
  try {
    // Properly await the params object before destructuring
    const { lang } = await params;
    
    return (
      <html lang={lang} suppressHydrationWarning>
        <body
          className={`${openSans.variable} font-sans antialiased`}
        >
          {children}
        </body>
      </html>
    );
  } catch (error) {
    console.error("Error in RootLayout:", error);
    
    // Fallback to default locale in case of errors
    return (
      <html lang={defaultLocale} suppressHydrationWarning>
        <body
          className={`${openSans.variable} font-sans antialiased`}
        >
          {children}
        </body>
      </html>
    );
  }
}