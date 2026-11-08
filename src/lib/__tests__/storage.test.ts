import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  readActiveView, readFavoriteVerbs, readPracticeQuestionCount, readPracticeStatsByLanguage, readPracticeTense, readQuizQuestionCount,
  readStoredMisses, readTimerEnabled, readTranslationLanguage, writeActiveView, writeFavoriteVerbs,
  writePracticeQuestionCount, writePracticeStatsByLanguage, writePracticeTense, writeQuizQuestionCount, writeStoredMisses,
} from '../storage';

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

  it('preserves French passé simple selection, misses, and statistics across reloads', () => {
    writePracticeTense('passeSimple');
    expect(readPracticeTense()).toBe('passeSimple');
    const miss = { ...legacyMiss, languageId: 'french' as const, verbInfinitive: 'venir', tense: 'passeSimple' as const, pronoun: 'you' as const, answer: 'vins', box: 1 as const, dueAt: 1 };
    writeStoredMisses([miss]);
    expect(readStoredMisses()).toEqual([miss]);
    const stats = readPracticeStatsByLanguage();
    stats.french!.byTense.passeSimple = { answered: 3, correct: 2 };
    stats.french!.quiz.byTense.passeSimple = { answered: 2, correct: 1 };
    writePracticeStatsByLanguage(stats);
    expect(readPracticeStatsByLanguage().french!.byTense.passeSimple).toEqual({ answered: 3, correct: 2 });
    expect(readPracticeStatsByLanguage().french!.quiz.byTense.passeSimple).toEqual({ answered: 2, correct: 1 });
  });

  it('defaults the timer to off', () => {
    expect(readTimerEnabled()).toBe(false);
    store.set('conjugo.timerEnabled', 'true');
    expect(readTimerEnabled()).toBe(true);
  });

  it('persists the settings view and validates the practice question count', () => {
    expect(readPracticeQuestionCount()).toBe(20);
    writeActiveView('settings');
    writePracticeQuestionCount(30);
    expect(readActiveView()).toBe('settings');
    expect(readPracticeQuestionCount()).toBe(30);
    store.set('conjugo.practiceQuestionCount', '99');
    expect(readPracticeQuestionCount()).toBe(20);
  });

  it('stores the quiz question count independently of the existing practice preference', () => {
    store.set('conjugo.practiceQuestionCount', '30');
    expect(readQuizQuestionCount()).toBe(10);
    writeQuizQuestionCount(40);
    expect(readQuizQuestionCount()).toBe(40);
    expect(readPracticeQuestionCount()).toBe(30);
    writePracticeQuestionCount(10);
    expect(readQuizQuestionCount()).toBe(40);
    store.set('conjugo.quizQuestionCount', '99');
    expect(readQuizQuestionCount()).toBe(10);
  });

  it('stores favorites by learning language and ignores invalid or duplicate entries', () => {
    expect(readFavoriteVerbs()).toEqual({});
    writeFavoriteVerbs({ spanish: ['tener'], french: ['être'] });
    expect(readFavoriteVerbs()).toEqual({ spanish: ['tener'], french: ['être'] });
    store.set('conjugo.favoriteVerbs', JSON.stringify({ spanish: ['tener', 'tener', 'être', 4], french: false }));
    expect(readFavoriteVerbs()).toEqual({ spanish: ['tener'] });
    writeFavoriteVerbs({ spanish: [] });
    expect(readFavoriteVerbs()).toEqual({ spanish: [] });
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
