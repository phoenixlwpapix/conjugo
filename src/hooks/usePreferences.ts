import { useEffect, useState } from 'react';
import type { TranslationLanguage } from '../data/translations';
import { readIncludeVosotros, readTranslationLanguage, writeIncludeVosotros, writeTranslationLanguage } from '../lib/storage';

export function usePreferences() {
  const [translationLanguage, setTranslationLanguage] = useState<TranslationLanguage>(readTranslationLanguage);
  const [includeVosotros, setIncludeVosotros] = useState(readIncludeVosotros);

  useEffect(() => {
    writeTranslationLanguage(translationLanguage);
  }, [translationLanguage]);

  useEffect(() => {
    writeIncludeVosotros(includeVosotros);
  }, [includeVosotros]);

  return { translationLanguage, setTranslationLanguage, includeVosotros, setIncludeVosotros };
}
