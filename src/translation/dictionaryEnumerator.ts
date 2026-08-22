export function dictionaryEnumerator(
  enumeratorDictionary: Record<string, string>,
  value: string | null | undefined,
): string {
  return value ? enumeratorDictionary[value] || value : '';
}
