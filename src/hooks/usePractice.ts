import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { languages, type Language, type LanguageId, type PracticeTenseId } from '../data/verbs';
import { clearMasteredMiss, getReviewTargets, upsertMiss } from '../lib/misses';
import {
  autoAdvanceDelayMs,
  clampEnglishTense,
  createSessionPrompts,
  getAnswer,
  getChoices,
  getFallbackPrompt,
  sessionTarget,
  timerSeconds,
} from '../lib/prompts';
import { emptyStats, getAccuracy, getDailyStats, getSevenDayTrend, recordAnswer } from '../lib/scoring';
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
import type { AppView, Attempt, PracticeStats, PracticeStatsByLanguage, StoredMiss } from '../types';
import { useWordbook } from './useWordbook';



export function usePractice() {
  const [languageId, setLanguageId] = useState<LanguageId>(readLanguageId);
  const [practiceTense, setPracticeTense] = useState<PracticeTenseId>(() =>
    clampEnglishTense(readLanguageId(), readPracticeTense()),
  );
  const [activeView, setActiveViewState] = useState<AppView>(readActiveView);
  const [storedMisses, setStoredMisses] = useState<StoredMiss[]>(readStoredMisses);
  const [statsByLanguage, setStatsByLanguage] = useState<PracticeStatsByLanguage>(readPracticeStatsByLanguage);
  const [sessionPrompts, setSessionPrompts] = useState(() => {
    const language = languages.find((item) => item.id === readLanguageId()) ?? languages[0];
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
  const [timerPaused, setTimerPaused] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(readTimerEnabled);

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storedMissesRef = useRef(storedMisses);
  const selectedAnswerRef = useRef(selectedAnswer);
  const isSessionCompleteRef = useRef(false);

  const activeLanguage = useMemo(
    () => languages.find((language) => language.id === languageId) ?? languages[0],
    [languageId],
  );
  const wordbook = useWordbook(activeLanguage);

  const stats: PracticeStats = statsByLanguage[languageId] ?? emptyStats();
  const prompt =
    sessionPrompts[Math.min(promptIndex, sessionPrompts.length - 1)] ?? getFallbackPrompt(activeLanguage, practiceTense);
  const choices = useMemo(() => getChoices(prompt, promptIndex), [prompt, promptIndex]);
  const correctAnswer = getAnswer(prompt);
  const isAnswered = selectedAnswer !== null || timedOut;
  const isCorrect = !timedOut && selectedAnswer === correctAnswer;
  const correctCount = attempts.filter((attempt) => attempt.correct).length;
  const accuracy = getAccuracy(correctCount, attempts.length);
  const progress = Math.min(attempts.length, sessionTarget);
  const progressPercent = Math.round((progress / sessionTarget) * 100);
  const recentMisses = attempts.filter((attempt) => !attempt.correct).slice(0, 4);
  const isSessionComplete = attempts.length >= sessionTarget;
  const todayStats = getDailyStats(stats);
  const todayAccuracy = getAccuracy(todayStats.correct, todayStats.answered);
  const trend = useMemo(() => getSevenDayTrend(stats), [stats]);
  const languageMisses = useMemo(
    () => storedMisses.filter((miss) => miss.languageId === languageId),
    [languageId, storedMisses],
  );

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

  const startSession = useCallback(
    (language: Language = activeLanguage, tense: PracticeTenseId = practiceTense) => {
      clearAutoAdvance();
      const nextTense = clampEnglishTense(language.id, tense);
      setSessionPrompts(createSessionPrompts(language, nextTense, getReviewTargets(language, nextTense, storedMissesRef.current)));
      setPromptIndex(0);
      setAttempts([]);
      setStreak(0);
      setShowCelebration(false);
      setShowCompletion(false);
      setSelectedAnswer(null);
      setTimedOut(false);
      setTimeLeft(timerSeconds);
    },
    [activeLanguage, clearAutoAdvance, practiceTense],
  );

  const resetSession = useCallback(() => {
    startSession(activeLanguage, practiceTense);
  }, [activeLanguage, practiceTense, startSession]);

  const moveNext = useCallback(() => {
    clearAutoAdvance();
    setPromptIndex((current) => Math.min(current + 1, sessionTarget - 1));
    setSelectedAnswer(null);
    setTimedOut(false);
    setTimeLeft(timerSeconds);
  }, [clearAutoAdvance]);

  const updateStats = useCallback((language: LanguageId, choiceIsCorrect: boolean, nextStreak: number, sessionJustCompleted: boolean) => {
    setStatsByLanguage((current) => {
      const languageStats = current[language] ?? emptyStats();
      return {
        ...current,
        [language]: recordAnswer(languageStats, choiceIsCorrect, nextStreak, sessionJustCompleted),
      };
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
      setTimedOut(false);
      setAttempts((current) => [attempt, ...current]);
      setStreak(nextStreak);
      updateStats(languageId, choiceIsCorrect, nextStreak, nextAttemptTotal >= sessionTarget);

      if (choiceIsCorrect) {
        setStoredMisses((current) => clearMasteredMiss(current, prompt));
      } else {
        setStoredMisses((current) => upsertMiss(current, prompt));
      }

      if (perfectSetComplete) {
        setShowCelebration(true);
        return;
      }

      if (nextAttemptTotal >= sessionTarget) {
        setShowCompletion(true);
        return;
      }

      if (choiceIsCorrect) {
        autoAdvanceTimer.current = setTimeout(() => {
          setPromptIndex((current) => Math.min(current + 1, sessionTarget - 1));
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
    setAttempts((current) => [attempt, ...current]);
    setStreak(0);
    updateStats(languageId, false, 0, nextAttemptTotal >= sessionTarget);
    setStoredMisses((current) => upsertMiss(current, prompt));

    if (nextAttemptTotal >= sessionTarget) {
      setShowCompletion(true);
    }
  }, [attempts.length, languageId, prompt, updateStats]);

  useEffect(() => {
    if (!isAnswered && !isSessionComplete) {
      setTimeLeft(timerSeconds);
    }
  }, [promptIndex, isAnswered, isSessionComplete]);

  useEffect(() => {
    if (
      !timerEnabled ||
      timerPaused ||
      isAnswered ||
      isSessionComplete ||
      showCelebration ||
      showCompletion ||
      activeView !== 'practice'
    ) {
      return undefined;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    activeView,
    handleTimeout,
    isAnswered,
    isSessionComplete,
    showCelebration,
    showCompletion,
    timerEnabled,
    timerPaused,
  ]);

  useEffect(
    () => () => {
      clearAutoAdvance();
    },
    [clearAutoAdvance],
  );

  const switchLanguage = useCallback(
    (nextLanguageId: LanguageId) => {
      const nextLanguage = languages.find((language) => language.id === nextLanguageId) ?? languages[0];
      const nextTense = clampEnglishTense(nextLanguageId, practiceTense);
      setLanguageId(nextLanguageId);
      if (nextTense !== practiceTense) {
        setPracticeTense(nextTense);
      }
      if (nextLanguageId === 'english' && (wordbook.bookTense === 'imperfect' || wordbook.bookTense === 'conditional')) {
        wordbook.setBookTense('present');
      }
      startSession(nextLanguage, nextTense);
    },
    [practiceTense, startSession, wordbook],
  );

  const switchTense = useCallback(
    (nextTense: PracticeTenseId) => {
      const tense = clampEnglishTense(languageId, nextTense);
      setPracticeTense(tense);
      startSession(activeLanguage, tense);
    },
    [activeLanguage, languageId, startSession],
  );

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
    setBookTense: wordbook.setBookTense,
    wordbookQuery: wordbook.wordbookQuery,
    setWordbookQuery: wordbook.setWordbookQuery,
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
    recentMisses,
    isSessionComplete,
    selectChoice,
    resetSession,
    moveNext,
    dismissCelebration,
    dismissCompletion,
    timeLeft,
    timerEnabled,
    timerPaused,
    setTimerPaused,
    toggleTimer,
    todayStats,
    todayAccuracy,
    trend,
    sessionTarget,
  };
}
