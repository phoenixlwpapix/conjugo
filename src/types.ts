import type { Language, LanguageId, TenseId, VerbEntry } from './data/verbs';

export type Pronoun = 'I' | 'you' | 'he/she' | 'we' | 'you plural' | 'they';

export type AppView = 'practice' | 'quiz' | 'stats' | 'wordbook' | 'settings';

export type PracticeAnswerMode = 'choice' | 'typing';

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
  timedOut?: boolean;
};

/** Leitner box: 1 = just missed, 3 = one clean pass away from mastered. */
export type ReviewBox = 1 | 2 | 3;

export type StoredMiss = {
  languageId: LanguageId;
  verbInfinitive: string;
  tense: TenseId;
  pronoun: Pronoun;
  answer: string;
  missedAt: number;
  box: ReviewBox;
  /** Timestamp from which a correct answer promotes the miss to the next box. */
  dueAt: number;
};

export type SessionKind = 'standard' | 'review' | 'verbs' | 'favorites';

export type FavoriteVerbsByLanguage = Partial<Record<LanguageId, string[]>>;

export type DailyStats = {
  answered: number;
  correct: number;
  sessions: number;
};

export type AnswerTally = {
  answered: number;
  correct: number;
};

export type PracticeStats = {
  totalAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  days: Record<string, DailyStats>;
  byTense: Partial<Record<TenseId, AnswerTally>>;
  byVerb: Record<string, AnswerTally>;
  quiz: {
    answered: number;
    correct: number;
    sessions: number;
    byTense: Partial<Record<TenseId, AnswerTally>>;
  };
};

export type PracticeStatsByLanguage = Partial<Record<LanguageId, PracticeStats>>;

export type ReviewTarget = {
  verbInfinitive: string;
  tense: TenseId;
  pronoun: Pronoun;
};
