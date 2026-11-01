import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readPracticeTense, writePracticeTense, writePracticeStatsByLanguage, readPracticeStatsByLanguage, readStoredMisses, readTimerEnabled, readTranslationLanguage, writeStoredMisses } from '../storage';

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

  it('persists imperative selection and command review items', () => {
    writePracticeTense('imperativeNegative');
    expect(readPracticeTense()).toBe('commands');
    const miss = { ...legacyMiss, tense: 'imperativeNegative' as const, pronoun: 'you' as const, answer: 'no seas', box: 1 as const, dueAt: 1, languageId: 'spanish' as const };
    writeStoredMisses([miss]);
    expect(readStoredMisses()).toEqual([miss]);
  });

  it('persists the unified command entry and migrates legacy saved selections', () => {
    writePracticeTense('commands');
    expect(readPracticeTense()).toBe('commands');
    store.delete('conjugo.practiceTense');
    store.set('conjugo_practiceTense', 'imperative');
    expect(readPracticeTense()).toBe('commands');
  });

  it('preserves imperfect subjunctive selection, misses, and statistics across reloads', () => {
    writePracticeTense('imperfectSubjunctive');
    expect(readPracticeTense()).toBe('imperfectSubjunctive');
    const miss = { ...legacyMiss, languageId: 'spanish' as const, verbInfinitive: 'venir', tense: 'imperfectSubjunctive' as const, pronoun: 'you' as const, answer: 'vinieras', box: 1 as const, dueAt: 1 };
    writeStoredMisses([miss]);
    expect(readStoredMisses()).toEqual([miss]);
    const stats = readPracticeStatsByLanguage();
    stats.spanish!.byTense.imperfectSubjunctive = { answered: 3, correct: 2 };
    writePracticeStatsByLanguage(stats);
    expect(readPracticeStatsByLanguage().spanish!.byTense.imperfectSubjunctive).toEqual({ answered: 3, correct: 2 });
  });

  it('defaults the timer to off', () => {
    expect(readTimerEnabled()).toBe(false);
    store.set('conjugo.timerEnabled', 'true');
    expect(readTimerEnabled()).toBe(true);
  });

  it('preserves the existing translation preference as the global interface locale', () => {
    vi.stubGlobal('navigator', { language: 'en-US' });
    store.set('conjugo.translationLanguage', 'zh');
    expect(readTranslationLanguage()).toBe('zh');
    vi.stubGlobal('navigator', { language: 'zh-CN' });
    store.set('conjugo.translationLanguage', 'en');
    expect(readTranslationLanguage()).toBe('en');
  });

  it('uses the browser language only when there is no valid saved preference', () => {
    vi.stubGlobal('navigator', { language: 'zh-TW' });
    expect(readTranslationLanguage()).toBe('zh');
    store.set('conjugo.translationLanguage', 'invalid');
    vi.stubGlobal('navigator', { language: 'fr-FR' });
    expect(readTranslationLanguage()).toBe('en');
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
