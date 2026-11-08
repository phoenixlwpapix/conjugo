import { useEffect, useState } from 'react';
import type { TranslationLanguage } from '../data/translations';
import {
  readIncludeVosotros,
  readPracticeQuestionCount,
  readQuizQuestionCount,
  readTranslationLanguage,
  writeIncludeVosotros,
  writePracticeQuestionCount,
  writeQuizQuestionCount,
  writeTranslationLanguage,
} from '../lib/storage';

export function usePreferences() {
  const [translationLanguage, setTranslationLanguage] = useState<TranslationLanguage>(readTranslationLanguage);
  const [includeVosotros, setIncludeVosotros] = useState(readIncludeVosotros);
  const [practiceQuestionCount, setPracticeQuestionCount] = useState(readPracticeQuestionCount);
  const [quizQuestionCount, setQuizQuestionCount] = useState(readQuizQuestionCount);

  useEffect(() => {
    writeTranslationLanguage(translationLanguage);
  }, [translationLanguage]);

  useEffect(() => {
    writeIncludeVosotros(includeVosotros);
  }, [includeVosotros]);

  useEffect(() => {
    writePracticeQuestionCount(practiceQuestionCount);
  }, [practiceQuestionCount]);

  useEffect(() => {
    writeQuizQuestionCount(quizQuestionCount);
  }, [quizQuestionCount]);

  return {
    translationLanguage,
    setTranslationLanguage,
    includeVosotros,
    setIncludeVosotros,
    practiceQuestionCount,
    setPracticeQuestionCount,
    quizQuestionCount,
    setQuizQuestionCount,
  };
}
