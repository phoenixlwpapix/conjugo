import { useLayoutEffect, useRef } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import type { TranslationLanguage } from '../../data/translations';
import type { Language, TenseId, VerbEntry } from '../../data/verbs';
import type { WordbookSort, WordbookView } from '../../hooks/useWordbook';
import { ConjugationPanel } from './ConjugationPanel';
import { VerbListPanel } from './VerbListPanel';
import { FavoriteButton } from './FavoriteButton';

type WordBookProps = {
  view: WordbookView;
  onViewChange: (view: WordbookView) => void;
  activeLanguage: Language;
  bookTense: TenseId;
  filteredVerbs: VerbEntry[];
  favoriteVerbs: ReadonlySet<string>;
  showOnlyFavorites: boolean;
  onToggleFavorite: (infinitive: string) => void;
  onFavoritesFilterChange: (show: boolean) => void;
  onQueryChange: (query: string) => void;
  onReturnToSession: (view: 'practice' | 'quiz') => void;
  onSelectVerb: (infinitive: string) => void;
  onSortChange: (sort: WordbookSort) => void;
  onTenseChange: (tense: TenseId) => void;
  query: string;
  returnTo?: 'practice' | 'quiz';
  selectedVerb: VerbEntry;
  selectedVerbInfinitive: string;
  sort: WordbookSort;
  translationLanguage: TranslationLanguage;
};

export function WordBook({
  view,
  onViewChange,
  activeLanguage,
  bookTense,
  filteredVerbs,
  favoriteVerbs,
  showOnlyFavorites,
  onToggleFavorite,
  onFavoritesFilterChange,
  onQueryChange,
  onReturnToSession,
  onSelectVerb,
  onSortChange,
  onTenseChange,
  query,
  returnTo,
  selectedVerb,
  selectedVerbInfinitive,
  sort,
  translationLanguage,
}: WordBookProps) {
  const { t, languageName } = useI18n();
  const layoutRef = useRef<HTMLElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const listPositionRef = useRef<{ button: HTMLButtonElement; languageId: Language['id']; scrollY: number } | null>(null);
  const selectedIndex = filteredVerbs.findIndex((verb) => verb.infinitive === selectedVerbInfinitive);

  useLayoutEffect(() => {
    const isCompact = window.matchMedia('(max-width: 980px)').matches;
    if (view === 'detail') {
      if (!isCompact) return;
      layoutRef.current?.scrollIntoView({ block: 'start' });
      detailRef.current?.focus({ preventScroll: true });
      return;
    }

    const listPosition = listPositionRef.current;
    listPositionRef.current = null;
    if (!isCompact || listPosition?.languageId !== activeLanguage.id) return;
    listPosition.button.focus({ preventScroll: true });
    window.scrollTo({ top: listPosition.scrollY, behavior: 'instant' });
  }, [activeLanguage.id, view, selectedVerbInfinitive]);

  const selectVerb = (infinitive: string, button?: HTMLButtonElement) => {
    if (button) {
      listPositionRef.current = { button, languageId: activeLanguage.id, scrollY: window.scrollY };
    }
    onSelectVerb(infinitive);
    onViewChange('detail');
  };

  const goBack = () => {
    if (returnTo) onReturnToSession(returnTo);
    else onViewChange('list');
  };

  return (
    <section ref={layoutRef} className="wordbook-layout" data-view={view} aria-label={t('{language} verb book', { language: languageName(activeLanguage.id) })}>
      <VerbListPanel
        activeLanguage={activeLanguage}
        filteredVerbs={filteredVerbs}
        favoriteVerbs={favoriteVerbs}
        showOnlyFavorites={showOnlyFavorites}
        onToggleFavorite={onToggleFavorite}
        onFavoritesFilterChange={onFavoritesFilterChange}
        onQueryChange={onQueryChange}
        onSelectVerb={selectVerb}
        onSortChange={onSortChange}
        query={query}
        selectedVerbInfinitive={selectedVerbInfinitive}
        sort={sort}
        translationLanguage={translationLanguage}
      />
      <div className="wordbook-detail" ref={detailRef} tabIndex={-1}>
        <nav className="wordbook-detail-nav" data-return-to-session={Boolean(returnTo)} aria-label={t('Verb Book')}>
          <button type="button" onClick={goBack}>
            <ArrowLeft size={18} aria-hidden="true" />{t(returnTo === 'practice' ? 'Back to practice' : returnTo === 'quiz' ? 'Back to quiz' : 'Back to verbs')}
          </button>
          <div>
            <button type="button" aria-label={t('Previous verb')} disabled={selectedIndex <= 0} onClick={() => selectVerb(filteredVerbs[selectedIndex - 1].infinitive)}>
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button type="button" aria-label={t('Next verb')} disabled={selectedIndex < 0 || selectedIndex >= filteredVerbs.length - 1} onClick={() => selectVerb(filteredVerbs[selectedIndex + 1].infinitive)}>
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </nav>
        <ConjugationPanel
          activeLanguage={activeLanguage}
          bookTense={bookTense}
          onTenseChange={onTenseChange}
          selectedVerb={selectedVerb}
          translationLanguage={translationLanguage}
          favoriteAction={
            <FavoriteButton
              infinitive={selectedVerb.infinitive}
              isFavorite={favoriteVerbs.has(selectedVerb.infinitive)}
              onToggle={onToggleFavorite}
            />
          }
        />
      </div>
    </section>
  );
}
