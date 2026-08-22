import { Dictionary, Locale } from '../../translation/locales';
import { TipoSoloWithRelationships } from './tipoSoloSchemas';

export function tipoSoloLabel(
  tipoSolo: Partial<TipoSoloWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!tipoSolo?.nome) {
    return '';
  }

  const value = tipoSolo.nome;
  const _label = String(value);

  if (!tipoSolo?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
