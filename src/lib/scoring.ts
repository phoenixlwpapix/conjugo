import type { TenseId } from '../data/verbs';
import type { AnswerTally, PracticeStats } from '../types';

export const getAccuracy = (correct: number, total: number) => (total === 0 ? 0 : Math.round((correct / total) * 100));

/** Local calendar day key (YYYY-MM-DD), avoids UTC midnight off-by-one. */
export const getTodayKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const emptyStats = (): PracticeStats => ({
  totalAnswered: 0,
  totalCorrect: 0,
  bestStreak: 0,
  days: {},
  byTense: {},
  byVerb: {},
});

export const getDailyStats = (stats: PracticeStats, dayKey = getTodayKey()) =>
  stats.days[dayKey] ?? {
    answered: 0,
    correct: 0,
    sessions: 0,
  };

export const getSevenDayTrend = (stats: PracticeStats, today = new Date()) =>
  Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - index));
    const key = getTodayKey(date);
    const daily = getDailyStats(stats, key);

    return {
      key,
      label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3),
      accuracy: getAccuracy(daily.correct, daily.answered),
      answered: daily.answered,
    };
  });

export type RecordedAnswer = {
  correct: boolean;
  streak: number;
  completedSet: boolean;
  tense: TenseId;
  verbInfinitive: string;
};

const addToTally = (tally: AnswerTally | undefined, correct: boolean): AnswerTally => ({
  answered: (tally?.answered ?? 0) + 1,
  correct: (tally?.correct ?? 0) + (correct ? 1 : 0),
});

export const recordAnswer = (current: PracticeStats, answer: RecordedAnswer, dayKey = getTodayKey()): PracticeStats => {
  const today = getDailyStats(current, dayKey);

  return {
    totalAnswered: current.totalAnswered + 1,
    totalCorrect: current.totalCorrect + (answer.correct ? 1 : 0),
    bestStreak: Math.max(current.bestStreak, answer.streak),
    days: {
      ...current.days,
      [dayKey]: {
        answered: today.answered + 1,
        correct: today.correct + (answer.correct ? 1 : 0),
        sessions: today.sessions + (answer.completedSet ? 1 : 0),
      },
    },
    byTense: { ...current.byTense, [answer.tense]: addToTally(current.byTense[answer.tense], answer.correct) },
    byVerb: { ...current.byVerb, [answer.verbInfinitive]: addToTally(current.byVerb[answer.verbInfinitive], answer.correct) },
  };
};

/** Laplace-smoothed accuracy, so 0/1 doesn't outrank 3/10 as "weakest". */
const smoothedAccuracy = ({ answered, correct }: AnswerTally) => (correct + 1) / (answered + 2);

export type TenseBreakdown = AnswerTally & { tense: TenseId; accuracy: number };

export const getTenseBreakdown = (stats: PracticeStats, tenses: TenseId[]): TenseBreakdown[] =>
  tenses.map((tense) => {
    const tally = stats.byTense[tense] ?? { answered: 0, correct: 0 };
    return { tense, ...tally, accuracy: getAccuracy(tally.correct, tally.answered) };
  });

export const minAnsweredForWeakSpot = 5;

export const getWeakestTense = (breakdown: TenseBreakdown[], minAnswered = minAnsweredForWeakSpot) =>
  breakdown
    .filter((item) => item.answered >= minAnswered && item.correct < item.answered)
    .sort((first, second) => smoothedAccuracy(first) - smoothedAccuracy(second))[0];

export type VerbBreakdown = AnswerTally & { verbInfinitive: string; accuracy: number };

export const getHardestVerbs = (
  stats: PracticeStats,
  knownVerbs: string[],
  limit = 5,
  minAnswered = 3,
): VerbBreakdown[] => {
  const known = new Set(knownVerbs);

  return Object.entries(stats.byVerb)
    .filter(([verbInfinitive, tally]) => known.has(verbInfinitive) && tally.answered >= minAnswered && tally.correct < tally.answered)
    .map(([verbInfinitive, tally]) => ({ verbInfinitive, ...tally, accuracy: getAccuracy(tally.correct, tally.answered) }))
    .sort((first, second) => smoothedAccuracy(first) - smoothedAccuracy(second) || second.answered - first.answered)
    .slice(0, limit);
};
