import { getVerbTranslation, type TranslationLanguage } from '../../data/translations';
import { getLanguagePronouns, getLanguageTenses, type Language, type TenseId, type VerbEntry } from '../../data/verbs';
import { withMoodMarker } from '../../lib/prompts';
import { SegmentedControl } from '../ui/SegmentedControl';

type ConjugationPanelProps = {
  activeLanguage: Language;
  bookTense: TenseId;
  onTenseChange: (tense: TenseId) => void;
  selectedVerb: VerbEntry;
  translationLanguage: TranslationLanguage;
};

export function ConjugationPanel({
  activeLanguage,
  bookTense,
  onTenseChange,
  selectedVerb,
  translationLanguage,
}: ConjugationPanelProps) {
  const translation = getVerbTranslation(activeLanguage, selectedVerb, translationLanguage);

  return (
    <section className="conjugation-panel" aria-label={`${selectedVerb.infinitive} conjugation table`}>
      <div className="conjugation-head">
        <div>
          <span className="eyebrow">{activeLanguage.name}</span>
          <h2>{selectedVerb.infinitive}</h2>
          {translation && <p>{translation}</p>}
        </div>

        <SegmentedControl
          ariaLabel="Choose tense"
          className="book-tense-tabs"
          onChange={onTenseChange}
          options={getLanguageTenses(activeLanguage.id).map((item) => ({
            id: item.id,
            label: activeLanguage.tenseLabels[item.id],
          }))}
          value={bookTense}
        />
      </div>

      <div className="conjugation-table">
        {getLanguagePronouns(activeLanguage).map((pronoun) => (
          <div className="conjugation-row" key={pronoun}>
            <span>{withMoodMarker(activeLanguage.id, bookTense, activeLanguage.pronounLabels[pronoun])}</span>
            <strong>{selectedVerb.forms[bookTense][pronoun]}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
