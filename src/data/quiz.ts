import { isCommandVariant, isImperative } from './imperative';
import { getLocalizedTenseName, type Locale } from '../lib/i18n';
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
  return quizScenes[tense].filter((scene) => getConjugationPronouns(language, tense).includes(scene.pronoun)).map((scene, index) => {
    const verb = language.verbs.find((entry) => entry.infinitive === quizVerbs[scene.verb][language.id]);
    const englishVerb = english.verbs.find((entry) => entry.infinitive === quizVerbs[scene.verb].english);
    if (!verb || !englishVerb) throw new Error(`Missing quiz verb ${scene.verb}`);
    const sentence = scene.sentence[language.id];
    if (!sentence) throw new Error(`Missing ${language.id} quiz scene for ${tense}`);
    const answer = verb.forms[tense][scene.pronoun];
    const alternatives = shuffle(available.filter((other) => other !== tense && (isImperative(tense) || !isImperative(other)))).map((other) => verb.forms[other][scene.pronoun]).filter(Boolean);
    const fallback = shuffle((Object.keys(verb.forms) as TenseId[]).filter((id) => isImperative(tense) || !isImperative(id)).flatMap((id) =>
      getConjugationPronouns(language, id, verb).map((pronoun) => verb.forms[id][pronoun]),
    ));
    const choices = shuffle([...new Set([answer, ...[...alternatives, ...fallback].filter((form) => !isCommandVariant(language.id, verb.infinitive, tense, scene.pronoun, form))])].slice(0, 4));
    const addressee = getConjugationPronounLabel(language, tense, scene.pronoun);
    const englishAnswer = scene.englishAnswer ?? englishVerb.forms[tense][scene.pronoun];
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

export const createQuizQuestions = (language: Language, selectedTense: PracticeTenseId): QuizQuestion[] => {
  const tenses = getLanguageTenses(language.id).map(({ id }) => id).filter((tense) => selectedTense === 'mixed' ? !isImperative(tense) : selectedTense === 'commands' ? isImperative(tense) : tense === selectedTense);
  const pool = tenses.flatMap((tense) => createQuizBank(language, tense));
  if (selectedTense === 'commands') return shuffle(tenses.flatMap((tense) => shuffle(pool.filter((question) => question.tense === tense)).slice(0, 5)));
  if (selectedTense !== 'mixed') return shuffle(pool).slice(0, 10);
  const selected = tenses.flatMap((tense) => shuffle(pool.filter((question) => question.tense === tense)).slice(0, 1));
  return shuffle([...selected, ...shuffle(pool.filter((question) => !selected.includes(question))).slice(0, 10 - selected.length)]);
};
