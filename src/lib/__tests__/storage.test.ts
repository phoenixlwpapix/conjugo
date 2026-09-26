import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readPracticeStatsByLanguage, readStoredMisses, readTimerEnabled, writeStoredMisses } from '../storage';

const legacyMiss = {
  languageId: 'spanish',
  verbInfinitive: 'ser',
  tense: 'present',
  pronoun: 'I',
  answer: 'soy',
  missedAt: 1,
};

describe('storage', () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = new Map();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('migrates legacy misses when the primary key was never written', () => {
    store.set('conjugo_missed_prompts', JSON.stringify([legacyMiss]));
    expect(readStoredMisses()).toHaveLength(1);
  });

  it('does not resurrect legacy misses after all misses were cleared', () => {
    store.set('conjugo_missed_prompts', JSON.stringify([legacyMiss]));
    writeStoredMisses([]);
    expect(readStoredMisses()).toHaveLength(0);
  });

  it('defaults the timer to off', () => {
    expect(readTimerEnabled()).toBe(false);
    store.set('conjugo.timerEnabled', 'true');
    expect(readTimerEnabled()).toBe(true);
  });
  it('puts misses saved before spaced repetition into box 1, due now', () => {
    store.set('conjugo.misses', JSON.stringify([legacyMiss]));
    expect(readStoredMisses()[0]).toMatchObject({ box: 1, dueAt: legacyMiss.missedAt });
  });

  it('adds empty per-tense and per-verb tallies to older stats', () => {
    store.set(
      'conjugo.statsByLanguage',
      JSON.stringify({ spanish: { totalAnswered: 3, totalCorrect: 2, bestStreak: 2, days: {} } }),
    );
    expect(readPracticeStatsByLanguage().spanish).toMatchObject({ totalAnswered: 3, byTense: {}, byVerb: {} });
  });
});
