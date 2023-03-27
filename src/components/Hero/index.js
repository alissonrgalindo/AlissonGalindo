import classNames from "classnames/bind";

import Image from "next/image";
import Background from "@/components/Background";

import styles from "./index.module.scss";

const cn = classNames.bind(styles);

export default function Hero() {
  return (
    <>
      <Background />

      <div className={cn("wrapper")}>
        <div className={cn("personal")}>
          <div className={cn("header")}>
            <h2 className={cn("caption")}>CREATIVE FRONT-END DEVELOPER</h2>
            <h1 className={cn("title")}>Alison Galindo</h1>
          </div>
          <article className={cn("resume")}>
            <p>
              Professional developer, in loved with technology and sustainable
              ways of living. For detailed information, please check my
              <a
                className={cn("link")}
                href="https://www.linkedin.com/in/alissonrgalindo/"
                title="My Linkedin profile page."
                target="_blank"
                rel="noopener"
              >
                &nbsp;Linkedin&nbsp;
              </a>
              or
              <a
                className={cn("link")}
                href="/assets/docs/alison-cv.pdf"
                download="Alison-Galindo-CV-UI-Developer"
                role="button"
              >
                &nbsp;Download my CV
              </a>
              .
            </p>
          </article>
          <address className={cn("contact")}>
            <a href="tel:+351-912-279-671">+351 912 279 671</a>
            <br />
            based in the sunny city of Porto, Portugal
          </address>
        </div>
        <figure className={cn("me")}>
          <Image
            className={cn("photo")}
            src="/assets/images/me.webp"
            alt="Photography a man with black jacket and a glass."
            aria-label="Photography a man with black jacket and a glass."
            width="955"
            height="790"
          />
        </figure>
      </div>
    </>
  );
}
