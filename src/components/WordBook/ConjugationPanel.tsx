import { concreteTenses, pronouns, type Language, type TenseId, type VerbEntry } from '../../data/verbs';
import { SegmentedControl } from '../ui/SegmentedControl';

type ConjugationPanelProps = {
  activeLanguage: Language;
  bookTense: TenseId;
  onTenseChange: (tense: TenseId) => void;
  selectedVerb: VerbEntry;
};

export function ConjugationPanel({ activeLanguage, bookTense, onTenseChange, selectedVerb }: ConjugationPanelProps) {
  return (
    <section className="conjugation-panel" aria-label={`${selectedVerb.infinitive} conjugation table`}>
      <div className="conjugation-head">
        <div>
          <span className="eyebrow">{activeLanguage.name}</span>
          <h2>{selectedVerb.infinitive}</h2>
          <p>{selectedVerb.translation}</p>
        </div>

        <SegmentedControl
          ariaLabel="Choose tense"
          className="book-tense-tabs"
          onChange={onTenseChange}
          options={concreteTenses.filter((item) => item.id !== 'imperfect' || activeLanguage.id !== 'english')}
          value={bookTense}
        />
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
  );
}
