import { getLanguageTenses, type Language, type PracticeTenseId, type Pronoun, type TenseId, type VerbEntry } from './verbs';

export type QuizQuestion = {
  id: string;
  tense: TenseId;
  difficulty: 'Starter' | 'Intermediate' | 'Challenge';
  situation: string;
  clue: string;
  explanation: string;
  pronoun: Pronoun;
  verb: VerbEntry;
  choices: string[];
  answer: string;
};

type Seed = { situation: string; clue: string };

// Twenty authored contexts for each tense. The first seven are direct cues,
// the next seven require distinguishing a neighboring tense, and the last six
// use clauses or a less obvious time reference.
export const quizBank: Record<TenseId, Seed[]> = {
  present: [
    { situation: 'Every weekday before breakfast', clue: 'a repeated daily routine' },
    { situation: 'As a general rule', clue: 'a habit or general truth' },
    { situation: 'Usually on Mondays', clue: 'a recurring weekly habit' },
    { situation: 'Every time the bell rings', clue: 'an action that regularly follows another' },
    { situation: 'Nowadays, as part of a routine', clue: 'a current regular habit' },
    { situation: 'On most weekends', clue: 'a recurring weekend action' },
    { situation: 'Whenever there is enough time', clue: 'a repeated conditional habit' },
    { situation: 'In general, without a date in mind', clue: 'a general statement, not a completed event' },
    { situation: 'Each time the group meets', clue: 'a repeated event' },
    { situation: 'These days, as a matter of habit', clue: 'a present-day routine' },
    { situation: 'At the same hour every evening', clue: 'a scheduled repeated action' },
    { situation: 'Whenever the weather is good', clue: 'a recurring condition' },
    { situation: 'Normally, even during a busy week', clue: 'what normally happens' },
    { situation: 'Every year without exception', clue: 'a regularly recurring event' },
    { situation: 'Although yesterday was different, normally', clue: 'the normal pattern rather than yesterday’s exception' },
    { situation: 'Even if tomorrow changes, for now', clue: 'a current fact rather than a future plan' },
    { situation: 'Whenever this situation comes up', clue: 'a general recurring response' },
    { situation: 'Not just once: week after week', clue: 'repetition in the present' },
    { situation: 'As a standing rule in this family', clue: 'an ongoing custom' },
    { situation: 'Despite a one-time change last week, usually', clue: 'the usual action, not the past exception' },
  ],
  past: [
    { situation: 'Yesterday afternoon', clue: 'a finished event yesterday' },
    { situation: 'Last Saturday, on one occasion', clue: 'one completed event last Saturday' },
    { situation: 'Two days ago', clue: 'a completed action at a definite past time' },
    { situation: 'Earlier this morning, once', clue: 'one completed action earlier today' },
    { situation: 'At the end of last week', clue: 'a finished event last week' },
    { situation: 'Last night, just once', clue: 'one finished event last night' },
    { situation: 'On the day of the party', clue: 'a single completed event' },
    { situation: 'After the meeting ended yesterday', clue: 'an event completed after another past event' },
    { situation: 'Once, during last summer', clue: 'one completed event within a past period' },
    { situation: 'When the train arrived this morning', clue: 'a single event at a particular past moment' },
    { situation: 'Before going home last Friday', clue: 'an action completed last Friday' },
    { situation: 'The first time, back in 2020', clue: 'one dated past occurrence' },
    { situation: 'Immediately after the call ended', clue: 'the next completed action in a sequence' },
    { situation: 'At exactly noon yesterday', clue: 'a definite finished past event' },
    { situation: 'Although it was not the usual routine, that one day', clue: 'a single past exception' },
    { situation: 'Once the door opened last night', clue: 'a completed action in a past sequence' },
    { situation: 'That time, and never again', clue: 'a non-recurring finished event' },
    { situation: 'After years of waiting, finally last month', clue: 'a completed event with a defined endpoint' },
    { situation: 'During the trip, on the final day only', clue: 'one bounded event, not a repeated background habit' },
    { situation: 'Just before the clock struck midnight yesterday', clue: 'a single action at a definite past moment' },
  ],
  imperfect: [
    { situation: 'When I was a child, every summer', clue: 'a repeated habit in the past' },
    { situation: 'Back then, every morning', clue: 'a past routine without a stated endpoint' },
    { situation: 'In those days, usually', clue: 'what used to happen' },
    { situation: 'While the rain was falling', clue: 'background action in progress in the past' },
    { situation: 'At that time in life', clue: 'an ongoing past situation' },
    { situation: 'Before moving away, every week', clue: 'a former recurring habit' },
    { situation: 'During childhood, year after year', clue: 'repetition across an earlier period' },
    { situation: 'Whenever school finished back then', clue: 'a repeated past response' },
    { situation: 'While everyone else waited', clue: 'background action simultaneous with another past action' },
    { situation: 'For years, as a usual habit', clue: 'an ongoing repeated past habit' },
    { situation: 'When the town was smaller, normally', clue: 'a former general pattern' },
    { situation: 'Each evening before the old routine changed', clue: 'past habitual repetition' },
    { situation: 'As the story begins, in the background', clue: 'scene-setting past action' },
    { situation: 'Before the new job, most days', clue: 'a recurring action in a past period' },
    { situation: 'While the guests were arriving', clue: 'an unfinished background action' },
    { situation: 'Not on one particular day, but throughout that winter', clue: 'ongoing past activity rather than one completed event' },
    { situation: 'Every time that old song played', clue: 'habitual response in the past' },
    { situation: 'As the sun was setting, still', clue: 'an action in progress as background' },
    { situation: 'Although one day was different, usually back then', clue: 'the past habit rather than a single exception' },
    { situation: 'In the years before the change, again and again', clue: 'repeated past action without a single endpoint' },
  ],
  future: [
    { situation: 'Tomorrow morning', clue: 'a time after now' },
    { situation: 'Next Saturday', clue: 'a future date' },
    { situation: 'In two weeks', clue: 'a later planned time' },
    { situation: 'Next year', clue: 'a future year' },
    { situation: 'Soon, but not today', clue: 'an action yet to happen' },
    { situation: 'At this time tomorrow', clue: 'tomorrow rather than now' },
    { situation: 'After the upcoming meeting', clue: 'an event still ahead' },
    { situation: 'Once the new term begins next month', clue: 'an action in an upcoming period' },
    { situation: 'When the train arrives tomorrow', clue: 'a later event' },
    { situation: 'By next Friday', clue: 'a future deadline' },
    { situation: 'On the first day of the next trip', clue: 'an upcoming event' },
    { situation: 'In the years ahead', clue: 'a projected later time' },
    { situation: 'As soon as the office opens tomorrow', clue: 'an action expected tomorrow' },
    { situation: 'After the results are announced next week', clue: 'a later consequence' },
    { situation: 'Even though it has not happened yet, next month', clue: 'an upcoming action, not a past one' },
    { situation: 'When this season ends', clue: 'a point after the present' },
    { situation: 'On the day after tomorrow', clue: 'a specific future day' },
    { situation: 'Provided the plan goes ahead next year', clue: 'a projected future event' },
    { situation: 'Not as a current habit, but on the next occasion', clue: 'one upcoming occasion' },
    { situation: 'Once the wait is over later this evening', clue: 'an event expected later' },
  ],
  conditional: [
    { situation: 'If there were enough time', clue: 'an imagined condition' },
    { situation: 'If the weather were better', clue: 'a hypothetical condition' },
    { situation: 'In that imagined situation', clue: 'an unreal scenario' },
    { situation: 'If money were no obstacle', clue: 'a hypothetical possibility' },
    { situation: 'Given the chance, hypothetically', clue: 'what would happen' },
    { situation: 'If the plan changed', clue: 'the consequence of a possible condition' },
    { situation: 'If the door were open', clue: 'an imagined result' },
    { situation: 'If there were no deadline', clue: 'a hypothetical outcome' },
    { situation: 'With a little more help, perhaps', clue: 'a possible result under a condition' },
    { situation: 'If the journey were shorter', clue: 'a result that depends on an unreal condition' },
    { situation: 'If I were in your place', clue: 'an imagined alternative' },
    { situation: 'Under different circumstances', clue: 'a non-factual outcome' },
    { situation: 'If the invitation arrived', clue: 'a conditional consequence' },
    { situation: 'Without that obstacle', clue: 'what would happen if the obstacle vanished' },
    { situation: 'Even though the chance is unlikely, if it appeared', clue: 'a hypothetical result, not a scheduled future event' },
    { situation: 'If yesterday’s decision were reversed', clue: 'the imagined consequence of changing a fact' },
    { situation: 'Supposing there were another opportunity', clue: 'an imagined outcome' },
    { situation: 'Were the rules different', clue: 'a result dependent on an unreal premise' },
    { situation: 'If the busy season ended early', clue: 'a possible consequence rather than a certainty' },
    { situation: 'If, contrary to fact, everything were ready', clue: 'an unreal condition and its result' },
  ],
  subjunctive: [
    { situation: 'I hope that', clue: 'a wish, not an asserted fact' },
    { situation: 'It is important that', clue: 'necessity or importance' },
    { situation: 'I want that', clue: 'someone’s wish about another action' },
    { situation: 'It is necessary that', clue: 'a requirement' },
    { situation: 'I doubt that', clue: 'doubt rather than certainty' },
    { situation: 'I am glad that', clue: 'an emotional reaction' },
    { situation: 'It is possible that', clue: 'possibility rather than a stated fact' },
    { situation: 'I insist that', clue: 'a demand' },
    { situation: 'I fear that', clue: 'fear or uncertainty' },
    { situation: 'I prefer that', clue: 'a preference about another action' },
    { situation: 'It is better that', clue: 'a judgment or recommendation' },
    { situation: 'I ask that', clue: 'a request' },
    { situation: 'I am surprised that', clue: 'an emotional response' },
    { situation: 'It is unlikely that', clue: 'uncertainty, not an assertion' },
    { situation: 'Even if I cannot guarantee it, I hope that', clue: 'a hoped-for action' },
    { situation: 'Although there is no proof, it is possible that', clue: 'possibility rather than certainty' },
    { situation: 'What matters most is that', clue: 'a value judgment' },
    { situation: 'I would be relieved if I knew that', clue: 'an emotionally framed, uncertain action' },
    { situation: 'Despite the objections, I insist that', clue: 'a demand, not a report of fact' },
    { situation: 'Whether or not it actually happens, I wish that', clue: 'desire rather than factual assertion' },
  ],
};

