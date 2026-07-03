import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  concreteTenses,
  languages,
  pronouns,
  type Language,
  type LanguageId,
  type PracticeTenseId,
  type Pronoun,
  type TenseId,
  type VerbEntry,
} from '../data/verbs';

export type AppView = 'practice' | 'wordbook';

export type Prompt = {
  language: Language;
  verb: VerbEntry;
  tense: TenseId;
  pronoun: Pronoun;
  selectedPronounLabel?: string;
};

export type Attempt = {
  prompt: Prompt;
  answer: string;
  correct: boolean;
};

export type SavedMissedPrompt = {
  languageId: LanguageId;
  verbInfinitive: string;
  tense: TenseId;
  pronoun: Pronoun;
};

export type CumulativeStats = {
  totalAttempts: number;
  totalCorrect: number;
  maxStreak: number;
};

const sessionTarget = 20;
const autoAdvanceDelayMs = 1200;

const getPracticeTenses = (practiceTense: PracticeTenseId, languageId?: LanguageId): TenseId[] => {
  const tenses = languageId === 'english'
    ? concreteTenses.filter((t) => t.id !== 'imperfect' && t.id !== 'conditional')
    : concreteTenses;
  return practiceTense === 'mixed' ? tenses.map((t) => t.id) : [practiceTense];
};

const createPromptPool = (language: Language, practiceTense: PracticeTenseId): Prompt[] =>
  language.verbs.flatMap((verb) =>
    getPracticeTenses(practiceTense, language.id).flatMap((tense) =>
      pronouns.map((pronoun) => {
        const fullLabel = language.pronounLabels[pronoun];
        const parts = fullLabel.split('/');
        const selectedPronounLabel = parts[Math.floor(Math.random() * parts.length)];
        return {
          language,
          verb,
          tense,
          pronoun,
          selectedPronounLabel,
        };
      }),
    ),
  );

