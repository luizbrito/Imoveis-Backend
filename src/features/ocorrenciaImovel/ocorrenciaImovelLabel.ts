import { Dictionary, Locale } from '../../translation/locales';
import { OcorrenciaImovelWithRelationships } from './ocorrenciaImovelSchemas';

export function ocorrenciaImovelLabel(
  ocorrenciaImovel:
    | Partial<OcorrenciaImovelWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!ocorrenciaImovel?.codigo) {
    return '';
  }

  const value = ocorrenciaImovel.codigo;
  const _label = String(value);

  if (!ocorrenciaImovel?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