const verbsByMeaning = {
  go: { english: 'to go', french: 'aller', spanish: 'ir', italian: 'andare' },
  eat: { english: 'to eat', french: 'manger', spanish: 'comer', italian: 'mangiare' },
  speak: { english: 'to speak', french: 'parler', spanish: 'hablar', italian: 'parlare' },
  work: { english: 'to work', french: 'travailler', spanish: 'trabajar', italian: 'lavorare' },
  live: { english: 'to live', french: 'vivre', spanish: 'vivir', italian: 'vivere' },
  have: { english: 'to have', french: 'avoir', spanish: 'tener', italian: 'avere' },
} as const;

const meanings = Object.keys(verbsByMeaning) as Array<keyof typeof verbsByMeaning>;
const subjects: Pronoun[] = ['I', 'you', 'he/she', 'we', 'they'];
const tenseContrast: Record<TenseId, string> = {
  present: 'This describes a present habit or general fact, rather than a finished past event or a future plan.',
  past: 'The event is finished and bounded in time; an imperfect form would describe an ongoing background or repeated past habit.',
  imperfect: 'The action was habitual or in progress in the background; a simple completed past form would present it as one bounded event.',
  future: 'The event is expected after now; a conditional form would instead depend on an imagined “if” condition.',
  conditional: 'The action depends on an imagined condition, so it expresses what would happen rather than what will definitely happen.',
  subjunctive: 'The opening clause expresses a wish, feeling, demand, judgment, or uncertainty, so the action is presented through that attitude rather than as a plain fact.',
};

