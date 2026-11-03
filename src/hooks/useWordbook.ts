import { useEffect, useMemo, useState } from 'react';
import { getVerbSearchText } from '../data/translations';
import { isTenseAvailable, type Language, type TenseId } from '../data/verbs';
import type { Prompt } from '../types';
import { getStudyLanguageTag } from '../lib/i18n';

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

  const searchEntries = useMemo(() => activeLanguage.verbs.map((verb) => ({
    verb,
    searchText: getVerbSearchText(activeLanguage, verb),
  })), [activeLanguage]);
  const verbIndex = useMemo(() => new Map(activeLanguage.verbs.map((verb) => [verb.infinitive, verb])), [activeLanguage.verbs]);

  const sortedEntries = useMemo(() => {
    if (wordbookSort === 'alphabetical') {
      const collator = new Intl.Collator(getStudyLanguageTag(activeLanguage.id), { sensitivity: 'base' });
      return [...searchEntries].sort((first, second) => collator.compare(first.verb.infinitive, second.verb.infinitive));
    }
    return searchEntries;
  }, [activeLanguage.id, searchEntries, wordbookSort]);

  const filteredVerbs = useMemo(() => {
    const query = wordbookQuery.trim().toLowerCase();
    return sortedEntries.filter(({ searchText }) => !query || searchText.includes(query)).map(({ verb }) => verb);
  }, [sortedEntries, wordbookQuery]);

  const selectedVerb =
    verbIndex.get(selectedVerbInfinitive) ??
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
