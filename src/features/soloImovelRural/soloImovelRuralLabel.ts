import { Dictionary, Locale } from '../../translation/locales';
import { SoloImovelRuralWithRelationships } from './soloImovelRuralSchemas';

export function soloImovelRuralLabel(
  soloImovelRural: Partial<SoloImovelRuralWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!soloImovelRural?.nomeArea) {
    return '';
  }

  const value = soloImovelRural.nomeArea;
  const _label = String(value);

  if (!soloImovelRural?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
