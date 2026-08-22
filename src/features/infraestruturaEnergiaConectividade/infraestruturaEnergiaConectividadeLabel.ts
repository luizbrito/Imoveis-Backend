import { Dictionary, Locale } from '../../translation/locales';
import { InfraestruturaEnergiaConectividadeWithRelationships } from './infraestruturaEnergiaConectividadeSchemas';

export function infraestruturaEnergiaConectividadeLabel(
  infraestruturaEnergiaConectividade:
    | Partial<InfraestruturaEnergiaConectividadeWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!infraestruturaEnergiaConectividade?.descricao) {
    return '';
  }

  const value = infraestruturaEnergiaConectividade.descricao;
  const _label = String(value);

  if (!infraestruturaEnergiaConectividade?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
