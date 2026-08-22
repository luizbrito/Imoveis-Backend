import { Dictionary, Locale } from '../../translation/locales';
import { PortalImobiliarioWithRelationships } from './portalImobiliarioSchemas';

export function portalImobiliarioLabel(
  portalImobiliario:
    | Partial<PortalImobiliarioWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!portalImobiliario?.nome) {
    return '';
  }

  const value = portalImobiliario.nome;
  const _label = String(value);

  if (!portalImobiliario?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
