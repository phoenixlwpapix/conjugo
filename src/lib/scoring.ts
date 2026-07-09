import type { PracticeStats } from '../types';

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

export const recordAnswer = (
  current: PracticeStats,
  choiceIsCorrect: boolean,
  nextStreak: number,
  sessionJustCompleted: boolean,
  dayKey = getTodayKey(),
): PracticeStats => {
  const today = getDailyStats(current, dayKey);

  return {
    totalAnswered: current.totalAnswered + 1,
    totalCorrect: current.totalCorrect + (choiceIsCorrect ? 1 : 0),
    bestStreak: Math.max(current.bestStreak, nextStreak),
    days: {
      ...current.days,
      [dayKey]: {
        answered: today.answered + 1,
        correct: today.correct + (choiceIsCorrect ? 1 : 0),
        sessions: today.sessions + (sessionJustCompleted ? 1 : 0),
      },
    },
  };
};
