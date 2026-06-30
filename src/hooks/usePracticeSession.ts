import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Language, PracticeTenseId } from '../data/verbs';
import {
  autoAdvanceDelayMs,
  createSessionPrompts,
  getAnswer,
  getChoices,
  getFallbackPrompt,
  getPracticeTenses,
  getPromptKey,
  sessionTarget,
} from '../lib/prompts';
import { getAccuracy, getDailyStats, getSevenDayTrend, getTodayKey } from '../lib/scoring';
import { readPracticeStats, readStoredMisses, writePracticeStats, writeStoredMisses } from '../lib/storage';
import type { Attempt, PracticeStats, ReviewTarget, StoredMiss } from '../types';

const getReviewTargets = (language: Language, practiceTense: PracticeTenseId, misses: StoredMiss[]): ReviewTarget[] => {
  const activeTenses = new Set(getPracticeTenses(practiceTense));
  const verbInfinitives = new Set(language.verbs.map((verb) => verb.infinitive));

  return misses
    .filter((miss) => miss.languageId === language.id && activeTenses.has(miss.tense) && verbInfinitives.has(miss.verbInfinitive))
    .map((miss) => ({
      verbInfinitive: miss.verbInfinitive,
      tense: miss.tense,
      pronoun: miss.pronoun,
    }));
};

const isEditableElement = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
};

