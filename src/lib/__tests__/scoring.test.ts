import { describe, expect, it } from 'vitest';
import { emptyStats, getHardestVerbs, getTenseBreakdown, getWeakestTense, recordAnswer } from '../scoring';
import type { PracticeStats } from '../../types';

const answer = (stats: PracticeStats, tense: 'present' | 'past', verbInfinitive: string, correct: boolean) =>
  recordAnswer(stats, { correct, streak: 0, completedSet: false, tense, verbInfinitive }, '2026-09-26');

describe('scoring', () => {
  it('tallies answers per tense and per verb', () => {
    let stats = emptyStats();
    stats = answer(stats, 'present', 'ser', true);
    stats = answer(stats, 'present', 'ser', false);
    stats = answer(stats, 'past', 'ir', false);

    expect(stats.byTense.present).toEqual({ answered: 2, correct: 1 });
    expect(stats.byTense.past).toEqual({ answered: 1, correct: 0 });
    expect(stats.byVerb.ser).toEqual({ answered: 2, correct: 1 });
    expect(stats.totalAnswered).toBe(3);
  });

  it('picks the weakest tense only once it has enough answers', () => {
    let stats = emptyStats();
    for (let index = 0; index < 5; index += 1) stats = answer(stats, 'present', 'ser', index > 0);
    for (let index = 0; index < 4; index += 1) stats = answer(stats, 'past', 'ser', false);

    const breakdown = getTenseBreakdown(stats, ['present', 'past']);
    expect(breakdown.map((item) => item.accuracy)).toEqual([80, 0]);
    // Past is worse but only has 4 answers.
    expect(getWeakestTense(breakdown)?.tense).toBe('present');
  });

  it('ranks hardest verbs by smoothed accuracy and ignores unknown or perfect verbs', () => {
    let stats = emptyStats();
    for (let index = 0; index < 10; index += 1) stats = answer(stats, 'present', 'ser', index < 3);
    for (let index = 0; index < 3; index += 1) stats = answer(stats, 'present', 'ir', index < 1);
    for (let index = 0; index < 4; index += 1) stats = answer(stats, 'present', 'dar', true);
    for (let index = 0; index < 4; index += 1) stats = answer(stats, 'present', 'gone', false);

    const hardest = getHardestVerbs(stats, ['ser', 'ir', 'dar']);
    expect(hardest.map((item) => item.verbInfinitive)).toEqual(['ser', 'ir']);
  });
});
