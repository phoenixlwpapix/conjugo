import { describe, expect, it } from 'vitest';
import { isImperative } from '../imperative';
import { createQuizBank, createQuizQuestions } from '../quiz';
import { getConjugationPronounLabel, getConjugationPronouns, getLanguageTenses, getLanguagePracticeTenses, languages, type LanguageId } from '../verbs';
import { clampEnglishTense, createMissSessionPrompts, createPromptPool, getAnswer, getChoices, getFallbackPrompt, createSessionPrompts, getPronounLabel } from '../../lib/prompts';
import { getReviewTargets, upsertMiss } from '../../lib/misses';

const fixtures: [LanguageId, string, string[], string[]][] = [
  ['french', 'parler', ['parle', 'parlons', 'parlez'], ['ne parle pas', 'ne parlons pas', 'ne parlez pas']],
  ['french', 'avoir', ['aie', 'ayons', 'ayez'], ["n'aie pas", "n'ayons pas", "n'ayez pas"]],
  ['french', 'être', ['sois', 'soyons', 'soyez'], ['ne sois pas', 'ne soyons pas', 'ne soyez pas']],
  ['french', 'savoir', ['sache', 'sachons', 'sachez'], ['ne sache pas', 'ne sachons pas', 'ne sachez pas']],
  ['french', 'aller', ['va', 'allons', 'allez'], ["ne va pas", "n'allons pas", "n'allez pas"]],
  ['french', 'ouvrir', ['ouvre', 'ouvrons', 'ouvrez'], ["n'ouvre pas", "n'ouvrons pas", "n'ouvrez pas"]],
  ['spanish', 'hablar', ['habla', 'hable', 'hablemos', 'hablad', 'hablen'], ['no hables', 'no hable', 'no hablemos', 'no habléis', 'no hablen']],
  ['spanish', 'ir', ['ve', 'vaya', 'vamos', 'id', 'vayan'], ['no vayas', 'no vaya', 'no vayamos', 'no vayáis', 'no vayan']],
  ['spanish', 'ser', ['sé', 'sea', 'seamos', 'sed', 'sean'], ['no seas', 'no sea', 'no seamos', 'no seáis', 'no sean']],
  ['spanish', 'hacer', ['haz', 'haga', 'hagamos', 'haced', 'hagan'], ['no hagas', 'no haga', 'no hagamos', 'no hagáis', 'no hagan']],
  ['italian', 'parlare', ['parla', 'parli', 'parliamo', 'parlate'], ['non parlare', 'non parli', 'non parliamo', 'non parlate']],
  ['italian', 'essere', ['sii', 'sia', 'siamo', 'siate'], ['non essere', 'non sia', 'non siamo', 'non siate']],
  ['italian', 'avere', ['abbi', 'abbia', 'abbiamo', 'abbiate'], ['non avere', 'non abbia', 'non abbiamo', 'non abbiate']],
  ['italian', 'andare', ['vai', 'vada', 'andiamo', 'andate'], ['non andare', 'non vada', 'non andiamo', 'non andate']],
  ['italian', 'dire', ["di'", 'dica', 'diciamo', 'dite'], ['non dire', 'non dica', 'non diciamo', 'non dite']],
  ['italian', 'sapere', ['sappi', 'sappia', 'sappiamo', 'sappiate'], ['non sapere', 'non sappia', 'non sappiamo', 'non sappiate']],
];

