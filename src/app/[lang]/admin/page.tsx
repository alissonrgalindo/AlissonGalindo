import { Locale } from "@/i18n/config";
import { getTranslations } from "@/i18n/utils";
import AdminClient from "./client";
import { Dictionary } from "@/i18n/types";

export default async function AdminPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getTranslations(params.lang) as Dictionary;
  
  return <AdminClient lang={params.lang} dictionary={dictionary} />;
}