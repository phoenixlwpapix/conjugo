import type { PracticeStats } from '../types';

export const getAccuracy = (correct: number, total: number) => (total === 0 ? 0 : Math.round((correct / total) * 100));

export const getTodayKey = () => new Date().toISOString().slice(0, 10);

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
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const daily = getDailyStats(stats, key);

    return {
      key,
      label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3),
      accuracy: getAccuracy(daily.correct, daily.answered),
      answered: daily.answered,
    };
  });
