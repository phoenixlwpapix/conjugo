import { concreteTenses, pronouns, type Language, type PracticeTenseId, type TenseId } from '../data/verbs';
import type { Prompt, ReviewTarget } from '../types';

export const sessionTarget = 20;
export const autoAdvanceDelayMs = 1200;

export const getPracticeTenses = (practiceTense: PracticeTenseId, languageId?: Language['id']): TenseId[] => {
  const tenses = languageId === 'english'
    ? concreteTenses.filter((t) => t.id !== 'imperfect' && t.id !== 'conditional')
    : concreteTenses;
  return practiceTense === 'mixed' ? tenses.map((tense) => tense.id) : [practiceTense];
};

export const createPromptPool = (language: Language, practiceTense: PracticeTenseId): Prompt[] =>
  language.verbs.flatMap((verb) =>
    getPracticeTenses(practiceTense, language.id).flatMap((tense) =>
      pronouns.map((pronoun) => {
        const fullLabel = language.pronounLabels[pronoun];
        const parts = fullLabel.split('/');
        const selectedPronounLabel = parts[Math.floor(Math.random() * parts.length)];
        return {
          language,
          verb,
          tense,
          pronoun,
          selectedPronounLabel,
        };
      }),
    ),
  );

export const shufflePrompts = <Item>(items: Item[]) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

export const getPromptKey = (prompt: Pick<Prompt, 'verb' | 'tense' | 'pronoun'>) =>
  `${prompt.verb.infinitive}::${prompt.tense}::${prompt.pronoun}`;

const matchesReviewTarget = (prompt: Prompt, target: ReviewTarget) =>
  prompt.verb.infinitive === target.verbInfinitive && prompt.tense === target.tense && prompt.pronoun === target.pronoun;

export const createSessionPrompts = (
  language: Language,
  practiceTense: PracticeTenseId,
  reviewTargets: ReviewTarget[] = [],
) => {
  const promptPool = createPromptPool(language, practiceTense);
  const reviewLimit = Math.min(Math.ceil(sessionTarget * 0.3), reviewTargets.length);
  const reviewPrompts = shufflePrompts(reviewTargets)
    .map((target) => promptPool.find((prompt) => matchesReviewTarget(prompt, target)))
    .filter((prompt): prompt is Prompt => Boolean(prompt))
    .slice(0, reviewLimit);
  const reviewKeys = new Set(reviewPrompts.map(getPromptKey));
  const freshPrompts = shufflePrompts(promptPool.filter((prompt) => !reviewKeys.has(getPromptKey(prompt)))).slice(
    0,
    sessionTarget - reviewPrompts.length,
  );

  return shufflePrompts([...reviewPrompts, ...freshPrompts]).slice(0, sessionTarget);
};

export const getFallbackPrompt = (language: Language, practiceTense: PracticeTenseId): Prompt => {
  const firstVerb = language.verbs[0];

  if (!firstVerb) {
    throw new Error(`${language.name} needs at least one verb`);
  }

  const pronoun = pronouns[0];
  const fullLabel = language.pronounLabels[pronoun];
  const parts = fullLabel.split('/');
  const selectedPronounLabel = parts[Math.floor(Math.random() * parts.length)];

  return {
    language,
    verb: firstVerb,
    tense: getPracticeTenses(practiceTense, language.id)[0],
    pronoun,
    selectedPronounLabel,
  };
};

export const getAnswer = (prompt: Prompt) => prompt.verb.forms[prompt.tense][prompt.pronoun];

export const getPronounLabel = (prompt: Prompt) => prompt.selectedPronounLabel || prompt.language.pronounLabels[prompt.pronoun];

export const getTenseLabel = (tense: TenseId) => concreteTenses.find((item) => item.id === tense)?.label ?? tense;

const stableScore = (value: string, seed: number) => {
  let hash = 2166136261 ^ seed;

  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

export const getChoices = (prompt: Prompt, seed: number, choiceCount = 4) => {
  const correctAnswer = getAnswer(prompt);
  const sameTenseDistractors = pronouns
    .map((pronoun) => prompt.verb.forms[prompt.tense][pronoun])
    .filter((value, index, values) => value !== correctAnswer && values.indexOf(value) === index)
    .sort((first, second) => stableScore(first, seed) - stableScore(second, seed))
    .slice(0, choiceCount - 1);
  
  const languageTenses = prompt.language.id === 'english'
    ? concreteTenses.filter((t) => t.id !== 'imperfect' && t.id !== 'conditional')
    : concreteTenses;

  const fallbackDistractors = languageTenses
    .flatMap((tense) => pronouns.map((pronoun) => prompt.verb.forms[tense.id][pronoun]))
    .filter(
      (value, index, values) =>
        value !== correctAnswer && !sameTenseDistractors.includes(value) && values.indexOf(value) === index,
    )
    .sort((first, second) => stableScore(first, seed) - stableScore(second, seed))
    .slice(0, choiceCount - 1 - sameTenseDistractors.length);
  const distractors = [...sameTenseDistractors, ...fallbackDistractors];

  return shufflePrompts([correctAnswer, ...distractors]);
};
