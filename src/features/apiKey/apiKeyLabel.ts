import { ApiKey } from '../../prisma/generated/client';
import { Dictionary } from '../../translation/locales';

export function apiKeyLabel(
  apiKey?: Partial<ApiKey> | null,
  _dictionary?: Dictionary,
) {
  return String(apiKey?.name != null ? apiKey.name : '');
}
