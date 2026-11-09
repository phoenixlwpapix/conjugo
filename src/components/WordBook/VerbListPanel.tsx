import { getStudyLanguageTag } from '../../lib/i18n';
import { useI18n } from '../../hooks/useI18n';
import { ArrowDownAZ, List, Search, Star } from 'lucide-react';
import { getVerbTranslation, type TranslationLanguage } from '../../data/translations';
import type { Language, VerbEntry } from '../../data/verbs';
import type { WordbookSort } from '../../hooks/useWordbook';
import { FavoriteButton } from './FavoriteButton';

type VerbListPanelProps = {
  activeLanguage: Language;
  filteredVerbs: VerbEntry[];
  favoriteVerbs: ReadonlySet<string>;
  showOnlyFavorites: boolean;
  onToggleFavorite: (infinitive: string) => void;
  onFavoritesFilterChange: (show: boolean) => void;
  onQueryChange: (query: string) => void;
  onSelectVerb: (infinitive: string, button: HTMLButtonElement) => void;
  onSortChange: (sort: WordbookSort) => void;
  query: string;
  selectedVerbInfinitive: string;
  sort: WordbookSort;
  translationLanguage: TranslationLanguage;
};

export function VerbListPanel({
  activeLanguage,
  filteredVerbs,
  favoriteVerbs,
  showOnlyFavorites,
  onToggleFavorite,
  onFavoritesFilterChange,
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
          <h1 className="workspace-title">{t("Verb Book")}</h1>
        </div>
        <span>{t('{count} verbs', { count: showOnlyFavorites ? favoriteVerbs.size : activeLanguage.verbs.length })}</span>
      </div>

      <div className="wordbook-tools">
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
            aria-label={t('Current')}
            title={t('Current')}
            aria-pressed={sort === 'current'}
            data-active={sort === 'current'}
            onClick={() => onSortChange('current')}
            type="button"
          >
            <List size={15} aria-hidden="true" />
            <span>{t("Current")}</span>
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
        <button className="favorites-filter" aria-pressed={showOnlyFavorites} onClick={() => onFavoritesFilterChange(!showOnlyFavorites)} type="button">
          <Star size={15} fill={showOnlyFavorites ? 'currentColor' : 'none'} aria-hidden="true" />
          {t('Favorites only')}
        </button>
      </div>

      <div className="verb-list" aria-label={t('{language} verbs', { language: languageName(activeLanguage.id) })}>
        {filteredVerbs.length === 0 ? (
          <p className="empty-state">
            {t(showOnlyFavorites && favoriteVerbs.size === 0 ? 'No favorite verbs yet.' : 'No verbs match this search.')}
          </p>
        ) : (
          filteredVerbs.map((verb) => (
            <div className="verb-list-row" key={verb.infinitive}>
              <button
                className="verb-list-item"
                data-active={selectedVerbInfinitive === verb.infinitive}
                aria-pressed={selectedVerbInfinitive === verb.infinitive}
                onClick={(event) => onSelectVerb(verb.infinitive, event.currentTarget)}
                type="button"
              >
                <strong lang={getStudyLanguageTag(activeLanguage.id)}>{verb.infinitive}</strong>
                <span>{getVerbTranslation(activeLanguage, verb, translationLanguage)}</span>
              </button>
              <FavoriteButton infinitive={verb.infinitive} isFavorite={favoriteVerbs.has(verb.infinitive)} onToggle={onToggleFavorite} />
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
