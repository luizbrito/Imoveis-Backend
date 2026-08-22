import { Dictionary, Locale } from '../../translation/locales';
import { ReferenciaClimaticaRuralWithRelationships } from './referenciaClimaticaRuralSchemas';

export function referenciaClimaticaRuralLabel(
  referenciaClimaticaRural:
    | Partial<ReferenciaClimaticaRuralWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!referenciaClimaticaRural?.titulo) {
    return '';
  }

  const value = referenciaClimaticaRural.titulo;
  const _label = String(value);

  if (!referenciaClimaticaRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
