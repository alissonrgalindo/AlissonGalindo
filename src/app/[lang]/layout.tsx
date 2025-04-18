import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "@/app/globals.css";
import { getTranslations } from "@/i18n/utils";
import { Locale, locales } from "@/i18n/config";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: Locale }> 
}): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = await getTranslations(lang);
  
  return {
    title: dictionary.meta.title,
    description: dictionary.meta.description,
  };
}

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
  const { lang } = await params;
  
  return (
    <html lang={lang}>
      <body
        className={`${openSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}