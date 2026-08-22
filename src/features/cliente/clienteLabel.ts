import { Dictionary, Locale } from '../../translation/locales';
import { ClienteWithRelationships } from './clienteSchemas';

export function clienteLabel(
  cliente: Partial<ClienteWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!cliente?.nomeRazaoSocial) {
    return '';
  }

  const value = cliente.nomeRazaoSocial;
  const _label = String(value);

  if (!cliente?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
