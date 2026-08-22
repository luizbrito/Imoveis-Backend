import { Dictionary, Locale } from '../../translation/locales';
import { OrdemServicoWithRelationships } from './ordemServicoSchemas';

export function ordemServicoLabel(
  ordemServico: Partial<OrdemServicoWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!ordemServico?.codigo) {
    return '';
  }

  const value = ordemServico.codigo;
  const _label = String(value);

  if (!ordemServico?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
