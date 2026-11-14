import { isCommandVariant, isImperative } from './imperative';
import { getLocalizedTenseName, type Locale } from '../lib/i18n';
import { defaultQuizQuestionCount, getChoices, getPracticeTenses, type PracticeQuestionCount } from '../lib/prompts';
import { getConjugationPronouns, getConjugationPronounLabel, getLanguageTenses, languages, type Language, type PracticeTenseId, type Pronoun, type TenseId, type VerbEntry } from './verbs';
import { quizScenes, quizVerbs, type FeaturedSubject } from './quizScenes';
import { englishNonFiniteScenes } from './nonFinite/englishScenes';
import { frenchNonFiniteScenes } from './nonFinite/frenchScenes';
import { italianNonFiniteScenes } from './nonFinite/italianScenes';
import { spanishNonFiniteScenes } from './nonFinite/spanishScenes';
import { isNonFiniteForm, type NonFiniteScene } from './nonFinite/types';

export type QuizQuestion = {
  id: string;
  tense: TenseId;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sentence: string;
  translation: Record<Locale, string>;
  explanation: Record<Locale, string>;
  pronoun: Pronoun;
  pronounLabel: string;
  featuredSubject?: FeaturedSubject;
  verb: VerbEntry;
  choices: string[];
  answer: string;
};

const shuffle = <Value,>(items: Value[]): Value[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
};

const nonFiniteScenes: Record<Language['id'], readonly NonFiniteScene[]> = {
  english: englishNonFiniteScenes, french: frenchNonFiniteScenes,
  italian: italianNonFiniteScenes, spanish: spanishNonFiniteScenes,
};

export const createQuizBank = (language: Language, tense: TenseId): QuizQuestion[] => {
  const available = getLanguageTenses(language.id).map(({ id }) => id);
  if (!available.includes(tense)) return [];
  if (isNonFiniteForm(tense)) {
    const verbs = new Map(language.verbs.map((verb) => [verb.infinitive, verb]));
    return nonFiniteScenes[language.id].filter((scene) => scene.form === tense &&
      !(scene.usesVosotros && language.excludedPronouns?.includes('you plural'))).map((scene, index) => {
      const verb = verbs.get(scene.verb);
      const pronoun = 'he/she';
      const answer = verb?.nonFinite?.[tense];
      if (!verb || !answer) throw new Error(`Missing ${language.id} ${tense} for ${scene.verb}`);
      return {
        id: `${tense}-${index}`, tense, difficulty: 'intermediate', sentence: scene.sentence,
        translation: scene.translation, explanation: scene.reason,
        pronoun, pronounLabel: '', verb, answer,
        choices: getChoices({ language, verb, tense, pronoun }, index, 4, scene.distractors),
      };
    });
  }
  const english = languages.find((entry) => entry.id === 'english');
  if (!english) throw new Error('English verb data is missing');
  const verbIndex = new Map(language.verbs.map((verb) => [verb.infinitive, verb]));
  const englishVerbIndex = new Map(english.verbs.map((verb) => [verb.infinitive, verb]));
  const pronouns = new Set(getConjugationPronouns(language, tense));
  const scenes = quizScenes[tense].filter((scene) => pronouns.has(scene.pronoun) && (!scene.studyLanguage || language.id === scene.studyLanguage));
  return scenes.map((scene, index) => {
    const verb = verbIndex.get(quizVerbs[scene.verb][language.id]);
    const englishVerb = englishVerbIndex.get(quizVerbs[scene.verb].english);
    if (!verb || !englishVerb) throw new Error(`Missing quiz verb ${scene.verb}`);
    const sentence = scene.sentence[language.id];
    if (!sentence) throw new Error(`Missing ${language.id} quiz scene for ${tense}`);
    const answer = verb.forms[tense][scene.pronoun];
    // These two French tenses can narrate the same event in different registers.
    const alternateFrenchPast = language.id === 'french' && (tense === 'passeSimple' ? 'past' : tense === 'past' ? 'passeSimple' : null);
    const canUseAsDistractor = (other: TenseId) => !isNonFiniteForm(other) && other !== alternateFrenchPast && (isImperative(tense) || !isImperative(other));
    const alternatives = shuffle(available.filter((other) => other !== tense && canUseAsDistractor(other))).map((other) => verb.forms[other][scene.pronoun]).filter(Boolean);
    const fallback = shuffle((Object.keys(verb.forms) as TenseId[]).filter(canUseAsDistractor).flatMap((id) =>
      getConjugationPronouns(language, id, verb).map((pronoun) => verb.forms[id][pronoun]),
    ));
    const choices = shuffle([...new Set([answer, ...[...alternatives, ...fallback].filter((form) => !isCommandVariant(language.id, verb.infinitive, tense, scene.pronoun, form))])].slice(0, 4));
    const subject = scene.pronounLabel ?? (isImperative(tense)
      ? getConjugationPronounLabel(language, tense, scene.pronoun)
      : language.pronounLabels[scene.pronoun]);
    const englishAnswer = scene.englishAnswer ?? englishVerb.forms[tense === 'passeSimple' ? 'past' : tense][scene.pronoun];
    return {
      id: `${tense}-${index}`, tense, difficulty: scene.difficulty,
      sentence,
      translation: { zh: scene.zh, en: scene.sentence.english.replace('____', englishAnswer) },
      explanation: {
        zh: `${scene.reason.zh} 本题使用${getLocalizedTenseName(language, tense, 'zh')}（${language.tenseLabels[tense]}），${verb.infinitive} 在 ${subject} 下的形式是“${answer}”。`,
        en: `${scene.reason.en} Use ${getLocalizedTenseName(language, tense, 'en')} (${language.tenseLabels[tense]}): the form of ${verb.infinitive} for ${subject} is “${answer}”.`,
      },
      pronoun: scene.pronoun, pronounLabel: subject, featuredSubject: scene.featuredSubject, verb, choices, answer,
    };
  });
};

