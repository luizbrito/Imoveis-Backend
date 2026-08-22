import { Dictionary, Locale } from '../../translation/locales';
import { LocacaoWithRelationships } from './locacaoSchemas';

export function locacaoLabel(
  locacao: Partial<LocacaoWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!locacao?.codigo) {
    return '';
  }

  const value = locacao.codigo;
  const _label = String(value);

  if (!locacao?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
