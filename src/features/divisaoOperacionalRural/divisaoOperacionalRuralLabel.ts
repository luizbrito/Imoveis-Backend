import { Dictionary, Locale } from '../../translation/locales';
import { DivisaoOperacionalRuralWithRelationships } from './divisaoOperacionalRuralSchemas';

export function divisaoOperacionalRuralLabel(
  divisaoOperacionalRural:
    | Partial<DivisaoOperacionalRuralWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!divisaoOperacionalRural?.nome) {
    return '';
  }

  const value = divisaoOperacionalRural.nome;
  const _label = String(value);

  if (!divisaoOperacionalRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
