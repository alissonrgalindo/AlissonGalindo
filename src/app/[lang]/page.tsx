import { getTranslations } from "@/i18n/utils";
import Hero from "@/components/Hero";
import { Locale, defaultLocale } from "@/i18n/config";
import { Suspense } from "react";
import en from "@/i18n/dictionaries/en";  // Import default dictionary as fallback

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-200"></div>
    </div>
  );
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  try {
    // Properly await the params object before destructuring
    const { lang } = await params;
    
    // Get translations with error handling
    let dictionary;
    try {
      dictionary = await getTranslations(lang);
      console.log(`Page: Got dictionary for ${lang}`, dictionary ? "Found" : "Not found");
    } catch (error) {
      console.error(`Error getting translations for ${lang}:`, error);
      dictionary = en; // Fallback to English dictionary
    }
    
    // If dictionary is still undefined, use English as fallback
    if (!dictionary) {
      console.warn(`Using fallback dictionary for page (lang: ${lang})`);
      dictionary = en;
    }
    
    return (
      <Suspense fallback={<Loading />}>
        <Hero lang={lang} dictionary={dictionary} />
      </Suspense>
    );
  } catch (error) {
    console.error("Error in Home page:", error);
    
    // Return fallback content in case of errors
    return (
      <Suspense fallback={<Loading />}>
        <Hero lang={defaultLocale} dictionary={en} />
      </Suspense>
    );
  }
}