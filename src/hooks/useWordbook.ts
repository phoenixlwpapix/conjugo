import { useEffect, useMemo, useState } from 'react';
import type { Language, TenseId } from '../data/verbs';
import type { Prompt } from '../types';

export const useWordbook = (activeLanguage: Language) => {
  const [bookTense, setBookTense] = useState<TenseId>('present');
  const [selectedVerbInfinitive, setSelectedVerbInfinitive] = useState(activeLanguage.verbs[0]?.infinitive ?? '');
  const [wordbookQuery, setWordbookQuery] = useState('');

  useEffect(() => {
    setSelectedVerbInfinitive(activeLanguage.verbs[0]?.infinitive ?? '');
    setWordbookQuery('');
  }, [activeLanguage]);

  const filteredVerbs = useMemo(() => {
    const normalizedQuery = wordbookQuery.trim().toLowerCase();

    return activeLanguage.verbs
      .map((verb, index) => ({ index, verb }))
      .filter(({ verb }) => {
        if (!normalizedQuery) {
          return true;
        }

        return `${verb.infinitive} ${verb.translation}`.toLowerCase().includes(normalizedQuery);
      });
  }, [activeLanguage, wordbookQuery]);

  const selectedVerb =
    activeLanguage.verbs.find((verb) => verb.infinitive === selectedVerbInfinitive) ??
    filteredVerbs[0]?.verb ??
    activeLanguage.verbs[0];

  const openPromptInWordbook = (prompt: Prompt) => {
    setSelectedVerbInfinitive(prompt.verb.infinitive);
    setBookTense(prompt.tense);
    setWordbookQuery('');
  };

  return {
    bookTense,
    filteredVerbs,
    openPromptInWordbook,
    selectedVerb,
    selectedVerbInfinitive: selectedVerb?.infinitive ?? '',
    setBookTense,
    setSelectedVerbInfinitive,
    setWordbookQuery,
    wordbookQuery,
  };
};
