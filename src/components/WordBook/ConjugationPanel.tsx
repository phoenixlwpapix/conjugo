import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { getStudyLanguageTag } from '../../lib/i18n';
import { useI18n } from '../../hooks/useI18n';
import { getVerbTranslation, type TranslationLanguage } from '../../data/translations';
import { isNonFiniteForm, nonFiniteForms } from '../../data/nonFinite/types';
import {
  getConjugationPronouns,
  getConjugationPronounLabel,
  getLanguageTenses,
  type Language,
  type Pronoun,
  type TenseId,
  type VerbEntry,
} from '../../data/verbs';
import type { Prompt } from '../../types';
import { withMoodMarker } from '../../lib/prompts';
import { SegmentedControl } from '../ui/SegmentedControl';
import { QuestionTense } from '../PracticeQuestion';
import { FavoriteButton } from './FavoriteButton';
import { isImperative } from '../../data/imperative';

type ConjugationTableProps = {
  activeLanguage: Language;
  bookTense: TenseId;
  selectedVerb: VerbEntry;
  highlightPronoun?: Pronoun;
};

export function ConjugationTable({
  activeLanguage,
  bookTense,
  selectedVerb,
  highlightPronoun,
}: ConjugationTableProps) {
  const { t, locale, tenseName } = useI18n();
  if (isNonFiniteForm(bookTense) && selectedVerb.nonFinite) {
    const entries = selectedVerb.nonFinite;
    return (
      <dl className="conjugation-table">
        {nonFiniteForms.map((form) => entries[form] && (
          <div className="conjugation-row" key={form} data-highlighted={form === bookTense && highlightPronoun !== undefined || undefined}>
            <dt lang={locale}><span>{tenseName(activeLanguage, form)}</span></dt>
            <dd lang={getStudyLanguageTag(activeLanguage.id)}><strong>{[entries[form], ...(entries.accepted?.[form] ?? [])].join(' / ')}</strong></dd>
          </div>
        ))}
      </dl>
    );
  }
  const showCommands = isImperative(bookTense);
  const showVariants = bookTense === 'imperfectSubjunctive' && Boolean(selectedVerb.imperfectSubjunctiveSe);
  const pronouns = getConjugationPronouns(activeLanguage, bookTense, selectedVerb);

  return (
    <>
      {pronouns.length === 0 && <p>{t('Command forms for this verb are not included yet.')}</p>}
      {showCommands || showVariants ? pronouns.length > 0 && (
        <table className="conjugation-comparison" data-variants={showVariants || undefined} aria-label={showCommands ? t('Imperative comparison') : tenseName(activeLanguage, bookTense)}>
          <thead lang={locale}>
            <tr><th scope="col">{t('Pronoun')}</th><th scope="col">{showCommands ? t('Affirmative') : '-ra'}</th><th scope="col">{showCommands ? t('Negative') : '-se'}</th></tr>
          </thead>
          <tbody lang={getStudyLanguageTag(activeLanguage.id)}>
            {pronouns.map((pronoun) => (
              <tr key={pronoun} data-highlighted={pronoun === highlightPronoun || undefined}>
                <th scope="row">{withMoodMarker(activeLanguage.id, bookTense, getConjugationPronounLabel(activeLanguage, bookTense, pronoun))}</th>
                <td>{selectedVerb.forms[showCommands ? 'imperative' : bookTense][pronoun]}</td>
                <td>{showCommands ? selectedVerb.forms.imperativeNegative[pronoun] : selectedVerb.imperfectSubjunctiveSe?.[pronoun]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="conjugation-table" lang={getStudyLanguageTag(activeLanguage.id)}>
          {pronouns.map((pronoun) => (
            <div className="conjugation-row" key={pronoun} data-highlighted={pronoun === highlightPronoun || undefined}>
              <span>{withMoodMarker(activeLanguage.id, bookTense, getConjugationPronounLabel(activeLanguage, bookTense, pronoun))}</span>
              <strong>
                {selectedVerb.forms[bookTense][pronoun]}
              </strong>
            </div>
          ))}
        </div>
      )}
      {activeLanguage.id === 'french' && pronouns.includes('you plural') && (
        <p className="conjugation-note" lang={locale}>{t('Vous can address one person politely or more than one person.')}</p>
      )}
    </>
  );
}

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
  const { t, tenseName } = useI18n();
  const translation = getVerbTranslation(activeLanguage, selectedVerb, translationLanguage);
  const showCommands = isImperative(bookTense);
  const bookTab = showCommands ? 'imperative' : isNonFiniteForm(bookTense) ? 'pastParticiple' : bookTense;

  return (
    <section className="conjugation-panel" aria-label={t('{verb} conjugation table', { verb: selectedVerb.infinitive })}>
      <div className="conjugation-head">
        <div className="conjugation-summary">
          <div className="conjugation-title">
            <h2 lang={getStudyLanguageTag(activeLanguage.id)}>{selectedVerb.infinitive}</h2>
            {translation && <p lang={translationLanguage}>{translation}</p>}
          </div>
          {favoriteAction}
        </div>

        <SegmentedControl
          ariaLabel={t('Choose tense, mood, or verb form')}
          className="book-tense-tabs"
          onChange={onTenseChange}
          options={getLanguageTenses(activeLanguage.id).filter(({ id }) => id !== 'imperativeNegative' && (!isNonFiniteForm(id) || id === 'pastParticiple')).map(({ id }) => {
            const labelId = id === 'imperative' ? 'commands' : id === 'pastParticiple' ? 'nonFinite' : id;
            return { id, label: tenseName(activeLanguage, labelId), nativeLabel: activeLanguage.tenseLabels[labelId], lang: getStudyLanguageTag(activeLanguage.id) };
          })}
          value={bookTab}
        />
      </div>

      <ConjugationTable
        activeLanguage={activeLanguage}
        bookTense={bookTense}
        selectedVerb={selectedVerb}
      />
    </section>
  );
}

type ConjugationModalProps = {
  prompt: Prompt;
  isFavorite: boolean;
  onToggleFavorite: (infinitive: string) => void;
  onClose: () => void;
  translationLanguage: TranslationLanguage;
};

export function ConjugationModal({
  prompt,
  isFavorite,
  onToggleFavorite,
  onClose,
  translationLanguage,
}: ConjugationModalProps) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { language: activeLanguage, verb: selectedVerb, tense, pronoun } = prompt;
  const translation = getVerbTranslation(activeLanguage, selectedVerb, translationLanguage);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    closeButtonRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus({ preventScroll: true });
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="conjugation-modal-backdrop"
      aria-label={t('{verb} conjugation table', { verb: selectedVerb.infinitive })}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        const from = event.shiftKey ? first : last;
        const to = event.shiftKey ? last : first;
        if (event.target === from && to) {
          event.preventDefault();
          to.focus();
        }
      }}
    >
      <section className="conjugation-modal">
        <div className="conjugation-modal-handle" aria-hidden="true" />
        <div className="conjugation-modal-head">
          <div className="conjugation-modal-title">
            <div className="conjugation-modal-verb">
              <h2 lang={getStudyLanguageTag(activeLanguage.id)}>{selectedVerb.infinitive}</h2>
              <QuestionTense language={activeLanguage} tense={tense} />
            </div>
            {translation && <p lang={translationLanguage}>{translation}</p>}
          </div>
          <div className="conjugation-modal-actions">
            <FavoriteButton
              infinitive={selectedVerb.infinitive}
              isFavorite={isFavorite}
              onToggle={onToggleFavorite}
            />
            <button
              ref={closeButtonRef}
              type="button"
              className="conjugation-modal-close"
              onClick={onClose}
              aria-label={t('Close')}
              title={t('Close')}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <ConjugationTable
          activeLanguage={activeLanguage}
          bookTense={tense}
          selectedVerb={selectedVerb}
          highlightPronoun={pronoun}
        />
      </section>
    </dialog>
  );
}
