import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { concreteTenses, pronouns, type TenseId, type Language } from '../data/verbs';

interface WordBookPanelProps {
  activeLanguage: Language;
  selectedVerbIndex: number;
  setSelectedVerbIndex: (index: number) => void;
  wordbookQuery: string;
  setWordbookQuery: (query: string) => void;
  bookTense: TenseId;
  setBookTense: (tense: TenseId) => void;
}

export function WordBookPanel({
  activeLanguage,
  selectedVerbIndex,
  setSelectedVerbIndex,
  wordbookQuery,
  setWordbookQuery,
  bookTense,
  setBookTense,
}: WordBookPanelProps) {
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

  const selectedVerb = activeLanguage.verbs[selectedVerbIndex] ?? activeLanguage.verbs[0] ?? {
    infinitive: '',
    translation: '',
    forms: {
      present: { I: '', you: '', 'he/she': '', we: '', they: '' },
      past: { I: '', you: '', 'he/she': '', we: '', they: '' },
      imperfect: { I: '', you: '', 'he/she': '', we: '', they: '' },
      future: { I: '', you: '', 'he/she': '', we: '', they: '' },
      conditional: { I: '', you: '', 'he/she': '', we: '', they: '' },
    }
  };

  return (
    <section className="wordbook-layout" aria-label={`${activeLanguage.name} verb book`}>
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
            onChange={(event) => setWordbookQuery(event.target.value)}
            placeholder="Search verbs"
            type="search"
            value={wordbookQuery}
          />
        </label>

        <div className="verb-list" aria-label={`${activeLanguage.name} verbs`}>
          {filteredVerbs.length === 0 ? (
            <p className="empty-state">No verbs match this search.</p>
          ) : (
            filteredVerbs.map(({ verb, index }) => (
              <button
                className="verb-list-item"
                data-active={selectedVerbIndex === index}
                key={verb.infinitive}
                onClick={() => setSelectedVerbIndex(index)}
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

      <section className="conjugation-panel" aria-label={`${selectedVerb.infinitive} conjugation table`}>
        <div className="conjugation-head">
          <div>
            <span className="eyebrow">{activeLanguage.name}</span>
            <h2>{selectedVerb.infinitive}</h2>
            <p>{selectedVerb.translation}</p>
          </div>

          <div className="book-tense-tabs" aria-label="Choose tense">
            {concreteTenses
              .filter((item) => (item.id !== 'imperfect' && item.id !== 'conditional') || activeLanguage.id !== 'english')
              .map((item) => (
                <button
                  className="book-tense-button"
                  data-active={item.id === bookTense}
                  key={item.id}
                  onClick={() => setBookTense(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
          </div>
        </div>

        <div className="conjugation-table">
          {pronouns.map((pronoun) => (
            <div className="conjugation-row" key={pronoun}>
              <span>{activeLanguage.pronounLabels[pronoun]}</span>
              <strong>{selectedVerb.forms[bookTense][pronoun]}</strong>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
