import { useEffect, useState } from 'react';
import type { TranslationLanguage } from '../data/translations';
import {
  readDrillShortcuts,
  readIncludeVosotros,
  readPracticeAccentRetry,
  readPracticeAnswerMode,
  readPracticeAutoAdvance,
  readPracticeQuestionCount,
  readPracticeShowGloss,
  readQuizQuestionCount,
  readTranslationLanguage,
  writeDrillShortcuts,
  writeIncludeVosotros,
  writePracticeAccentRetry,
  writePracticeAnswerMode,
  writePracticeAutoAdvance,
  writePracticeQuestionCount,
  writePracticeShowGloss,
  writeQuizQuestionCount,
  writeTranslationLanguage,
} from '../lib/storage';

export function usePreferences() {
  const [translationLanguage, setTranslationLanguage] = useState<TranslationLanguage>(readTranslationLanguage);
  const [includeVosotros, setIncludeVosotros] = useState(readIncludeVosotros);
  const [practiceAnswerMode, setPracticeAnswerMode] = useState(readPracticeAnswerMode);
  const [practiceAccentRetry, setPracticeAccentRetry] = useState(readPracticeAccentRetry);
  const [practiceAutoAdvance, setPracticeAutoAdvance] = useState(readPracticeAutoAdvance);
  const [practiceShowGloss, setPracticeShowGloss] = useState(readPracticeShowGloss);
  const [drillShortcuts, setDrillShortcuts] = useState(readDrillShortcuts);
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
    writePracticeAutoAdvance(practiceAutoAdvance);
  }, [practiceAutoAdvance]);

  useEffect(() => {
    writePracticeShowGloss(practiceShowGloss);
  }, [practiceShowGloss]);

  useEffect(() => {
    writeDrillShortcuts(drillShortcuts);
  }, [drillShortcuts]);

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
    practiceAutoAdvance,
    setPracticeAutoAdvance,
    practiceShowGloss,
    setPracticeShowGloss,
    drillShortcuts,
    setDrillShortcuts,
    practiceQuestionCount,
    setPracticeQuestionCount,
    quizQuestionCount,
    setQuizQuestionCount,
  };
}
