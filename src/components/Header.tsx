import { useI18n } from '../hooks/useI18n';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BarChart3, BookOpenText, Check, ClipboardList, Mail, Menu, Moon, Sun, Target, X } from 'lucide-react';
import { languages, type LanguageId } from '../data/verbs';
import { type ThemeId } from '../data/themes';
import type { MessageKey } from '../lib/i18n';
import type { AppView } from '../types';
import { PreferencesPanel, type PreferencesPanelProps } from './PreferencesPanel';

interface HeaderProps extends Omit<PreferencesPanelProps, 'languageId'> {
  languageId: LanguageId;
  switchLanguage: (id: LanguageId) => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  themeId: ThemeId;
  setThemeId: (themeId: ThemeId) => void;
}

const viewLabels: Record<AppView, MessageKey> = {
  practice: 'Practice',
  quiz: 'Quiz',
  stats: 'Stats',
  wordbook: 'Verb Book',
};

const feedbackHref = 'mailto:phoenixlwp@gmail.com?subject=ConjuGO%20Feedback';

export function Header({
  languageId,
  switchLanguage,
  activeView,
  setActiveView,
  themeId,
  setThemeId,
  ...preferences
}: HeaderProps) {
  const { t, languageName } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const activeLanguage = languages.find((language) => language.id === languageId) ?? languages[0];

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    const closeOnFocusOutside = (event: FocusEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOnFocusOutside);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOnFocusOutside);
    };
  }, [isMenuOpen]);

  const chooseLanguage = (nextLanguageId: LanguageId) => {
    switchLanguage(nextLanguageId);
    setIsMenuOpen(false);
  };

  const chooseView = (nextView: AppView) => {
    setActiveView(nextView);
    setIsMenuOpen(false);
  };

  const toggleTheme = () => {
    setThemeId(themeId === 'dark' ? 'light' : 'dark');
  };

  const ThemeIcon = themeId === 'dark' ? Sun : Moon;

  return (
    <header ref={headerRef} className="app-topbar">
      <div className="brand-lockup">
        <img src="/conjugo-logo.webp" alt="" aria-hidden="true" width="46" height="46" />
        <div>
          <strong>ConjuGO</strong>
          <span>{t("Verb trainer")}</span>
        </div>
      </div>

      <div className="view-switch" aria-label={t("Choose workspace")}>
        <button
          className="view-button"
          data-active={activeView === 'practice'}
          aria-current={activeView === 'practice' ? 'page' : undefined}
          onClick={() => setActiveView('practice')}
          type="button"
        >
          <Target size={16} aria-hidden="true" />
          {t("Practice")}
        </button>
        <button className="view-button" data-active={activeView === 'quiz'} aria-current={activeView === 'quiz' ? 'page' : undefined} onClick={() => setActiveView('quiz')} type="button">
          <ClipboardList size={16} aria-hidden="true" />
          {t("Quiz")}
        </button>
        <button
          className="view-button"
          data-active={activeView === 'stats'}
          aria-current={activeView === 'stats' ? 'page' : undefined}
          onClick={() => setActiveView('stats')}
          type="button"
        >
          <BarChart3 size={16} aria-hidden="true" />
          {t("Stats")}
        </button>
        <button
          className="view-button"
          data-active={activeView === 'wordbook'}
          aria-current={activeView === 'wordbook' ? 'page' : undefined}
          onClick={() => setActiveView('wordbook')}
          type="button"
        >
          <BookOpenText size={16} aria-hidden="true" />
          {t('Verb Book')}
        </button>
      </div>

      <nav className="language-tabs" aria-label={t("Choose language")}>
        <span className="language-tabs-title">{t("Languages")}</span>
        {languages.map((language) => (
          <button
            className="tab-button"
            data-active={language.id === languageId}
            aria-pressed={language.id === languageId}
            key={language.id}
            onClick={() => switchLanguage(language.id)}
            style={{ '--accent': themeId === 'dark' ? language.darkAccent : language.accent } as CSSProperties}
            type="button"
          >
            <span className="language-code" aria-hidden="true">{language.id === 'english' ? 'EN' : language.id === 'french' ? 'FR' : language.id === 'spanish' ? 'ES' : 'IT'}</span>
            <span>{languageName(language.id)}</span>
            {language.id === languageId && <Check className="language-selected" size={14} aria-hidden="true" />}
          </button>
        ))}
      </nav>

      <div className="language-select-wrapper">
        <select
          value={languageId}
          onChange={(event) => switchLanguage(event.target.value as LanguageId)}
          aria-label={t("Choose language")}
          className="language-select"
        >
          {languages.map((language) => (
            <option key={language.id} value={language.id}>
              {languageName(language.id)}
            </option>
          ))}
        </select>
      </div>

      <PreferencesPanel languageId={languageId} {...preferences} />

      <div className="nav-footer">
        <a className="view-button feedback-link" href={feedbackHref}>
          <Mail size={16} aria-hidden="true" />
          {t('Feedback')}
        </a>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          type="button"
          aria-label={t(themeId === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')}
        >
          <ThemeIcon size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="mobile-status" aria-label={t("Current selection")}>
        <strong>{languageName(activeLanguage.id)}</strong>
        <span>{t(viewLabels[activeView])}</span>
      </div>

      <button
        aria-controls="mobile-navigation"
        aria-expanded={isMenuOpen}
        aria-label={t(isMenuOpen ? 'Close menu' : 'Open menu')}
        className="mobile-menu-button"
        onClick={() => setIsMenuOpen((current) => !current)}
        type="button"
      >
        {isMenuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
      </button>

      <div className="mobile-menu-panel" data-open={isMenuOpen} id="mobile-navigation">
        <div className="mobile-menu-section">
          <span>{t("Workspace")}</span>
          <div className="mobile-view-grid">
            <button className="view-button" data-active={activeView === 'practice'} onClick={() => chooseView('practice')} type="button">
              <Target size={16} aria-hidden="true" />
              {t("Practice")}
            </button>
            <button className="view-button" data-active={activeView === 'quiz'} onClick={() => chooseView('quiz')} type="button">
              <ClipboardList size={16} aria-hidden="true" />
              {t("Quiz")}
            </button>
            <button className="view-button" data-active={activeView === 'stats'} onClick={() => chooseView('stats')} type="button">
              <BarChart3 size={16} aria-hidden="true" />
              {t("Stats")}
            </button>
            <button className="view-button" data-active={activeView === 'wordbook'} onClick={() => chooseView('wordbook')} type="button">
              <BookOpenText size={16} aria-hidden="true" />
              {t('Verb Book')}
            </button>
          </div>
        </div>

        <div className="mobile-menu-section">
          <span>{t("Language")}</span>
          <div className="mobile-menu-grid">
            {languages.map((language) => (
              <button
                className="tab-button"
                data-active={language.id === languageId}
                aria-pressed={language.id === languageId}
                key={language.id}
                onClick={() => chooseLanguage(language.id)}
                style={{ '--accent': themeId === 'dark' ? language.darkAccent : language.accent } as CSSProperties}
                type="button"
              >
                <span className="language-code" aria-hidden="true">{language.id === 'english' ? 'EN' : language.id === 'french' ? 'FR' : language.id === 'spanish' ? 'ES' : 'IT'}</span>
                <span>{languageName(language.id)}</span>
                {language.id === languageId && <Check className="language-selected" size={14} aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>

        <div className="mobile-menu-section">
          <PreferencesPanel languageId={languageId} {...preferences} />
        </div>

        <div className="mobile-menu-section">
          <div className="mobile-theme-row">
            <span className="mobile-theme-label">{t("Theme")}</span>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              type="button"
              aria-label={t(themeId === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')}
            >
              <ThemeIcon size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
        <a className="view-button feedback-link" href={feedbackHref} onClick={() => setIsMenuOpen(false)}>
          <Mail size={16} aria-hidden="true" />
          {t('Feedback')}
        </a>
      </div>
    </header>
  );
}
