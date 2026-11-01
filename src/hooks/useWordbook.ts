import { useEffect, useMemo, useState } from 'react';
import { getVerbSearchText } from '../data/translations';
import { isTenseAvailable, type Language, type TenseId } from '../data/verbs';
import type { Prompt } from '../types';

export type WordbookSort = 'current' | 'alphabetical';
export type WordbookView = 'list' | 'detail';

export const useWordbook = (activeLanguage: Language) => {
  const [bookTense, setBookTense] = useState<TenseId>('present');
  const [selectedVerbInfinitive, setSelectedVerbInfinitive] = useState(activeLanguage.verbs[0]?.infinitive ?? '');
  const [wordbookQuery, setWordbookQuery] = useState('');
  const [wordbookSort, setWordbookSort] = useState<WordbookSort>('current');
  const [wordbookView, setWordbookView] = useState<WordbookView>('list');

  useEffect(() => {
    setSelectedVerbInfinitive(activeLanguage.verbs[0]?.infinitive ?? '');
    setWordbookQuery('');
    setWordbookView('list');
    if (!isTenseAvailable(activeLanguage.id, bookTense)) {
      setBookTense('present');
    }
    // Only reset selection when language changes; bookTense intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLanguage.id]);

  const filteredVerbs = useMemo(() => {
    const normalizedQuery = wordbookQuery.trim().toLowerCase();

    const matchingVerbs = activeLanguage.verbs.filter((verb) => {
      if (!normalizedQuery) {
        return true;
      }

      return getVerbSearchText(activeLanguage, verb).includes(normalizedQuery);
    });

    if (wordbookSort === 'alphabetical') {
      return [...matchingVerbs].sort((first, second) =>
        first.infinitive.localeCompare(second.infinitive, activeLanguage.id, { sensitivity: 'base' }),
      );
    }

    return matchingVerbs;
  }, [activeLanguage, wordbookQuery, wordbookSort]);

  const selectedVerb =
    activeLanguage.verbs.find((verb) => verb.infinitive === selectedVerbInfinitive) ??
    filteredVerbs[0] ??
    activeLanguage.verbs[0];

  const openPromptInWordbook = (prompt: Prompt) => {
    setSelectedVerbInfinitive(prompt.verb.infinitive);
    setBookTense(prompt.tense);
    setWordbookQuery('');
    setWordbookView('detail');
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
    setWordbookSort,
    wordbookQuery,
    wordbookSort,
    wordbookView,
    setWordbookView,
  };
};
