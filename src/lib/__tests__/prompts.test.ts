import { afterEach, describe, expect, it, vi } from 'vitest';
import { languages } from '../../data/verbs';
import {
  clampEnglishTense,
  createPromptPool,
  getChoices,
  createMissSessionPrompts,
  createSessionPrompts,
  getAnswer,
  getPronounLabel,
} from '../prompts';

describe('prompts', () => {
  const spanish = languages.find((l) => l.id === 'spanish')!;
  const english = languages.find((l) => l.id === 'english')!;

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
      const pool = createPromptPool(spanish, 'present');
      const first = pool.find((prompt) => prompt.pronoun === 'you plural');

      expect(first).toBeDefined();
      const answer = getAnswer(first!);
      expect(answer).toBeDefined();
      expect(typeof answer).toBe('string');
      expect(answer.length).toBeGreaterThan(0);
    });

    it('should expand Spanish abbreviated second-person plural labels', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);

      const prompt = createPromptPool(spanish, 'present').find((item) => item.pronoun === 'you plural');

      expect(prompt).toBeDefined();
      expect(getPronounLabel(prompt!)).toBe('vosotras');
    });
  });

  describe('createMissSessionPrompts', () => {
    it('should return an empty session when there are no review targets', () => {
      const session = createMissSessionPrompts(spanish, []);
      expect(session).toHaveLength(0);
    });

    it('should build a session solely from review targets without padding', () => {
      const reviewTargets = [
        { verbInfinitive: spanish.verbs[0].infinitive, tense: 'present' as const, pronoun: 'I' as const },
        { verbInfinitive: spanish.verbs[1].infinitive, tense: 'past' as const, pronoun: 'you' as const },
        { verbInfinitive: spanish.verbs[2].infinitive, tense: 'future' as const, pronoun: 'they' as const },
      ];

      const session = createMissSessionPrompts(spanish, reviewTargets);
      expect(session).toHaveLength(reviewTargets.length);

      for (const prompt of session) {
        const matched = reviewTargets.some(
          (target) =>
            target.verbInfinitive === prompt.verb.infinitive &&
            target.tense === prompt.tense &&
            target.pronoun === prompt.pronoun,
        );
        expect(matched).toBe(true);
      }
    });

    it('should cap the session at the normal session target', () => {
      const reviewTargets = Array.from({ length: 30 }, (_, index) => ({
        verbInfinitive: spanish.verbs[index % spanish.verbs.length].infinitive,
        tense: (['present', 'past', 'future', 'imperfect', 'conditional'] as const)[index % 5],
        pronoun: 'I' as const,
      }));

      const session = createMissSessionPrompts(spanish, reviewTargets);
      expect(session.length).toBeLessThanOrEqual(20);
      expect(session.length).toBeGreaterThan(0);
    });

    it('should skip review targets that do not exist in the language', () => {
      const reviewTargets = [
        { verbInfinitive: 'nonexistent', tense: 'present' as const, pronoun: 'I' as const },
        { verbInfinitive: spanish.verbs[0].infinitive, tense: 'present' as const, pronoun: 'I' as const },
      ];

      const session = createMissSessionPrompts(spanish, reviewTargets);
      expect(session.length).toBeGreaterThan(0);
      expect(session.every((prompt) => prompt.verb.infinitive === spanish.verbs[0].infinitive)).toBe(true);
    });
  });
});
