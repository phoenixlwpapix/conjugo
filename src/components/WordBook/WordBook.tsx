import type { Language, TenseId, VerbEntry } from '../../data/verbs';
import type { WordbookSort } from '../../hooks/useWordbook';
import { ConjugationPanel } from './ConjugationPanel';
import { VerbListPanel } from './VerbListPanel';

type WordBookProps = {
  activeLanguage: Language;
  bookTense: TenseId;
  filteredVerbs: VerbEntry[];
  onQueryChange: (query: string) => void;
  onSelectVerb: (infinitive: string) => void;
  onSortChange: (sort: WordbookSort) => void;
  onTenseChange: (tense: TenseId) => void;
  query: string;
  selectedVerb: VerbEntry;
  selectedVerbInfinitive: string;
  sort: WordbookSort;
};

export function WordBook({
  activeLanguage,
  bookTense,
  filteredVerbs,
  onQueryChange,
  onSelectVerb,
  onSortChange,
  onTenseChange,
  query,
  selectedVerb,
  selectedVerbInfinitive,
  sort,
}: WordBookProps) {
  return (
    <section className="wordbook-layout" aria-label={`${activeLanguage.name} verb book`}>
      <VerbListPanel
        activeLanguage={activeLanguage}
        filteredVerbs={filteredVerbs}
        onQueryChange={onQueryChange}
        onSelectVerb={onSelectVerb}
        onSortChange={onSortChange}
        query={query}
        selectedVerbInfinitive={selectedVerbInfinitive}
        sort={sort}
      />
      <ConjugationPanel
        activeLanguage={activeLanguage}
        bookTense={bookTense}
        onTenseChange={onTenseChange}
        selectedVerb={selectedVerb}
      />
    </section>
  );
}
