import Head from "next/head";
import { Locale } from "@/i18n/config";
import en from "@/i18n/dictionaries/en";

type MetadataDictionary = typeof en;

export default function Metadata({
  dictionary,
  lang,
}: {
  dictionary: MetadataDictionary;
  lang: Locale;
}) {
  const { meta } = dictionary;
  const canonicalUrl = "https://alisongalindo.com";

  return (
    <Head>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={`${canonicalUrl}/assets/images/og-image.jpg`} />
      
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={meta.title} />
      <meta property="twitter:description" content={meta.description} />
      <meta property="twitter:image" content={`${canonicalUrl}/assets/images/og-image.jpg`} />
      
      <meta property="og:locale" content={lang === "en" ? "en_US" : "pt_BR"} />
      <link rel="canonical" href={`${canonicalUrl}/${lang}`} />
      
      <link rel="alternate" href={`${canonicalUrl}/en`} hrefLang="en" />
      <link rel="alternate" href={`${canonicalUrl}/pt-BR`} hrefLang="pt-BR" />
      <link rel="alternate" href={`${canonicalUrl}`} hrefLang="x-default" />
      
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      <meta name="theme-color" content="#000000" />
    </Head>
  );
}