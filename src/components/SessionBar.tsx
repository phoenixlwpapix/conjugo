import { useI18n } from '../hooks/useI18n';
import { RotateCcw } from 'lucide-react';
import { getLanguagePracticeTenses, type PracticeTenseId, type Language } from '../data/verbs';
import { SegmentedControl } from './ui/SegmentedControl';

interface SessionBarProps {
  language: Language;
  practiceTense: PracticeTenseId;
  switchTense: (tense: PracticeTenseId) => void;
  resetSession: () => void;
}

export function SessionBar({ language, practiceTense, switchTense, resetSession }: SessionBarProps) {
  const { t, tenseName } = useI18n();
  const options: Array<{ id: PracticeTenseId; label: string }> = [
    ...getLanguagePracticeTenses(language.id).map((item) => ({ id: item.id, label: tenseName(language, item.id) })),
    { id: 'mixed', label: t('Mixed practice') },
  ];

  return (
    <section className="session-bar" aria-label={t("Practice controls")}>
      <SegmentedControl
        ariaLabel={t('Choose tense or mood')}
        onChange={switchTense}
        options={options}
        value={practiceTense}
      />

      <button className="reset-button" onClick={resetSession} type="button" title={t("Reset session")}>
        <RotateCcw size={16} aria-hidden="true" />
        <span className="reset-button-text">{t("Reset")}</span>
      </button>
    </section>
  );
}
