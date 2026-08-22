import { Dictionary, Locale } from '../../translation/locales';
import { SimulacaoFinanciamentoWithRelationships } from './simulacaoFinanciamentoSchemas';
import { formatDateTime } from '../../shared/lib/formatDateTime';

export function simulacaoFinanciamentoLabel(
  simulacaoFinanciamento:
    | Partial<SimulacaoFinanciamentoWithRelationships>
    | null
    | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!simulacaoFinanciamento?.dataSimulacao) {
    return '';
  }

  const value = simulacaoFinanciamento.dataSimulacao;
  const _label = formatDateTime(value as any, dictionary);

  if (!simulacaoFinanciamento?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
