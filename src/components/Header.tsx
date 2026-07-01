import { CSSProperties } from 'react';
import { Target, BookOpenText } from 'lucide-react';
import { languages, type LanguageId } from '../data/verbs';
import { type AppView } from '../hooks/usePractice';

interface HeaderProps {
  languageId: LanguageId;
  switchLanguage: (id: LanguageId) => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

export function Header({ languageId, switchLanguage, activeView, setActiveView }: HeaderProps) {
  return (
    <header className="app-topbar">
      <div className="brand-lockup">
        <img src="/conjugo-logo.png" alt="" aria-hidden="true" />
        <div>
          <strong>ConjuGO</strong>
          <span>Verb trainer</span>
        </div>
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
    </header>
  );
}
