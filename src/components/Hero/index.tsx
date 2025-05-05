import Image from "next/image";
import Background from "@/components/Background";
import { Locale } from "@/i18n/config";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SkipToContent from "@/components/SkipToContent";
import en from "@/i18n/dictionaries/en";

type HeroDictionary = typeof en;

export default function Hero({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: HeroDictionary;
}) {
  const { hero, accessibility } = dictionary;

  return (
    <>
      <SkipToContent />
      <Background />
      <LanguageSwitcher currentLocale={lang} />
      <main 
        id="main-content"
        className="relative pointer-events-none max-w-[1200px] h-screen px-4 md:px-8 py-10 mx-auto grid grid-cols-1 md:grid-cols-[1fr_550px] gap-6 md:gap-12"
        aria-labelledby="hero-title"
      >
        <div className="flex flex-col justify-center py-10 md:py-0 select-none text-white">
          <div className="mb-6">
            <h2 
              className="mix-blend-difference uppercase tracking-wide text-sm font-bold mb-2"
              aria-label={hero.subtitle}
            >
              {hero.subtitle}
            </h2>
            <h1 
              id="hero-title"
              className="mix-blend-difference text-[clamp(40px,8vw,80px)] uppercase font-extrabold leading-tight"
            >
              {hero.title}
            </h1>
          </div>
          <article 
            className="mix-blend-difference max-w-[400px] tracking-wide leading-[20px] text-sm mb-5"
            aria-label="About me"
          >
            <p>
              {hero.description}
              <a
                className="font-bold pointer-events-auto text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:underline"
                href="https://codepen.io/AlisonGalindo"
                title={accessibility.codepenTitle}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${hero.codepenLink} - ${accessibility.codepenTitle} (opens in a new tab)`}
              >
                &nbsp;{hero.codepenLink}&nbsp;
              </a>
              {hero.codepenLinkText}
              <a
                className="font-bold pointer-events-auto text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:underline"
                href="https://www.linkedin.com/in/alissonrgalindo/"
                title={accessibility.linkedinTitle}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${hero.linkedinLink} - ${accessibility.linkedinTitle} (opens in a new tab)`}
              >
                &nbsp;{hero.linkedinLink}&nbsp;
              </a>
              {hero.orText}
              <a
                className="font-bold pointer-events-auto text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:underline"
                href="/assets/docs/alison-cv.pdf"
                download="Alison-Galindo-CV-UI-Developer"
                role="button"
                aria-label={`${hero.downloadCV} (downloads a PDF file)`}
              >
                &nbsp;{hero.downloadCV}
              </a>
              .
            </p>
          </article>
          
          <address className="mix-blend-difference not-italic max-w-[400px] tracking-wide leading-[20px] text-sm mb-5">
            {hero.location}
          </address>
          
        </div>

        <figure 
          className="relative hidden md:flex items-end max-h-[500px] rounded-full overflow-hidden pointer-events-none before-gradient-mask"
          aria-labelledby="photo-caption"
        >
          <Image
            priority
            className="relative max-w-full h-auto top-4"
            src="/me.webp" 
            alt={accessibility.photoAlt}
            width={955}
            height={790}
          />
          <figcaption id="photo-caption" className="sr-only">
            {accessibility.photoAlt}
          </figcaption>
        </figure>
      </main>
    </>
  );
}