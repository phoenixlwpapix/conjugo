import { isCommandVariant, isImperative } from '../data/imperative';
import { isNonFiniteForm } from '../data/nonFinite/types';
import {
  concreteTenses,
  getConjugationPronouns,
  getConjugationPronounLabel,
  getLanguageTenses,
  isTenseAvailable,
  type Language,
  type LanguageId,
  type PracticeTenseId,
  type TenseId,
  type VerbEntry,
} from '../data/verbs';
import type { Pronoun, Prompt, ReviewTarget } from '../types';

export const practiceQuestionCounts = [10, 20, 30, 40] as const;
export type PracticeQuestionCount = (typeof practiceQuestionCounts)[number];
export const defaultPracticeQuestionCount = 20;
export const defaultQuizQuestionCount = 10;
export const autoAdvanceDelayMs = 1200;
export const timerSeconds = 8;

/** Falls back to present when the language has no such tense (English imperfect, subjunctive…). */
export const clampEnglishTense = (languageId: LanguageId, tense: PracticeTenseId): PracticeTenseId =>
  tense === 'mixed' ? tense
    : tense === 'commands' ? languageId === 'english' ? 'present' : 'commands'
    : tense === 'nonFinite' ? tense
    : isTenseAvailable(languageId, tense) ? isImperative(tense) ? 'commands' : tense : 'present';

export const getPracticeTenses = (practiceTense: PracticeTenseId, languageId?: Language['id']): TenseId[] => {
  const tenses = languageId ? getLanguageTenses(languageId) : concreteTenses;
  if (practiceTense === 'commands') return tenses.filter(({ id }) => isImperative(id)).map(({ id }) => id);
  if (practiceTense === 'nonFinite') return tenses.filter(({ id }) => isNonFiniteForm(id)).map(({ id }) => id);
  return practiceTense === 'mixed' ? tenses.filter((tense) => !isImperative(tense.id)).map((tense) => tense.id) : [practiceTense];
};

const subjunctiveMarkers: Partial<Record<LanguageId, string>> = { french: 'que', spanish: 'que', italian: 'che' };

