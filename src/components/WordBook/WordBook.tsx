import type { Language, TenseId, VerbEntry } from '../../data/verbs';
import { ConjugationPanel } from './ConjugationPanel';
import { VerbListPanel } from './VerbListPanel';

type WordBookProps = {
  activeLanguage: Language;
  bookTense: TenseId;
  filteredVerbs: Array<{ index: number; verb: VerbEntry }>;
  onQueryChange: (query: string) => void;
  onSelectVerb: (infinitive: string) => void;
  onTenseChange: (tense: TenseId) => void;
  query: string;
  selectedVerb: VerbEntry;
  selectedVerbInfinitive: string;
};

export function WordBook({
  activeLanguage,
  bookTense,
  filteredVerbs,
  onQueryChange,
  onSelectVerb,
  onTenseChange,
  query,
  selectedVerb,
  selectedVerbInfinitive,
}: WordBookProps) {
  return (
    <section className="wordbook-layout" aria-label={`${activeLanguage.name} verb book`}>
      <VerbListPanel
        activeLanguage={activeLanguage}
        filteredVerbs={filteredVerbs}
        onQueryChange={onQueryChange}
        onSelectVerb={onSelectVerb}
        query={query}
        selectedVerbInfinitive={selectedVerbInfinitive}
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
