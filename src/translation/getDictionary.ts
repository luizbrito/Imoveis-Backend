import { defaultLocale, Locale } from './locales';
import { dictionary as en } from './en/en';
import { dictionary as fr } from './fr/fr';
import { dictionary as es } from './es/es';
import { dictionary as de } from './de/de';
import { dictionary as ptBR } from './pt-BR/pt-BR';

export const dictionaries = {
  en: en,
  fr: fr,
  es: es,
  de: de,
  'pt-BR': ptBR,
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]
    ? dictionaries[locale]
    : dictionaries[defaultLocale];
}

export async function isDictionaryValid(locale: string) {
  return (dictionaries as any)[locale] ? true : false;
}
