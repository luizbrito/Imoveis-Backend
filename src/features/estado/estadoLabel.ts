import { Dictionary, Locale } from '../../translation/locales';
import { EstadoWithRelationships } from './estadoSchemas';

export function estadoLabel(
  estado: Partial<EstadoWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!estado?.nome) {
    return '';
  }

  const value = estado.nome;
  const _label = String(value);

  if (!estado?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
