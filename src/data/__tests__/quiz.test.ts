import { isImperative } from '../imperative';
import { isNonFiniteForm } from '../nonFinite/types';
import { describe, expect, it } from 'vitest';
import { createQuizBank, createQuizQuestions } from '../quiz';
import { quizScenes, quizVerbs } from '../quizScenes';
import { getLanguagePronouns, getLanguageTenses, isTenseAvailable, languages, pronouns, type TenseId } from '../verbs';

const spanish = languages.find((language) => language.id === 'spanish');
if (!spanish) throw new Error('Spanish data missing');

describe('authored quiz scenes', () => {
  it('provides fifty complete scenes per tense in its supported languages', () => {
    for (const [tense, scenes] of Object.entries(quizScenes)) {
      expect(scenes.filter((scene) => !scene.featuredSubject)).toHaveLength(50);
      for (const language of languages) {
        if (!isTenseAvailable(language.id, tense as TenseId)) continue;
        const supportedScenes = scenes.filter((scene) => !scene.studyLanguage || scene.studyLanguage === language.id);
        expect(new Set(supportedScenes.map((scene) => scene.sentence[language.id])).size).toBe(supportedScenes.length);
        for (const scene of supportedScenes) {
          expect(scene.sentence[language.id]?.split('____')).toHaveLength(2);
          expect(scene.sentence[language.id]).not.toMatch(/undefined/);
          expect(scene.reason.zh).toBeTruthy();
          expect(scene.reason.en).toBeTruthy();
          expect(scene.zh).toMatch(/[。？]$/);
        }
      }
    }
  });

  it('covers all pronouns, difficulties, and diverse verbs across the expanded bank', () => {
    const usedVerbs = new Set<string>();
    for (const [tense, scenes] of Object.entries(quizScenes)) {
      const tensePronouns = new Set(scenes.filter((scene) => !scene.featuredSubject).map((scene) => scene.pronoun));
      const tenseDifficulties = new Set(scenes.map((scene) => scene.difficulty));
      const tenseVerbs = new Set(scenes.map((scene) => scene.verb));
      scenes.forEach((scene) => usedVerbs.add(scene.verb));

      expect(tenseDifficulties).toEqual(new Set(['beginner', 'intermediate', 'advanced']));
      expect(tenseVerbs.size).toBeGreaterThanOrEqual(24);

      if (isImperative(tense as TenseId)) {
        expect(tensePronouns).toEqual(new Set(['you', 'we', 'you plural']));
      } else {
        expect(tensePronouns).toEqual(new Set(pronouns));
      }
    }
    expect(usedVerbs.size).toBe(Object.keys(quizVerbs).length);
  });

  it('keeps the authored scene, verb, subject, and explanation together', () => {
    for (const language of languages) {
      for (const { id } of getLanguageTenses(language.id)) {
        if (isNonFiniteForm(id)) continue;
        const bank = createQuizBank(language, id);
        const scenes = quizScenes[id].filter((scene) => !scene.studyLanguage || scene.studyLanguage === language.id);
        expect(bank).toHaveLength(scenes.length);
        bank.forEach((question, index) => {
          const scene = scenes[index];
          expect(question.sentence).toBe(scene.sentence[language.id]);
          expect(question.pronoun).toBe(scene.pronoun);
          expect(question.difficulty).toBe(scene.difficulty);
          expect(question.translation.zh).toBe(scene.zh);
          expect(question.explanation.zh).toContain(scene.reason.zh);
          expect(question.explanation.en).toContain(scene.reason.en);
          expect(question.explanation.zh).toContain(question.answer);
          expect(question.explanation.en).toContain(question.answer);
          expect(question.translation.en).not.toMatch(/____|undefined|\p{Script=Han}/u);
          expect(question.translation.en).toMatch(/[.?]$/);
          expect(question.explanation.en).not.toMatch(/undefined|\p{Script=Han}/u);
        });
      }
    }
  });

  it.each([
    ['english', 'it', 'it', 'he/she'],
    ['italian', 'Lei', 'Lei', 'he/she'],
    ['french', 'polite vous', 'vous', 'you plural'],
  ] as const)('includes the new %s subject across its supported tenses', (id, subject, label, pronoun) => {
    const language = languages.find((entry) => entry.id === id)!;
    for (const { id: tense } of getLanguageTenses(id)) {
      if (isNonFiniteForm(tense)) continue;
      const question = createQuizQuestions(language, tense).find((entry) => entry.featuredSubject === subject)!;
      expect(question.pronounLabel).toBe(label);
      expect(question.pronoun).toBe(pronoun);
      expect(question.answer).toBe(question.verb.forms[tense][pronoun]);
      expect(question.choices).toContain(question.answer);
    }
  });

  it('uses the authored feminine pronoun in the French quiz hint and feedback', () => {
    const french = languages.find(({ id }) => id === 'french')!;
    const question = createQuizBank(french, 'passeSimple').find(({ sentence }) => sentence.startsWith('Elle ____ les cartes'))!;
    expect(question.pronounLabel).toBe('elle');
    expect(question.explanation.en).toContain('for elle');
  });

  it('includes both Spanish forms of address in every supported tense with vosotros hidden', () => {
    const language = { ...spanish, excludedPronouns: ['you plural' as const] };
    for (const { id } of getLanguageTenses(language.id)) {
      if (isNonFiniteForm(id)) continue;
      const questions = createQuizQuestions(language, id);
      for (const [label, pronoun] of [['usted', 'he/she'], ['ustedes', 'they']] as const) {
        const question = questions.find((entry) => entry.pronounLabel === label)!;
        expect(question.sentence).toMatch(new RegExp(`\\b${label}\\b`, 'i'));
        expect(question.answer).toBe(question.verb.forms[id][pronoun]);
        expect(question.answer).toBeTruthy();
        expect(question.explanation.zh).toContain(` ${label} `);
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

  it('teaches the literary French past without competing compound-past answers', () => {
    const french = languages.find(({ id }) => id === 'french')!;
    const literaryPast = createQuizBank(french, 'passeSimple');
    const question = literaryPast.find(({ verb, pronoun }) => verb.infinitive === 'manger' && pronoun === 'we')!;
    expect(question.sentence.replace('____', question.answer)).toBe('Nous mangeâmes à l’auberge, puis nous reprîmes la route.');
    expect(question.translation.en).toBe('We ate at the inn and then set off again.');
    expect(question.explanation.zh).toContain('简单过去时（Passé simple）');
    for (const entry of literaryPast) {
      expect(entry.choices).toHaveLength(4);
      expect(entry.choices).not.toContain(entry.verb.forms.past[entry.pronoun]);
    }
    const compoundPast = createQuizBank(french, 'past').find(({ verb }) => verb.infinitive === 'aller')!;
    expect(compoundPast.choices).not.toContain(compoundPast.verb.forms.passeSimple[compoundPast.pronoun]);
  });

  it.each([
    ['english', 'present', 'his bed', 'makes', 'Every morning before leaving, Leo makes his bed.'],
    ['english', 'present', 'the truth', 'tell', 'You always tell the truth when you speak with your friends.'],
    ['spanish', 'conditional', 'la verdad exacta', 'diría', 'If they asked for my opinion, I would tell the exact truth.'],
    ['spanish', 'subjunctive', 'Marco ____ la verdad', 'diga', 'It is essential that Marco tell the truth during the meeting.'],
    ['spanish', 'imperative', 'la verdad aunque', 'di', 'tell the truth even if it proves difficult at this moment.'],
    ['spanish', 'imperativeNegative', 'promesas que', 'no hagas', 'Don’t make promises that you cannot keep later on.'],
    ['spanish', 'conditional', 'la grabación entera', 'escucharías', 'If the audio had less background noise, you would listen to the entire recording.'],
  ] as const)('uses idiomatic English for %s %s (%s)', (languageId, tense, fragment, answer, translation) => {
    const language = languages.find(({ id }) => id === languageId)!;
    const question = createQuizBank(language, tense).find(({ sentence }) => sentence.includes(fragment));
    expect(question?.answer).toBe(answer);
    expect(question?.choices).toContain(answer);
    expect(question?.translation.en).toBe(translation);
  });

  it.each([
    ['spanish', 'rumores infundados', 'Alumnos, no escuchéis rumores infundados sobre los criterios de evaluación.'],
    ['french', 'rumeurs infondées', "Les élèves, n'écoutez pas les rumeurs infondées sur les critères d’évaluation."],
    ['italian', 'voci infondate', 'Studenti, non ascoltate le voci infondate sui criteri di valutazione.'],
  ] as const)('uses a direct object for the %s command about rumours', (languageId, fragment, completedSentence) => {
    const language = languages.find(({ id }) => id === languageId)!;
    const question = createQuizBank(language, 'imperativeNegative').find(({ sentence }) => sentence.includes(fragment));
    expect(question).toBeDefined();
    expect(question?.sentence.replace('____', question.answer)).toBe(completedSentence);
  });

  it('uses estar for feeling calmer after a hypothetical success', () => {
    const question = createQuizBank(spanish, 'conditional').find(({ sentence }) => sentence.includes('Si este proyecto tuviera éxito'));
    expect(question?.verb.infinitive).toBe('estar');
    expect(question?.answer).toBe('estaría');
    expect(question?.choices).toContain('estaría');
    expect(question?.choices).not.toContain('sería');
    expect(question?.explanation.en).toContain('estar');
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
          if (!isNonFiniteForm(question.tense)) {
            expect(question.choices.every((choice) => Object.values(question.verb.forms).some((forms) => Object.values(forms).includes(choice)))).toBe(true);
          }
        }
        if (selected === 'mixed') expect(new Set(questions.map((question) => question.tense)).size).toBe(getLanguageTenses(language.id).filter(({ id }) => !isImperative(id)).length);
      }
    }
  });

  it('excludes vosotros scenes and forms when the preference is disabled', () => {
    const language = { ...spanish, excludedPronouns: ['you plural' as const] };
    for (const { id } of getLanguageTenses(language.id)) {
      if (isNonFiniteForm(id)) continue;
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

  it.each([20, 30, 40] as const)('builds %i-question rounds without repeats', (count) => {
    const selectedTenses = ['past', 'subjunctive', 'commands'] as const;
    const questions = createQuizQuestions(spanish, selectedTenses, count);
    expect(questions).toHaveLength(count);
    expect(new Set(questions.map(({ id }) => id)).size).toBe(count);
    expect(new Set(questions.map(({ tense }) => tense))).toEqual(new Set(['past', 'subjunctive', 'imperative', 'imperativeNegative']));

    const commands = createQuizQuestions(spanish, 'commands', count);
    expect(commands.filter(({ tense }) => tense === 'imperative')).toHaveLength(count / 2);
    expect(commands.filter(({ tense }) => tense === 'imperativeNegative')).toHaveLength(count / 2);
  });

  it('uses only eligible scenes when the requested round is larger than the bank', () => {
    const language = { ...spanish, excludedPronouns: ['you plural' as const, 'they' as const, 'we' as const] };
    const eligible = createQuizBank(language, 'present');
    const questions = createQuizQuestions(language, 'present', 40);
    expect(eligible.length).toBeLessThan(40);
    expect(new Set(questions.map(({ id }) => id))).toEqual(new Set(eligible.map(({ id }) => id)));
  });

  it('handles empty, single, and all available selections', () => {
    for (const language of languages) {
      expect(createQuizQuestions(language, [])).toEqual([]);
      expect(createQuizQuestions(language, ['past']).every(({ tense }) => tense === 'past')).toBe(true);
      const tenses = getLanguageTenses(language.id).map(({ id }) => id);
      const questions = createQuizQuestions(language, tenses);
      expect(questions).toHaveLength(10);
      expect(new Set(questions.map(({ id }) => id)).size).toBe(10);
      expect(new Set(questions.map(({ tense }) => tense)).size).toBe(Math.min(tenses.length, 10));
    }
    const commands = createQuizQuestions(spanish, ['commands']);
    expect(commands.filter(({ tense }) => tense === 'imperative')).toHaveLength(5);
    expect(commands.filter(({ tense }) => tense === 'imperativeNegative')).toHaveLength(5);
  });
});
