import { Dictionary, Locale } from '../../translation/locales';
import { ChaveImovelWithRelationships } from './chaveImovelSchemas';

export function chaveImovelLabel(
  chaveImovel: Partial<ChaveImovelWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!chaveImovel?.codigo) {
    return '';
  }

  const value = chaveImovel.codigo;
  const _label = String(value);

  if (!chaveImovel?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
