import { describe, expect, it } from 'vitest';
import { languages, getLanguageTenses, pronouns, type Pronoun } from '../verbs';
import { createQuizBank, createQuizQuestions } from '../quiz';
import { createPromptPool, createSessionPrompts, createMissSessionPrompts, getChoices, getPronounLabel, getPracticeTenses, clampEnglishTense } from '../../lib/prompts';
import { getReviewTargets, upsertMiss } from '../../lib/misses';

const spanish = languages.find((language) => language.id === 'spanish')!;
const tense = 'imperfectSubjunctive' as const;

describe('Spanish imperfect subjunctive', () => {
  it('stores full -ra and -se paradigms with nosotros accents', () => {
    const hablar = spanish.verbs.find((verb) => verb.infinitive === 'hablar')!;
    const venir = spanish.verbs.find((verb) => verb.infinitive === 'venir')!;
    expect(pronouns.map((person) => hablar.forms[tense][person])).toEqual(['hablara', 'hablaras', 'hablara', 'habláramos', 'hablarais', 'hablaran']);
    expect(pronouns.map((person) => hablar.imperfectSubjunctiveSe?.[person])).toEqual(['hablase', 'hablases', 'hablase', 'hablásemos', 'hablaseis', 'hablasen']);
    expect(pronouns.map((person) => venir.forms[tense][person])).toEqual(['viniera', 'vinieras', 'viniera', 'viniéramos', 'vinierais', 'vinieran']);
    expect(pronouns.map((person) => venir.imperfectSubjunctiveSe?.[person])).toEqual(['viniese', 'vinieses', 'viniese', 'viniésemos', 'vinieseis', 'viniesen']);
  });

  const irregulars: [string, Pronoun, string, string][] = [
    ['ser', 'I', 'fuera', 'fuese'], ['ir', 'we', 'fuéramos', 'fuésemos'],
    ['hacer', 'you', 'hicieras', 'hicieses'], ['decir', 'they', 'dijeran', 'dijesen'],
    ['traer', 'we', 'trajéramos', 'trajésemos'], ['tener', 'you plural', 'tuvierais', 'tuvieseis'],
    ['estar', 'we', 'estuviéramos', 'estuviésemos'], ['saber', 'I', 'supiera', 'supiese'],
    ['haber', 'I', 'hubiera', 'hubiese'], ['dar', 'we', 'diéramos', 'diésemos'],
    ['leer', 'I', 'leyera', 'leyese'], ['oír', 'you', 'oyeras', 'oyeses'],
    ['pedir', 'we', 'pidiéramos', 'pidiésemos'], ['dormir', 'we', 'durmiéramos', 'durmiésemos'],
  ];
  it.each(irregulars)('preserves the irregular stem of %s (%s)', (infinitive, person, ra, se) => {
    const verb = spanish.verbs.find((entry) => entry.infinitive === infinitive)!;
    expect(verb.forms[tense][person]).toBe(ra);
    expect(verb.imperfectSubjunctiveSe?.[person]).toBe(se);
  });

  it('supports all 100 Spanish verbs and uses only -ra forms as targets and choices', () => {
    const pool = createPromptPool(spanish, tense);
    expect(pool).toHaveLength(600);
    for (const prompt of pool) {
      expect(prompt.verb.forms[tense][prompt.pronoun]).toBeTruthy();
      const variants = Object.values(prompt.verb.imperfectSubjunctiveSe ?? {});
      expect(variants).toHaveLength(6);
      const choices = getChoices(prompt, 2);
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices.every((choice) => Boolean(choice) && !variants.includes(choice))).toBe(true);
      expect(getPronounLabel(prompt)).toMatch(/^que /);
    }
    expect(createSessionPrompts(spanish, tense)).toHaveLength(20);
    expect(getPracticeTenses('mixed', 'spanish')).toContain(tense);
    expect(createQuizQuestions(spanish, 'mixed').some((question) => question.tense === tense)).toBe(true);
  });

  it('offers the tense only for Spanish and clamps it when switching languages', () => {
    for (const language of languages.filter((entry) => entry.id !== 'spanish')) {
      expect(getLanguageTenses(language.id).some(({ id }) => id === tense)).toBe(false);
      expect(clampEnglishTense(language.id, tense)).toBe('present');
      expect(createPromptPool(language, tense)).toEqual([]);
      expect(createQuizBank(language, tense)).toEqual([]);
    }
  });

  it('keeps past requests and hypothetical future events distinct from past completed actions', () => {
    const bank = createQuizBank(spanish, tense);
    expect(bank).toHaveLength(40);
    const request = bank.find((question) => question.sentence.includes('Ana te pidió'))!;
    expect(request.answer).toBe('vinieras');
    expect(request.translation.en).toBe('Yesterday, Ana asked you to come to her house today.');
    expect(request.explanation.zh).toContain('并不一定发生在过去');
    const future = bank.find((question) => question.sentence.includes('mis amigos'))!;
    expect(future.answer).toBe('vinieran');
    expect(future.translation.en).toBe('If my friends came tomorrow, we would make dinner together.');
    for (const question of bank) {
      expect(question.choices).toContain(question.answer);
      expect(question.choices.some((choice) => Object.values(question.verb.imperfectSubjunctiveSe ?? {}).includes(choice))).toBe(false);
    }
  });

  it('honors vosotros preferences and keeps -ra answers in review', () => {
    const language = { ...spanish, excludedPronouns: ['you plural' as const] };
    const pool = createPromptPool(language, tense);
    expect(pool).toHaveLength(500);
    expect(createQuizBank(language, tense).some((question) => question.pronoun === 'you plural')).toBe(false);
    const prompt = pool.find((entry) => entry.verb.infinitive === 'venir' && entry.pronoun === 'you')!;
    const misses = upsertMiss([], prompt);
    expect(misses[0].answer).toBe('vinieras');
    const review = createMissSessionPrompts(language, getReviewTargets(language, 'mixed', misses));
    expect(review).toHaveLength(1);
    expect(review[0].tense).toBe(tense);
    expect(review[0].verb.forms[tense][review[0].pronoun]).toBe('vinieras');
  });
});
