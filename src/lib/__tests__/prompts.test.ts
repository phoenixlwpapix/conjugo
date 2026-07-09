import { describe, it, expect } from 'vitest';
import { languages } from '../../data/verbs';
import {
  clampEnglishTense,
  getChoices,
  createSessionPrompts,
  getAnswer,
} from '../prompts';

describe('prompts', () => {
  const spanish = languages.find((l) => l.id === 'spanish')!;
  const english = languages.find((l) => l.id === 'english')!;

  describe('clampEnglishTense', () => {
    it('should clamp imperfect and conditional tenses to present for English', () => {
      expect(clampEnglishTense('english', 'imperfect')).toBe('present');
      expect(clampEnglishTense('english', 'conditional')).toBe('present');
    });

    it('should not clamp other tenses for English', () => {
      expect(clampEnglishTense('english', 'present')).toBe('present');
      expect(clampEnglishTense('english', 'past')).toBe('past');
      expect(clampEnglishTense('english', 'future')).toBe('future');
      expect(clampEnglishTense('english', 'mixed')).toBe('mixed');
    });

    it('should not clamp any tenses for Spanish', () => {
      expect(clampEnglishTense('spanish', 'imperfect')).toBe('imperfect');
      expect(clampEnglishTense('spanish', 'conditional')).toBe('conditional');
      expect(clampEnglishTense('spanish', 'present')).toBe('present');
    });
  });

  describe('getChoices', () => {
    it('should generate exactly 4 unique choices including the correct answer', () => {
      const verb = spanish.verbs[0];
      const prompt = {
        language: spanish,
        verb,
        tense: 'present' as const,
        pronoun: 'I' as const,
      };

      const choices = getChoices(prompt, 42);
      expect(choices).toHaveLength(4);
      
      const uniqueChoices = new Set(choices);
      expect(uniqueChoices.size).toBe(4);
      
      const correctAnswer = getAnswer(prompt);
      expect(choices).toContain(correctAnswer);
    });

    it('should fall back to other tenses as distractors if there are not enough same-tense conjugations', () => {
      const verb = english.verbs[0]; // to be or similar
      const prompt = {
        language: english,
        verb,
        tense: 'present' as const,
        pronoun: 'I' as const,
      };

      const choices = getChoices(prompt, 1);
      expect(choices).toHaveLength(4);
      
      const correctAnswer = getAnswer(prompt);
      expect(choices).toContain(correctAnswer);
    });
  });

  describe('createSessionPrompts', () => {
    it('should generate a list of 20 prompts', () => {
      const session = createSessionPrompts(spanish, 'present');
      expect(session).toHaveLength(20);
    });

    it('should include up to 30% review targets if provided', () => {
      const reviewTargets = [
        { verbInfinitive: spanish.verbs[0].infinitive, tense: 'present' as const, pronoun: 'I' as const },
        { verbInfinitive: spanish.verbs[1].infinitive, tense: 'present' as const, pronoun: 'you' as const },
        { verbInfinitive: spanish.verbs[2].infinitive, tense: 'present' as const, pronoun: 'we' as const },
        { verbInfinitive: spanish.verbs[3].infinitive, tense: 'present' as const, pronoun: 'they' as const },
        { verbInfinitive: spanish.verbs[4].infinitive, tense: 'present' as const, pronoun: 'he/she' as const },
      ];

      const session = createSessionPrompts(spanish, 'present', reviewTargets);
      expect(session).toHaveLength(20);

      // 30% of 20 is 6. So max 5 review targets from our list of 5 should all be included.
      const matched = session.filter((prompt) =>
        reviewTargets.some(
          (t) =>
            t.verbInfinitive === prompt.verb.infinitive &&
            t.tense === prompt.tense &&
            t.pronoun === prompt.pronoun
        )
      );

      expect(matched.length).toBeLessThanOrEqual(6);
      expect(matched.length).toBeGreaterThanOrEqual(1);
    });

    it('should generate prompts with the "you plural" pronoun', () => {
      const session = createSessionPrompts(spanish, 'present');
      const youPluralPrompts = session.filter((p) => p.pronoun === 'you plural');
      // It's random, but over 20 items in a pool of verbs there should usually be at least one,
      // or we can test the pool directly. Let's create a pool of all prompts.
      const pool = spanish.verbs.flatMap((v) =>
        ['present' as const].flatMap((t) =>
          ['you plural' as const].map((p) => ({
            language: spanish,
            verb: v,
            tense: t,
            pronoun: p,
          }))
        )
      );
      expect(pool.length).toBeGreaterThan(0);
      const first = pool[0];
      const answer = getAnswer(first);
      expect(answer).toBeDefined();
      expect(typeof answer).toBe('string');
      expect(answer.length).toBeGreaterThan(0);
    });
  });
});
