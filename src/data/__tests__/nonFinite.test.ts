import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { ConjugationTable } from '../../components/WordBook/ConjugationPanel';
import { getReviewTargets, upsertMiss } from '../../lib/misses';
import { createMissSessionPrompts, createPromptPool, createSessionPrompts, getAnswer, getChoices, getPracticeTenses, getPronounLabel } from '../../lib/prompts';
import { gradeTypedAnswer } from '../../lib/typing';
import { createQuizBank, createQuizQuestions } from '../quiz';
import { languages } from '../verbs';

describe('non-finite forms', () => {
  it.each(languages)('connects every $id verb to both forms and their drills', (language) => {
    const forms = getPracticeTenses('nonFinite', language.id);
    const prompts = createPromptPool(language, 'nonFinite');
    expect(forms).toHaveLength(2);
    expect(prompts).toHaveLength(language.verbs.length * 2);
    expect(new Set(prompts.map(({ verb, tense }) => `${verb.infinitive}:${tense}`)).size).toBe(prompts.length);

    for (const prompt of prompts) {
      expect(getPronounLabel(prompt)).toBe('');
      expect(getAnswer(prompt)).toBeTruthy();
      const choices = getChoices(prompt, 9);
      expect(new Set(choices).size).toBe(4);
      expect(choices).toContain(getAnswer(prompt));
    }
    const session = createSessionPrompts(language, 'nonFinite', [], { limit: 10 });
    expect(session.filter(({ tense }) => tense === 'pastParticiple')).toHaveLength(5);

    for (const form of forms) {
      const bank = createQuizBank(language, form);
      expect(bank.length).toBeGreaterThanOrEqual(10);
      expect(new Set(bank.map(({ sentence }) => sentence)).size).toBe(bank.length);
      for (const question of bank) {
        expect(question.sentence.split('____')).toHaveLength(2);
        expect(question.translation.en).not.toContain('____');
        expect(question.pronounLabel).toBe('');
        expect(question.choices).toContain(question.answer);
        expect(new Set(question.choices).size).toBe(4);
      }
    }
    const quiz = createQuizQuestions(language, 'nonFinite');
    expect(quiz).toHaveLength(10);
    expect(quiz.filter(({ tense }) => tense === 'pastParticiple')).toHaveLength(5);

    const original = prompts[0];
    const review = createMissSessionPrompts(language, getReviewTargets(language, 'nonFinite', upsertMiss([], original)));
    expect(review).toEqual([original]);
  });

  it('accepts valid spelling variants and tests mistakes on the appropriate form', () => {
    const english = languages.find(({ id }) => id === 'english')!;
    const [travel] = createPromptPool(english, 'presentParticiple', new Set(['to travel']));
    expect(getAnswer(travel)).toBe('traveling');
    expect(gradeTypedAnswer('travelling', travel)).toBe('correct');
    expect(getChoices(travel, 0)).not.toContain('travelling');

    const [run] = createPromptPool(english, 'presentParticiple', new Set(['to run']));
    expect(getChoices(run, 0)).toEqual(expect.arrayContaining(['running', 'runing']));
    const draw = createQuizBank(english, 'pastParticiple').find(({ verb }) => verb.infinitive === 'to draw')!;
    expect(draw.choices).toEqual(expect.arrayContaining(['drew', 'drawn', 'drawed']));
  });

  it('respects the Spanish preference in sentences that use a vosotros auxiliary', () => {
    const spanish = languages.find(({ id }) => id === 'spanish')!;
    expect(createQuizBank(spanish, 'pastParticiple').some(({ sentence }) => sentence.includes('Habéis'))).toBe(true);
    expect(createQuizBank({ ...spanish, excludedPronouns: ['you plural'] }, 'pastParticiple')
      .some(({ sentence }) => sentence.includes('Habéis'))).toBe(false);
  });

  it('shows Italian present participles in the reference and uses risposto consistently', () => {
    const italian = languages.find(({ id }) => id === 'italian')!;
    const verb = italian.verbs.find(({ infinitive }) => infinitive === 'rispondere')!;
    expect(verb.forms.past.I).toBe('ho risposto');
    const html = renderToStaticMarkup(createElement(ConjugationTable, { activeLanguage: italian, selectedVerb: verb, bookTense: 'pastParticiple' }));
    expect(html).toContain('<dl');
    expect(html).toContain('risposto');
    expect(html).toContain('rispondendo');
    expect(html).toContain('rispondente');
    expect(createQuizBank(italian, 'presentParticiple')).toEqual([]);
  });
});
