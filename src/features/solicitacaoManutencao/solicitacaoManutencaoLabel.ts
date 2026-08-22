import { Dictionary, Locale } from '../../translation/locales';
import { SolicitacaoManutencaoWithRelationships } from './solicitacaoManutencaoSchemas';

export function solicitacaoManutencaoLabel(
  solicitacaoManutencao:
    | Partial<SolicitacaoManutencaoWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!solicitacaoManutencao?.codigo) {
    return '';
  }

  const value = solicitacaoManutencao.codigo;
  const _label = String(value);

  if (!solicitacaoManutencao?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
