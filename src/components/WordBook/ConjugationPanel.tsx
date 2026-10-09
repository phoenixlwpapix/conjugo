import { getStudyLanguageTag } from '../../lib/i18n';
import { useI18n } from '../../hooks/useI18n';
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
  const { t, languageName, tenseName } = useI18n();
  const translation = getVerbTranslation(activeLanguage, selectedVerb, translationLanguage);

  return (
    <section className="conjugation-panel" aria-label={t('{verb} conjugation table', { verb: selectedVerb.infinitive })}>
      <div className="conjugation-head">
        <div>
          <span className="eyebrow">{languageName(activeLanguage.id)}</span>
          <h2 lang={getStudyLanguageTag(activeLanguage.id)}>{selectedVerb.infinitive}</h2>
          {translation && <p>{translation}</p>}
        </div>

        <SegmentedControl
          ariaLabel={t('Choose tense')}
          className="book-tense-tabs"
          onChange={onTenseChange}
          options={getLanguageTenses(activeLanguage.id).map((item) => ({
            id: item.id,
            label: tenseName(activeLanguage, item.id),
            nativeLabel: activeLanguage.tenseLabels[item.id],
            lang: getStudyLanguageTag(activeLanguage.id),
          }))}
          value={bookTense}
        />
      </div>

      <div className="conjugation-table" lang={getStudyLanguageTag(activeLanguage.id)}>
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
