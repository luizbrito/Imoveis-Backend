import { Dictionary, Locale } from '../../translation/locales';
import { RecursoHidricoRuralWithRelationships } from './recursoHidricoRuralSchemas';

export function recursoHidricoRuralLabel(
  recursoHidricoRural:
    | Partial<RecursoHidricoRuralWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!recursoHidricoRural?.nome) {
    return '';
  }

  const value = recursoHidricoRural.nome;
  const _label = String(value);

  if (!recursoHidricoRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
