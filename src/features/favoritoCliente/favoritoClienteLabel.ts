import { Dictionary, Locale } from '../../translation/locales';
import { FavoritoClienteWithRelationships } from './favoritoClienteSchemas';
import { formatDateTime } from '../../shared/lib/formatDateTime';

export function favoritoClienteLabel(
  favoritoCliente: Partial<FavoritoClienteWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!favoritoCliente?.dataInclusao) {
    return '';
  }

  const value = favoritoCliente.dataInclusao;
  const _label = formatDateTime(value as any, dictionary);

  if (!favoritoCliente?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
