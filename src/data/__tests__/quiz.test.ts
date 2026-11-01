import { isImperative } from '../imperative';
import { describe, expect, it } from 'vitest';
import { createQuizBank, createQuizQuestions } from '../quiz';
import { quizScenes } from '../quizScenes';
import { getLanguagePronouns, getLanguageTenses, isTenseAvailable, languages, type TenseId } from '../verbs';

const spanish = languages.find((language) => language.id === 'spanish');
if (!spanish) throw new Error('Spanish data missing');

describe('authored quiz scenes', () => {
  it('provides twenty complete scenes per tense in its supported languages', () => {
    for (const [tense, scenes] of Object.entries(quizScenes)) {
      expect(scenes).toHaveLength(20);
      for (const language of languages) {
        if (!isTenseAvailable(language.id, tense as TenseId)) continue;
        expect(new Set(scenes.map((scene) => scene.sentence[language.id])).size).toBe(20);
        for (const scene of scenes) {
          expect(scene.sentence[language.id]?.split('____')).toHaveLength(2);
          expect(scene.sentence[language.id]).not.toMatch(/undefined/);
          expect(scene.reason.zh).toBeTruthy();
          expect(scene.reason.en).toBeTruthy();
          expect(scene.zh.endsWith('。')).toBe(true);
        }
      }
    }
  });

  it('keeps the authored scene, verb, subject, and explanation together', () => {
    for (const language of languages) {
      for (const { id } of getLanguageTenses(language.id)) {
        const bank = createQuizBank(language, id);
        expect(bank).toHaveLength(20);
        bank.forEach((question, index) => {
          const scene = quizScenes[id][index];
          expect(question.sentence).toBe(scene.sentence[language.id]);
          expect(question.pronoun).toBe(scene.pronoun);
          expect(question.difficulty).toBe(scene.difficulty);
          expect(question.translation.zh).toBe(scene.zh);
          expect(question.explanation.zh).toContain(scene.reason.zh);
          expect(question.explanation.en).toContain(scene.reason.en);
          expect(question.explanation.zh).toContain(question.answer);
          expect(question.explanation.en).toContain(question.answer);
          expect(question.translation.en).not.toMatch(/____|undefined|\p{Script=Han}/u);
          expect(question.translation.en.endsWith('.')).toBe(true);
          expect(question.explanation.en).not.toMatch(/undefined|\p{Script=Han}/u);
        });
      }
    }
  });

  it('uses a coherent pharmacy trip rather than attaching a generic destination', () => {
    const question = createQuizBank(spanish, 'past').find((entry) => entry.verb.infinitive === 'ir' && entry.pronoun === 'he/she');
    expect(question?.sentence).toBe('Ayer, Alex ____ a la farmacia para comprar una medicina.');
    expect(question?.translation.en).toBe('Yesterday, Alex went to the pharmacy to buy some medicine.');
    expect(question?.answer).toBe('fue');
    expect(question?.explanation.zh).toContain('去药店买药');
  });

  it('translates ongoing past actions and hypothetical results naturally', () => {
    const background = createQuizBank(spanish, 'imperfect').find((entry) => entry.sentence.includes('recepcionista'));
    expect(background?.translation.en).toBe('You were speaking with the receptionist when your phone rang.');
    const conditional = createQuizBank(spanish, 'conditional').find((entry) => entry.verb.infinitive === 'vivir');
    expect(conditional?.translation.en).toBe('If the rent were cheaper, we would live downtown.');
    expect(conditional?.explanation.zh).toContain('低租金');
  });

  it('explains factual emotional subjunctives without calling every clause uncertain', () => {
    const question = createQuizBank(spanish, 'subjunctive').find((entry) => entry.verb.infinitive === 'vivir');
    expect(question?.sentence).toBe('A mis padres les alegra que nosotros ____ cerca de ellos.');
    expect(question?.answer).toBe('vivamos');
    expect(question?.translation.en).toBe('My parents are glad that we live near them.');
    expect(question?.explanation.zh).toContain('住址可以是事实');
    expect(question?.explanation.en).toContain('emotional reaction');
  });

  it('keeps subjunctive English translations grammatical for infinitive and finite clauses', () => {
    const bank = createQuizBank(spanish, 'subjunctive');
    expect(bank.find((entry) => entry.sentence.includes('fiebre'))?.translation.en)
      .toBe('I want Alex to go to the doctor; he has had a fever for three days.');
    expect(bank.find((entry) => entry.verb.infinitive === 'dormir')?.translation.en)
      .toBe('I am surprised that Alex sleeps with so much noise in the street.');
  });

  it('builds unique ten-question rounds with valid, distinct choices', () => {
    for (const language of languages) {
      for (const selected of [...getLanguageTenses(language.id).map(({ id }) => id), 'mixed' as const]) {
        const questions = createQuizQuestions(language, selected);
        expect(questions).toHaveLength(10);
        expect(new Set(questions.map((question) => question.id)).size).toBe(10);
        for (const question of questions) {
          if (selected !== 'mixed') expect(question.tense).toBe(selected);
          expect(question.answer).toBe(question.verb.forms[question.tense][question.pronoun]);
          expect(question.choices).toContain(question.answer);
          expect(question.choices).toHaveLength(4);
          expect(new Set(question.choices).size).toBe(question.choices.length);
          expect(question.choices.every((choice) => Object.values(question.verb.forms).some((forms) => Object.values(forms).includes(choice)))).toBe(true);
        }
        if (selected === 'mixed') expect(new Set(questions.map((question) => question.tense)).size).toBe(getLanguageTenses(language.id).filter(({ id }) => !isImperative(id)).length);
      }
    }
  });

  it('excludes vosotros scenes and forms when the preference is disabled', () => {
    const language = { ...spanish, excludedPronouns: ['you plural' as const] };
    for (const { id } of getLanguageTenses(language.id)) {
      for (const question of createQuizBank(language, id)) {
        expect(question.pronoun).not.toBe('you plural');
        expect(question.choices).toHaveLength(4);
        const allowed = Object.values(question.verb.forms).flatMap((forms) =>
          getLanguagePronouns(language).map((pronoun) => forms[pronoun]),
        );
        expect(question.choices.every((choice) => allowed.includes(choice))).toBe(true);
      }
    }
  });

  it('does not offer unavailable English tenses', () => {
    expect(createQuizBank(languages.find((language) => language.id === 'english')!, 'subjunctive')).toEqual([]);
  });

  it('limits multi-select rounds to the selected tenses and covers each one', () => {
    const questions = createQuizQuestions(spanish, ['past', 'subjunctive', 'commands']);
    expect(questions).toHaveLength(10);
    expect(new Set(questions.map(({ id }) => id)).size).toBe(10);
    expect(new Set(questions.map(({ tense }) => tense))).toEqual(new Set(['past', 'subjunctive', 'imperative', 'imperativeNegative']));
  });

  it('handles empty, single, and all available selections', () => {
    for (const language of languages) {
      expect(createQuizQuestions(language, [])).toEqual([]);
      expect(createQuizQuestions(language, ['past']).every(({ tense }) => tense === 'past')).toBe(true);
      const tenses = getLanguageTenses(language.id).map(({ id }) => id);
      const questions = createQuizQuestions(language, tenses);
      expect(questions).toHaveLength(10);
      expect(new Set(questions.map(({ id }) => id)).size).toBe(10);
      expect(new Set(questions.map(({ tense }) => tense))).toEqual(new Set(tenses));
    }
    const commands = createQuizQuestions(spanish, ['commands']);
    expect(commands.filter(({ tense }) => tense === 'imperative')).toHaveLength(5);
    expect(commands.filter(({ tense }) => tense === 'imperativeNegative')).toHaveLength(5);
  });
});
