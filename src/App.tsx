import { LocaleContext } from './hooks/useI18n';
import { translate, type MessageKey } from './lib/i18n';
import { lazy, Suspense, useEffect, useState, type CSSProperties } from 'react';
import { usePractice } from './hooks/usePractice';
import { usePreferences } from './hooks/usePreferences';
import { Header } from './components/Header';
import { AppUpdateNotice } from './components/AppUpdateNotice';
import { SessionBar } from './components/SessionBar';
import { TimedTrainerPanel } from './components/TrainerPanel';
import { ProgressPanel } from './components/ProgressPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { WorkspaceNavigation } from './components/WorkspaceNavigation';
import { ConjugationModal } from './components/WordBook/ConjugationPanel';
import { isEditableElement } from './lib/keyboard';
import { isThemeId, themeStorageKey, type ThemeId } from './data/themes';

const StatsDashboard = lazy(() =>
  import('./components/StatsDashboard').then((module) => ({ default: module.StatsDashboard })),
);
const QuizPanel = lazy(() =>
  import('./components/QuizPanel').then((module) => ({ default: module.QuizPanel })),
);
const WordBook = lazy(() =>
  import('./components/WordBook/WordBook').then((module) => ({ default: module.WordBook })),
);

export default function App() {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    try {
      const storedTheme = window.localStorage.getItem(themeStorageKey);
      return isThemeId(storedTheme) ? storedTheme : 'light';
    } catch {
      return 'light';
    }
  });

  const preferences = usePreferences();
  const { translationLanguage } = preferences;
  const t = (key: MessageKey) => translate(translationLanguage, key);

  useEffect(() => {
    document.documentElement.lang = translationLanguage === 'zh' ? 'zh-CN' : 'en';
  }, [translationLanguage]);

  const {
    languageId,
    switchLanguage,
    practiceTense,
    switchTense,
    switchPracticeScope,
    favoriteVerbs,
    toggleFavorite,
    isEmptyFavoriteSession,
    canStartFavoriteSession,
    activeView,
    setActiveView,
    bookTense,
    setBookTense,
    wordbookQuery,
    setWordbookQuery,
    wordbookSort,
    wordbookView,
    setWordbookView,
    setWordbookSort,
    selectedVerb,
    selectedVerbInfinitive,
    setSelectedVerbInfinitive,
    filteredVerbs,
    showOnlyFavorites,
    setShowOnlyFavorites,
    openPromptInWordbook,
    conjugationPrompt,
    closeConjugationModal,
    autoAdvanceStopped,
    wordbookReturnView,
    selectedAnswer,
    timedOut,
    attempts,
    streak,
    reviewingLastAnswer,
    toggleResults,
    stats,
    storedMisses,
    activeLanguage,
    prompt,
    choices,
    correctAnswer,
    isAnswered,
    isCorrect,
    accuracy,
    progress,
    progressPercent,
    isSessionComplete,
    selectChoice,
    resetSession,
    moveNext,
    startMissReview,
    startVerbDrill,
    drillTense,
    sessionKind,
    countdownClock,
    elapsedClock,
    timerEnabled,
    toggleTimer,
    todayStats,
    todayAccuracy,
    trend,
    sessionTarget,
    recordQuizResult,
  } = usePractice(preferences);

  const openWordbookList = () => {
    setShowOnlyFavorites(false);
    setWordbookQuery('');
    setWordbookView('list');
    setActiveView('wordbook');
  };

  // Defer the quiz until its first visit, then keep the round mounted across views.
  const [hasOpenedQuiz, setHasOpenedQuiz] = useState(activeView === 'quiz');
  if (activeView === 'quiz' && !hasOpenedQuiz) {
    setHasOpenedQuiz(true);
  }
  const workspaceLoading = (
    <section className="stats-loading-card" role="status" aria-busy="true">
      {t('Loading workspace…')}
    </section>
  );

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;

    try {
      window.localStorage.setItem(themeStorageKey, themeId);
    } catch {
      // Theme choice is cosmetic; keep the UI usable if storage is blocked.
    }
  }, [themeId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableElement(event.target) || event.defaultPrevented) {
        return;
      }

      if (activeView !== 'practice' || conjugationPrompt) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'r') {
        event.preventDefault();
        resetSession();
        return;
      }

      if (isSessionComplete && !reviewingLastAnswer) return;

      if (isAnswered) {
        if (event.key === 'Enter' || event.key === ' ') {
          // Let focused controls, including the Verb Book shortcut, handle activation.
          if (event.target instanceof Element && event.target.closest('button:not(:disabled), a[href]')) return;
          event.preventDefault();
          if (isSessionComplete) {
            toggleResults();
          } else if (!isCorrect || autoAdvanceStopped) {
            moveNext();
          }
        }
        return;
      }

      if (!isSessionComplete) {
        if (key === '1' || key === 'a') {
          event.preventDefault();
          if (choices[0]) selectChoice(choices[0]);
        } else if (key === '2' || key === 'b') {
          event.preventDefault();
          if (choices[1]) selectChoice(choices[1]);
        } else if (key === '3' || key === 'c') {
          event.preventDefault();
          if (choices[2]) selectChoice(choices[2]);
        } else if (key === '4' || key === 'd') {
          event.preventDefault();
          if (choices[3]) selectChoice(choices[3]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeView,
    autoAdvanceStopped,
    choices,
    conjugationPrompt,
    isAnswered,
    isCorrect,
    isSessionComplete,
    moveNext,
    resetSession,
    selectChoice,
    reviewingLastAnswer,
    toggleResults,
  ]);

  return (
    <LocaleContext value={translationLanguage}>
      <main
        className="app-shell"
        data-view={activeView}
        data-theme={themeId}
        onPointerDownCapture={(event) => {
          event.currentTarget.toggleAttribute('data-touch-input', event.pointerType === 'touch');
        }}
        onKeyDownCapture={(event) => event.currentTarget.removeAttribute('data-touch-input')}
        style={{ '--language-accent': themeId === 'dark' ? activeLanguage.darkAccent : activeLanguage.accent } as CSSProperties}
      >
        <Header
          languageId={languageId}
          switchLanguage={switchLanguage}
          activeView={activeView}
          setActiveView={setActiveView}
          themeId={themeId}
        />

        <div className="app-content">
          <AppUpdateNotice />
          {activeView === 'practice' && (
            <>
              <SessionBar
                language={activeLanguage}
                practiceTense={practiceTense}
                switchTense={switchTense}
                favoriteCount={favoriteVerbs.size}
                sessionKind={sessionKind}
                switchPracticeScope={switchPracticeScope}
              />

              {isEmptyFavoriteSession ? (
                <section className="trainer-panel favorite-practice-empty">
                  <h1 className="workspace-title">{t('Practice')}</h1>
                  {favoriteVerbs.size === 0 ? (
                    <>
                      <p>{t('No favorite verbs yet.')}</p>
                      <button className="quiz-primary" type="button" onClick={openWordbookList}>{t('Open the Verb Book')}</button>
                    </>
                  ) : canStartFavoriteSession ? (
                    <>
                      <p>{t('Start a set with your favorites.')}</p>
                      <button className="quiz-primary" type="button" onClick={resetSession}>{t('Start practice')}</button>
                    </>
                  ) : (
                    <p>{t('Your favorites have no questions for this tense or mood. Choose another one.')}</p>
                  )}
                </section>
              ) : (
                <section className="practice-layout">
                  <TimedTrainerPanel
                    attempts={attempts}
                    prompt={prompt}
                    practiceTense={practiceTense}
                    choices={choices}
                    selectedAnswer={selectedAnswer}
                    timedOut={timedOut}
                    correctAnswer={correctAnswer}
                    isAnswered={isAnswered}
                    isCorrect={isCorrect}
                    isSessionComplete={isSessionComplete}
                    reviewingLastAnswer={reviewingLastAnswer}
                    toggleResults={toggleResults}
                    selectChoice={selectChoice}
                    resetSession={resetSession}
                    onBackHome={() => switchPracticeScope('standard')}
                    moveNext={moveNext}
                    onOpenWordbook={() => openPromptInWordbook(prompt, 'practice')}
                    clock={countdownClock}
                    elapsedClock={elapsedClock}
                    timerEnabled={timerEnabled}
                    toggleTimer={toggleTimer}
                    sessionTarget={sessionTarget}
                    sessionKind={sessionKind}
                    streak={streak}
                    autoAdvanceStopped={autoAdvanceStopped}
                    translationLanguage={translationLanguage}
                  />

                  <ProgressPanel
                    activeLanguage={activeLanguage}
                    progress={progress}
                    progressPercent={progressPercent}
                    attempts={attempts}
                    accuracy={accuracy}
                    streak={streak}
                    cumulativeStats={stats}
                    sessionTarget={sessionTarget}
                    elapsedClock={elapsedClock}
                  />
                </section>
              )}
            </>
          )}

          {activeView === 'settings' && (
            <SettingsPanel
              {...preferences}
              themeId={themeId}
              setThemeId={setThemeId}
              timerEnabled={timerEnabled}
              toggleTimer={toggleTimer}
            />
          )}

          {activeView === 'stats' && (
            <Suspense
              fallback={
                <section className="stats-loading-card" aria-busy="true" aria-label={t('Loading stats')}>
                  {t('Loading performance dashboard…')}
                </section>
              }
            >
              <StatsDashboard
                activeLanguage={activeLanguage}
                bestStreak={stats.bestStreak}
                storedMisses={storedMisses}
                stats={stats}
                todayAccuracy={todayAccuracy}
                todayStats={todayStats}
                trend={trend}
                translationLanguage={translationLanguage}
                onStartMissPractice={startMissReview}
                onDrillTense={drillTense}
                onDrillVerbs={startVerbDrill}
              />
            </Suspense>
          )}

          {hasOpenedQuiz && (
            <Suspense fallback={activeView === 'quiz' ? workspaceLoading : null}>
              <QuizPanel
                key={`${languageId}-${languageId === 'spanish' && preferences.includeVosotros}`}
                active={activeView === 'quiz'}
                language={activeLanguage}
                questionCount={preferences.quizQuestionCount}
                onAnswer={recordQuizResult}
                onOpenWordbook={(quizPrompt) => openPromptInWordbook(quizPrompt, 'quiz')}
              />
            </Suspense>
          )}

          {activeView === 'wordbook' && selectedVerb && (
            <Suspense fallback={workspaceLoading}>
              <WordBook
                view={wordbookView}
                onViewChange={setWordbookView}
                activeLanguage={activeLanguage}
                bookTense={bookTense}
                filteredVerbs={filteredVerbs}
                favoriteVerbs={favoriteVerbs}
                showOnlyFavorites={showOnlyFavorites}
                onToggleFavorite={toggleFavorite}
                onFavoritesFilterChange={setShowOnlyFavorites}
                onQueryChange={setWordbookQuery}
                onReturnToSession={setActiveView}
                onSortChange={setWordbookSort}
                onSelectVerb={setSelectedVerbInfinitive}
                onTenseChange={setBookTense}
                query={wordbookQuery}
                returnTo={wordbookReturnView}
                sort={wordbookSort}
                selectedVerb={selectedVerb}
                selectedVerbInfinitive={selectedVerbInfinitive}
                translationLanguage={translationLanguage}
              />
            </Suspense>
          )}
        </div>
        {conjugationPrompt && (
          <ConjugationModal
            prompt={conjugationPrompt}
            isFavorite={favoriteVerbs.has(conjugationPrompt.verb.infinitive)}
            onToggleFavorite={toggleFavorite}
            onClose={closeConjugationModal}
            translationLanguage={translationLanguage}
          />
        )}
        <WorkspaceNavigation activeView={activeView} onViewChange={setActiveView} placement="bottom" />
      </main>
    </LocaleContext>
  );
}
