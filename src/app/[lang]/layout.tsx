import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "@/app/globals.css";
import { getTranslations } from "@/i18n/utils";
import { Locale, locales } from "@/i18n/config";
import Navbar from "@/components/Navbar";
import { Dictionary } from "@/i18n/types";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export async function generateMetadata({ 
  params 
}: { 
  params: { lang: Locale }
}): Promise<Metadata> {
  const dictionary = await getTranslations(params.lang) as Dictionary;
  
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
  params: { lang: Locale };
}>) {
  const dictionary = await getTranslations(params.lang) as Dictionary;
  
  return (
    <html lang={params.lang}>
      <body
        className={`${openSans.variable} antialiased`}
      >
        <Navbar locale={params.lang} dictionary={dictionary} />
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}