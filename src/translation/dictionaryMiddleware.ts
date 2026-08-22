import { AppContext } from '../shared/controller/appContext';
import { applyDayjsTranslation } from './applyDayjsTranslation';
import { getDictionary } from './getDictionary';

export async function dictionaryMiddleware(
  locale: any,
  context: Partial<AppContext>,
) {
  context.locale = locale;
  context.dictionary = await getDictionary(locale);
  applyDayjsTranslation(locale);
  return context as AppContext;
}
