"use client";

import Image from "next/image";
import Background from "@/components/Background";
import PhotoOfMe from "@/assets/images/me.webp";

export default function Hero() {
  return (
    <>
      <Background />
      <div className="pointer-events-none max-w-[1200px] h-screen px-4 md:px-8 py-10 mx-auto grid grid-cols-1 md:grid-cols-[1fr_550px] gap-6 md:gap-12">
        <div className="py-10 md:py-20 select-none text-white">
          <div className="mb-6">
            <h2 className="mix-blend-difference uppercase tracking-wide text-sm font-bold mb-2">
              CREATIVE FRONT-END DEVELOPER
            </h2>
            <h1 className="mix-blend-difference text-[clamp(40px,8vw,80px)] uppercase font-extrabold leading-tight">
              Alison Galindo
            </h1>
          </div>
          <article className="mix-blend-difference max-w-[400px] tracking-wide leading-[20px] text-sm mb-5">
            <p>
              Professional developer, in love with technology and sustainable
              ways of living. For detailed information, please check my
              <a
                className="font-bold pointer-events-auto"
                href="https://www.linkedin.com/in/alissonrgalindo/"
                title="My Linkedin profile page."
                target="_blank"
                rel="noopener"
              >
                &nbsp;Linkedin&nbsp;
              </a>
              or
              <a
                className="font-bold pointer-events-auto"
                href="/assets/docs/alison-cv.pdf"
                download="Alison-Galindo-CV-UI-Developer"
                role="button"
              >
                &nbsp;Download my CV
              </a>
              .
            </p>
          </article>
          <address className="mix-blend-difference not-italic max-w-[400px] tracking-wide leading-[20px] text-sm mb-5">
            <a href="tel:+351-912-279-671" className="pointer-events-auto">+351 912 279 671</a>
            <br />
            based in the sunny city of Porto, Portugal
          </address>
        </div>

        <figure className="relative hidden md:flex items-end max-h-[500px] rounded-full overflow-hidden pointer-events-none before-gradient-mask">
          <Image
            priority
            className="relative max-w-full h-auto"
            src={PhotoOfMe}
            alt="Photography of Alison Galindo wearing a black jacket and glasses"
            width={955}
            height={790}
          />
        </figure>
      </div>
    </>
  );
}