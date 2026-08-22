import { Dictionary, Locale } from '../../translation/locales';
import { RestricaoTerritorialRuralWithRelationships } from './restricaoTerritorialRuralSchemas';
import { dictionaryEnumerator } from '../../translation/dictionaryEnumerator';

export function restricaoTerritorialRuralLabel(
  restricaoTerritorialRural:
    | Partial<RestricaoTerritorialRuralWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!restricaoTerritorialRural?.tipo) {
    return '';
  }

  const value = restricaoTerritorialRural.tipo;
  const _label = dictionaryEnumerator(
    dictionary.restricaoTerritorialRural.enumerators.tipo,
    value as string,
  );

  if (!restricaoTerritorialRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
