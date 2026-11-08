import type { ReactNode } from 'react';
import { getStudyLanguageTag } from '../../lib/i18n';
import { useI18n } from '../../hooks/useI18n';
import { getVerbTranslation, type TranslationLanguage } from '../../data/translations';
import { getConjugationPronouns, getConjugationPronounLabel, getLanguageTenses, type Language, type TenseId, type VerbEntry } from '../../data/verbs';
import { withMoodMarker } from '../../lib/prompts';
import { SegmentedControl } from '../ui/SegmentedControl';
import { isImperative } from '../../data/imperative';

type ConjugationPanelProps = {
  activeLanguage: Language;
  bookTense: TenseId;
  onTenseChange: (tense: TenseId) => void;
  selectedVerb: VerbEntry;
  translationLanguage: TranslationLanguage;
  favoriteAction?: ReactNode;
};

export function ConjugationPanel({
  activeLanguage,
  bookTense,
  onTenseChange,
  selectedVerb,
  translationLanguage,
  favoriteAction,
}: ConjugationPanelProps) {
  const { t, locale, languageName, tenseName } = useI18n();
  const translation = getVerbTranslation(activeLanguage, selectedVerb, translationLanguage);
  const showCommands = isImperative(bookTense);
  const showVariants = bookTense === 'imperfectSubjunctive' && Boolean(selectedVerb.imperfectSubjunctiveSe);
  const pronouns = getConjugationPronouns(activeLanguage, bookTense, selectedVerb);

  return (
    <section className="conjugation-panel" aria-label={t('{verb} conjugation table', { verb: selectedVerb.infinitive })}>
      <div className="conjugation-head">
        <div className="conjugation-summary">
          <div className="conjugation-title">
            <span className="eyebrow">{languageName(activeLanguage.id)}</span>
            <h2 lang={getStudyLanguageTag(activeLanguage.id)}>{selectedVerb.infinitive}</h2>
            {translation && <p>{translation}</p>}
          </div>
          {favoriteAction}
        </div>

        <SegmentedControl
          ariaLabel={t('Choose tense or mood')}
          className="book-tense-tabs"
          onChange={onTenseChange}
          options={getLanguageTenses(activeLanguage.id).filter(({ id }) => id !== 'imperativeNegative').map((item) => ({
            id: item.id,
            label: tenseName(activeLanguage, item.id === 'imperative' ? 'commands' : item.id),
            nativeLabel: activeLanguage.tenseLabels[item.id === 'imperative' ? 'commands' : item.id],
            lang: getStudyLanguageTag(activeLanguage.id),
          }))}
          value={showCommands ? 'imperative' : bookTense}
        />
      </div>

      {pronouns.length === 0 && <p>{t('Command forms for this verb are not included yet.')}</p>}
      {showCommands || showVariants ? pronouns.length > 0 && (
        <table className="conjugation-comparison" data-variants={showVariants || undefined} aria-label={showCommands ? t('Imperative comparison') : tenseName(activeLanguage, bookTense)}>
          <thead lang={locale}>
            <tr><th scope="col">{t('Pronoun')}</th><th scope="col">{showCommands ? t('Affirmative') : '-ra'}</th><th scope="col">{showCommands ? t('Negative') : '-se'}</th></tr>
          </thead>
          <tbody lang={getStudyLanguageTag(activeLanguage.id)}>
            {pronouns.map((pronoun) => (
              <tr key={pronoun}>
                <th scope="row">{withMoodMarker(activeLanguage.id, bookTense, getConjugationPronounLabel(activeLanguage, bookTense, pronoun))}</th>
                <td>{selectedVerb.forms[showCommands ? 'imperative' : bookTense][pronoun]}</td>
                <td>{showCommands ? selectedVerb.forms.imperativeNegative[pronoun] : selectedVerb.imperfectSubjunctiveSe?.[pronoun]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <div className="conjugation-table" lang={getStudyLanguageTag(activeLanguage.id)}>
        {pronouns.map((pronoun) => (
          <div className="conjugation-row" key={pronoun}>
            <span>{withMoodMarker(activeLanguage.id, bookTense, getConjugationPronounLabel(activeLanguage, bookTense, pronoun))}</span>
            <strong>
              {selectedVerb.forms[bookTense][pronoun]}
            </strong>
          </div>
        ))}
      </div>}
    </section>
  );
}
