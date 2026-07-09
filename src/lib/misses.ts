import type { Language, PracticeTenseId } from '../data/verbs';
import type { Prompt, ReviewTarget, StoredMiss } from '../types';
import { getAnswer, getPracticeTenses, getPromptKey } from './prompts';

export const getMissKey = (miss: Pick<StoredMiss, 'languageId' | 'verbInfinitive' | 'tense' | 'pronoun'>) =>
  `${miss.languageId}::${miss.verbInfinitive}::${miss.tense}::${miss.pronoun}`;

export const getReviewTargets = (
  language: Language,
  practiceTense: PracticeTenseId,
  misses: StoredMiss[],
): ReviewTarget[] => {
  const activeTenses = new Set(getPracticeTenses(practiceTense, language.id));
  const verbInfinitives = new Set(language.verbs.map((verb) => verb.infinitive));

  return misses
    .filter((miss) => miss.languageId === language.id && activeTenses.has(miss.tense) && verbInfinitives.has(miss.verbInfinitive))
    .map((miss) => ({
      verbInfinitive: miss.verbInfinitive,
      tense: miss.tense,
      pronoun: miss.pronoun,
    }));
};

export const upsertMiss = (current: StoredMiss[], attemptPrompt: Prompt, limit = 24): StoredMiss[] => {
  const miss: StoredMiss = {
    languageId: attemptPrompt.language.id,
    verbInfinitive: attemptPrompt.verb.infinitive,
    tense: attemptPrompt.tense,
    pronoun: attemptPrompt.pronoun,
    answer: getAnswer(attemptPrompt),
    missedAt: Date.now(),
  };
  const missKey = getMissKey(miss);

  return [miss, ...current.filter((item) => getMissKey(item) !== missKey)].slice(0, limit);
};

export const clearMasteredMiss = (current: StoredMiss[], attemptPrompt: Prompt): StoredMiss[] => {
  const masteredKey = `${attemptPrompt.language.id}::${getPromptKey(attemptPrompt)}`;
  return current.filter(
    (item) => `${item.languageId}::${item.verbInfinitive}::${item.tense}::${item.pronoun}` !== masteredKey,
  );
};
