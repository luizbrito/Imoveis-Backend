import { Dictionary, Locale } from '../../translation/locales';
import { BenfeitoriaRuralWithRelationships } from './benfeitoriaRuralSchemas';

export function benfeitoriaRuralLabel(
  benfeitoriaRural:
    | Partial<BenfeitoriaRuralWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!benfeitoriaRural?.nome) {
    return '';
  }

  const value = benfeitoriaRural.nome;
  const _label = String(value);

  if (!benfeitoriaRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
