import { useI18n } from '../hooks/useI18n';
import type { CSSProperties } from 'react';
import { Check, ChevronDown, Settings } from 'lucide-react';
import { languages, type LanguageId } from '../data/verbs';
import { type ThemeId } from '../data/themes';
import type { AppView } from '../types';
import { WorkspaceNavigation } from './WorkspaceNavigation';

interface HeaderProps {
  languageId: LanguageId;
  switchLanguage: (id: LanguageId) => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  themeId: ThemeId;
}

export function Header({
  languageId,
  switchLanguage,
  activeView,
  setActiveView,
  themeId,
}: HeaderProps) {
  const { t, languageName } = useI18n();

  return (
    <header className="app-topbar">
      <div className="brand-lockup">
        <img src="/conjugo-logo.webp" alt="" aria-hidden="true" width="46" height="46" />
        <div>
          <strong>ConjuGO</strong>
          <span>{t("Verb trainer")}</span>
        </div>
      </div>

      <WorkspaceNavigation activeView={activeView} onViewChange={setActiveView} placement="header" />

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
        <span className="language-select-label" aria-hidden="true">{languageName(languageId)}</span>
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
        <ChevronDown className="language-select-chevron" size={14} aria-hidden="true" />
      </div>

      <div className="nav-footer">
        <button
          className="view-button"
          data-active={activeView === 'settings'}
          aria-current={activeView === 'settings' ? 'page' : undefined}
          aria-label={t('Settings')}
          title={t('Settings')}
          onClick={() => setActiveView('settings')}
          type="button"
        >
          <Settings size={16} aria-hidden="true" />
          <span>{t('Settings')}</span>
        </button>
      </div>
    </header>
  );
}
