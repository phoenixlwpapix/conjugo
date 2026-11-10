import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getConjugationPronouns,
  getLanguagePronouns,
  isTenseAvailable,
  languages,
  type Language,
  type LanguageId,
  type PracticeTenseId,
  type TenseId,
} from '../data/verbs';
import { getReviewTargets, recordCorrectReview, upsertMiss } from '../lib/misses';
import {
  autoAdvanceDelayMs,
  clampEnglishTense,
  createMissSessionPrompts,
  createSessionPrompts,
  createVerbSessionPrompts,
  getAnswer,
  getChoices,
  getFallbackPrompt,
  getPracticeTenses,
  timerSeconds,
  type PracticeQuestionCount,
} from '../lib/prompts';
import { emptyStats, getAccuracy, getDailyStats, getSevenDayTrend, recordAnswer, recordQuizAnswer, type RecordedAnswer } from '../lib/scoring';
import {
  readActiveView,
  readFavoriteVerbs,
  readLanguageId,
  readPracticeStatsByLanguage,
  readPracticeTense,
  readStoredMisses,
  readTimerEnabled,
  writeActiveView,
  writeFavoriteVerbs,
  writeLanguageId,
  writePracticeStatsByLanguage,
  writePracticeTense,
  writeStoredMisses,
  writeTimerEnabled,
} from '../lib/storage';
import type { AppView, Attempt, PracticeAnswerMode, PracticeStats, PracticeStatsByLanguage, Prompt, SessionKind, StoredMiss } from '../types';
import { useWordbook } from './useWordbook';
import { createPracticeClock } from '../lib/practiceClock';
import { gradeTypedAnswer } from '../lib/typing';

type PracticePreferences = {
  includeVosotros: boolean;
  practiceAnswerMode: PracticeAnswerMode;
  practiceAccentRetry: boolean;
  practiceQuestionCount: PracticeQuestionCount;
};

type Workspace =
  | { view: AppView; returnTo?: undefined }
  | { view: 'wordbook'; returnTo: 'practice' | 'quiz' };

/** Applies learner preferences that change which prompts a language can produce. */
const resolveLanguage = (languageId: LanguageId, includeVosotros: boolean): Language => {
  const language = languages.find((item) => item.id === languageId) ?? languages[0];
  return language.id === 'spanish' && !includeVosotros ? { ...language, excludedPronouns: ['you plural'] } : language;
};

