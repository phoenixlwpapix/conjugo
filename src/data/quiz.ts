import { isCommandVariant, isImperative } from './imperative';
import { getLocalizedTenseName, type Locale } from '../lib/i18n';
import { defaultQuizQuestionCount, type PracticeQuestionCount } from '../lib/prompts';
import { getConjugationPronouns, getConjugationPronounLabel, getLanguageTenses, languages, type Language, type PracticeTenseId, type Pronoun, type TenseId, type VerbEntry } from './verbs';
import { quizScenes, quizVerbs } from './quizScenes';

export type QuizQuestion = {
  id: string;
  tense: TenseId;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sentence: string;
  translation: Record<Locale, string>;
  explanation: Record<Locale, string>;
  pronoun: Pronoun;
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

export const createQuizBank = (language: Language, tense: TenseId): QuizQuestion[] => {
  const available = getLanguageTenses(language.id).map(({ id }) => id);
  if (!available.includes(tense)) return [];
  const english = languages.find((entry) => entry.id === 'english');
  if (!english) throw new Error('English verb data is missing');
  const verbIndex = new Map(language.verbs.map((verb) => [verb.infinitive, verb]));
  const englishVerbIndex = new Map(english.verbs.map((verb) => [verb.infinitive, verb]));
  const pronouns = new Set(getConjugationPronouns(language, tense));
  return quizScenes[tense].filter((scene) => pronouns.has(scene.pronoun)).map((scene, index) => {
    const verb = verbIndex.get(quizVerbs[scene.verb][language.id]);
    const englishVerb = englishVerbIndex.get(quizVerbs[scene.verb].english);
    if (!verb || !englishVerb) throw new Error(`Missing quiz verb ${scene.verb}`);
    const sentence = scene.sentence[language.id];
    if (!sentence) throw new Error(`Missing ${language.id} quiz scene for ${tense}`);
    const answer = verb.forms[tense][scene.pronoun];
    // These two French tenses can narrate the same event in different registers.
    const alternateFrenchPast = language.id === 'french' && (tense === 'passeSimple' ? 'past' : tense === 'past' ? 'passeSimple' : null);
    const canUseAsDistractor = (other: TenseId) => other !== alternateFrenchPast && (isImperative(tense) || !isImperative(other));
    const alternatives = shuffle(available.filter((other) => other !== tense && canUseAsDistractor(other))).map((other) => verb.forms[other][scene.pronoun]).filter(Boolean);
    const fallback = shuffle((Object.keys(verb.forms) as TenseId[]).filter(canUseAsDistractor).flatMap((id) =>
      getConjugationPronouns(language, id, verb).map((pronoun) => verb.forms[id][pronoun]),
    ));
    const choices = shuffle([...new Set([answer, ...[...alternatives, ...fallback].filter((form) => !isCommandVariant(language.id, verb.infinitive, tense, scene.pronoun, form))])].slice(0, 4));
    const addressee = getConjugationPronounLabel(language, tense, scene.pronoun);
    const englishAnswer = scene.englishAnswer ?? englishVerb.forms[tense === 'passeSimple' ? 'past' : tense][scene.pronoun];
    return {
      id: `${tense}-${index}`, tense, difficulty: scene.difficulty,
      sentence,
      translation: { zh: scene.zh, en: scene.sentence.english.replace('____', englishAnswer) },
      explanation: {
        zh: `${scene.reason.zh} 本题使用${getLocalizedTenseName(language, tense, 'zh')}（${language.tenseLabels[tense]}），${verb.infinitive} 在 ${addressee} 下的形式是“${answer}”。`,
        en: `${scene.reason.en} Use ${getLocalizedTenseName(language, tense, 'en')} (${language.tenseLabels[tense]}): the form of ${verb.infinitive} for ${addressee} is “${answer}”.`,
      },
      pronoun: scene.pronoun, verb, choices, answer,
    };
  });
};

export const createQuizQuestions = (
  language: Language,
  selectedTense: PracticeTenseId | readonly PracticeTenseId[],
  limit: PracticeQuestionCount = defaultQuizQuestionCount,
): QuizQuestion[] => {
  const selections = typeof selectedTense === 'string' ? [selectedTense] : selectedTense;
  const tenses = getLanguageTenses(language.id).map(({ id }) => id).filter((tense) => selections.some((selection) => selection === 'mixed' ? !isImperative(tense) : selection === 'commands' ? isImperative(tense) : tense === selection));
  const banks = tenses.map((tense) => shuffle(createQuizBank(language, tense)));
  if (banks.length <= 1) return banks[0]?.slice(0, limit) ?? [];

  const perTense = selections.length === 1 && selections[0] === 'commands' ? limit / 2 : 1;
  const selected = banks.flatMap((bank) => bank.slice(0, perTense));
  const remaining = banks.flatMap((bank) => bank.slice(perTense));
  return shuffle([...selected, ...shuffle(remaining).slice(0, limit - selected.length)]);
};