export const createQuizQuestions = (
  language: Language,
  selectedTense: PracticeTenseId | readonly PracticeTenseId[],
  limit: PracticeQuestionCount = defaultQuizQuestionCount,
): QuizQuestion[] => {
  const selections = typeof selectedTense === 'string' ? [selectedTense] : selectedTense;
  const selectedTenses = new Set(selections.flatMap((selection) => getPracticeTenses(selection, language.id)));
  const tenses = getLanguageTenses(language.id).map(({ id }) => id).filter((tense) => selectedTenses.has(tense));
  const banks = tenses.map((tense) => shuffle(createQuizBank(language, tense)));
  const perTense = selections.length === 1 && (selections[0] === 'commands' || selections[0] === 'nonFinite') ? limit / 2 : 1;
  const initial = banks.flatMap((bank) => bank.slice(0, banks.length === 1 ? limit : perTense));
  const selected = initial.length > limit ? shuffle(initial).slice(0, limit) : initial;
  const remaining = banks.flatMap((bank) => bank.slice(perTense));
  const round = banks.length <= 1 ? selected : shuffle([...selected, ...shuffle(remaining).slice(0, limit - selected.length)]);

  // Include the featured subjects that fit the selection while retaining its tense distribution.
  const candidates = shuffle(banks.flat().filter((question) => question.featuredSubject));
  for (const subject of new Set(candidates.map((question) => question.featuredSubject))) {
    if (round.some((question) => question.featuredSubject === subject)) continue;
    const replacement = candidates.find((question) => question.featuredSubject === subject &&
      round.some((entry) => entry.tense === question.tense && !entry.featuredSubject));
    if (replacement) {
      const index = round.findIndex((entry) => entry.tense === replacement.tense && !entry.featuredSubject);
      round[index] = replacement;
    }
  }
  return round;
};
