import 'server-only';
import { getDictionary } from './dictionaries';
import { Locale, defaultLocale } from './config';

export async function getTranslations(locale: Locale) {
  try {
    const safeLocale = locale || defaultLocale;
    
    const dictionary = getDictionary(safeLocale);
    console.log(`Getting translations for locale: ${safeLocale}`, dictionary ? 'Dictionary found' : 'Dictionary not found');
    
    if (!dictionary) {
      console.error(`No dictionary found for locale: ${safeLocale}, falling back to default`);
      return getDictionary(defaultLocale);
    }
    
    return dictionary;
  } catch (error) {
    console.error('Error getting translations:', error);
    return getDictionary(defaultLocale);
  }
}