export const defaultLocale = 'en';
export const locales = ['en', 'pt-BR'] as const;
export type Locale = typeof locales[number];

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}