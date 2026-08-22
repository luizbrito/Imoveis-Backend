import { Dictionary, Locale } from '../../translation/locales';
import { RepasseProprietarioWithRelationships } from './repasseProprietarioSchemas';

export function repasseProprietarioLabel(
  repasseProprietario:
    | Partial<RepasseProprietarioWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!repasseProprietario?.competencia) {
    return '';
  }

  const value = repasseProprietario.competencia;
  const _label = String(value);

  if (!repasseProprietario?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
