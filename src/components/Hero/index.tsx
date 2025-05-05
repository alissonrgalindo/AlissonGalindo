import Image from "next/image";
import Background from "@/components/Background";
import PhotoOfMe from "@/assets/images/me.webp";
import { Locale } from "@/i18n/config";
import LanguageSwitcher from "@/components/LanguageSwitcher";
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
      <Background />
      <LanguageSwitcher currentLocale={lang} />
      <main className="pointer-events-none max-w-[1200px] h-screen px-4 md:px-8 py-10 mx-auto grid grid-cols-1 md:grid-cols-[1fr_550px] gap-6 md:gap-12">
        <div className="flex flex-col justify-center py-10 md:py-0 select-none text-white">
          <div className="mb-6">
            <h2 className="mix-blend-difference uppercase tracking-wide text-sm font-bold mb-2">
              {hero.subtitle}
            </h2>
            <h1 className="mix-blend-difference text-[clamp(40px,8vw,80px)] uppercase font-extrabold leading-tight">
              {hero.title}
            </h1>
          </div>
          <article className="mix-blend-difference max-w-[400px] tracking-wide leading-[20px] text-sm mb-5">
            <p>
              {hero.description}
              <a
                className="font-bold pointer-events-auto text-orange-400"
                href="https://codepen.io/AlisonGalindo"
                title={accessibility.codepenTitle}
                target="_blank"
                rel="noopener"
              >
                &nbsp;{hero.codepenLink}&nbsp;
              </a>
              {hero.codepenLinkText}
              <a
                className="font-bold pointer-events-auto text-orange-400"
                href="https://www.linkedin.com/in/alissonrgalindo/"
                title={accessibility.linkedinTitle}
                target="_blank"
                rel="noopener"
              >
                &nbsp;{hero.linkedinLink}&nbsp;
              </a>
              {hero.orText}
              <a
                className="font-bold pointer-events-auto text-orange-400"
                href="/assets/docs/alison-cv.pdf"
                download="Alison-Galindo-CV-UI-Developer"
                role="button"
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

        <figure className="relative hidden md:flex items-end max-h-[500px] rounded-full overflow-hidden pointer-events-none before-gradient-mask">
          <Image
            priority
            className="relative max-w-full h-auto top-4"
            src={PhotoOfMe}
            alt={accessibility.photoAlt}
            width={955}
            height={790}
          />
        </figure>
      </main>
    </>
  );
}