export const usePracticeSession = (activeLanguage: Language, practiceTense: PracticeTenseId) => {
  const [storedMisses, setStoredMisses] = useState<StoredMiss[]>(readStoredMisses);
  const [stats, setStats] = useState<PracticeStats>(readPracticeStats);
  const [sessionPrompts, setSessionPrompts] = useState(() =>
    createSessionPrompts(activeLanguage, practiceTense, getReviewTargets(activeLanguage, practiceTense, storedMisses)),
  );
  const [promptIndex, setPromptIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storedMissesRef = useRef(storedMisses);

  const prompt =
    sessionPrompts[Math.min(promptIndex, sessionPrompts.length - 1)] ?? getFallbackPrompt(activeLanguage, practiceTense);
  const choices = useMemo(() => getChoices(prompt, promptIndex), [prompt, promptIndex]);
  const correctAnswer = getAnswer(prompt);
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === correctAnswer;
  const correctCount = attempts.filter((attempt) => attempt.correct).length;
  const accuracy = getAccuracy(correctCount, attempts.length);
  const progress = Math.min(attempts.length, sessionTarget);
  const progressPercent = Math.round((progress / sessionTarget) * 100);
  const recentMisses = attempts.filter((attempt) => !attempt.correct).slice(0, 4);
  const isSessionComplete = attempts.length >= sessionTarget;
  const todayStats = getDailyStats(stats);
  const todayAccuracy = getAccuracy(todayStats.correct, todayStats.answered);
  const trend = useMemo(() => getSevenDayTrend(stats), [stats]);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  }, []);

  const resetQuestion = useCallback(() => {
    setSelectedAnswer(null);
  }, []);

  const startSession = useCallback(() => {
    clearAutoAdvance();
    setSessionPrompts(
      createSessionPrompts(activeLanguage, practiceTense, getReviewTargets(activeLanguage, practiceTense, storedMissesRef.current)),
    );
    setPromptIndex(0);
    setAttempts([]);
    setStreak(0);
    setShowCelebration(false);
    resetQuestion();
  }, [activeLanguage, clearAutoAdvance, practiceTense, resetQuestion]);

  const moveNext = useCallback(() => {
    clearAutoAdvance();
    setPromptIndex((current) => Math.min(current + 1, sessionTarget - 1));
    resetQuestion();
  }, [clearAutoAdvance, resetQuestion]);

  const recordStats = useCallback((choiceIsCorrect: boolean, nextStreak: number, sessionJustCompleted: boolean) => {
    setStats((current) => {
      const todayKey = getTodayKey();
      const today = getDailyStats(current, todayKey);
      const nextStats: PracticeStats = {
        totalAnswered: current.totalAnswered + 1,
        totalCorrect: current.totalCorrect + (choiceIsCorrect ? 1 : 0),
        bestStreak: Math.max(current.bestStreak, nextStreak),
        days: {
          ...current.days,
          [todayKey]: {
            answered: today.answered + 1,
            correct: today.correct + (choiceIsCorrect ? 1 : 0),
            sessions: today.sessions + (sessionJustCompleted ? 1 : 0),
          },
        },
      };

      writePracticeStats(nextStats);
      return nextStats;
    });
  }, []);

  const recordMiss = useCallback(
    (attempt: Attempt) => {
      setStoredMisses((current) => {
        const miss: StoredMiss = {
          languageId: attempt.prompt.language.id,
          verbInfinitive: attempt.prompt.verb.infinitive,
          tense: attempt.prompt.tense,
          pronoun: attempt.prompt.pronoun,
          answer: getAnswer(attempt.prompt),
          missedAt: Date.now(),
        };
        const missKey = `${miss.languageId}::${miss.verbInfinitive}::${miss.tense}::${miss.pronoun}`;
        const nextMisses = [
          miss,
          ...current.filter((item) => `${item.languageId}::${item.verbInfinitive}::${item.tense}::${item.pronoun}` !== missKey),
        ].slice(0, 24);

        writeStoredMisses(nextMisses);
        return nextMisses;
      });
    },
    [],
  );

  const clearMasteredMiss = useCallback((attempt: Attempt) => {
    setStoredMisses((current) => {
      const masteredKey = `${attempt.prompt.language.id}::${getPromptKey(attempt.prompt)}`;
      const nextMisses = current.filter((item) => `${item.languageId}::${item.verbInfinitive}::${item.tense}::${item.pronoun}` !== masteredKey);

      if (nextMisses.length !== current.length) {
        writeStoredMisses(nextMisses);
      }

      return nextMisses;
    });
  }, []);

  const selectChoice = useCallback(
    (choice: string) => {
      if (isAnswered || isSessionComplete) {
        return;
      }

      clearAutoAdvance();
      const choiceIsCorrect = choice === correctAnswer;
      const nextAttemptTotal = attempts.length + 1;
      const nextCorrectTotal = correctCount + (choiceIsCorrect ? 1 : 0);
      const nextStreak = choiceIsCorrect ? streak + 1 : 0;
      const perfectSetComplete = choiceIsCorrect && nextAttemptTotal >= sessionTarget && nextCorrectTotal >= sessionTarget;
      const attempt: Attempt = { prompt, answer: choice, correct: choiceIsCorrect };

      setSelectedAnswer(choice);
      setAttempts((current) => [attempt, ...current]);
      setStreak(nextStreak);
      recordStats(choiceIsCorrect, nextStreak, nextAttemptTotal >= sessionTarget);

      if (choiceIsCorrect) {
        clearMasteredMiss(attempt);
      } else {
        recordMiss(attempt);
      }

      if (perfectSetComplete) {
        setShowCelebration(true);
        return;
      }

      if (choiceIsCorrect && nextAttemptTotal < sessionTarget) {
        autoAdvanceTimer.current = setTimeout(() => {
          setPromptIndex((current) => Math.min(current + 1, sessionTarget - 1));
          setSelectedAnswer(null);
          autoAdvanceTimer.current = null;
        }, autoAdvanceDelayMs);
      }
    },
    [
      attempts.length,
      clearAutoAdvance,
      clearMasteredMiss,
      correctAnswer,
      correctCount,
      isAnswered,
      isSessionComplete,
      prompt,
      recordMiss,
      recordStats,
      streak,
    ],
  );

  useEffect(() => {
    storedMissesRef.current = storedMisses;
  }, [storedMisses]);

  useEffect(() => {
    startSession();
  }, [activeLanguage.id, practiceTense, startSession]);

  useEffect(
    () => () => {
      clearAutoAdvance();
    },
    [clearAutoAdvance],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableElement(event.target)) {
        return;
      }

      const optionIndex = ['a', 'b', 'c', 'd'].indexOf(event.key.toLowerCase());

      if (optionIndex >= 0 && choices[optionIndex] && !isAnswered) {
        event.preventDefault();
        selectChoice(choices[optionIndex]);
        return;
      }

      if ((event.key === 'Enter' || event.key === ' ') && isAnswered && !isCorrect && !isSessionComplete) {
        event.preventDefault();
        moveNext();
        return;
      }

      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        startSession();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [choices, isAnswered, isCorrect, isSessionComplete, moveNext, selectChoice, startSession]);

  return {
    accuracy,
    attempts,
    choices,
    correctAnswer,
    isAnswered,
    isCorrect,
    isSessionComplete,
    moveNext,
    progress,
    progressPercent,
    prompt,
    recentMisses,
    selectChoice,
    selectedAnswer,
    showCelebration,
    startSession,
    stats,
    storedMisses,
    streak,
    todayAccuracy,
    todayStats,
    trend,
  };
};
