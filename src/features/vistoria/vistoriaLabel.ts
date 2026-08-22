import { Dictionary, Locale } from '../../translation/locales';
import { VistoriaWithRelationships } from './vistoriaSchemas';

export function vistoriaLabel(
  vistoria: Partial<VistoriaWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!vistoria?.codigo) {
    return '';
  }

  const value = vistoria.codigo;
  const _label = String(value);

  if (!vistoria?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