describe('imperative', () => {
  it.each(fixtures)('conjugates %s %s for valid addressees', (id, infinitive, affirmative, negative) => {
    const language = languages.find((entry) => entry.id === id)!;
    const verb = language.verbs.find((entry) => entry.infinitive === infinitive)!;
    expect(getConjugationPronouns(language, 'imperative', verb).map((person) => verb.forms.imperative[person])).toEqual(affirmative);
    expect(getConjugationPronouns(language, 'imperativeNegative', verb).map((person) => verb.forms.imperativeNegative[person])).toEqual(negative);
  });

  it('keeps English and ordinary Mixed practice free of command targets', () => {
    for (const language of languages) {
      expect(createPromptPool(language, 'mixed').every((prompt) => !isImperative(prompt.tense))).toBe(true);
      expect(createQuizQuestions(language, 'mixed').every((question) => !isImperative(question.tense))).toBe(true);
    }
    const english = languages[0];
    expect(clampEnglishTense('english', 'imperative')).toBe('present');
    expect(clampEnglishTense('english', 'imperativeNegative')).toBe('present');
    expect(createPromptPool(english, 'imperative')).toEqual([]);
    expect(createQuizBank(english, 'imperativeNegative')).toEqual([]);
    expect(getLanguageTenses('english')).toHaveLength(3);
  });

  it('only drills supported verbs and persons, with four nonempty choices', () => {
    for (const language of languages.slice(1)) {
      for (const tense of ['imperative', 'imperativeNegative'] as const) {
        const pool = createPromptPool(language, tense);
        expect(pool.length).toBeGreaterThan(60);
        expect(getAnswer(getFallbackPrompt(language, tense))).toBeTruthy();
        for (const prompt of pool) {
          expect(prompt.pronoun).not.toBe('I');
          const choices = getChoices(prompt, 42);
          expect(choices).toHaveLength(4);
          expect(new Set(choices).size).toBe(4);
          expect(choices.every(Boolean)).toBe(true);
          expect(choices).toContain(getAnswer(prompt));
        }
        for (const question of createQuizBank(language, tense)) expect(question.answer).toBeTruthy();
      }
    }
  });

  it('labels polite commands as addressees and honors the vosotros preference', () => {
    const spanish = { ...languages.find((entry) => entry.id === 'spanish')!, excludedPronouns: ['you plural' as const] };
    const italian = languages.find((entry) => entry.id === 'italian')!;
    expect(getConjugationPronounLabel(spanish, 'imperative', 'he/she')).toBe('usted');
    expect(getConjugationPronounLabel(spanish, 'imperativeNegative', 'they')).toBe('ustedes');
    expect(getConjugationPronounLabel(italian, 'imperative', 'he/she')).toBe('Lei');
    for (const tense of ['imperative', 'imperativeNegative'] as const) {
      const pool = createPromptPool(spanish, tense);
      expect(pool.some((prompt) => prompt.pronoun === 'you plural')).toBe(false);
      const politePrompt = pool.find((prompt) => prompt.pronoun === 'he/she')!;
      expect(getPronounLabel(politePrompt)).toBe('usted');
      expect(getPronounLabel({ ...politePrompt, selectedPronounLabel: undefined })).toBe('usted');
      expect(getPronounLabel(pool.find((prompt) => prompt.pronoun === 'they')!)).toBe('ustedes');
      expect(createQuizBank(spanish, tense).some((question) => question.pronoun === 'you plural')).toBe(false);
    }
  });

  it('does not treat the valid alternative vayamos as a distractor for vamos', () => {
    const spanish = languages.find((entry) => entry.id === 'spanish')!;
    const prompt = createPromptPool(spanish, 'imperative').find((item) => item.verb.infinitive === 'ir' && item.pronoun === 'we')!;
    expect(getChoices(prompt, 0)).not.toContain('vayamos');
    expect(createQuizBank(spanish, 'imperative').find((question) => question.verb.infinitive === 'ir' && question.pronoun === 'we')?.choices).not.toContain('vayamos');
  });

  it('offers one command entry and maps old affirmative/negative practice selections to it', () => {
    for (const language of languages) {
      const options = getLanguagePracticeTenses(language.id);
      expect(options.filter(({ id }) => id === 'commands')).toHaveLength(language.id === 'english' ? 0 : 1);
      expect(options.some(({ id }) => id === 'imperative' || id === 'imperativeNegative')).toBe(false);
      expect(clampEnglishTense(language.id, 'imperative')).toBe(language.id === 'english' ? 'present' : 'commands');
      expect(clampEnglishTense(language.id, 'imperativeNegative')).toBe(language.id === 'english' ? 'present' : 'commands');
    }
  });

  it('balances both polarities in unified practice and quizzes, retaining question-level labels', () => {
    for (const language of languages.slice(1)) {
      const session = createSessionPrompts(language, 'commands');
      expect(session).toHaveLength(20);
      expect(session.filter((prompt) => prompt.tense === 'imperative')).toHaveLength(10);
      expect(session.filter((prompt) => prompt.tense === 'imperativeNegative')).toHaveLength(10);
      expect(new Set(session.map((prompt) => `${prompt.verb.infinitive}:${prompt.tense}:${prompt.pronoun}`)).size).toBe(20);
      const quiz = createQuizQuestions(language, 'commands');
      expect(quiz).toHaveLength(10);
      expect(quiz.filter((question) => question.tense === 'imperative')).toHaveLength(5);
      expect(quiz.filter((question) => question.tense === 'imperativeNegative')).toHaveLength(5);
      expect(new Set(quiz.map((question) => question.id)).size).toBe(10);
    }
    expect(createQuizQuestions(languages[0], 'commands')).toEqual([]);
  });

  it('keeps a balanced command session when six negative misses need review', () => {
    const spanish = { ...languages.find((language) => language.id === 'spanish')!, excludedPronouns: ['you plural' as const] };
    const missedPrompts = createPromptPool(spanish, 'imperativeNegative').slice(0, 6);
    const misses = missedPrompts.reduce((current, prompt) => upsertMiss(current, prompt), upsertMiss([], missedPrompts[0]));
    const session = createSessionPrompts(spanish, 'commands', getReviewTargets(spanish, 'commands', misses));
    expect(session).toHaveLength(20);
    expect(session.filter((prompt) => prompt.tense === 'imperativeNegative')).toHaveLength(10);
    expect(session.filter((prompt) => prompt.tense === 'imperative')).toHaveLength(10);
    expect(session.some((prompt) => prompt.pronoun === 'you plural')).toBe(false);
    for (const missed of missedPrompts) {
      expect(session.some((prompt) => prompt.verb === missed.verb && prompt.tense === missed.tense && prompt.pronoun === missed.pronoun)).toBe(true);
    }
  });

  it('reviews command misses even though ordinary Mixed excludes commands', () => {
    const french = languages.find((entry) => entry.id === 'french')!;
    const prompt = createPromptPool(french, 'imperativeNegative')[0];
    const targets = getReviewTargets(french, 'mixed', upsertMiss([], prompt));
    const review = createMissSessionPrompts(french, targets);
    expect(review).toHaveLength(1);
    expect(review[0].tense).toBe('imperativeNegative');
    expect(getAnswer(review[0])).toBe(getAnswer(prompt));
  });
});
