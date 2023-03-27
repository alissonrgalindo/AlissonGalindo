import Script from "next/script";

import Head from "next/head";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <>
      <Head>
        <title>Alison Galindo - Front-end</title>
        <meta name="title" content="Alison Galindo" />
        <meta
          name="description"
          content="Creative Front-end developer, in love with technology and sustainable ways of living."
        />
        <meta
          name="keywords"
          content="Design System, Ui Developer, Ux Engineer, Style Guide, Remote, Freelancer, ux/ui developer, Front end, HTML, CSS, SASS, HTML5, CSS3, Figma, Adobe XD, Agile, JavaScript, jQuery, React, Next.js, Ember.js, Design System Management,  Interactive Components,  Interactive Components, Adobe Package, Conversion Rate Optimization, A/B testing, SCRUM"
        />
        <meta name="language" content="English" />
        <meta name="author" content="Alison Galindo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-3M53WYLLVM"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-3M53WYLLVM');
        `}
      </Script>
      <main>
        <Hero />
      </main>
    </>
  );
}
