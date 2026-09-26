import { languages, type LanguageId, type PracticeTenseId, type Pronoun, type TenseId } from '../data/verbs';
import { isTranslationLanguage, type TranslationLanguage } from '../data/translations';
import type { AnswerTally, AppView, PracticeStats, PracticeStatsByLanguage, ReviewBox, StoredMiss } from '../types';
import { capMissesPerLanguage } from './misses';
import { emptyStats } from './scoring';

const storageKeys = {
  languageId: 'conjugo.languageId',
  practiceTense: 'conjugo.practiceTense',
  activeView: 'conjugo.activeView',
  misses: 'conjugo.misses',
  statsByLanguage: 'conjugo.statsByLanguage',
  timerEnabled: 'conjugo.timerEnabled',
  translationLanguage: 'conjugo.translationLanguage',
  includeVosotros: 'conjugo.includeVosotros',
} as const;

/** Legacy keys from the pre-refactor live path. */
const legacyKeys = {
  languageId: 'conjugo_languageId',
  practiceTense: 'conjugo_practiceTense',
  activeView: 'conjugo_activeView',
  misses: 'conjugo_missed_prompts',
  statsByLanguage: 'conjugo_stats_by_language',
  timerEnabled: 'conjugo_timerEnabled',
  stats: 'conjugo.stats',
} as const;

const languageIds = languages.map((language) => language.id);
const practiceTenses: PracticeTenseId[] = ['present', 'past', 'imperfect', 'future', 'conditional', 'subjunctive', 'mixed'];
const appViews: AppView[] = ['practice', 'stats', 'wordbook'];
const tenseIds: TenseId[] = ['present', 'past', 'imperfect', 'future', 'conditional', 'subjunctive'];
const pronounIds: Pronoun[] = ['I', 'you', 'he/she', 'we', 'you plural', 'they'];

const canUseStorage = () => typeof window !== 'undefined' && 'localStorage' in window;

const safeGet = (key: string): string | null => {
  if (!canUseStorage()) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string) => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage may be blocked (private mode / quota); keep the UI usable.
  }
};

const readJson = <Value>(key: string, fallback: Value): Value => {
  const rawValue = safeGet(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as Value;
  } catch {
    return fallback;
  }
};

const writeJson = <Value>(key: string, value: Value) => {
  safeSet(key, JSON.stringify(value));
};

const readString = <Value extends string>(key: string, fallback: Value, allowedValues: readonly Value[]) => {
  const rawValue = safeGet(key);
  return allowedValues.includes(rawValue as Value) ? (rawValue as Value) : fallback;
};

const isLanguageId = (value: unknown): value is LanguageId =>
  typeof value === 'string' && languageIds.includes(value as LanguageId);

const isTenseId = (value: unknown): value is TenseId => typeof value === 'string' && tenseIds.includes(value as TenseId);

const isPronoun = (value: unknown): value is Pronoun => typeof value === 'string' && pronounIds.includes(value as Pronoun);

const isReviewBox = (value: unknown): value is ReviewBox => value === 1 || value === 2 || value === 3;

const isAnswerTally = (value: unknown): value is AnswerTally => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const tally = value as Record<string, unknown>;
  return typeof tally.answered === 'number' && typeof tally.correct === 'number';
};

/** Drops malformed entries so a corrupted tally can't break the Stats view. */
const readTallies = (value: unknown): Record<string, AnswerTally> => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.fromEntries(Object.entries(value).filter(([, tally]) => isAnswerTally(tally)));
};

type StoredPracticeStats = Omit<PracticeStats, 'byTense' | 'byVerb'> & Partial<Pick<PracticeStats, 'byTense' | 'byVerb'>>;

const isPracticeStats = (value: unknown): value is StoredPracticeStats => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const stats = value as Record<string, unknown>;
  return (
    typeof stats.totalAnswered === 'number' &&
    typeof stats.totalCorrect === 'number' &&
    typeof stats.bestStreak === 'number' &&
    typeof stats.days === 'object' &&
    stats.days !== null
  );
};

const isLegacyCumulative = (value: unknown): value is { totalAttempts: number; totalCorrect: number; maxStreak: number } => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const stats = value as Record<string, unknown>;
  return (
    typeof stats.totalAttempts === 'number' && typeof stats.totalCorrect === 'number' && typeof stats.maxStreak === 'number'
  );
};

const migrateLegacyStats = (value: unknown): PracticeStats | null => {
  if (isPracticeStats(value)) {
    // Stats saved before per-tense / per-verb tracking have no tallies yet.
    return {
      ...value,
      byTense: Object.fromEntries(
        Object.entries(readTallies(value.byTense)).filter(([tense]) => isTenseId(tense)),
      ) as PracticeStats['byTense'],
      byVerb: readTallies(value.byVerb),
    };
  }

  if (isLegacyCumulative(value)) {
    return {
      ...emptyStats(),
      totalAnswered: value.totalAttempts,
      totalCorrect: value.totalCorrect,
      bestStreak: value.maxStreak,
    };
  }

  return null;
};

const isStoredMiss = (value: unknown): value is StoredMiss => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const miss = value as Record<string, unknown>;
  return (
    isLanguageId(miss.languageId) &&
    typeof miss.verbInfinitive === 'string' &&
    isTenseId(miss.tense) &&
    isPronoun(miss.pronoun) &&
    typeof miss.answer === 'string' &&
    typeof miss.missedAt === 'number' &&
    isReviewBox(miss.box) &&
    typeof miss.dueAt === 'number'
  );
};

