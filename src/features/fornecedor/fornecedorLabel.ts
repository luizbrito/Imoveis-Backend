import { Dictionary, Locale } from '../../translation/locales';
import { FornecedorWithRelationships } from './fornecedorSchemas';

export function fornecedorLabel(
  fornecedor: Partial<FornecedorWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!fornecedor?.nomeRazaoSocial) {
    return '';
  }

  const value = fornecedor.nomeRazaoSocial;
  const _label = String(value);

  if (!fornecedor?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
