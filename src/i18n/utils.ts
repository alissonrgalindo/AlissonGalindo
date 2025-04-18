import 'server-only';
import { getDictionary } from './dictionaries';
import { Locale } from './config';

export async function getTranslations(locale: Locale) {
  const dictionary = getDictionary(locale);
  return dictionary;
}