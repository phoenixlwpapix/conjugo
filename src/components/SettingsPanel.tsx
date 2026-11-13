import { ChevronRight, Mail, Moon, Sun } from 'lucide-react';
import type { ThemeId } from '../data/themes';
import { translationLanguageOptions } from '../data/translations';
import { useI18n } from '../hooks/useI18n';
import type { usePreferences } from '../hooks/usePreferences';
import { defaultPracticeQuestionCount, defaultQuizQuestionCount, practiceQuestionCounts, type PracticeQuestionCount } from '../lib/prompts';
import type { PracticeAnswerMode } from '../types';

type SettingsPanelProps = ReturnType<typeof usePreferences> & {
  activePracticeAnswerMode: PracticeAnswerMode;
  themeId: ThemeId;
  setThemeId: (themeId: ThemeId) => void;
  timerEnabled: boolean;
  toggleTimer: () => void;
};

type QuestionCountSettingProps = {
  label: string;
  value: PracticeQuestionCount;
  defaultCount: PracticeQuestionCount;
  onChange: (count: PracticeQuestionCount) => void;
};

function QuestionCountSetting({ label, value, defaultCount, onChange }: QuestionCountSettingProps) {
  const { t } = useI18n();
  return (
    <label className="preference-row">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => {
          const count = practiceQuestionCounts.find((option) => String(option) === event.target.value);
          if (count !== undefined) onChange(count);
        }}
      >
        {practiceQuestionCounts.map((count) => (
          <option key={count} value={count}>
            {t(count === defaultCount ? '{count} questions (default)' : '{count} questions', { count })}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SettingsPanel({
  themeId,
  setThemeId,
  translationLanguage,
  setTranslationLanguage,
  includeVosotros,
  setIncludeVosotros,
  practiceAnswerMode,
  activePracticeAnswerMode,
  setPracticeAnswerMode,
  practiceAccentRetry,
  setPracticeAccentRetry,
  practiceAutoAdvance,
  setPracticeAutoAdvance,
  drillShortcuts,
  setDrillShortcuts,
  practiceQuestionCount,
  setPracticeQuestionCount,
  quizQuestionCount,
  setQuizQuestionCount,
  timerEnabled,
  toggleTimer,
}: SettingsPanelProps) {
  const { t } = useI18n();

  return (
    <section className="settings-page" aria-labelledby="settings-title">
      <h1 className="workspace-title" id="settings-title">{t('Settings')}</h1>

      <section className="settings-section" aria-labelledby="practice-settings-title">
        <h2 id="practice-settings-title">{t('Practice')}</h2>
        <div className="preference-row">
          <span>
            {t('Answer format')}
            {activePracticeAnswerMode !== practiceAnswerMode && <small id="practice-answer-mode-note" className="preference-note">{t('Applies to the next set.')}</small>}
          </span>
          <div
            className="preference-toggle"
            role="group"
            aria-label={t('Answer format')}
            aria-describedby={activePracticeAnswerMode !== practiceAnswerMode ? 'practice-answer-mode-note' : undefined}
          >
            <button aria-pressed={practiceAnswerMode === 'choice'} data-active={practiceAnswerMode === 'choice'} onClick={() => setPracticeAnswerMode('choice')} type="button">
              {t('Multiple choice')}
            </button>
            <button aria-pressed={practiceAnswerMode === 'typing'} data-active={practiceAnswerMode === 'typing'} onClick={() => setPracticeAnswerMode('typing')} type="button">
              {t('Typing')}
            </button>
          </div>
        </div>
        {practiceAnswerMode === 'typing' && (
          <label className="preference-row preference-switch">
            <span>{t('Allow one accent retry')}</span>
            <input checked={practiceAccentRetry} onChange={(event) => setPracticeAccentRetry(event.target.checked)} role="switch" type="checkbox" />
          </label>
        )}
        <QuestionCountSetting
          label={t('Questions per set')}
          value={practiceQuestionCount}
          defaultCount={defaultPracticeQuestionCount}
          onChange={setPracticeQuestionCount}
        />
        <label className="preference-row preference-switch">
          <span>{t('Question timer')}</span>
          <input checked={timerEnabled} onChange={toggleTimer} role="switch" type="checkbox" />
        </label>
        <label className="preference-row preference-switch">
          <span>{t('Auto-advance after correct choices')}</span>
          <input checked={practiceAutoAdvance} onChange={(event) => setPracticeAutoAdvance(event.target.checked)} role="switch" type="checkbox" />
        </label>
        <label className="preference-row preference-switch">
          <span>{t('Include Spanish vosotros')}</span>
          <input checked={includeVosotros} onChange={(event) => setIncludeVosotros(event.target.checked)} role="switch" type="checkbox" />
        </label>
      </section>

      <section className="settings-section" aria-labelledby="quiz-settings-title">
        <h2 id="quiz-settings-title">{t('Quiz')}</h2>
        <QuestionCountSetting
          label={t('Questions per round')}
          value={quizQuestionCount}
          defaultCount={defaultQuizQuestionCount}
          onChange={setQuizQuestionCount}
        />
      </section>

      <section className="settings-section" aria-labelledby="display-settings-title">
        <h2 id="display-settings-title">{t('Display')}</h2>
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
        <div className="preference-row">
          <span>{t('Theme')}</span>
          <div className="preference-toggle" role="group" aria-label={t('Theme')}>
            <button aria-pressed={themeId === 'light'} data-active={themeId === 'light'} onClick={() => setThemeId('light')} type="button">
              <Sun size={15} aria-hidden="true" /> {t('Light')}
            </button>
            <button aria-pressed={themeId === 'dark'} data-active={themeId === 'dark'} onClick={() => setThemeId('dark')} type="button">
              <Moon size={15} aria-hidden="true" /> {t('Dark')}
            </button>
          </div>
        </div>
      </section>

      <section className="settings-section" aria-labelledby="keyboard-settings-title">
        <h2 id="keyboard-settings-title">{t('Keyboard')}</h2>
        <label className="preference-row preference-switch">
          <span>{t('Practice and quiz shortcuts')}</span>
          <input checked={drillShortcuts} onChange={(event) => setDrillShortcuts(event.target.checked)} role="switch" type="checkbox" />
        </label>
      </section>

      <a className="preference-row feedback-link" href="mailto:phoenixlwp@gmail.com?subject=ConjuGO%20Feedback">
        <Mail size={16} aria-hidden="true" />
        <span>{t('Feedback')}</span>
        <ChevronRight size={16} aria-hidden="true" />
      </a>
    </section>
  );
}
