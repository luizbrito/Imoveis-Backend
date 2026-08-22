import dayjs from 'dayjs';
import 'dayjs/locale/fr.js';
import 'dayjs/locale/es.js';
import 'dayjs/locale/de.js';
import 'dayjs/locale/pt-br.js';
import { Locale } from './locales';

export function applyDayjsTranslation(locale: Locale) {
  if (locale === 'en') {
    dayjs.locale('en');
  }

  if (locale === 'fr') {
    dayjs.locale('fr');
  }

  if (locale === 'es') {
    dayjs.locale('es');
  }

  if (locale === 'de') {
    dayjs.locale('de');
  }

  if (locale === 'pt-BR') {
    dayjs.locale('pt-br');
  }
}
