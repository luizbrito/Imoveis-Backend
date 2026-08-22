import { Dictionary, Locale } from '../../translation/locales';
import { DocumentoPessoaWithRelationships } from './documentoPessoaSchemas';

export function documentoPessoaLabel(
  documentoPessoa: Partial<DocumentoPessoaWithRelationships> | null | undefined,
  dictionary: Dictionary,
  locale: Locale,
) {
  if (!documentoPessoa?.titulo) {
    return '';
  }

  const value = documentoPessoa.titulo;
  const _label = String(value);

  if (!documentoPessoa?.archivedAt) {
    return _label;
  }

  return `${_label} (${dictionary.shared.archived})`;
}
