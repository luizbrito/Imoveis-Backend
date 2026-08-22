import { Dictionary, Locale } from '../../translation/locales';
import { DocumentoImovelWithRelationships } from './documentoImovelSchemas';

export function documentoImovelLabel(
  documentoImovel: Partial<DocumentoImovelWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!documentoImovel?.titulo) {
    return '';
  }

  const value = documentoImovel.titulo;
  const _label = String(value);

  if (!documentoImovel?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
