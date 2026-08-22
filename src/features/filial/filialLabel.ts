import { Dictionary, Locale } from '../../translation/locales';
import { FilialWithRelationships } from './filialSchemas';

export function filialLabel(
  filial: Partial<FilialWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!filial?.nome) {
    return '';
  }

  const value = filial.nome;
  const _label = String(value);

  if (!filial?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
