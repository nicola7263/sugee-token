import ja from './ja.json';
import en from './en.json';

type Translations = typeof ja;

const translations: Record<string, Translations> = { ja, en };

export function getTranslations(lang: string): Translations {
  return translations[lang] || translations.en;
}

export function flattenTranslations(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenTranslations(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = String(value);
    }
  }
  return result;
}

export const defaultLang = 'ja';
export const supportedLangs = ['ja', 'en'] as const;
