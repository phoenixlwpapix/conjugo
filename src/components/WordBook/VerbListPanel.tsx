import { ArrowDownAZ, List, Search } from 'lucide-react';
import type { Language, VerbEntry } from '../../data/verbs';
import type { WordbookSort } from '../../hooks/useWordbook';

type VerbListPanelProps = {
  activeLanguage: Language;
  filteredVerbs: VerbEntry[];
  onQueryChange: (query: string) => void;
  onSelectVerb: (infinitive: string) => void;
  onSortChange: (sort: WordbookSort) => void;
  query: string;
  selectedVerbInfinitive: string;
  sort: WordbookSort;
};

export function VerbListPanel({
  activeLanguage,
  filteredVerbs,
  onQueryChange,
  onSelectVerb,
  onSortChange,
  query,
  selectedVerbInfinitive,
  sort,
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

      <div className="wordbook-sort" aria-label="Verb order" role="group">
        <button
          aria-pressed={sort === 'current'}
          data-active={sort === 'current'}
          onClick={() => onSortChange('current')}
          type="button"
        >
          <List size={15} aria-hidden="true" />
          Current
        </button>
        <button
          aria-pressed={sort === 'alphabetical'}
          data-active={sort === 'alphabetical'}
          onClick={() => onSortChange('alphabetical')}
          type="button"
        >
          <ArrowDownAZ size={15} aria-hidden="true" />
          A–Z
        </button>
      </div>

      <div className="verb-list" aria-label={`${activeLanguage.name} verbs`}>
        {filteredVerbs.length === 0 ? (
          <p className="empty-state">No verbs match this search.</p>
        ) : (
          filteredVerbs.map((verb) => (
            <button
              className="verb-list-item"
              data-active={selectedVerbInfinitive === verb.infinitive}
              key={verb.infinitive}
              onClick={() => onSelectVerb(verb.infinitive)}
              type="button"
            >
              <strong>{verb.infinitive}</strong>
              <span>{verb.translation}</span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
