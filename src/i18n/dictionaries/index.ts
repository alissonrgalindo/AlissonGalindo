import { defaultLocale, Locale } from '../config';

import en from './en';
import ptBR from './pt-BR';

const dictionaries = {
  en,
  'pt-BR': ptBR
};

export const getDictionary = (locale: Locale = defaultLocale) => {
  return dictionaries[locale];
};