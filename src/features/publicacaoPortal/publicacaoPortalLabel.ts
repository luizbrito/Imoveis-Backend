import { Dictionary, Locale } from '../../translation/locales';
import { PublicacaoPortalWithRelationships } from './publicacaoPortalSchemas';

export function publicacaoPortalLabel(
  publicacaoPortal:
    | Partial<PublicacaoPortalWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!publicacaoPortal?.codigoExterno) {
    return '';
  }

  const value = publicacaoPortal.codigoExterno;
  const _label = String(value);

  if (!publicacaoPortal?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
