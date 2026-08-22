import { Dictionary, Locale } from '../../translation/locales';
import { ProducaoHistoricaRuralWithRelationships } from './producaoHistoricaRuralSchemas';

export function producaoHistoricaRuralLabel(
  producaoHistoricaRural:
    | Partial<ProducaoHistoricaRuralWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!producaoHistoricaRural?.safraAno) {
    return '';
  }

  const value = producaoHistoricaRural.safraAno;
  const _label = String(value);

  if (!producaoHistoricaRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