export function usePractice({ includeVosotros, practiceAnswerMode, practiceAccentRetry, practiceQuestionCount }: PracticePreferences) {
  const [languageId, setLanguageId] = useState<LanguageId>(readLanguageId);
  const [practiceTense, setPracticeTense] = useState<PracticeTenseId>(() =>
    clampEnglishTense(languageId, readPracticeTense()),
  );
  const [{ view: activeView, returnTo: wordbookReturnView }, setWorkspace] = useState<Workspace>(() => ({ view: readActiveView() }));
  const [storedMisses, setStoredMisses] = useState<StoredMiss[]>(readStoredMisses);
  const [statsByLanguage, setStatsByLanguage] = useState<PracticeStatsByLanguage>(readPracticeStatsByLanguage);
  const [favoritesByLanguage, setFavoritesByLanguage] = useState(readFavoriteVerbs);
  const [sessionPrompts, setSessionPrompts] = useState(() => {
    const language = resolveLanguage(languageId, includeVosotros);
    return createSessionPrompts(language, practiceTense, getReviewTargets(language, practiceTense, storedMisses), { limit: practiceQuestionCount });
  });
  const [promptIndex, setPromptIndex] = useState(0);
  const [sessionVersion, setSessionVersion] = useState(0);
  const [startedAnswerMode, setStartedAnswerMode] = useState<PracticeAnswerMode | null>(null);
  const [showAccentHint, setShowAccentHint] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [streak, setStreak] = useState(0);
  const [reviewingLastAnswer, setReviewingLastAnswer] = useState(false);
  const [countdownClock] = useState(() => createPracticeClock(timerSeconds, -1));
  const [elapsedClock] = useState(() => createPracticeClock(0, 1));
  const [timerEnabled, setTimerEnabled] = useState(readTimerEnabled);
  const [sessionKind, setSessionKind] = useState<SessionKind>('standard');
  const [conjugationPrompt, setConjugationPrompt] = useState<Prompt | null>(null);
  const [autoAdvanceStopped, setAutoAdvanceStopped] = useState(false);

  const drillVerbsRef = useRef<string[]>([]);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storedMissesRef = useRef(storedMisses);
  const hasRecordedAttempt = useRef(false);

  const activeLanguage = useMemo(() => resolveLanguage(languageId, includeVosotros), [includeVosotros, languageId]);
  const activeFavorites = favoritesByLanguage[languageId];
  const favoriteVerbs = useMemo(() => new Set(activeFavorites), [activeFavorites]);
  const wordbook = useWordbook(activeLanguage, favoriteVerbs);

  const stats: PracticeStats = statsByLanguage[languageId] ?? emptyStats();
  const sessionLength = sessionPrompts.length;
  const isEmptyFavoriteSession = sessionKind === 'favorites' && sessionLength === 0;
  const canStartFavoriteSession = isEmptyFavoriteSession && getPracticeTenses(practiceTense, languageId).some((tense) =>
    activeLanguage.verbs.some((verb) =>
      favoriteVerbs.has(verb.infinitive) && getConjugationPronouns(activeLanguage, tense, verb).length > 0,
    ),
  );
  const prompt =
    sessionPrompts[Math.min(promptIndex, sessionPrompts.length - 1)] ?? getFallbackPrompt(activeLanguage, practiceTense);
  const answerMode = startedAnswerMode ?? practiceAnswerMode;
  const choices = useMemo(() => answerMode === 'choice' ? getChoices(prompt, promptIndex) : [], [answerMode, prompt, promptIndex]);
  const correctAnswer = getAnswer(prompt);
  const isAnswered = selectedAnswer !== null || timedOut;
  const isCorrect = isAnswered && attempts[attempts.length - 1]?.correct === true;
  const correctCount = attempts.filter((attempt) => attempt.correct).length;
  const accuracy = getAccuracy(correctCount, attempts.length);
  const progress = Math.min(attempts.length, sessionLength);
  const progressPercent = sessionLength === 0 ? 0 : Math.round((progress / sessionLength) * 100);
  const isSessionComplete = attempts.length >= sessionLength;
  const todayStats = getDailyStats(stats);
  const todayAccuracy = getAccuracy(todayStats.correct, todayStats.answered);
  const trend = useMemo(() => getSevenDayTrend(stats), [stats]);
  const languageMisses = useMemo(() => {
    const activePronouns = new Set(getLanguagePronouns(activeLanguage));
    return storedMisses.filter((miss) => miss.languageId === activeLanguage.id && activePronouns.has(miss.pronoun));
  }, [activeLanguage, storedMisses]);

  useEffect(() => {
    storedMissesRef.current = storedMisses;
  }, [storedMisses]);

  useEffect(() => {
    writeLanguageId(languageId);
  }, [languageId]);

  useEffect(() => {
    writePracticeTense(practiceTense);
  }, [practiceTense]);

  useEffect(() => {
    writeActiveView(activeView);
  }, [activeView]);

  useEffect(() => {
    writeTimerEnabled(timerEnabled);
  }, [timerEnabled]);

  useEffect(() => {
    writeStoredMisses(storedMisses);
  }, [storedMisses]);

  useEffect(() => {
    writePracticeStatsByLanguage(statsByLanguage);
  }, [statsByLanguage]);

  useEffect(() => {
    writeFavoriteVerbs(favoritesByLanguage);
  }, [favoritesByLanguage]);

  const toggleFavorite = (infinitive: string) => {
    setFavoritesByLanguage((current) => {
      const favorites = current[languageId] ?? [];
      return {
        ...current,
        [languageId]: favorites.includes(infinitive)
          ? favorites.filter((verb) => verb !== infinitive)
          : [...favorites, infinitive],
      };
    });
  };

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  }, []);

  const setActiveView = useCallback((view: AppView) => {
    setConjugationPrompt(null);
    setWorkspace({ view });
  }, []);

  const openPromptInWordbook = useCallback((targetPrompt: Prompt, returnTo?: 'practice' | 'quiz') => {
    if (returnTo === 'practice') {
      clearAutoAdvance();
      setAutoAdvanceStopped(true);
    }
    setConjugationPrompt(targetPrompt);
  }, [clearAutoAdvance]);

  const closeConjugationModal = useCallback(() => {
    setConjugationPrompt(null);
  }, []);

  const beginSession = useCallback(
    (prompts: Prompt[], kind: SessionKind) => {
      clearAutoAdvance();
      setConjugationPrompt(null);
      setAutoAdvanceStopped(false);
      setSessionKind(kind);
      setSessionPrompts(prompts);
      setSessionVersion((current) => current + 1);
      setStartedAnswerMode(null);
      setShowAccentHint(false);
      setPromptIndex(0);
      setAttempts([]);
      setStreak(0);
      setReviewingLastAnswer(false);
      setSelectedAnswer(null);
      setTimedOut(false);
      hasRecordedAttempt.current = false;
      countdownClock.reset();
      elapsedClock.reset();
    },
    [clearAutoAdvance, countdownClock, elapsedClock],
  );

  const startSession = useCallback(
    (language: Language, tense: PracticeTenseId, kind: 'standard' | 'favorites') => {
      const nextTense = clampEnglishTense(language.id, tense);
      const verbInfinitives = kind === 'favorites' ? new Set(favoritesByLanguage[language.id]) : undefined;
      beginSession(
        createSessionPrompts(language, nextTense, getReviewTargets(language, nextTense, storedMissesRef.current), {
          limit: practiceQuestionCount,
          verbInfinitives,
        }),
        kind,
      );
    },
    [beginSession, favoritesByLanguage, practiceQuestionCount],
  );

  const practiceScope = sessionKind === 'favorites' ? 'favorites' : 'standard';
  const switchPracticeScope = (kind: 'standard' | 'favorites') => {
    if (kind !== sessionKind) startSession(activeLanguage, practiceTense, kind);
  };

  const startMissReview = useCallback(() => {
    // Explicit review includes misses that aren't due yet; only due ones get promoted.
    const targets = getReviewTargets(activeLanguage, 'mixed', storedMissesRef.current, { dueOnly: false });
    beginSession(createMissSessionPrompts(activeLanguage, targets, practiceQuestionCount), 'review');
    setActiveView('practice');
  }, [activeLanguage, beginSession, practiceQuestionCount, setActiveView]);

  const startVerbDrill = useCallback(
    (verbInfinitives: string[]) => {
      drillVerbsRef.current = verbInfinitives;
      beginSession(createVerbSessionPrompts(activeLanguage, verbInfinitives, practiceQuestionCount), 'verbs');
      setActiveView('practice');
    },
    [activeLanguage, beginSession, practiceQuestionCount, setActiveView],
  );

  const resetSession = useCallback(() => {
    if (sessionKind === 'review') {
      const targets = getReviewTargets(activeLanguage, 'mixed', storedMissesRef.current, { dueOnly: false });
      // A mastered queue can still be repeated without silently changing modes.
      beginSession(
        targets.length ? createMissSessionPrompts(activeLanguage, targets, practiceQuestionCount) : sessionPrompts.slice(0, practiceQuestionCount),
        'review',
      );
    } else if (sessionKind === 'verbs') {
      beginSession(createVerbSessionPrompts(activeLanguage, drillVerbsRef.current, practiceQuestionCount), 'verbs');
    } else {
      startSession(activeLanguage, practiceTense, sessionKind);
    }
  }, [activeLanguage, beginSession, practiceQuestionCount, practiceTense, sessionKind, sessionPrompts, startSession]);

  const previousPracticeQuestionCount = useRef(practiceQuestionCount);
  useEffect(() => {
    if (previousPracticeQuestionCount.current === practiceQuestionCount) return;
    previousPracticeQuestionCount.current = practiceQuestionCount;
    if (attempts.length === 0) resetSession();
  }, [attempts.length, practiceQuestionCount, resetSession]);

  const moveNext = useCallback(() => {
    clearAutoAdvance();
    setConjugationPrompt(null);
    setAutoAdvanceStopped(false);
    setPromptIndex((current) => Math.min(current + 1, sessionLength - 1));
    setSelectedAnswer(null);
    setTimedOut(false);
    setShowAccentHint(false);
    hasRecordedAttempt.current = false;
    countdownClock.reset();
  }, [clearAutoAdvance, countdownClock, sessionLength]);

  const updateStats = useCallback((language: LanguageId, answer: RecordedAnswer) => {
    setStatsByLanguage((current) => ({
      ...current,
      [language]: recordAnswer(current[language] ?? emptyStats(), answer),
    }));
  }, []);

  const recordQuizResult = useCallback((answer: RecordedAnswer, quizPrompt: Prompt) => {
    setStoredMisses((current) => answer.correct ? recordCorrectReview(current, quizPrompt) : upsertMiss(current, quizPrompt));
    setStatsByLanguage((current) => ({
      ...current,
      [languageId]: recordQuizAnswer(current[languageId] ?? emptyStats(), answer),
    }));
  }, [languageId]);

  const recordAttempt = useCallback(
    (answer: string, correct: boolean, didTimeOut = false) => {
      if (hasRecordedAttempt.current || isSessionComplete) return;
      hasRecordedAttempt.current = true;
      countdownClock.stop();
      setStartedAnswerMode(answerMode);
      const nextAttemptTotal = attempts.length + 1;
      const nextStreak = correct ? streak + 1 : 0;
      const attempt: Attempt = { prompt, answer, correct, timedOut: didTimeOut };

      setSelectedAnswer(didTimeOut ? null : answer);
      setTimedOut(didTimeOut);
      setAttempts((current) => [...current, attempt]);
      setStreak(nextStreak);
      updateStats(languageId, {
        correct,
        streak: nextStreak,
        completedSet: nextAttemptTotal >= sessionLength && sessionKind !== 'review',
        tense: prompt.tense,
        verbInfinitive: prompt.verb.infinitive,
      });

      setStoredMisses((current) => correct ? recordCorrectReview(current, prompt) : upsertMiss(current, prompt));
    },
    [
      answerMode,
      attempts.length,
      countdownClock,
      isSessionComplete,
      languageId,
      prompt,
      sessionKind,
      sessionLength,
      streak,
      updateStats,
    ],
  );

  const submitAnswer = useCallback((input: string) => {
    if (hasRecordedAttempt.current || isSessionComplete) return;
    if (answerMode === 'choice') {
      recordAttempt(input, input === correctAnswer);
      return;
    }
    const answer = input.trim();
    if (!answer) return;
    const grade = gradeTypedAnswer(answer, prompt);
    if (grade === 'accent' && practiceAccentRetry && !showAccentHint) {
      setShowAccentHint(true);
      return;
    }
    recordAttempt(answer, grade === 'correct');
  }, [answerMode, correctAnswer, isSessionComplete, practiceAccentRetry, prompt, recordAttempt, showAccentHint]);

  const handleTimeout = useCallback(() => recordAttempt('', false, true), [recordAttempt]);

  useEffect(() => {
    if (!isAnswered && !isSessionComplete) {
      countdownClock.reset();
    }
  }, [countdownClock, promptIndex, isAnswered, isSessionComplete]);

  useEffect(() => {
    if (activeView !== 'practice' || isSessionComplete) {
      return undefined;
    }

    elapsedClock.start();
    return elapsedClock.stop;
  }, [activeView, elapsedClock, isSessionComplete]);

  useEffect(() => {
    if (
      !timerEnabled ||
      isAnswered ||
      isSessionComplete ||
      activeView !== 'practice'
    ) {
      return undefined;
    }

    countdownClock.start(handleTimeout);
    return countdownClock.stop;
  }, [activeView, countdownClock, handleTimeout, isAnswered, isSessionComplete, timerEnabled]);

  useEffect(() => {
    if (activeView !== 'practice' || answerMode === 'typing' || !isCorrect || isSessionComplete || autoAdvanceStopped || conjugationPrompt) return;

    autoAdvanceTimer.current = setTimeout(moveNext, autoAdvanceDelayMs);
    return clearAutoAdvance;
  }, [activeView, answerMode, autoAdvanceStopped, clearAutoAdvance, conjugationPrompt, isCorrect, isSessionComplete, moveNext]);

  const switchLanguage = useCallback(
    (nextLanguageId: LanguageId) => {
      const nextLanguage = resolveLanguage(nextLanguageId, includeVosotros);
      const nextTense = clampEnglishTense(nextLanguageId, practiceTense);
      setLanguageId(nextLanguageId);
      setConjugationPrompt(null);
      if (nextTense !== practiceTense) {
        setPracticeTense(nextTense);
      }
      if (!isTenseAvailable(nextLanguageId, wordbook.bookTense)) {
        wordbook.setBookTense('present');
      }
      if (nextLanguageId !== languageId && wordbookReturnView) setActiveView('wordbook');
      startSession(nextLanguage, nextTense, practiceScope);
    },
    [includeVosotros, languageId, practiceScope, practiceTense, setActiveView, startSession, wordbook, wordbookReturnView],
  );

  const switchTense = useCallback(
    (nextTense: PracticeTenseId) => {
      const tense = clampEnglishTense(languageId, nextTense);
      setPracticeTense(tense);
      startSession(activeLanguage, tense, practiceScope);
    },
    [activeLanguage, languageId, practiceScope, startSession],
  );

  const drillTense = useCallback(
    (tense: TenseId) => {
      const nextTense = clampEnglishTense(languageId, tense);
      setPracticeTense(nextTense);
      startSession(activeLanguage, nextTense, 'standard');
      setActiveView('practice');
    },
    [activeLanguage, languageId, setActiveView, startSession],
  );

  // Toggling vosotros changes the Spanish prompt pool, so the running set would be stale.
  const previousIncludeVosotros = useRef(includeVosotros);
  useEffect(() => {
    if (previousIncludeVosotros.current === includeVosotros) {
      return;
    }

    previousIncludeVosotros.current = includeVosotros;
    if (activeLanguage.id === 'spanish') {
      startSession(activeLanguage, practiceTense, practiceScope);
    }
  }, [activeLanguage, includeVosotros, practiceScope, practiceTense, startSession]);

  const toggleResults = useCallback(() => setReviewingLastAnswer((current) => !current), []);
  const toggleTimer = useCallback(() => setTimerEnabled((prev) => !prev), []);

  return {
    languageId,
    switchLanguage,
    practiceTense,
    switchTense,
    switchPracticeScope,
    favoriteVerbs,
    toggleFavorite,
    isEmptyFavoriteSession,
    canStartFavoriteSession,
    activeView,
    setActiveView,
    bookTense: wordbook.bookTense,
    wordbookView: wordbook.wordbookView,
    setWordbookView: wordbook.setWordbookView,
    setBookTense: wordbook.setBookTense,
    wordbookQuery: wordbook.wordbookQuery,
    setWordbookQuery: wordbook.setWordbookQuery,
    wordbookSort: wordbook.wordbookSort,
    setWordbookSort: wordbook.setWordbookSort,
    selectedVerb: wordbook.selectedVerb,
    selectedVerbInfinitive: wordbook.selectedVerbInfinitive,
    setSelectedVerbInfinitive: wordbook.setSelectedVerbInfinitive,
    filteredVerbs: wordbook.filteredVerbs,
    showOnlyFavorites: wordbook.showOnlyFavorites,
    setShowOnlyFavorites: wordbook.setShowOnlyFavorites,
    openPromptInWordbook,
    conjugationPrompt,
    closeConjugationModal,
    autoAdvanceStopped,
    wordbookReturnView,
    selectedAnswer,
    timedOut,
    attempts,
    streak,
    reviewingLastAnswer,
    toggleResults,
    stats,
    storedMisses: languageMisses,
    allStoredMisses: storedMisses,
    activeLanguage,
    prompt,
    answerMode,
    sessionVersion,
    showAccentHint,
    choices,
    correctAnswer,
    isAnswered,
    isCorrect,
    accuracy,
    progress,
    progressPercent,
    isSessionComplete,
    submitAnswer,
    resetSession,
    moveNext,
    startMissReview,
    startVerbDrill,
    drillTense,
    sessionKind,
    countdownClock,
    elapsedClock,
    timerEnabled,
    toggleTimer,
    todayStats,
    todayAccuracy,
    trend,
    recordQuizResult,
    sessionTarget: sessionLength,
  };
}
