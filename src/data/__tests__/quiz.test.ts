import { describe, expect, it } from 'vitest';
import { createQuizBank, createQuizQuestions, quizBank } from '../quiz';
import { getLanguageTenses, languages } from '../verbs';

describe('quiz bank', () => {
  it('has twenty distinct complete sentences for each supported language and tense', () => {
    for (const seeds of Object.values(quizBank)) {
      expect(seeds).toHaveLength(20);
      expect(new Set(seeds.map((seed) => seed.text.spanish)).size).toBe(20);
    }
    for (const language of languages) {
      for (const { id } of getLanguageTenses(language.id)) {
        const bank = createQuizBank(language, id);
        expect(bank).toHaveLength(20);
        expect(new Set(bank.map((question) => question.sentence)).size).toBe(20);
        expect(bank.every((question) => question.sentence.includes('____') && question.translation.endsWith('。'))).toBe(true);
        expect(bank.every((question) => question.explanation.includes(question.answer))).toBe(true);
        expect(bank.every((question) => question.choices.includes(question.answer) && question.choices.every((choice) => getLanguageTenses(language.id).some(({ id: choiceTense }) => question.verb.forms[choiceTense][question.pronoun] === choice)))).toBe(true);
      }
    }
  });

  it('uses the supplied subjunctive example as a complete sentence with a contextual explanation', () => {
    const spanish = languages.find((language) => language.id === 'spanish');
    if (!spanish) throw new Error('Spanish data missing');
    const question = createQuizBank(spanish, 'subjunctive')[0];
    expect(question.sentence).toBe('Me alegra que Ana ____ cerca de aquí.');
    expect(question.answer).toBe('viva');
    expect(question.explanation).toContain('情感反应');
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
