import {
  concreteTenses,
  getLanguagePronouns,
  getLanguageTenses,
  isTenseAvailable,
  type Language,
  type LanguageId,
  type PracticeTenseId,
  type TenseId,
  type VerbEntry,
} from '../data/verbs';
import type { Pronoun, Prompt, ReviewTarget } from '../types';

export const sessionTarget = 20;
export const autoAdvanceDelayMs = 1200;
export const timerSeconds = 8;

/** Falls back to present when the language has no such tense (English imperfect, subjunctive…). */
export const clampEnglishTense = (languageId: LanguageId, tense: PracticeTenseId): PracticeTenseId =>
  tense === 'mixed' || isTenseAvailable(languageId, tense) ? tense : 'present';

export const getPracticeTenses = (practiceTense: PracticeTenseId, languageId?: Language['id']): TenseId[] => {
  const tenses = languageId ? getLanguageTenses(languageId) : concreteTenses;
  return practiceTense === 'mixed' ? tenses.map((tense) => tense.id) : [practiceTense];
};

const subjunctiveMarkers: Partial<Record<LanguageId, string>> = { french: 'que', spanish: 'que', italian: 'che' };

/** Subjunctive prompts read as "que tu…", "qu'elle…", "che io…". */
export const withMoodMarker = (languageId: LanguageId, tense: TenseId, pronounLabel: string) => {
  const marker = subjunctiveMarkers[languageId];
  if (tense !== 'subjunctive' || !marker) {
    return pronounLabel;
  }

  return languageId === 'french' && /^[aeiouhy]/i.test(pronounLabel) ? `qu'${pronounLabel}` : `${marker} ${pronounLabel}`;
};

const getPronounLabelOptions = (label: string) => {
  const suffixMatch = /^(.+?)([aeio]s?)\/([aeio]s?)$/.exec(label);
  if (suffixMatch) {
    const [, base, firstSuffix, secondSuffix] = suffixMatch;
    return [`${base}${firstSuffix}`, `${base}${secondSuffix}`];
  }

  return label.split('/');
};

/** Past-tense auxiliaries whose participle agrees with the subject's gender (être / essere). */
const genderAgreeingAuxiliaries: Partial<Record<Language['id'], Set<string>>> = {
  french: new Set(['suis', 'es', 'est', 'sommes', 'êtes', 'sont']),
  italian: new Set(['sono', 'sei', 'è', 'siamo', 'siete']),
};

/** Stored forms are masculine, so a feminine pronoun would make the expected answer wrong. */
export const isGenderAgreeingForm = (languageId: Language['id'], tense: TenseId, form: string) =>
  tense === 'past' && Boolean(genderAgreeingAuxiliaries[languageId]?.has(form.split(' ')[0]));

const choosePronounLabel = (label: string, masculineOnly = false) => {
  const options = getPronounLabelOptions(label);
  return masculineOnly ? options[0] : options[Math.floor(Math.random() * options.length)];
};

const choosePromptPronounLabel = (language: Language, verb: VerbEntry, tense: TenseId, pronoun: Pronoun) =>
  choosePronounLabel(
    language.pronounLabels[pronoun],
    isGenderAgreeingForm(language.id, tense, verb.forms[tense][pronoun]),
  );

export const createPromptPool = (language: Language, practiceTense: PracticeTenseId): Prompt[] =>
  language.verbs.flatMap((verb) =>
    getPracticeTenses(practiceTense, language.id).flatMap((tense) =>
      getLanguagePronouns(language).map((pronoun) => {
        const selectedPronounLabel = choosePromptPronounLabel(language, verb, tense, pronoun);
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

/** Targets arrive in priority order (due first), so trim before shuffling. */
export const createMissSessionPrompts = (language: Language, reviewTargets: ReviewTarget[]): Prompt[] => {
  const promptPool = createPromptPool(language, 'mixed');
  const reviewPrompts = reviewTargets
    .map((target) => promptPool.find((prompt) => matchesReviewTarget(prompt, target)))
    .filter((prompt): prompt is Prompt => Boolean(prompt))
    .slice(0, sessionTarget);

  return shufflePrompts(reviewPrompts);
};

/** A focused set drawn from every tense of the given verbs. */
export const createVerbSessionPrompts = (language: Language, verbInfinitives: string[]): Prompt[] => {
  const focusVerbs = new Set(verbInfinitives);
  return shufflePrompts(createPromptPool(language, 'mixed').filter((prompt) => focusVerbs.has(prompt.verb.infinitive))).slice(
    0,
    sessionTarget,
  );
};

export const getFallbackPrompt = (language: Language, practiceTense: PracticeTenseId): Prompt => {
  const firstVerb = language.verbs[0];

  if (!firstVerb) {
    throw new Error(`${language.name} needs at least one verb`);
  }

  const pronoun = getLanguagePronouns(language)[0];
  const tense = getPracticeTenses(practiceTense, language.id)[0];

  return {
    language,
    verb: firstVerb,
    tense,
    pronoun,
    selectedPronounLabel: choosePromptPronounLabel(language, firstVerb, tense, pronoun),
  };
};

export const getAnswer = (prompt: Prompt) => prompt.verb.forms[prompt.tense][prompt.pronoun];

export const getPronounLabel = (prompt: Prompt) =>
  withMoodMarker(
    prompt.language.id,
    prompt.tense,
    prompt.selectedPronounLabel || prompt.language.pronounLabels[prompt.pronoun],
  );

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
  const pronouns = getLanguagePronouns(prompt.language);
  const sameTenseDistractors = pronouns
    .map((pronoun) => prompt.verb.forms[prompt.tense][pronoun])
    .filter((value, index, values) => value !== correctAnswer && values.indexOf(value) === index)
    .sort((first, second) => stableScore(first, seed) - stableScore(second, seed))
    .slice(0, choiceCount - 1);

  const languageTenses = getLanguageTenses(prompt.language.id);

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
