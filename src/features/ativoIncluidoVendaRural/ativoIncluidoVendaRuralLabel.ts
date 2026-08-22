import { Dictionary, Locale } from '../../translation/locales';
import { AtivoIncluidoVendaRuralWithRelationships } from './ativoIncluidoVendaRuralSchemas';

export function ativoIncluidoVendaRuralLabel(
  ativoIncluidoVendaRural:
    | Partial<AtivoIncluidoVendaRuralWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!ativoIncluidoVendaRural?.nome) {
    return '';
  }

  const value = ativoIncluidoVendaRural.nome;
  const _label = String(value);

  if (!ativoIncluidoVendaRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
