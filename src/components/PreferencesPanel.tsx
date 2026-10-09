import { useI18n } from '../hooks/useI18n';
import { translationLanguageOptions, type TranslationLanguage } from '../data/translations';
import type { LanguageId } from '../data/verbs';

export type PreferencesPanelProps = {
  languageId: LanguageId;
  translationLanguage: TranslationLanguage;
  setTranslationLanguage: (translationLanguage: TranslationLanguage) => void;
  includeVosotros: boolean;
  setIncludeVosotros: (include: boolean) => void;
};

export function PreferencesPanel({
  languageId,
  translationLanguage,
  setTranslationLanguage,
  includeVosotros,
  setIncludeVosotros,
}: PreferencesPanelProps) {
  const { t } = useI18n();
  return (
    <section className="preferences-panel" aria-label={t("Preferences")}>
      <span className="preferences-title">{t("Preferences")}</span>

      <div className="preference-row">
        <span>{t('Interface language')}</span>
        <div className="preference-toggle" role="group" aria-label={t('Interface language and translations')}>
          {translationLanguageOptions.map((option) => (
            <button
              aria-pressed={option.id === translationLanguage}
              data-active={option.id === translationLanguage}
              key={option.id}
              onClick={() => setTranslationLanguage(option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {languageId === 'spanish' && (
        <label className="preference-row preference-switch">
          <span>
            {t('Include')} <i lang="es">vosotros</i>
          </span>
          <input
            checked={includeVosotros}
            onChange={(event) => setIncludeVosotros(event.target.checked)}
            role="switch"
            type="checkbox"
          />
        </label>
      )}
    </section>
  );
}
