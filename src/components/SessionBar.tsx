import { useI18n } from '../hooks/useI18n';
import { RotateCcw, Star } from 'lucide-react';
import { getLanguagePracticeTenses, type PracticeTenseId, type Language } from '../data/verbs';
import type { SessionKind } from '../types';
import { SegmentedControl } from './ui/SegmentedControl';

interface SessionBarProps {
  language: Language;
  practiceTense: PracticeTenseId;
  switchTense: (tense: PracticeTenseId) => void;
  resetSession: () => void;
  favoriteCount: number;
  sessionKind: SessionKind;
  switchPracticeScope: (scope: 'standard' | 'favorites') => void;
}

export function SessionBar({ language, practiceTense, switchTense, resetSession, favoriteCount, sessionKind, switchPracticeScope }: SessionBarProps) {
  const { t, tenseName } = useI18n();
  const favoritesActive = sessionKind === 'favorites';
  const favoritesLabel = t('Practice favorites ({count})', { count: favoriteCount });
  const resetLabel = t('Reset session');
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

      <div className="session-actions">
        <button
          className="session-action"
          aria-label={favoritesLabel}
          aria-pressed={favoritesActive}
          title={favoritesLabel}
          onClick={() => switchPracticeScope(favoritesActive ? 'standard' : 'favorites')}
          type="button"
        >
          <Star size={16} fill={favoritesActive ? 'currentColor' : 'none'} aria-hidden="true" />
          <span aria-hidden="true">{favoriteCount}</span>
        </button>
        <button className="session-action" aria-label={resetLabel} title={resetLabel} onClick={resetSession} type="button">
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