const shufflePrompts = (prompts: Prompt[]): Prompt[] => {
  const shuffled = [...prompts];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const getAnswer = (prompt: Prompt) => prompt.verb.forms[prompt.tense][prompt.pronoun];

const stableScore = (value: string, seed: number) =>
  Array.from(value).reduce((score, character) => score + character.charCodeAt(0), seed * 37);

const getChoices = (prompt: Prompt, seed: number) => {
  const correctAnswer = getAnswer(prompt);
  const sameTenseDistractors = pronouns
    .map((pronoun) => prompt.verb.forms[prompt.tense][pronoun])
    .filter((value, index, values) => value !== correctAnswer && values.indexOf(value) === index)
    .sort((first, second) => stableScore(first, seed) - stableScore(second, seed))
    .slice(0, 3);
  
  const languageTenses = prompt.language.id === 'english'
    ? concreteTenses.filter((t) => t.id !== 'imperfect' && t.id !== 'conditional')
    : concreteTenses;

  const fallbackDistractors = languageTenses
    .flatMap((tense) => pronouns.map((pronoun) => prompt.verb.forms[tense.id][pronoun]))
    .filter(
      (value, index, values) =>
        value !== correctAnswer && !sameTenseDistractors.includes(value) && values.indexOf(value) === index,
    )
    .sort((first, second) => stableScore(first, seed) - stableScore(second, seed))
    .slice(0, 3 - sameTenseDistractors.length);
  const distractors = [...sameTenseDistractors, ...fallbackDistractors];

  return [correctAnswer, ...distractors].sort(
    (first, second) => stableScore(first, seed + 11) - stableScore(second, seed + 11)
  );
};

const getFallbackPrompt = (language: Language, practiceTense: PracticeTenseId): Prompt => {
  const firstVerb = language.verbs[0];
  if (!firstVerb) {
    throw new Error(`${language.name} needs at least one verb`);
  }
  const pronoun = pronouns[0];
  const fullLabel = language.pronounLabels[pronoun];
  const parts = fullLabel.split('/');
  const selectedPronounLabel = parts[Math.floor(Math.random() * parts.length)];
  return {
    language,
    verb: firstVerb,
    tense: getPracticeTenses(practiceTense, language.id)[0],
    pronoun,
    selectedPronounLabel,
  };
};

export function usePractice() {
  // Load from localStorage on initialization
  const [languageId, setLanguageId] = useState<LanguageId>(() => {
    const saved = localStorage.getItem('conjugo_languageId');
    return (saved as LanguageId) || 'spanish';
  });

  const [practiceTense, setPracticeTense] = useState<PracticeTenseId>(() => {
    const saved = localStorage.getItem('conjugo_practiceTense');
    return (saved as PracticeTenseId) || 'present';
  });

  const [activeView, setActiveView] = useState<AppView>(() => {
    const saved = localStorage.getItem('conjugo_activeView');
    return (saved as AppView) || 'practice';
  });

  const [bookTense, setBookTense] = useState<TenseId>('present');
  const [selectedVerbIndex, setSelectedVerbIndex] = useState(0);
  const [wordbookQuery, setWordbookQuery] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Cumulative stats
  const [stats, setStats] = useState<CumulativeStats>(() => {
    const saved = localStorage.getItem('conjugo_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return { totalAttempts: 0, totalCorrect: 0, maxStreak: 0 };
  });

  // Saved missed prompts for review queue
  const [missedPrompts, setMissedPrompts] = useState<SavedMissedPrompt[]>(() => {
    const saved = localStorage.getItem('conjugo_missed_prompts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  const activeLanguage = useMemo(
    () => languages.find((lang) => lang.id === languageId) ?? languages[0],
    [languageId]
  );

  // Generate session prompts combining normal pool and missed review queue prompts
  const createSessionPromptsWithReview = (lang: Language, tense: PracticeTenseId, misses: SavedMissedPrompt[]) => {
    const fullPool = createPromptPool(lang, tense);
    
    // Filter misses that match current language and tense context
    const currentTenses = getPracticeTenses(tense, lang.id);
    const applicableMisses = misses.filter(
      (m) => m.languageId === lang.id && currentTenses.includes(m.tense)
    );

    // Resolve SavedMissedPrompt to full Prompt objects
    const resolvedMisses: Prompt[] = [];
    applicableMisses.forEach((miss) => {
      const verb = lang.verbs.find((v) => v.infinitive === miss.verbInfinitive);
      if (verb) {
        const fullLabel = lang.pronounLabels[miss.pronoun];
        const parts = fullLabel.split('/');
        const selectedPronounLabel = parts[Math.floor(Math.random() * parts.length)];
        resolvedMisses.push({
          language: lang,
          verb,
          tense: miss.tense,
          pronoun: miss.pronoun,
          selectedPronounLabel,
        });
      }
    });

    // We take up to 6 unique misses (30% of sessionTarget)
    const uniqueMisses = resolvedMisses.filter(
      (value, index, self) =>
        self.findIndex(
          (p) =>
            p.verb.infinitive === value.verb.infinitive &&
            p.tense === value.tense &&
            p.pronoun === value.pronoun
        ) === index
    );
    const selectedMisses = shufflePrompts(uniqueMisses).slice(0, 6);

    // Remaining prompts from normal pool (excluding those already selected from misses)
    const remainingCount = sessionTarget - selectedMisses.length;
    const filteredPool = fullPool.filter(
      (poolItem) =>
        !selectedMisses.some(
          (miss) =>
            miss.verb.infinitive === poolItem.verb.infinitive &&
            miss.tense === poolItem.tense &&
            miss.pronoun === poolItem.pronoun
        )
    );

    const normalSelection = shufflePrompts(filteredPool).slice(0, remainingCount);
    return shufflePrompts([...selectedMisses, ...normalSelection]);
  };

  const [sessionPrompts, setSessionPrompts] = useState<Prompt[]>(() =>
    createSessionPromptsWithReview(activeLanguage, practiceTense, missedPrompts)
  );

  const [timeLeft, setTimeLeft] = useState(8);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('conjugo_timerEnabled');
    return saved !== 'false';
  });

  const prompt = sessionPrompts[Math.min(promptIndex, sessionPrompts.length - 1)] ?? getFallbackPrompt(activeLanguage, practiceTense);
  const choices = useMemo(() => getChoices(prompt, promptIndex), [prompt, promptIndex]);
  const correctAnswer = getAnswer(prompt);
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === correctAnswer;
  
  const correctCount = attempts.filter((attempt) => attempt.correct).length;
  const sessionAccuracy = attempts.length === 0 ? 0 : Math.round((correctCount / attempts.length) * 100);
  const progress = Math.min(attempts.length, sessionTarget);
  const progressPercent = Math.round((progress / sessionTarget) * 100);
  
  // Recent misses in the current session
  const recentSessionMisses = attempts.filter((attempt) => !attempt.correct);
  const isSessionComplete = attempts.length >= sessionTarget;

  const handleTimeout = useCallback(() => {
    if (selectedAnswer !== null || isSessionComplete) {
      return;
    }

    const nextAttempts = [{ prompt, answer: '[Timeout]', correct: false }, ...attempts];
    setAttempts(nextAttempts);
    setStreak(0);

    setStats((current) => ({
      ...current,
      totalAttempts: current.totalAttempts + 1,
    }));

    setMissedPrompts((current) => {
      const exists = current.some(
        (m) =>
          m.languageId === languageId &&
          m.verbInfinitive === prompt.verb.infinitive &&
          m.tense === prompt.tense &&
          m.pronoun === prompt.pronoun
      );
      if (exists) return current;

      return [
        {
          languageId,
          verbInfinitive: prompt.verb.infinitive,
          tense: prompt.tense,
          pronoun: prompt.pronoun,
        },
        ...current,
      ].slice(0, 50);
    });

    setSelectedAnswer('[Timeout]');

    if (nextAttempts.length >= sessionTarget) {
      setShowCompletion(true);
    }
  }, [selectedAnswer, isSessionComplete, prompt, attempts, languageId]);

  // Timer countdown effect for "Fast recall"
  useEffect(() => {
    if (!timerEnabled || selectedAnswer !== null || isSessionComplete || showCelebration || showCompletion || activeView !== 'practice') {
      return;
    }

    setTimeLeft(8);

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
  }, [promptIndex, selectedAnswer, isSessionComplete, showCelebration, showCompletion, activeView, timerEnabled, handleTimeout]);

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync basic preferences to localStorage
  useEffect(() => {
    localStorage.setItem('conjugo_languageId', languageId);
  }, [languageId]);

  useEffect(() => {
    localStorage.setItem('conjugo_timerEnabled', String(timerEnabled));
  }, [timerEnabled]);

  useEffect(() => {
    localStorage.setItem('conjugo_practiceTense', practiceTense);
  }, [practiceTense]);

  useEffect(() => {
    localStorage.setItem('conjugo_activeView', activeView);
  }, [activeView]);

  // Sync stats and missed prompts
  useEffect(() => {
    localStorage.setItem('conjugo_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('conjugo_missed_prompts', JSON.stringify(missedPrompts));
  }, [missedPrompts]);



  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
    };
  }, []);

  const clearAutoAdvance = () => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  };

  const moveNext = () => {
    clearAutoAdvance();
    setPromptIndex((current) => Math.min(current + 1, sessionTarget - 1));
    setSelectedAnswer(null);
  };

  const startSession = (lang: Language, tense: PracticeTenseId) => {
    clearAutoAdvance();
    // Load fresh missed prompts to inject into the pool
    const currentMissed = JSON.parse(localStorage.getItem('conjugo_missed_prompts') || '[]');
    setSessionPrompts(createSessionPromptsWithReview(lang, tense, currentMissed));
    setPromptIndex(0);
    setAttempts([]);
    setStreak(0);
    setShowCelebration(false);
    setShowCompletion(false);
    setSelectedAnswer(null);
  };

  const resetSession = () => {
    startSession(activeLanguage, practiceTense);
  };

  const switchLanguage = (nextLanguageId: LanguageId) => {
    const nextLanguage = languages.find((l) => l.id === nextLanguageId) ?? languages[0];
    setLanguageId(nextLanguageId);
    setSelectedVerbIndex(0);
    setWordbookQuery('');
    
    let activeTense = practiceTense;
    if (nextLanguageId === 'english' && (practiceTense === 'imperfect' || practiceTense === 'conditional')) {
      activeTense = 'present';
      setPracticeTense('present');
    }
    if (nextLanguageId === 'english' && (bookTense === 'imperfect' || bookTense === 'conditional')) {
      setBookTense('present');
    }
    
    startSession(nextLanguage, activeTense);
  };

  const switchTense = (nextTense: PracticeTenseId) => {
    setPracticeTense(nextTense);
    startSession(activeLanguage, nextTense);
  };

  const selectChoice = (choice: string) => {
    if (isAnswered || isSessionComplete) {
      return;
    }

    clearAutoAdvance();
    const choiceIsCorrect = choice === correctAnswer;
    const nextAttempts = [{ prompt, answer: choice, correct: choiceIsCorrect }, ...attempts];
    
    // Update attempts
    setAttempts(nextAttempts);

    // Update streak
    const nextStreak = choiceIsCorrect ? streak + 1 : 0;
    setStreak(nextStreak);

    // Update stats
    setStats((current) => {
      const totalAttempts = current.totalAttempts + 1;
      const totalCorrect = current.totalCorrect + (choiceIsCorrect ? 1 : 0);
      const maxStreak = Math.max(current.maxStreak, nextStreak);
      return { totalAttempts, totalCorrect, maxStreak };
    });

    // Update missed prompts queue
    if (!choiceIsCorrect) {
      setMissedPrompts((current) => {
        // Avoid duplicates in the global missed queue
        const exists = current.some(
          (m) =>
            m.languageId === languageId &&
            m.verbInfinitive === prompt.verb.infinitive &&
            m.tense === prompt.tense &&
            m.pronoun === prompt.pronoun
        );
        if (exists) return current;

        // Keep it capped at 50 to prevent unbounded growth
        const updated = [
          {
            languageId,
            verbInfinitive: prompt.verb.infinitive,
            tense: prompt.tense,
            pronoun: prompt.pronoun,
          },
          ...current,
        ];
        return updated.slice(0, 50);
      });
    } else {
      // If answered correctly, remove from the missed queue (adaptive learning)
      setMissedPrompts((current) =>
        current.filter(
          (m) =>
            !(
              m.languageId === languageId &&
              m.verbInfinitive === prompt.verb.infinitive &&
              m.tense === prompt.tense &&
              m.pronoun === prompt.pronoun
            )
        )
      );
    }

    const nextAttemptTotal = nextAttempts.length;
    const nextCorrectTotal = nextAttempts.filter((a) => a.correct).length;
    const perfectSetComplete = choiceIsCorrect && nextAttemptTotal >= sessionTarget && nextCorrectTotal >= sessionTarget;

    setSelectedAnswer(choice);

    if (perfectSetComplete) {
      setShowCelebration(true);
      return;
    }

    if (nextAttemptTotal >= sessionTarget) {
      setShowCompletion(true);
      return;
    }

    if (choiceIsCorrect && nextAttemptTotal < sessionTarget) {
      autoAdvanceTimer.current = setTimeout(() => {
        setPromptIndex((current) => Math.min(current + 1, sessionTarget - 1));
        setSelectedAnswer(null);
        autoAdvanceTimer.current = null;
      }, autoAdvanceDelayMs);
    }
  };

  const dismissCelebration = () => {
    setShowCelebration(false);
  };

  const dismissCompletion = () => {
    setShowCompletion(false);
  };

  // Jump from review item to word book
  const clickReviewItem = (verbInfinitive: string) => {
    const index = activeLanguage.verbs.findIndex((v) => v.infinitive === verbInfinitive);
    if (index !== -1) {
      setSelectedVerbIndex(index);
      setActiveView('wordbook');
      setWordbookQuery('');
    }
  };

  return {
    languageId,
    switchLanguage,
    practiceTense,
    switchTense,
    activeView,
    setActiveView,
    bookTense,
    setBookTense,
    selectedVerbIndex,
    setSelectedVerbIndex,
    wordbookQuery,
    setWordbookQuery,
    promptIndex,
    selectedAnswer,
    attempts,
    streak,
    showCelebration,
    showCompletion,
    setShowCelebration,
    stats,
    missedPrompts,
    activeLanguage,
    sessionPrompts,
    prompt,
    choices,
    correctAnswer,
    isAnswered,
    isCorrect,
    accuracy: sessionAccuracy,
    progress,
    progressPercent,
    recentMisses: recentSessionMisses.slice(0, 4),
    isSessionComplete,
    selectChoice,
    resetSession,
    moveNext,
    dismissCelebration,
    dismissCompletion,
    clickReviewItem,
    timeLeft,
    timerEnabled,
    toggleTimer: () => setTimerEnabled((prev) => !prev),
  };
}
