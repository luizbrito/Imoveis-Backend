import { dictionary as enDictionary } from './en/en';
import { dictionary as esDictionary } from './es/es';
import { dictionary as deDictionary } from './de/de';
import { dictionary as frDictionary } from './fr/fr';
import { dictionary as ptBRDictionary } from './pt-BR/pt-BR';
import type { Locale } from './locales';

type DictionaryRecord = Record<string, any>;

/**
 * Recursively gets all keys from a nested object
 * Returns keys in dot notation (e.g., 'shared.unsavedChanges.title')
 */
function getAllKeys(obj: DictionaryRecord, prefix = ''): string[] {
  const keys: string[] = [];

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Checks integrity of all dictionaries and warns about missing keys
 * This runs on server startup to catch translation misalignments early
 */
export function dictionaryIntegrityCheck(): void {
  const dictionaries: Record<Locale, DictionaryRecord> = {
    en: enDictionary,
    es: esDictionary,
    de: deDictionary,
    fr: frDictionary,
    'pt-BR': ptBRDictionary,
  };

  // Get all keys from each dictionary
  const allKeysPerLocale: Record<Locale, Set<string>> = {
    en: new Set(getAllKeys(dictionaries.en)),
    es: new Set(getAllKeys(dictionaries.es)),
    de: new Set(getAllKeys(dictionaries.de)),
    fr: new Set(getAllKeys(dictionaries.fr)),
    'pt-BR': new Set(getAllKeys(dictionaries['pt-BR'])),
  };

  // Get union of all keys across all dictionaries
  const allKeys = new Set<string>();
  for (const locale in allKeysPerLocale) {
    for (const key of allKeysPerLocale[locale as Locale]) {
      allKeys.add(key);
    }
  }

  // Check each dictionary for missing keys
  const missingKeysPerLocale: Record<Locale, string[]> = {
    en: [],
    es: [],
    de: [],
    fr: [],
    'pt-BR': [],
  };

  let hasIssues = false;

  for (const locale in allKeysPerLocale) {
    const localeKeys = allKeysPerLocale[locale as Locale];
    const missing: string[] = [];

    for (const key of allKeys) {
      if (!localeKeys.has(key)) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      hasIssues = true;
      missingKeysPerLocale[locale as Locale] = missing.sort();
    }
  }

  // Report issues
  if (hasIssues) {
    console.warn(
      '\n⚠️  Dictionary Integrity Check: Missing translation keys detected\n',
    );

    for (const locale in missingKeysPerLocale) {
      const missing = missingKeysPerLocale[locale as Locale];
      if (missing.length > 0) {
        console.warn(
          `\n📝 Locale "${locale}" is missing ${missing.length} key(s):`,
        );
        missing.forEach((key) => {
          console.warn(`   - ${key}`);
        });
      }
    }

    console.warn(
      '\n💡 Tip: Ensure all dictionaries have the same structure and keys.\n',
    );
  } else {
    console.log('✅ Dictionary Integrity Check: All dictionaries are aligned');
  }
}
