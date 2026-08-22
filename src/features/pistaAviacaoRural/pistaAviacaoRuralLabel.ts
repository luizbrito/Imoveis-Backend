import { Dictionary, Locale } from '../../translation/locales';
import { PistaAviacaoRuralWithRelationships } from './pistaAviacaoRuralSchemas';

export function pistaAviacaoRuralLabel(
  pistaAviacaoRural:
    | Partial<PistaAviacaoRuralWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!pistaAviacaoRural?.nome) {
    return '';
  }

  const value = pistaAviacaoRural.nome;
  const _label = String(value);

  if (!pistaAviacaoRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
