import { Dictionary, Locale } from '../../translation/locales';
import { SistemaProdutivoRuralWithRelationships } from './sistemaProdutivoRuralSchemas';

export function sistemaProdutivoRuralLabel(
  sistemaProdutivoRural:
    | Partial<SistemaProdutivoRuralWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!sistemaProdutivoRural?.nome) {
    return '';
  }

  const value = sistemaProdutivoRural.nome;
  const _label = String(value);

  if (!sistemaProdutivoRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
