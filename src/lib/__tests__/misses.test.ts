import { describe, it, expect } from 'vitest';
import { languages } from '../../data/verbs';
import {
  upsertMiss,
  recordCorrectReview,
  capMissesPerLanguage,
  getReviewTargets,
  getDaysUntilDue,
} from '../misses';
import type { Prompt, StoredMiss } from '../../types';

const day = 86_400_000;
// Noon, so day offsets never cross a local midnight ambiguously.
const now = new Date(2026, 8, 26, 12).getTime();

describe('misses', () => {
  const spanish = languages.find((l) => l.id === 'spanish')!;
  const verb = spanish.verbs[0];

  const mockPrompt: Prompt = {
    language: spanish,
    verb,
    tense: 'present',
    pronoun: 'I',
  };

  const makeMiss = (overrides: Partial<StoredMiss> = {}): StoredMiss => ({
    languageId: 'spanish',
    verbInfinitive: verb.infinitive,
    tense: 'present',
    pronoun: 'I',
    answer: verb.forms.present.I,
    missedAt: now,
    box: 1,
    dueAt: now,
    ...overrides,
  });

  describe('upsertMiss', () => {
    it('should add a new miss to the top of the array in box 1, due now', () => {
      const updated = upsertMiss([], mockPrompt, 40, now);

      expect(updated).toHaveLength(1);
      expect(updated[0].verbInfinitive).toBe(verb.infinitive);
      expect(updated[0].tense).toBe('present');
      expect(updated[0].pronoun).toBe('I');
      expect(updated[0].answer).toBe(verb.forms.present.I);
      expect(updated[0].box).toBe(1);
      expect(updated[0].dueAt).toBe(now);
    });

    it('should reset an existing miss back to box 1', () => {
      const updated = upsertMiss([makeMiss({ box: 3, dueAt: now + 3 * day, missedAt: 1000 })], mockPrompt, 40, now);

      expect(updated).toHaveLength(1);
      expect(updated[0].missedAt).toBe(now);
      expect(updated[0].box).toBe(1);
      expect(updated[0].dueAt).toBe(now);
    });

    it('should respect the limit', () => {
      const current = Array.from({ length: 24 }, (_, i) => makeMiss({ verbInfinitive: `verb-${i}` }));

      const updated = upsertMiss(current, mockPrompt, 24);
      expect(updated).toHaveLength(24);
      expect(updated[0].verbInfinitive).toBe(verb.infinitive);
    });

    it('caps each language separately so one language cannot evict another', () => {
      const frenchMiss = makeMiss({ languageId: 'french', verbInfinitive: 'aller', answer: 'vais' });
      const spanishMisses = Array.from({ length: 24 }, (_, i) => makeMiss({ verbInfinitive: `verb-${i}` }));

      const updated = upsertMiss([...spanishMisses, frenchMiss], mockPrompt, 24);
      expect(updated.filter((miss) => miss.languageId === 'spanish')).toHaveLength(24);
      expect(updated).toContainEqual(frenchMiss);
      expect(capMissesPerLanguage(updated, 1)).toHaveLength(2);
    });
  });

  describe('recordCorrectReview', () => {
    it('promotes a due miss one box and schedules it for a later day', () => {
      const [promoted] = recordCorrectReview([makeMiss()], mockPrompt, now);

      expect(promoted.box).toBe(2);
      expect(getDaysUntilDue(promoted, now)).toBe(1);
    });

    it('schedules box 3 three days out', () => {
      const [promoted] = recordCorrectReview([makeMiss({ box: 2 })], mockPrompt, now);

      expect(promoted.box).toBe(3);
      expect(getDaysUntilDue(promoted, now)).toBe(3);
    });

    it('retires a miss that passes its last box', () => {
      expect(recordCorrectReview([makeMiss({ box: 3 })], mockPrompt, now)).toHaveLength(0);
    });

    it('ignores correct answers before the miss is due', () => {
      const current = [makeMiss({ box: 2, dueAt: now + day })];
      expect(recordCorrectReview(current, mockPrompt, now)).toBe(current);
    });

    it('needs three correct answers on separate days to clear a miss', () => {
      let misses = upsertMiss([], mockPrompt, 40, now);
      misses = recordCorrectReview(misses, mockPrompt, now);
      misses = recordCorrectReview(misses, mockPrompt, now + 1000);
      expect(misses[0].box).toBe(2);

      misses = recordCorrectReview(misses, mockPrompt, now + day);
      expect(misses[0].box).toBe(3);

      misses = recordCorrectReview(misses, mockPrompt, now + 4 * day);
      expect(misses).toHaveLength(0);
    });

    it('should not touch unmatched misses', () => {
      const current = [makeMiss({ pronoun: 'you' })];
      expect(recordCorrectReview(current, mockPrompt, now)).toBe(current);
    });
  });

  describe('getReviewTargets', () => {
    const due = makeMiss({ pronoun: 'we' });
    const notDue = makeMiss({ pronoun: 'they', box: 2, dueAt: now + day });
    const vosotros = makeMiss({ pronoun: 'you plural' });

    it('returns only due misses by default', () => {
      const targets = getReviewTargets(spanish, 'present', [notDue, due], { now });
      expect(targets.map((target) => target.pronoun)).toEqual(['we']);
    });

    it('can include not-due misses, due ones first', () => {
      const targets = getReviewTargets(spanish, 'present', [notDue, due], { dueOnly: false, now });
      expect(targets.map((target) => target.pronoun)).toEqual(['we', 'they']);
    });

    it('skips pronouns the learner has hidden', () => {
      const withoutVosotros = { ...spanish, excludedPronouns: ['you plural' as const] };
      expect(getReviewTargets(withoutVosotros, 'present', [vosotros], { now })).toHaveLength(0);
      expect(getReviewTargets(spanish, 'present', [vosotros], { now })).toHaveLength(1);
    });
  });
});
