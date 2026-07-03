import { useEffect, useState, type CSSProperties } from 'react';
import { BookOpenText, Menu, Moon, Sun, Target, X } from 'lucide-react';
import { languages, type LanguageId } from '../data/verbs';
import { themeOptions, type ThemeId } from '../data/themes';
import { type AppView } from '../hooks/usePractice';

interface HeaderProps {
  languageId: LanguageId;
  switchLanguage: (id: LanguageId) => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  themeId: ThemeId;
  setThemeId: (themeId: ThemeId) => void;
}

export function Header({
  languageId,
  switchLanguage,
  activeView,
  setActiveView,
  themeId,
  setThemeId,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeLanguage = languages.find((language) => language.id === languageId) ?? languages[0];
  const activeViewLabel = activeView === 'practice' ? 'Practice' : 'Word Book';

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isMenuOpen]);

  const chooseLanguage = (nextLanguageId: LanguageId) => {
    switchLanguage(nextLanguageId);
    setIsMenuOpen(false);
  };

  const chooseView = (nextView: AppView) => {
    setActiveView(nextView);
    setIsMenuOpen(false);
  };

  const chooseTheme = (nextThemeId: ThemeId) => {
    setThemeId(nextThemeId);
    setIsMenuOpen(false);
  };

  const renderThemeButton = (themeOption: (typeof themeOptions)[number]) => {
    const Icon = themeOption.id === 'dark' ? Moon : Sun;

    return (
      <button
        className="theme-button"
        data-active={themeOption.id === themeId}
        key={themeOption.id}
        onClick={() => chooseTheme(themeOption.id)}
        type="button"
      >
        <Icon size={16} aria-hidden="true" />
        <span>{themeOption.label}</span>
        <span className="theme-swatches" aria-hidden="true">
          {themeOption.swatches.map((swatch) => (
            <i key={swatch} style={{ background: swatch }} />
          ))}
        </span>
      </button>
    );
  };

  return (
    <header className="app-topbar">
      <div className="brand-lockup">
        <img src="/conjugo-logo.png" alt="" aria-hidden="true" />
        <div>
          <strong>ConjuGO</strong>
          <span>Verb trainer</span>
        </div>
      </div>

      <div className="view-switch" aria-label="Choose workspace">
        <button
          className="view-button"
          data-active={activeView === 'practice'}
          onClick={() => setActiveView('practice')}
          type="button"
        >
          <Target size={16} aria-hidden="true" />
          Practice
        </button>
        <button
          className="view-button"
          data-active={activeView === 'wordbook'}
          onClick={() => setActiveView('wordbook')}
          type="button"
        >
          <BookOpenText size={16} aria-hidden="true" />
          Word Book
        </button>
      </div>

      <nav className="language-tabs" aria-label="Choose language">
        {languages.map((language) => (
          <button
            className="tab-button"
            data-active={language.id === languageId}
            key={language.id}
            onClick={() => switchLanguage(language.id)}
            style={{ '--accent': language.accent } as CSSProperties}
            type="button"
          >
            <span>{language.name}</span>
          </button>
        ))}
      </nav>

      <div className="theme-switch" aria-label="Choose theme">
        <span>Theme</span>
        <div className="theme-grid">
          {themeOptions.map(renderThemeButton)}
        </div>
      </div>

      <div className="mobile-status" aria-label="Current selection">
        <strong>{activeLanguage.name}</strong>
        <span>{activeViewLabel}</span>
      </div>

      <button
        aria-controls="mobile-navigation"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        className="mobile-menu-button"
        onClick={() => setIsMenuOpen((current) => !current)}
        type="button"
      >
        {isMenuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
      </button>

      <div className="mobile-menu-panel" data-open={isMenuOpen} id="mobile-navigation">
        <div className="mobile-menu-section">
          <span>Workspace</span>
          <div className="mobile-view-grid">
            <button className="view-button" data-active={activeView === 'practice'} onClick={() => chooseView('practice')} type="button">
              <Target size={16} aria-hidden="true" />
              Practice
            </button>
            <button className="view-button" data-active={activeView === 'wordbook'} onClick={() => chooseView('wordbook')} type="button">
              <BookOpenText size={16} aria-hidden="true" />
              Word Book
            </button>
          </div>
        </div>

        <div className="mobile-menu-section">
          <span>Language</span>
          <div className="mobile-menu-grid">
            {languages.map((language) => (
              <button
                className="tab-button"
                data-active={language.id === languageId}
                key={language.id}
                onClick={() => chooseLanguage(language.id)}
                style={{ '--accent': language.accent } as CSSProperties}
                type="button"
              >
                {language.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mobile-menu-section">
          <span>Theme</span>
          <div className="theme-grid">
            {themeOptions.map(renderThemeButton)}
          </div>
        </div>
      </div>
    </header>
  );
}