const normalizeMiss = (value: unknown): StoredMiss | null => {
  if (isStoredMiss(value)) {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const miss = value as Record<string, unknown>;
  if (!isLanguageId(miss.languageId) || typeof miss.verbInfinitive !== 'string' || !isTenseId(miss.tense) || !isPronoun(miss.pronoun)) {
    return null;
  }

  const missedAt = typeof miss.missedAt === 'number' ? miss.missedAt : Date.now();

  // Misses saved before spaced repetition start in box 1 and are due right away.
  return {
    languageId: miss.languageId,
    verbInfinitive: miss.verbInfinitive,
    tense: miss.tense,
    pronoun: miss.pronoun,
    answer: typeof miss.answer === 'string' ? miss.answer : '',
    missedAt,
    box: isReviewBox(miss.box) ? miss.box : 1,
    dueAt: typeof miss.dueAt === 'number' ? miss.dueAt : missedAt,
  };
};

export const readLanguageId = (): LanguageId => {
  const primary = readString<LanguageId>(storageKeys.languageId, 'spanish', languageIds);
  if (safeGet(storageKeys.languageId)) {
    return primary;
  }

  return readString<LanguageId>(legacyKeys.languageId, 'spanish', languageIds);
};

export const writeLanguageId = (languageId: LanguageId) => {
  safeSet(storageKeys.languageId, languageId);
};

export const readPracticeTense = (): PracticeTenseId => {
  if (safeGet(storageKeys.practiceTense)) {
    return readString<PracticeTenseId>(storageKeys.practiceTense, 'present', practiceTenses);
  }

  return readString<PracticeTenseId>(legacyKeys.practiceTense, 'present', practiceTenses);
};

export const writePracticeTense = (practiceTense: PracticeTenseId) => {
  safeSet(storageKeys.practiceTense, practiceTense);
};

export const readActiveView = (): AppView => {
  if (safeGet(storageKeys.activeView)) {
    return readString<AppView>(storageKeys.activeView, 'practice', appViews);
  }

  return readString<AppView>(legacyKeys.activeView, 'practice', appViews);
};

export const writeActiveView = (activeView: AppView) => {
  safeSet(storageKeys.activeView, activeView);
};

export const readTimerEnabled = (): boolean => {
  const primary = safeGet(storageKeys.timerEnabled);
  if (primary !== null) {
    return primary !== 'false';
  }

  const legacy = safeGet(legacyKeys.timerEnabled);
  if (legacy !== null) {
    return legacy !== 'false';
  }

  return false;
};

export const writeTimerEnabled = (enabled: boolean) => {
  safeSet(storageKeys.timerEnabled, String(enabled));
};

export const readTranslationLanguage = (): TranslationLanguage => {
  const stored = safeGet(storageKeys.translationLanguage);
  return isTranslationLanguage(stored) ? stored : 'zh';
};

export const writeTranslationLanguage = (translationLanguage: TranslationLanguage) => {
  safeSet(storageKeys.translationLanguage, translationLanguage);
};

export const readIncludeVosotros = (): boolean => safeGet(storageKeys.includeVosotros) !== 'false';

export const writeIncludeVosotros = (include: boolean) => {
  safeSet(storageKeys.includeVosotros, String(include));
};

export const readStoredMisses = (): StoredMiss[] => {
  // An empty primary list is a real state (all misses cleared); only fall back when the key was never written.
  const source =
    safeGet(storageKeys.misses) !== null
      ? readJson<unknown[]>(storageKeys.misses, [])
      : readJson<unknown[]>(legacyKeys.misses, []);

  if (!Array.isArray(source)) {
    return [];
  }

  return capMissesPerLanguage(source.map(normalizeMiss).filter((miss): miss is StoredMiss => Boolean(miss)));
};

export const writeStoredMisses = (misses: StoredMiss[]) => {
  writeJson(storageKeys.misses, capMissesPerLanguage(misses));
};

export const readPracticeStatsByLanguage = (): PracticeStatsByLanguage => {
  const empty: PracticeStatsByLanguage = Object.fromEntries(languages.map((language) => [language.id, emptyStats()]));

  const parseBag = (raw: unknown): PracticeStatsByLanguage => {
    if (!raw || typeof raw !== 'object') {
      return { ...empty };
    }

    const next = { ...empty };
    const record = raw as Record<string, unknown>;

    for (const language of languages) {
      const migrated = migrateLegacyStats(record[language.id]);
      if (migrated) {
        next[language.id] = migrated;
      }
    }

    return next;
  };

  const primary = safeGet(storageKeys.statsByLanguage);
  if (primary) {
    try {
      return parseBag(JSON.parse(primary));
    } catch {
      // fall through
    }
  }

  const legacyByLanguage = safeGet(legacyKeys.statsByLanguage);
  if (legacyByLanguage) {
    try {
      return parseBag(JSON.parse(legacyByLanguage));
    } catch {
      // fall through
    }
  }

  // Older single-stats blob → map onto default language.
  const legacyGlobal = safeGet(legacyKeys.stats);
  if (legacyGlobal) {
    try {
      const migrated = migrateLegacyStats(JSON.parse(legacyGlobal));
      if (migrated) {
        return { ...empty, spanish: migrated };
      }
    } catch {
      // ignore
    }
  }

  return empty;
};

export const writePracticeStatsByLanguage = (stats: PracticeStatsByLanguage) => {
  writeJson(storageKeys.statsByLanguage, stats);
};

export const readPracticeStatsForLanguage = (languageId: LanguageId): PracticeStats =>
  readPracticeStatsByLanguage()[languageId] ?? emptyStats();
