import { getConjugationPronouns, getLanguageTenses, type Language, type PracticeTenseId } from '../data/verbs';
import type { Prompt, ReviewBox, ReviewTarget, StoredMiss } from '../types';
import { getAnswer, getPracticeTenses } from './prompts';

export const getMissKey = (miss: Pick<StoredMiss, 'languageId' | 'verbInfinitive' | 'tense' | 'pronoun'>) =>
  `${miss.languageId}::${miss.verbInfinitive}::${miss.tense}::${miss.pronoun}`;

const getPromptMissKey = (prompt: Prompt) =>
  getMissKey({
    languageId: prompt.language.id,
    verbInfinitive: prompt.verb.infinitive,
    tense: prompt.tense,
    pronoun: prompt.pronoun,
  });

export const reviewBoxCount = 3;

/** Days until a miss promoted into each box is due again (box 1 is due immediately). */
const boxIntervalDays: Record<ReviewBox, number> = { 1: 0, 2: 1, 3: 3 };

const startOfLocalDay = (time: number, dayOffset = 0) => {
  const date = new Date(time);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayOffset).getTime();
};

export const getDueAt = (box: ReviewBox, now = Date.now()) =>
  box === 1 ? now : startOfLocalDay(now, boxIntervalDays[box]);

export const isMissDue = (miss: Pick<StoredMiss, 'dueAt'>, now = Date.now()) => miss.dueAt <= now;

/** Whole calendar days until the miss is due; 0 means due now. */
export const getDaysUntilDue = (miss: Pick<StoredMiss, 'dueAt'>, now = Date.now()) =>
  isMissDue(miss, now) ? 0 : Math.max(1, Math.round((startOfLocalDay(miss.dueAt) - startOfLocalDay(now)) / 86_400_000));

type ReviewTargetOptions = {
  /** Only return misses whose review interval has passed. */
  dueOnly?: boolean;
  now?: number;
};

/** Misses that fit the language and tense range, due ones first. */
export const getReviewTargets = (
  language: Language,
  practiceTense: PracticeTenseId,
  misses: StoredMiss[],
  { dueOnly = true, now = Date.now() }: ReviewTargetOptions = {},
): ReviewTarget[] => {
  const activeTenses = new Set(practiceTense === 'mixed' ? getLanguageTenses(language.id).map(({ id }) => id) : getPracticeTenses(practiceTense, language.id));
  const verbInfinitives = new Set(language.verbs.map((verb) => verb.infinitive));

  const matching = misses.filter(
    (miss) =>
      miss.languageId === language.id &&
      activeTenses.has(miss.tense) &&
      getConjugationPronouns(language, miss.tense, language.verbs.find((verb) => verb.infinitive === miss.verbInfinitive)).includes(miss.pronoun) &&
      verbInfinitives.has(miss.verbInfinitive) &&
      (!dueOnly || isMissDue(miss, now)),
  );
  const ordered = dueOnly
    ? matching
    : [...matching.filter((miss) => isMissDue(miss, now)), ...matching.filter((miss) => !isMissDue(miss, now))];

  return ordered.map((miss) => ({
    verbInfinitive: miss.verbInfinitive,
    tense: miss.tense,
    pronoun: miss.pronoun,
  }));
};

export const missLimitPerLanguage = 40;

/** Keeps the newest misses of each language, so one language can't evict another's review load. */
export const capMissesPerLanguage = (misses: StoredMiss[], limit = missLimitPerLanguage): StoredMiss[] => {
  const counts = new Map<StoredMiss['languageId'], number>();

  return misses.filter((miss) => {
    const count = (counts.get(miss.languageId) ?? 0) + 1;
    counts.set(miss.languageId, count);
    return count <= limit;
  });
};

/** A wrong answer always sends the prompt back to box 1, due immediately. */
export const upsertMiss = (
  current: StoredMiss[],
  attemptPrompt: Prompt,
  limit = missLimitPerLanguage,
  now = Date.now(),
): StoredMiss[] => {
  const miss: StoredMiss = {
    languageId: attemptPrompt.language.id,
    verbInfinitive: attemptPrompt.verb.infinitive,
    tense: attemptPrompt.tense,
    pronoun: attemptPrompt.pronoun,
    answer: getAnswer(attemptPrompt),
    missedAt: now,
    box: 1,
    dueAt: getDueAt(1, now),
  };
  const missKey = getMissKey(miss);

  return capMissesPerLanguage([miss, ...current.filter((item) => getMissKey(item) !== missKey)], limit);
};

/**
 * A correct answer on a due miss moves it up one box; passing the last box retires it.
 * Answers before the miss is due change nothing, so one lucky pick can't clear it.
 */
export const recordCorrectReview = (current: StoredMiss[], attemptPrompt: Prompt, now = Date.now()): StoredMiss[] => {
  const missKey = getPromptMissKey(attemptPrompt);
  const miss = current.find((item) => getMissKey(item) === missKey);

  if (!miss || !isMissDue(miss, now)) {
    return current;
  }

  if (miss.box >= reviewBoxCount) {
    return current.filter((item) => item !== miss);
  }

  const box = (miss.box + 1) as ReviewBox;
  return current.map((item) => (item === miss ? { ...item, box, dueAt: getDueAt(box, now) } : item));
};
