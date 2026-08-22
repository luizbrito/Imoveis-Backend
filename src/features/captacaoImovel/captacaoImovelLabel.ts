import { Dictionary, Locale } from '../../translation/locales';
import { CaptacaoImovelWithRelationships } from './captacaoImovelSchemas';

export function captacaoImovelLabel(
  captacaoImovel: Partial<CaptacaoImovelWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!captacaoImovel?.codigo) {
    return '';
  }

  const value = captacaoImovel.codigo;
  const _label = String(value);

  if (!captacaoImovel?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
