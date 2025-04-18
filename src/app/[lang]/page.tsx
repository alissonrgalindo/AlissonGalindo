import { getTranslations } from "@/i18n/utils";
import Hero from "@/components/Hero";
import { Locale } from "@/i18n/config";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getTranslations(lang);
  
  return (
    <Hero lang={lang} dictionary={dictionary} />
  );
}