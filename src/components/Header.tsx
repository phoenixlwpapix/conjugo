import { useEffect, useState } from 'react';
import { BarChart3, BookOpenText, Menu, Target, X, type LucideIcon } from 'lucide-react';
import { languages, type Language, type LanguageId } from '../data/verbs';
import type { StyleVars } from '../lib/style';
import type { AppView } from '../types';

type HeaderProps = {
  activeLanguage: Language;
  activeView: AppView;
  languageId: LanguageId;
  onLanguageChange: (languageId: LanguageId) => void;
  onViewChange: (view: AppView) => void;
};

const viewOptions: Array<{ icon: LucideIcon; id: AppView; label: string }> = [
  { icon: Target, id: 'practice', label: 'Practice' },
  { icon: BarChart3, id: 'stats', label: 'Stats' },
  { icon: BookOpenText, id: 'wordbook', label: 'Word Book' },
];

export function Header({ activeLanguage, activeView, languageId, onLanguageChange, onViewChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeViewLabel = viewOptions.find((view) => view.id === activeView)?.label ?? 'Practice';

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
    onLanguageChange(nextLanguageId);
    setIsMenuOpen(false);
  };

  const chooseView = (nextView: AppView) => {
    onViewChange(nextView);
    setIsMenuOpen(false);
  };

  return (
    <header className="app-topbar">
      <div className="brand-lockup">
        <img src="/conjugo-logo.png" alt="" aria-hidden="true" />
        <div>
          <strong>ConjuGO</strong>
          <span>{activeLanguage.nativeName}</span>
        </div>
      </div>

      <nav className="language-tabs" aria-label="Choose language">
        {languages.map((language) => (
          <button
            className="tab-button"
            data-active={language.id === languageId}
            key={language.id}
            onClick={() => onLanguageChange(language.id)}
            style={{ '--accent': language.accent } as StyleVars}
            type="button"
          >
            <span>{language.name}</span>
          </button>
        ))}
      </nav>

      <div className="view-switch" aria-label="Choose workspace">
        {viewOptions.map(({ icon: Icon, id, label }) => (
          <button className="view-button" data-active={activeView === id} key={id} onClick={() => onViewChange(id)} type="button">
            <Icon size={16} aria-hidden="true" />
            {label}
          </button>
        ))}
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
          <span>Language</span>
          <div className="mobile-menu-grid">
            {languages.map((language) => (
              <button
                className="tab-button"
                data-active={language.id === languageId}
                key={language.id}
                onClick={() => chooseLanguage(language.id)}
                style={{ '--accent': language.accent } as StyleVars}
                type="button"
              >
                {language.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mobile-menu-section">
          <span>Workspace</span>
          <div className="mobile-view-grid">
            {viewOptions.map(({ icon: Icon, id, label }) => (
              <button className="view-button" data-active={activeView === id} key={id} onClick={() => chooseView(id)} type="button">
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
