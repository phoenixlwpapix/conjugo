import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
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
  timerSeconds,
} from '../lib/prompts';
import { emptyStats, getAccuracy, getDailyStats, getSevenDayTrend, recordAnswer, recordQuizAnswer, type RecordedAnswer } from '../lib/scoring';
import {
  readActiveView,
  readLanguageId,
  readPracticeStatsByLanguage,
  readPracticeTense,
  readStoredMisses,
  readTimerEnabled,
  writeActiveView,
  writeLanguageId,
  writePracticeStatsByLanguage,
  writePracticeTense,
  writeStoredMisses,
  writeTimerEnabled,
} from '../lib/storage';
import type { AppView, Attempt, PracticeStats, PracticeStatsByLanguage, Prompt, SessionKind, StoredMiss } from '../types';
import { useWordbook } from './useWordbook';

type PracticePreferences = {
  includeVosotros: boolean;
};

/** Applies learner preferences that change which prompts a language can produce. */
const resolveLanguage = (languageId: LanguageId, { includeVosotros }: PracticePreferences): Language => {
  const language = languages.find((item) => item.id === languageId) ?? languages[0];
  return language.id === 'spanish' && !includeVosotros ? { ...language, excludedPronouns: ['you plural'] } : language;
};

export function usePractice({ includeVosotros }: PracticePreferences) {
  const [languageId, setLanguageId] = useState<LanguageId>(readLanguageId);
  const [practiceTense, setPracticeTense] = useState<PracticeTenseId>(() =>
    clampEnglishTense(readLanguageId(), readPracticeTense()),
  );
  const [activeView, setActiveViewState] = useState<AppView>(readActiveView);
  const [storedMisses, setStoredMisses] = useState<StoredMiss[]>(readStoredMisses);
  const [statsByLanguage, setStatsByLanguage] = useState<PracticeStatsByLanguage>(readPracticeStatsByLanguage);
  const [sessionPrompts, setSessionPrompts] = useState(() => {
    const language = resolveLanguage(readLanguageId(), { includeVosotros });
    const tense = clampEnglishTense(language.id, readPracticeTense());
    return createSessionPrompts(language, tense, getReviewTargets(language, tense, readStoredMisses()));
  });
  const [promptIndex, setPromptIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(readTimerEnabled);
  const [sessionKind, setSessionKind] = useState<SessionKind>('standard');

  const drillVerbsRef = useRef<string[]>([]);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storedMissesRef = useRef(storedMisses);
  const selectedAnswerRef = useRef(selectedAnswer);
  const isSessionCompleteRef = useRef(false);

  const activeLanguage = useMemo(() => resolveLanguage(languageId, { includeVosotros }), [includeVosotros, languageId]);
  const wordbook = useWordbook(activeLanguage);

  const stats: PracticeStats = statsByLanguage[languageId] ?? emptyStats();
  const sessionLength = sessionPrompts.length;
  const prompt =
    sessionPrompts[Math.min(promptIndex, sessionPrompts.length - 1)] ?? getFallbackPrompt(activeLanguage, practiceTense);
  const choices = useMemo(() => getChoices(prompt, promptIndex), [prompt, promptIndex]);
  const correctAnswer = getAnswer(prompt);
  const isAnswered = selectedAnswer !== null || timedOut;
  const isCorrect = !timedOut && selectedAnswer === correctAnswer;
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

  selectedAnswerRef.current = selectedAnswer;
  isSessionCompleteRef.current = isSessionComplete;

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

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  }, []);

  const setActiveView = useCallback((view: AppView) => {
    setActiveViewState(view);
  }, []);

  const beginSession = useCallback(
    (prompts: Prompt[], kind: SessionKind) => {
      clearAutoAdvance();
      setSessionKind(kind);
      setSessionPrompts(prompts);
      setPromptIndex(0);
      setAttempts([]);
      setStreak(0);
      setShowCelebration(false);
      setShowCompletion(false);
      setSelectedAnswer(null);
      setTimedOut(false);
      setTimeLeft(timerSeconds);
      setSessionElapsedSeconds(0);
    },
    [clearAutoAdvance],
  );

  const startSession = useCallback(
    (language: Language = activeLanguage, tense: PracticeTenseId = practiceTense) => {
      const nextTense = clampEnglishTense(language.id, tense);
      beginSession(
        createSessionPrompts(language, nextTense, getReviewTargets(language, nextTense, storedMissesRef.current)),
        'standard',
      );
    },
    [activeLanguage, beginSession, practiceTense],
  );

  const startMissReview = useCallback(() => {
    // Explicit review includes misses that aren't due yet; only due ones get promoted.
    const targets = getReviewTargets(activeLanguage, 'mixed', storedMissesRef.current, { dueOnly: false });
    beginSession(createMissSessionPrompts(activeLanguage, targets), 'review');
    setActiveViewState('practice');
  }, [activeLanguage, beginSession]);

  const startVerbDrill = useCallback(
    (verbInfinitives: string[]) => {
      drillVerbsRef.current = verbInfinitives;
      beginSession(createVerbSessionPrompts(activeLanguage, verbInfinitives), 'verbs');
      setActiveViewState('practice');
    },
    [activeLanguage, beginSession],
  );

  const resetSession = useCallback(() => {
    if (sessionKind === 'review') {
      const targets = getReviewTargets(activeLanguage, 'mixed', storedMissesRef.current, { dueOnly: false });
      // A mastered queue can still be repeated without silently changing modes.
      beginSession(targets.length ? createMissSessionPrompts(activeLanguage, targets) : [...sessionPrompts], 'review');
    } else if (sessionKind === 'verbs') {
      beginSession(createVerbSessionPrompts(activeLanguage, drillVerbsRef.current), 'verbs');
    } else {
      startSession(activeLanguage, practiceTense);
    }
  }, [activeLanguage, beginSession, practiceTense, sessionKind, sessionPrompts, startSession]);

  const moveNext = useCallback(() => {
    clearAutoAdvance();
    setPromptIndex((current) => Math.min(current + 1, sessionLength - 1));
    setSelectedAnswer(null);
    setTimedOut(false);
    setTimeLeft(timerSeconds);
  }, [clearAutoAdvance, sessionLength]);

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
      const perfectSetComplete = choiceIsCorrect && nextAttemptTotal >= sessionLength && nextCorrectTotal >= sessionLength;
      const attempt: Attempt = { prompt, answer: choice, correct: choiceIsCorrect };

      setSelectedAnswer(choice);
      setTimedOut(false);
      setAttempts((current) => [...current, attempt]);
      setStreak(nextStreak);
      updateStats(languageId, {
        correct: choiceIsCorrect,
        streak: nextStreak,
        completedSet: nextAttemptTotal >= sessionLength && sessionKind !== 'review',
        tense: prompt.tense,
        verbInfinitive: prompt.verb.infinitive,
      });

      if (choiceIsCorrect) {
        setStoredMisses((current) => recordCorrectReview(current, prompt));
      } else {
        setStoredMisses((current) => upsertMiss(current, prompt));
      }

      if (perfectSetComplete) {
        setShowCelebration(true);
        return;
      }

      if (nextAttemptTotal >= sessionLength) {
        setShowCompletion(true);
        return;
      }

      if (choiceIsCorrect) {
        autoAdvanceTimer.current = setTimeout(() => {
          setPromptIndex((current) => Math.min(current + 1, sessionLength - 1));
          setSelectedAnswer(null);
          setTimedOut(false);
          setTimeLeft(timerSeconds);
          autoAdvanceTimer.current = null;
        }, autoAdvanceDelayMs);
      }
    },
    [
      attempts.length,
      clearAutoAdvance,
      correctAnswer,
      correctCount,
      isAnswered,
      isSessionComplete,
      languageId,
      prompt,
      sessionKind,
      sessionLength,
      streak,
      updateStats,
    ],
  );

  const handleTimeout = useCallback(() => {
    if (selectedAnswerRef.current !== null || isSessionCompleteRef.current) {
      return;
    }

    const attempt: Attempt = { prompt, answer: '', correct: false, timedOut: true };
    const nextAttemptTotal = attempts.length + 1;

    setTimedOut(true);
    setSelectedAnswer(null);
    setAttempts((current) => [...current, attempt]);
    setStreak(0);
    updateStats(languageId, {
      correct: false,
      streak: 0,
      completedSet: nextAttemptTotal >= sessionLength && sessionKind !== 'review',
      tense: prompt.tense,
      verbInfinitive: prompt.verb.infinitive,
    });
    setStoredMisses((current) => upsertMiss(current, prompt));

    if (nextAttemptTotal >= sessionLength) {
      setShowCompletion(true);
    }
  }, [attempts.length, languageId, prompt, sessionKind, sessionLength, updateStats]);

  useEffect(() => {
    if (!isAnswered && !isSessionComplete) {
      setTimeLeft(timerSeconds);
    }
  }, [promptIndex, isAnswered, isSessionComplete]);

  useEffect(() => {
    if (activeView !== 'practice' || isSessionComplete || showCelebration || showCompletion) {
      return undefined;
    }

    const interval = setInterval(() => {
      setSessionElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeView, isSessionComplete, showCelebration, showCompletion]);

  useEffect(() => {
    if (
      !timerEnabled ||
      isAnswered ||
      isSessionComplete ||
      showCelebration ||
      showCompletion ||
      activeView !== 'practice'
    ) {
      return undefined;
    }

    // Updaters must stay pure (StrictMode may run them twice), so the timeout fires from the effect below.
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeView, isAnswered, isSessionComplete, showCelebration, showCompletion, timerEnabled]);

  useEffect(() => {
    if (timerEnabled && timeLeft === 0 && !isAnswered && !isSessionComplete) {
      handleTimeout();
    }
  }, [handleTimeout, isAnswered, isSessionComplete, timeLeft, timerEnabled]);

  useEffect(
    () => () => {
      clearAutoAdvance();
    },
    [clearAutoAdvance],
  );

  const switchLanguage = useCallback(
    (nextLanguageId: LanguageId) => {
      const nextLanguage = resolveLanguage(nextLanguageId, { includeVosotros });
      const nextTense = clampEnglishTense(nextLanguageId, practiceTense);
      setLanguageId(nextLanguageId);
      if (nextTense !== practiceTense) {
        setPracticeTense(nextTense);
      }
      if (!isTenseAvailable(nextLanguageId, wordbook.bookTense)) {
        wordbook.setBookTense('present');
      }
      startSession(nextLanguage, nextTense);
    },
    [includeVosotros, practiceTense, startSession, wordbook],
  );

  const switchTense = useCallback(
    (nextTense: PracticeTenseId) => {
      const tense = clampEnglishTense(languageId, nextTense);
      setPracticeTense(tense);
      startSession(activeLanguage, tense);
    },
    [activeLanguage, languageId, startSession],
  );

  const drillTense = useCallback(
    (tense: TenseId) => {
      switchTense(tense);
      setActiveViewState('practice');
    },
    [switchTense],
  );

  // Toggling vosotros changes the Spanish prompt pool, so the running set would be stale.
  const previousIncludeVosotros = useRef(includeVosotros);
  useEffect(() => {
    if (previousIncludeVosotros.current === includeVosotros) {
      return;
    }

    previousIncludeVosotros.current = includeVosotros;
    if (activeLanguage.id === 'spanish') {
      startSession(activeLanguage, practiceTense);
    }
  }, [activeLanguage, includeVosotros, practiceTense, startSession]);

  const dismissCelebration = useCallback(() => setShowCelebration(false), []);
  const dismissCompletion = useCallback(() => setShowCompletion(false), []);
  const toggleTimer = useCallback(() => setTimerEnabled((prev) => !prev), []);

  return {
    languageId,
    switchLanguage,
    practiceTense,
    switchTense,
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
    openPromptInWordbook: wordbook.openPromptInWordbook,
    selectedAnswer,
    timedOut,
    attempts,
    streak,
    showCelebration,
    showCompletion,
    stats,
    storedMisses: languageMisses,
    allStoredMisses: storedMisses,
    activeLanguage,
    prompt,
    choices,
    correctAnswer,
    isAnswered,
    isCorrect,
    accuracy,
    progress,
    progressPercent,
    isSessionComplete,
    selectChoice,
    resetSession,
    moveNext,
    startMissReview,
    startVerbDrill,
    drillTense,
    sessionKind,
    dismissCelebration,
    dismissCompletion,
    timeLeft,
    sessionElapsedSeconds,
    timerEnabled,
    toggleTimer,
    todayStats,
    todayAccuracy,
    trend,
    recordQuizResult,
    sessionTarget: sessionLength,
  };
}
