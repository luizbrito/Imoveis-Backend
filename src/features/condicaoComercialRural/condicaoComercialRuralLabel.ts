import { Dictionary, Locale } from '../../translation/locales';
import { CondicaoComercialRuralWithRelationships } from './condicaoComercialRuralSchemas';
import { formatDecimal } from '../../shared/lib/formatDecimal';

export function condicaoComercialRuralLabel(
  condicaoComercialRural:
    | Partial<CondicaoComercialRuralWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!condicaoComercialRural?.precoPorHa) {
    return '';
  }

  const value = condicaoComercialRural.precoPorHa;
  const _label = formatDecimal((value as any)?.toString(), locale || 'en', 2);

  if (!condicaoComercialRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
