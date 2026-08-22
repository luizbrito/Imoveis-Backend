import { Dictionary, Locale } from '../../translation/locales';
import { ContratoLocacaoWithRelationships } from './contratoLocacaoSchemas';

export function contratoLocacaoLabel(
  contratoLocacao: Partial<ContratoLocacaoWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!contratoLocacao?.numero) {
    return '';
  }

  const value = contratoLocacao.numero;
  const _label = String(value);

  if (!contratoLocacao?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
