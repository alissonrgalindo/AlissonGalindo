import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/[lang]/page";
import en from "@/i18n/dictionaries/en";
import { Dictionary } from "@/i18n/types";

vi.mock("@/i18n/utils", () => ({
  getTranslations: vi.fn().mockImplementation(async (locale) => {
    if (locale === "pt-BR") {
      return (await import("@/i18n/dictionaries/pt-BR")).default;
    }
    return en;
  }),
}));

vi.mock("@/components/Hero", () => ({
  default: ({ lang, dictionary }: { lang: string; dictionary: Dictionary }) => (
    <div
      data-testid="hero-component"
      data-lang={lang}
      data-title={dictionary.hero.title}
    >
      Mocked Hero Component
    </div>
  ),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    Suspense: ({ children }: { children: React.ReactNode }) => children,
  };
});

describe("Home Page", () => {
  it("renders the loading component initially", async () => {
    const params = Promise.resolve({ lang: "en" as const });

    render(await Home({ params }));

    const heroComponent = screen.getByTestId("hero-component");
    expect(heroComponent).toBeInTheDocument();
  });

  it("passes the correct props to Hero component", async () => {
    const params = Promise.resolve({ lang: "en" as const });

    render(await Home({ params }));

    const heroComponent = screen.getByTestId("hero-component");
    expect(heroComponent).toHaveAttribute("data-lang", "en");
    expect(heroComponent).toHaveAttribute("data-title", en.hero.title);
  });

  it("works with different locales", async () => {
    const params = Promise.resolve({ lang: "pt-BR" as const });

    render(await Home({ params }));

    const heroComponent = screen.getByTestId("hero-component");
    expect(heroComponent).toHaveAttribute("data-lang", "pt-BR");
  });
});
