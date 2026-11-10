import { useEffect, useState } from 'react';
import type { TranslationLanguage } from '../data/translations';
import {
  readIncludeVosotros,
  readPracticeAccentRetry,
  readPracticeAnswerMode,
  readPracticeQuestionCount,
  readQuizQuestionCount,
  readTranslationLanguage,
  writeIncludeVosotros,
  writePracticeAccentRetry,
  writePracticeAnswerMode,
  writePracticeQuestionCount,
  writeQuizQuestionCount,
  writeTranslationLanguage,
} from '../lib/storage';

export function usePreferences() {
  const [translationLanguage, setTranslationLanguage] = useState<TranslationLanguage>(readTranslationLanguage);
  const [includeVosotros, setIncludeVosotros] = useState(readIncludeVosotros);
  const [practiceAnswerMode, setPracticeAnswerMode] = useState(readPracticeAnswerMode);
  const [practiceAccentRetry, setPracticeAccentRetry] = useState(readPracticeAccentRetry);
  const [practiceQuestionCount, setPracticeQuestionCount] = useState(readPracticeQuestionCount);
  const [quizQuestionCount, setQuizQuestionCount] = useState(readQuizQuestionCount);

  useEffect(() => {
    writeTranslationLanguage(translationLanguage);
  }, [translationLanguage]);

  useEffect(() => {
    writeIncludeVosotros(includeVosotros);
  }, [includeVosotros]);

  useEffect(() => {
    writePracticeAnswerMode(practiceAnswerMode);
  }, [practiceAnswerMode]);

  useEffect(() => {
    writePracticeAccentRetry(practiceAccentRetry);
  }, [practiceAccentRetry]);

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
    practiceAnswerMode,
    setPracticeAnswerMode,
    practiceAccentRetry,
    setPracticeAccentRetry,
    practiceQuestionCount,
    setPracticeQuestionCount,
    quizQuestionCount,
    setQuizQuestionCount,
  };
}
