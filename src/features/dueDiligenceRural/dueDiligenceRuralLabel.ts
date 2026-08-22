import { Dictionary, Locale } from '../../translation/locales';
import { DueDiligenceRuralWithRelationships } from './dueDiligenceRuralSchemas';

export function dueDiligenceRuralLabel(
  dueDiligenceRural:
    | Partial<DueDiligenceRuralWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!dueDiligenceRural?.titulo) {
    return '';
  }

  const value = dueDiligenceRural.titulo;
  const _label = String(value);

  if (!dueDiligenceRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
