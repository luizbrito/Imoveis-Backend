import { Dictionary, Locale } from '../../translation/locales';
import { TopografiaRuralWithRelationships } from './topografiaRuralSchemas';

export function topografiaRuralLabel(
  topografiaRural: Partial<TopografiaRuralWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!topografiaRural?.descricao) {
    return '';
  }

  const value = topografiaRural.descricao;
  const _label = String(value);

  if (!topografiaRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
