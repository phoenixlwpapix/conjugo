import { afterEach, describe, expect, it, vi } from 'vitest';
import { languages } from '../../data/verbs';
import {
  clampEnglishTense,
  createPromptPool,
  getChoices,
  createMissSessionPrompts,
  createSessionPrompts,
  createVerbSessionPrompts,
  getAnswer,
  getPromptKey,
  getPronounLabel,
  isGenderAgreeingForm,
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
    it('fills every English practice question with four distinct choices', () => {
      const pool = createPromptPool(english, 'mixed');
      for (const prompt of pool) {
        const choices = getChoices(prompt, 17);
        expect(new Set(choices).size).toBe(4);
        expect(choices).toContain(getAnswer(prompt));
      }
    });

    it('uses readed as the fourth choice and avoids treating costed as a misspelling', () => {
      const pool = createPromptPool(english, 'past', new Set(['to read', 'to cost']));
      const read = pool.find(({ pronoun, verb }) => pronoun === 'you' && verb.infinitive === 'to read')!;
      const cost = pool.find(({ pronoun, verb }) => pronoun === 'you' && verb.infinitive === 'to cost')!;
      expect(getAnswer(read)).toBe('read');
      expect(getChoices(read, 17).sort()).toEqual(['read', 'readed', 'reads', 'will read']);
      expect(getChoices(cost, 17).sort()).toEqual(['cost', 'costs', 'will cost', 'would cost']);
    });

    it.each([
      ['to put', 'put', 'putted'], ['to cut', 'cut', 'cutted'], ['to let', 'let', 'letted'],
      ['to hit', 'hit', 'hitted'], ['to shut', 'shut', 'shutted'], ['to begin', 'began', 'beginned'],
      ['to run', 'ran', 'runned'], ['to forget', 'forgot', 'forgetted'], ['to swim', 'swam', 'swimmed'],
      ['to hurt', 'hurt', 'hurted'], ['to write', 'wrote', 'writed'], ['to buy', 'bought', 'buyed'],
    ])('offers the regularized spelling for %s as a past-tense distractor', (infinitive, answer, misspelling) => {
      const [prompt] = createPromptPool(english, 'past', new Set([infinitive]));
      const choices = getChoices(prompt, 17);
      expect(getAnswer(prompt)).toBe(answer);
      expect(choices).toHaveLength(4);
      expect(choices).toEqual(expect.arrayContaining([answer, misspelling]));
    });

    it('prioritizes drawed in the plural you past question even when there are enough other choices', () => {
      const prompt = createPromptPool(english, 'past', new Set(['to draw']))
        .find(({ pronoun }) => pronoun === 'you plural')!;
      expect(getAnswer(prompt)).toBe('drew');
      expect(getChoices(prompt, 17, 2).sort()).toEqual(['drawed', 'drew']);
      for (const seed of [0, 17, 42]) {
        const choices = getChoices(prompt, seed);
        expect(choices).toHaveLength(4);
        expect(choices).toEqual(expect.arrayContaining(['drew', 'drawed']));
      }
    });

    it.each([
      ['to drink', 'drank', 'drunk'], ['to fly', 'flew', 'flown'],
      ['to ring', 'rang', 'rung'], ['to sing', 'sang', 'sung'],
    ])('includes the easily confused participle for %s in past practice', (infinitive, answer, participle) => {
      const [prompt] = createPromptPool(english, 'past', new Set([infinitive]));
      expect(getAnswer(prompt)).toBe(answer);
      expect(getChoices(prompt, 17)).toContain(participle);
    });

    it('uses regularized spellings outside the past only when needed to fill the choices', () => {
      const [run] = createPromptPool(english, 'present', new Set(['to run']));
      const [cut] = createPromptPool(english, 'present', new Set(['to cut']));
      expect(getChoices(run, 17)).not.toContain('runned');
      expect(getChoices(cut, 17)).toContain('cutted');
    });

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
    it.each([
      ['english', 'to be', 'it', 'is'],
      ['italian', 'parlare', 'Lei', 'parla'],
    ] as const)('uses %s third-person forms for %s', (id, infinitive, label, answer) => {
      const language = languages.find((entry) => entry.id === id)!;
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const pool = createPromptPool(language, 'present', new Set([infinitive]));
      const prompt = pool.find((entry) => getPronounLabel(entry) === label)!;
      expect(getAnswer(prompt)).toBe(answer);
      expect(createSessionPrompts(language, 'present').map(getPronounLabel)).toContain(label);
    });

    it('should generate a list of 20 prompts', () => {
      const session = createSessionPrompts(spanish, 'present');
      expect(session).toHaveLength(20);
    });

    it('caps large favorites lists at the configured count and uses every available prompt in small lists', () => {
      const smallScope = new Set(['tener']);
      const largeScope = new Set(spanish.verbs.slice(0, 40).map((verb) => verb.infinitive));
      const targets = [
        { verbInfinitive: 'tener', tense: 'present' as const, pronoun: 'I' as const },
        { verbInfinitive: 'ser', tense: 'present' as const, pronoun: 'I' as const },
      ];
      const smallSet = createSessionPrompts(spanish, 'present', targets, { limit: 20, verbInfinitives: smallScope });
      expect(smallSet).toHaveLength(6);
      expect(new Set(smallSet.map(getPromptKey)).size).toBe(6);
      expect(smallSet.every(({ verb, tense }) => verb.infinitive === 'tener' && tense === 'present')).toBe(true);

      const largeSet = createSessionPrompts(spanish, 'present', [], { limit: 30, verbInfinitives: largeScope });
      expect(largeSet).toHaveLength(30);
      expect(largeSet.every(({ verb }) => largeScope.has(verb.infinitive))).toBe(true);
      expect(createSessionPrompts(spanish, 'present', targets, { verbInfinitives: new Set() })).toEqual([]);
    });

    it('keeps configured command sets balanced and only uses eligible favorite command forms', () => {
      const commands = createSessionPrompts(spanish, 'commands', [], { limit: 10 });
      expect(commands).toHaveLength(10);
      expect(commands.filter((prompt) => prompt.tense === 'imperative')).toHaveLength(5);

      const scoped = createSessionPrompts(spanish, 'commands', [], { verbInfinitives: new Set(['tener']) });
      expect(scoped).toHaveLength(10);
      expect(scoped.every(({ verb }) => verb.infinitive === 'tener')).toBe(true);

      const unsupported = spanish.verbs.find((verb) => !verb.forms.imperative.you)?.infinitive;
      expect(unsupported).toBeDefined();
      expect(createSessionPrompts(spanish, 'commands', [], { verbInfinitives: new Set([unsupported!]) })).toEqual([]);
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
  describe('gender agreement', () => {
    it('detects être / essere past forms only', () => {
      expect(isGenderAgreeingForm('french', 'past', 'est allé')).toBe(true);
      expect(isGenderAgreeingForm('french', 'past', 'a eu')).toBe(false);
      expect(isGenderAgreeingForm('italian', 'past', 'è andato')).toBe(true);
      expect(isGenderAgreeingForm('italian', 'past', 'ha avuto')).toBe(false);
      expect(isGenderAgreeingForm('french', 'present', 'est')).toBe(false);
      expect(isGenderAgreeingForm('spanish', 'past', 'fue')).toBe(false);
    });

    it('never pairs a feminine pronoun with a masculine agreeing participle', () => {
      const feminineLabels = new Set(['elle', 'elles', 'lei']);

      for (const languageId of ['french', 'italian'] as const) {
        const language = languages.find((l) => l.id === languageId)!;
        for (let run = 0; run < 5; run += 1) {
          const agreeing = createPromptPool(language, 'past').filter((prompt) =>
            isGenderAgreeingForm(languageId, prompt.tense, getAnswer(prompt)),
          );
          expect(agreeing.length).toBeGreaterThan(0);
          expect(agreeing.some((prompt) => feminineLabels.has(getPronounLabel(prompt)))).toBe(false);
        }
      }
    });
  });
  describe('vosotros preference', () => {
    const withoutVosotros = { ...spanish, excludedPronouns: ['you plural' as const] };

    it('asks for usted and ustedes using the third-person forms when vosotros is hidden', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const pool = createPromptPool(withoutVosotros, 'present', new Set(['hablar']));
      const singular = pool.find((prompt) => getPronounLabel(prompt) === 'usted')!;
      const plural = pool.find((prompt) => getPronounLabel(prompt) === 'ustedes')!;
      expect(getAnswer(singular)).toBe('habla');
      expect(getAnswer(plural)).toBe('hablan');
      const subjunctive = createPromptPool(withoutVosotros, 'subjunctive', new Set(['hablar']));
      expect(subjunctive.map(getPronounLabel)).toEqual(expect.arrayContaining(['que usted', 'que ustedes']));
      const set = createSessionPrompts(withoutVosotros, 'present', [], { limit: 10 });
      expect(set.map(getPronounLabel)).toEqual(expect.arrayContaining(['usted', 'ustedes']));
    });

    it('never prompts or offers vosotros forms when hidden', () => {
      const pool = createPromptPool(withoutVosotros, 'mixed');
      expect(pool.some((prompt) => prompt.pronoun === 'you plural')).toBe(false);

      for (const prompt of pool.slice(0, 200)) {
        const vosotrosForm = prompt.verb.forms[prompt.tense]['you plural'];
        const choices = getChoices(prompt, 7);
        expect(choices).toHaveLength(4);
        if (vosotrosForm !== getAnswer(prompt)) {
          expect(choices).not.toContain(vosotrosForm);
        }
      }
    });
  });

  describe('createVerbSessionPrompts', () => {
    it('only draws prompts from the requested verbs', () => {
      const focus = [spanish.verbs[0].infinitive, spanish.verbs[1].infinitive];
      const session = createVerbSessionPrompts(spanish, focus);
      expect(session).toHaveLength(20);
      expect(session.every((prompt) => focus.includes(prompt.verb.infinitive))).toBe(true);
    });
  });
});
