import { createContext, useContext } from 'react';
import { getLanguageName, getLocalizedTenseName, translate, type Locale, type MessageKey, type MessageValues } from '../lib/i18n';
import type { Language, LanguageId, PracticeTenseId } from '../data/verbs';

export const LocaleContext = createContext<Locale>('en');

export function useI18n() {
  const locale = useContext(LocaleContext);
  return {
    locale,
    t: (key: MessageKey, values?: MessageValues) => translate(locale, key, values),
    languageName: (id: LanguageId) => getLanguageName(id, locale),
    tenseName: (language: Pick<Language, 'id'>, tense: PracticeTenseId) => getLocalizedTenseName(language, tense, locale),
  };
}