/** Subjunctive prompts read as "que tu…", "qu'elle…", "che io…". */
export const withMoodMarker = (languageId: LanguageId, tense: TenseId, pronounLabel: string) => {
  const marker = subjunctiveMarkers[languageId];
  if ((tense !== 'subjunctive' && tense !== 'imperfectSubjunctive') || !marker) {
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

  return label.split('/').map((option) => option.trim());
};

/** Past-tense auxiliaries whose participle agrees with the subject's gender (être / essere). */
const genderAgreeingAuxiliaries: Partial<Record<Language['id'], Set<string>>> = {
  french: new Set(['suis', 'es', 'est', 'sommes', 'êtes', 'sont']),
  italian: new Set(['sono', 'sei', 'è', 'siamo', 'siete']),
};

/** Stored forms are masculine, so Italian essere still restricts prompts to masculine labels. */
export const isGenderAgreeingForm = (languageId: Language['id'], tense: TenseId, form: string) =>
  tense === 'past' && Boolean(genderAgreeingAuxiliaries[languageId]?.has(form.split(' ')[0]));

export const isFrenchEtrePast = (languageId: LanguageId, tense: TenseId, verb: VerbEntry) =>
  languageId === 'french' && isGenderAgreeingForm(languageId, tense, verb.forms.past.I);

export const isFrenchFemininePronounLabel = (label?: string) => label === 'elle' || label === 'elles';

export type FrenchEtrePastForms = {
  masculine: string;
  feminine: string;
  tableMasculine: string;
  tableFeminine: string;
  accepted: string[];
};

/** Derives masculine/feminine agreement forms for French passé composé with être. */
export const getFrenchEtrePastForms = (verb: VerbEntry, pronoun: Pronoun): FrenchEtrePastForms => {
  const aux = verb.forms.past[pronoun].split(' ')[0];
  const baseParticiple = verb.forms.past.I.split(' ')[1];
  const plural = pronoun === 'we' || pronoun === 'you plural' || pronoun === 'they';
  const masculine = `${aux} ${baseParticiple}${plural ? 's' : ''}`;
  const feminine = `${aux} ${baseParticiple}${plural ? 'es' : 'e'}`;
  if (pronoun === 'you plural') {
    return {
      masculine,
      feminine,
      tableMasculine: `${aux} ${baseParticiple}(s)`,
      tableFeminine: `${aux} ${baseParticiple}e(s)`,
      accepted: [masculine, feminine, `${aux} ${baseParticiple}`, `${aux} ${baseParticiple}e`],
    };
  }
  return {
    masculine,
    feminine,
    tableMasculine: masculine,
    tableFeminine: feminine,
    accepted: [masculine, feminine],
  };
};

/** Returns the opposite-gender form for gendered French être subjects (il/elle, ils/elles). */
export const getFrenchEtreOppositeGenderForm = (prompt: Prompt): string | undefined => {
  if (!isFrenchEtrePast(prompt.language.id, prompt.tense, prompt.verb)) return undefined;
  if (prompt.pronoun !== 'he/she' && prompt.pronoun !== 'they') return undefined;
  const forms = getFrenchEtrePastForms(prompt.verb, prompt.pronoun);
  return isFrenchFemininePronounLabel(prompt.selectedPronounLabel) ? forms.masculine : forms.feminine;
};

const choosePronounLabel = (label: string, masculineOnly = false) => {
  const options = getPronounLabelOptions(label);
  return masculineOnly ? options[0] : options[Math.floor(Math.random() * options.length)];
};

const choosePromptPronounLabel = (language: Language, verb: VerbEntry, tense: TenseId, pronoun: Pronoun) =>
  isNonFiniteForm(tense) ? undefined : choosePronounLabel(
    getConjugationPronounLabel(language, tense, pronoun),
    language.id !== 'french' && isGenderAgreeingForm(language.id, tense, verb.forms[tense][pronoun]),
  );

export const createPromptPool = (language: Language, practiceTense: PracticeTenseId, verbInfinitives?: ReadonlySet<string>): Prompt[] =>
  (verbInfinitives ? language.verbs.filter((verb) => verbInfinitives.has(verb.infinitive)) : language.verbs).flatMap((verb) =>
    getPracticeTenses(practiceTense, language.id).flatMap((tense) =>
      getConjugationPronouns(language, tense, verb).map((pronoun) => {
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

const resolveReviewPrompt = (promptPool: Prompt[], target: ReviewTarget): Prompt | undefined => {
  const match = promptPool.find((prompt) => matchesReviewTarget(prompt, target));
  return match && target.pronounLabel ? { ...match, selectedPronounLabel: target.pronounLabel } : match;
};

export const createSessionPrompts = (
  language: Language,
  practiceTense: PracticeTenseId,
  reviewTargets: ReviewTarget[] = [],
  { limit = defaultPracticeQuestionCount, verbInfinitives }: { limit?: number; verbInfinitives?: ReadonlySet<string> } = {},
) => {
  const promptPool = createPromptPool(language, practiceTense, verbInfinitives);
  const reviewLimit = Math.ceil(Math.min(limit, promptPool.length) * 0.3);
  const reviewPrompts = shufflePrompts(reviewTargets)
    .map((target) => resolveReviewPrompt(promptPool, target))
    .filter((prompt): prompt is Prompt => Boolean(prompt))
    .slice(0, reviewLimit);
  const reviewKeys = new Set(reviewPrompts.map(getPromptKey));
  const freshPool = shufflePrompts(promptPool.filter((prompt) => !reviewKeys.has(getPromptKey(prompt))));
  const remaining = limit - reviewPrompts.length;
  if (practiceTense !== 'commands' && practiceTense !== 'nonFinite') {
    const labels = { english: ['it'], french: [], italian: ['Lei'], spanish: ['usted', 'ustedes'] }[language.id];
    const featuredPrompts = labels.flatMap((label) => {
      if (reviewPrompts.some((prompt) => prompt.selectedPronounLabel === label)) return [];
      const prompt = freshPool.find((entry) => entry.selectedPronounLabel === label);
      return prompt ? [prompt] : [];
    }).slice(0, remaining);
    const otherPrompts = freshPool.filter((prompt) => !featuredPrompts.includes(prompt));
    return shufflePrompts([...reviewPrompts, ...featuredPrompts, ...otherPrompts.slice(0, remaining - featuredPrompts.length)]);
  }

  const groupedTenses = getPracticeTenses(practiceTense, language.id);
  const balanced = groupedTenses.flatMap((tense, index) => {
    const quota = Math.floor(limit / groupedTenses.length) + Number(index < limit % groupedTenses.length);
    const reviewCount = reviewPrompts.filter((prompt) => prompt.tense === tense).length;
    return freshPool.filter((prompt) => prompt.tense === tense).slice(0, Math.max(0, quota - reviewCount));
  });
  const sampled = new Set(balanced);
  const extra = freshPool.filter((prompt) => !sampled.has(prompt)).slice(0, Math.max(0, remaining - balanced.length));
  return shufflePrompts([...reviewPrompts, ...balanced.slice(0, remaining), ...extra]);
};

/** Targets arrive in priority order (due first), so trim before shuffling. */
export const createMissSessionPrompts = (language: Language, reviewTargets: ReviewTarget[], limit = defaultPracticeQuestionCount): Prompt[] => {
  const promptPool = getLanguageTenses(language.id).flatMap(({ id }) => createPromptPool(language, id));
  const reviewPrompts = reviewTargets
    .map((target) => resolveReviewPrompt(promptPool, target))
    .filter((prompt): prompt is Prompt => Boolean(prompt))
    .slice(0, limit);

  return shufflePrompts(reviewPrompts);
};

/** A focused set drawn from every tense of the given verbs. */
export const createVerbSessionPrompts = (language: Language, verbInfinitives: string[], limit = defaultPracticeQuestionCount): Prompt[] =>
  shufflePrompts(createPromptPool(language, 'mixed', new Set(verbInfinitives))).slice(0, limit);

export const getFallbackPrompt = (language: Language, practiceTense: PracticeTenseId): Prompt => {
  for (const tense of getPracticeTenses(clampEnglishTense(language.id, practiceTense), language.id)) {
    for (const verb of language.verbs) {
      const pronoun = getConjugationPronouns(language, tense, verb)[0];
      if (pronoun) {
        return { language, verb, tense, pronoun, selectedPronounLabel: choosePromptPronounLabel(language, verb, tense, pronoun) };
      }
    }
  }
  throw new Error(`${language.name} needs at least one available verb form`);
};

export const getAnswer = (prompt: Prompt) => {
  if (isFrenchEtrePast(prompt.language.id, prompt.tense, prompt.verb) && isFrenchFemininePronounLabel(prompt.selectedPronounLabel)) {
    return getFrenchEtrePastForms(prompt.verb, prompt.pronoun).feminine;
  }
  return prompt.verb.forms[prompt.tense][prompt.pronoun];
};

export const getPronounLabel = (prompt: Prompt) =>
  withMoodMarker(
    prompt.language.id,
    prompt.tense,
    prompt.selectedPronounLabel || getConjugationPronounLabel(prompt.language, prompt.tense, prompt.pronoun),
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

// Mistakes to test in the simple past: regularized spellings and confused past participles.
const englishPastDistractors = new Map([
  ['to become', 'becomed'],
  ['to begin', 'beginned'],
  ['to break', 'breaked'],
  ['to bring', 'bringed'],
  ['to build', 'builded'],
  ['to buy', 'buyed'],
  ['to catch', 'catched'],
  ['to choose', 'choosed'],
  ['to come', 'comed'],
  ['to cut', 'cutted'],
  ['to do', 'done'],
  ['to draw', 'drawed'],
  ['to drink', 'drunk'],
  ['to drive', 'drived'],
  ['to eat', 'eated'],
  ['to fall', 'falled'],
  ['to feed', 'feeded'],
  ['to feel', 'feeled'],
  ['to fight', 'fighted'],
  ['to find', 'finded'],
  ['to fly', 'flown'],
  ['to forget', 'forgetted'],
  ['to forgive', 'forgived'],
  ['to freeze', 'freezed'],
  ['to get', 'getted'],
  ['to give', 'gived'],
  ['to go', 'goed'],
  ['to grow', 'growed'],
  ['to have', 'haved'],
  ['to hear', 'heared'],
  ['to hide', 'hided'],
  ['to hit', 'hitted'],
  ['to hold', 'holded'],
  ['to hurt', 'hurted'],
  ['to keep', 'keeped'],
  ['to know', 'knowed'],
  ['to lead', 'leaded'],
  ['to leave', 'leaved'],
  ['to lend', 'lended'],
  ['to let', 'letted'],
  ['to lose', 'losed'],
  ['to make', 'maked'],
  ['to mean', 'meaned'],
  ['to meet', 'meeted'],
  ['to put', 'putted'],
  ['to read', 'readed'],
  ['to ride', 'rided'],
  ['to ring', 'rung'],
  ['to rise', 'rised'],
  ['to run', 'runned'],
  ['to say', 'sayed'],
  ['to see', 'seen'],
  ['to sell', 'selled'],
  ['to send', 'sended'],
  ['to shake', 'shaked'],
  ['to shut', 'shutted'],
  ['to sing', 'sung'],
  ['to sit', 'sitted'],
  ['to sleep', 'sleeped'],
  ['to speak', 'speaked'],
  ['to spend', 'spended'],
  ['to stand', 'standed'],
  ['to steal', 'stealed'],
  ['to swim', 'swimmed'],
  ['to take', 'taked'],
  ['to teach', 'teached'],
  ['to tell', 'telled'],
  ['to think', 'thinked'],
  ['to throw', 'throwed'],
  ['to understand', 'understanded'],
  ['to wear', 'worn'],
  ['to win', 'winned'],
  ['to write', 'writed'],
]);

export const getChoices = (prompt: Prompt, seed: number, choiceCount = 4, authoredDistractors: readonly string[] = []) => {
  const correctAnswer = getAnswer(prompt);
  const englishDistractor = prompt.language.id === 'english' ? englishPastDistractors.get(prompt.verb.infinitive) : undefined;
  if (isNonFiniteForm(prompt.tense)) {
    const { language, verb, tense } = prompt;
    const base = language.id === 'english' ? verb.infinitive.replace(/^to /, '') : verb.infinitive;
    const past = verb.forms.past.I;
    const spelling = language.id === 'english' && tense === 'presentParticiple' && correctAnswer.endsWith('ing') && correctAnswer !== `${base}ing`
      ? `${base}ing` : undefined;
    const accepted = new Set([correctAnswer, ...(verb.nonFinite?.accepted?.[tense] ?? [])]);
    const choices = [
      ...authoredDistractors, spelling, base, past.slice(past.lastIndexOf(' ') + 1),
      englishDistractor, verb.nonFinite?.pastParticiple, verb.nonFinite?.presentParticiple, verb.nonFinite?.gerund,
      ...Object.values(verb.forms.present), ...Object.values(verb.forms.imperfect), ...Object.values(verb.forms.future),
    ].filter((form): form is string => Boolean(form && !accepted.has(form)));
    return shufflePrompts([correctAnswer, ...[...new Set(choices)].slice(0, choiceCount - 1)]);
  }
  const pastDistractor = prompt.tense === 'past' && choiceCount > 1 ? englishDistractor : undefined;
  const formLimit = choiceCount - (pastDistractor ? 2 : 1);
  const isUsableDistractor = (value: string, existing: readonly string[]) =>
    Boolean(value) &&
    value !== correctAnswer &&
    value !== pastDistractor &&
    !existing.includes(value) &&
    !isCommandVariant(prompt.language.id, prompt.verb.infinitive, prompt.tense, prompt.pronoun, value);
  const pickDistractors = (candidates: string[], limit: number, existing: readonly string[]) =>
    candidates
      .filter((value, index, values) => isUsableDistractor(value, existing) && values.indexOf(value) === index)
      .sort((first, second) => stableScore(first, seed) - stableScore(second, seed))
      .slice(0, limit);

  const pronouns = getConjugationPronouns(prompt.language, prompt.tense, prompt.verb);
  // Negative imperatives carry negation markers, so keep distractors within the same polarity when possible.
  const sameTenseLimit = prompt.tense === 'imperativeNegative' ? formLimit : Math.min(1, formLimit);
  const frenchGenderDistractor = getFrenchEtreOppositeGenderForm(prompt);
  const sameTenseCandidates = frenchGenderDistractor
    ? [frenchGenderDistractor]
    : pronouns.map((pronoun) => prompt.verb.forms[prompt.tense][pronoun]);
  const sameTenseDistractors = pickDistractors(
    sameTenseCandidates,
    sameTenseLimit,
    [],
  );

  const otherTenses = getLanguageTenses(prompt.language.id).filter(
    ({ id }) => id !== prompt.tense && !isNonFiniteForm(id) && (prompt.tense === 'imperativeNegative' || !isImperative(id)),
  );
  const samePersonDistractors = pickDistractors(
    otherTenses
      .filter(({ id }) => getConjugationPronouns(prompt.language, id, prompt.verb).includes(prompt.pronoun))
      .map(({ id }) => prompt.verb.forms[id][prompt.pronoun]),
    formLimit - sameTenseDistractors.length,
    sameTenseDistractors,
  );

  const selectedDistractors = [...sameTenseDistractors, ...samePersonDistractors];
  const fallbackTenses = getLanguageTenses(prompt.language.id).filter(
    ({ id }) => !isNonFiniteForm(id) && (isImperative(prompt.tense) || !isImperative(id)),
  );
  const fallbackDistractors = pickDistractors(
    fallbackTenses.flatMap((tense) =>
      getConjugationPronouns(prompt.language, tense.id, prompt.verb).map((pronoun) => prompt.verb.forms[tense.id][pronoun]),
    ),
    formLimit - selectedDistractors.length,
    selectedDistractors,
  );
  const distractors = [...selectedDistractors, ...fallbackDistractors];
  if (pastDistractor) distractors.push(pastDistractor);

  if (prompt.language.id === 'english' && distractors.length < choiceCount - 1) {
    // In the sense of estimating a price, "costed" is valid. Use the conditional form for cost.
    const extraChoices = [englishDistractor, prompt.verb.forms.conditional[prompt.pronoun]];
    distractors.push(...extraChoices
      .filter((form): form is string => Boolean(form && form !== correctAnswer && !distractors.includes(form)))
      .slice(0, choiceCount - 1 - distractors.length));
  }

  return shufflePrompts([correctAnswer, ...distractors]);
};
