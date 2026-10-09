import { getStudyLanguageTag } from '../../lib/i18n';
import { useI18n } from '../../hooks/useI18n';
import { ArrowDownAZ, List, Search } from 'lucide-react';
import { getVerbTranslation, type TranslationLanguage } from '../../data/translations';
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
  translationLanguage: TranslationLanguage;
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
  translationLanguage,
}: VerbListPanelProps) {
  const { t, languageName } = useI18n();
  return (
    <aside className="verb-list-panel">
      <div className="wordbook-heading">
        <div>
          <span className="eyebrow">{languageName(activeLanguage.id)}</span>
          <h1>{t("Verb Book")}</h1>
        </div>
        <span>{t('{count} verbs', { count: activeLanguage.verbs.length })}</span>
      </div>

      <label className="wordbook-search">
        <Search size={16} aria-hidden="true" />
        <input
          aria-label={t("Search verbs")}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("Search verbs")}
          type="search"
          value={query}
        />
      </label>

      <div className="wordbook-sort" aria-label={t("Verb order")} role="group">
        <button
          aria-pressed={sort === 'current'}
          data-active={sort === 'current'}
          onClick={() => onSortChange('current')}
          type="button"
        >
          <List size={15} aria-hidden="true" />
          {t("Current")}
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

      <div className="verb-list" aria-label={t('{language} verbs', { language: languageName(activeLanguage.id) })}>
        {filteredVerbs.length === 0 ? (
          <p className="empty-state">{t("No verbs match this search.")}</p>
        ) : (
          filteredVerbs.map((verb) => (
            <button
              className="verb-list-item"
              data-active={selectedVerbInfinitive === verb.infinitive}
              key={verb.infinitive}
              onClick={() => onSelectVerb(verb.infinitive)}
              type="button"
            >
              <strong lang={getStudyLanguageTag(activeLanguage.id)}>{verb.infinitive}</strong>
              <span>{getVerbTranslation(activeLanguage, verb, translationLanguage)}</span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
