import type { Language, Pronoun, TenseId, VerbEntry } from './data/verbs';

export type AppView = 'practice' | 'stats' | 'wordbook';

export type Prompt = {
  language: Language;
  verb: VerbEntry;
  tense: TenseId;
  pronoun: Pronoun;
};

export type Attempt = {
  prompt: Prompt;
  answer: string;
  correct: boolean;
};

export type StoredMiss = {
  languageId: Language['id'];
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

export type ReviewTarget = {
  verbInfinitive: string;
  tense: TenseId;
  pronoun: Pronoun;
};
