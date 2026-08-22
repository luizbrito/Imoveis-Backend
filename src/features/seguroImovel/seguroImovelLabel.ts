import { Dictionary, Locale } from '../../translation/locales';
import { SeguroImovelWithRelationships } from './seguroImovelSchemas';

export function seguroImovelLabel(
  seguroImovel: Partial<SeguroImovelWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!seguroImovel?.numeroApolice) {
    return '';
  }

  const value = seguroImovel.numeroApolice;
  const _label = String(value);

  if (!seguroImovel?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
