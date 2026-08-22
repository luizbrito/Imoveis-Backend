import { Locale, defaultLocale, locales } from './locales';

export function dictionaryValidateLocale(locale: string | undefined): Locale {
  if (!locale) return defaultLocale;

  if (locales.includes(locale as Locale)) {
    return locale as Locale;
  }

  const languageOnly = locale.split('-')[0];
  if (locales.includes(languageOnly as Locale)) {
    return languageOnly as Locale;
  }

  const matchingLocale = locales.find((l) => l.startsWith(languageOnly));
  if (matchingLocale) {
    return matchingLocale;
  }

  return defaultLocale;
}
