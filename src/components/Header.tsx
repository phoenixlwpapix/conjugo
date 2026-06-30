import { BarChart3, BookOpenText, Target } from 'lucide-react';
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

export function Header({ activeLanguage, activeView, languageId, onLanguageChange, onViewChange }: HeaderProps) {
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
        <button className="view-button" data-active={activeView === 'practice'} onClick={() => onViewChange('practice')} type="button">
          <Target size={16} aria-hidden="true" />
          Practice
        </button>
        <button className="view-button" data-active={activeView === 'stats'} onClick={() => onViewChange('stats')} type="button">
          <BarChart3 size={16} aria-hidden="true" />
          Stats
        </button>
        <button className="view-button" data-active={activeView === 'wordbook'} onClick={() => onViewChange('wordbook')} type="button">
          <BookOpenText size={16} aria-hidden="true" />
          Word Book
        </button>
      </div>
    </header>
  );
}
