import { getTranslations } from "@/i18n/utils";
import Hero from "@/components/Hero";
import { Locale } from "@/i18n/config";
import { Suspense } from "react";

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
  const { lang } = await params;
  const dictionary = await getTranslations(lang);
  
  return (
    <Suspense fallback={<Loading />}>
      <Hero lang={lang} dictionary={dictionary} />
    </Suspense>
  );
}