const shuffle = <Value,>(items: Value[]): Value[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
};

export const createQuizQuestions = (language: Language, selectedTense: PracticeTenseId): QuizQuestion[] => {
  const available = getLanguageTenses(language.id).map(({ id }) => id);
  const tenses = selectedTense === 'mixed' ? available : available.filter((tense) => tense === selectedTense);
  const pool = tenses.flatMap((tense) => quizBank[tense].map((seed, index) => {
    const meaning = meanings[index % meanings.length];
    const infinitive = verbsByMeaning[meaning][language.id];
    const verb = language.verbs.find((entry) => entry.infinitive === infinitive);
    if (!verb) throw new Error(`Missing quiz verb ${infinitive}`);
    const pronoun = subjects[index % subjects.length];
    const answer = verb.forms[tense][pronoun];
    const alternatives = shuffle(available.filter((other) => other !== tense)).map((other) => verb.forms[other][pronoun]);
    const choices = [answer, ...alternatives.filter((form, position) => form !== answer && alternatives.indexOf(form) === position)].slice(0, Math.min(4, available.length));
    return {
      id: `${tense}-${index}`,
      tense,
      difficulty: index < 7 ? 'Starter' as const : index < 14 ? 'Intermediate' as const : 'Challenge' as const,
      situation: seed.situation,
      clue: seed.clue,
      explanation: `The clue is ${seed.clue}. ${tenseContrast[tense]} This calls for ${language.tenseLabels[tense]} in ${language.name}. For ${language.pronounLabels[pronoun]} + ${verb.infinitive}, the matching form is “${answer}”; the alternatives are forms of this same subject in other tenses.`,
      pronoun,
      verb,
      choices: shuffle(choices),
      answer,
    };
  }));

  if (selectedTense !== 'mixed') return shuffle(pool).slice(0, 10);
  // Ensure a mixed set actually covers every available tense.
  const selected = tenses.flatMap((tense) => shuffle(pool.filter((question) => question.tense === tense)).slice(0, 1));
  const remaining = pool.filter((question) => !selected.includes(question));
  return shuffle([...selected, ...shuffle(remaining).slice(0, 10 - selected.length)]);
};
