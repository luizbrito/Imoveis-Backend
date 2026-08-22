import { defaultLocale, type Locale } from './locales';
import { dictionaryValidateLocale } from './dictionaryValidateLocale';

export function dictionaryLocaleFromRequest(request?: Request): Locale {
  try {
    if (request?.headers) {
      const acceptLanguage = request.headers.get('Accept-Language');
      const headerLocale = acceptLanguage?.split(',')[0];
      return dictionaryValidateLocale(headerLocale);
    }
    return defaultLocale;
  } catch (error) {
    return defaultLocale;
  }
}
