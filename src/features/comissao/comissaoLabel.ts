import { Dictionary, Locale } from '../../translation/locales';
import { ComissaoWithRelationships } from './comissaoSchemas';

export function comissaoLabel(
  comissao: Partial<ComissaoWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!comissao?.codigo) {
    return '';
  }

  const value = comissao.codigo;
  const _label = String(value);

  if (!comissao?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
