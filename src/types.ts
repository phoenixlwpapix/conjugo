import type { Language, LanguageId, Pronoun as VerbPronoun, TenseId, VerbEntry } from './data/verbs';

export type Pronoun = 'I' | 'you' | 'he/she' | 'we' | 'you plural' | 'they';

export type AppView = 'practice' | 'stats' | 'wordbook';

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

export type StoredMiss = {
  languageId: LanguageId;
  verbInfinitive: string;
  tense: TenseId;
  pronoun: Pronoun;
  answer: string;
  missedAt: number;
};

export type DailyStats = {
  answered: number;
  correct: number;
  sessions: number;
};

export type PracticeStats = {
  totalAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  days: Record<string, DailyStats>;
};

export type PracticeStatsByLanguage = Partial<Record<LanguageId, PracticeStats>>;

export type ReviewTarget = {
  verbInfinitive: string;
  tense: TenseId;
  pronoun: Pronoun;
};

export type CumulativeStats = {
  totalAttempts: number;
  totalCorrect: number;
  maxStreak: number;
};
