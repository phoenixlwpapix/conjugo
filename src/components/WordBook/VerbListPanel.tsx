import { Search } from 'lucide-react';
import type { Language, VerbEntry } from '../../data/verbs';

type VerbListPanelProps = {
  activeLanguage: Language;
  filteredVerbs: Array<{ index: number; verb: VerbEntry }>;
  onQueryChange: (query: string) => void;
  onSelectVerb: (infinitive: string) => void;
  query: string;
  selectedVerbInfinitive: string;
};

export function VerbListPanel({
  activeLanguage,
  filteredVerbs,
  onQueryChange,
  onSelectVerb,
  query,
  selectedVerbInfinitive,
}: VerbListPanelProps) {
  return (
    <aside className="verb-list-panel">
      <div className="wordbook-heading">
        <div>
          <span className="eyebrow">{activeLanguage.nativeName}</span>
          <h1>Verb Book</h1>
        </div>
        <span>{activeLanguage.verbs.length} verbs</span>
      </div>

      <label className="wordbook-search">
        <Search size={16} aria-hidden="true" />
        <input
          aria-label="Search verbs"
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search verbs"
          type="search"
          value={query}
        />
      </label>

      <div className="verb-list" aria-label={`${activeLanguage.name} verbs`}>
        {filteredVerbs.length === 0 ? (
          <p className="empty-state">No verbs match this search.</p>
        ) : (
          filteredVerbs.map(({ verb, index }) => (
            <button
              className="verb-list-item"
              data-active={selectedVerbInfinitive === verb.infinitive}
              key={verb.infinitive}
              onClick={() => onSelectVerb(verb.infinitive)}
              type="button"
            >
              <span className="verb-list-number">{String(index + 1).padStart(2, '0')}</span>
              <strong>{verb.infinitive}</strong>
              <span>{verb.translation}</span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
