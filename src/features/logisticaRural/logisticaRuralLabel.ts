import { Dictionary, Locale } from '../../translation/locales';
import { LogisticaRuralWithRelationships } from './logisticaRuralSchemas';

export function logisticaRuralLabel(
  logisticaRural: Partial<LogisticaRuralWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!logisticaRural?.descricao) {
    return '';
  }

  const value = logisticaRural.descricao;
  const _label = String(value);

  if (!logisticaRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
