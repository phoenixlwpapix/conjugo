import { describe, expect, it } from 'vitest';
import { createQuizQuestions, quizBank } from '../quiz';
import { getLanguageTenses, languages } from '../verbs';

describe('quiz bank', () => {
  it('has twenty distinct contexts for each tense', () => {
    for (const seeds of Object.values(quizBank)) {
      expect(seeds).toHaveLength(20);
      expect(new Set(seeds.map((seed) => seed.situation)).size).toBe(20);
    }
  });

  it('builds valid ten-question sets for each language and available tense', () => {
    for (const language of languages) {
      for (const { id } of getLanguageTenses(language.id)) {
        const questions = createQuizQuestions(language, id);
        expect(questions).toHaveLength(10);
        expect(new Set(questions.map((question) => question.id)).size).toBe(10);
        for (const question of questions) {
          expect(question.tense).toBe(id);
          expect(question.choices).toContain(question.answer);
          expect(new Set(question.choices).size).toBe(question.choices.length);
          expect(question.answer).toBe(question.verb.forms[id][question.pronoun]);
          expect(question.choices.every((choice) => getLanguageTenses(language.id).some(({ id: choiceTense }) => question.verb.forms[choiceTense][question.pronoun] === choice))).toBe(true);
          expect(question.explanation).toContain(question.answer);
        }
      }
      const mixed = createQuizQuestions(language, 'mixed');
      expect(mixed).toHaveLength(10);
      expect(new Set(mixed.map((question) => question.tense)).size).toBe(getLanguageTenses(language.id).length);
    }
  });
});
