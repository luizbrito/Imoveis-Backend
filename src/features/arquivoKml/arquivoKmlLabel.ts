import { Dictionary, Locale } from '../../translation/locales';
import { ArquivoKmlWithRelationships } from './arquivoKmlSchemas';

export function arquivoKmlLabel(
  arquivoKml: Partial<ArquivoKmlWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!arquivoKml?.nome) {
    return '';
  }

  const value = arquivoKml.nome;
  const _label = String(value);

  if (!arquivoKml?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
