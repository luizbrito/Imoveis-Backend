import { Dictionary, Locale } from '../../translation/locales';
import { RiscoRuralWithRelationships } from './riscoRuralSchemas';
import { dictionaryEnumerator } from '../../translation/dictionaryEnumerator';

export function riscoRuralLabel(
  riscoRural: Partial<RiscoRuralWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!riscoRural?.tipo) {
    return '';
  }

  const value = riscoRural.tipo;
  const _label = dictionaryEnumerator(
    dictionary.riscoRural.enumerators.tipo,
    value as string,
  );

  if (!riscoRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
