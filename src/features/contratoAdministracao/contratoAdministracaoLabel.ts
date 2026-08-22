import { Dictionary, Locale } from '../../translation/locales';
import { ContratoAdministracaoWithRelationships } from './contratoAdministracaoSchemas';

export function contratoAdministracaoLabel(
  contratoAdministracao:
    | Partial<ContratoAdministracaoWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!contratoAdministracao?.numero) {
    return '';
  }

  const value = contratoAdministracao.numero;
  const _label = String(value);

  if (!contratoAdministracao?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
