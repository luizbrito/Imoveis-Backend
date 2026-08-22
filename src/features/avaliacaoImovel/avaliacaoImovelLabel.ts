import { Dictionary, Locale } from '../../translation/locales';
import { AvaliacaoImovelWithRelationships } from './avaliacaoImovelSchemas';

export function avaliacaoImovelLabel(
  avaliacaoImovel: Partial<AvaliacaoImovelWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!avaliacaoImovel?.codigo) {
    return '';
  }

  const value = avaliacaoImovel.codigo;
  const _label = String(value);

  if (!avaliacaoImovel?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
