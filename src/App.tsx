import { LocaleContext } from './hooks/useI18n';
import { translate, type MessageKey } from './lib/i18n';
import { lazy, Suspense, useEffect, useState, type CSSProperties } from 'react';
import { usePractice } from './hooks/usePractice';
import { usePreferences } from './hooks/usePreferences';
import { Header } from './components/Header';
import { SessionBar } from './components/SessionBar';
import { TimedTrainerPanel } from './components/TrainerPanel';
import { ProgressPanel } from './components/ProgressPanel';
import { SessionCompleteOverlay } from './components/SessionCompleteOverlay';
import { isEditableElement } from './lib/focusTrap';
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
    openPromptInWordbook,
    wordbookReturnView,
    selectedAnswer,
    timedOut,
    attempts,
    streak,
    showCelebration,
    showCompletion,
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
    dismissCelebration,
    dismissCompletion,
    countdownClock,
    elapsedClock,
    timerEnabled,
    toggleTimer,
    todayStats,
    todayAccuracy,
    trend,
    sessionTarget,
    recordQuizResult,
  } = usePractice({ includeVosotros: preferences.includeVosotros });

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

      if (activeView !== 'practice' || showCelebration || showCompletion) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'r') {
        event.preventDefault();
        resetSession();
        return;
      }

      if (isAnswered) {
        if (event.key === 'Enter' || event.key === ' ') {
          // Let focused controls, including the Verb Book shortcut, handle activation.
          if (event.target instanceof Element && event.target.closest('button:not(:disabled), a[href]')) return;
          event.preventDefault();
          if (isSessionComplete) {
            resetSession();
          } else if (!isCorrect) {
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
    choices,
    isAnswered,
    isCorrect,
    isSessionComplete,
    moveNext,
    resetSession,
    selectChoice,
    showCelebration,
    showCompletion,
  ]);

  const sessionCorrectCount = attempts.filter((attempt) => attempt.correct).length;

  const returnHome = () => {
    dismissCompletion();
    dismissCelebration();
    setActiveView('practice');
  };

  return (
    <LocaleContext value={translationLanguage}>
      <main
        className="app-shell"
        data-theme={themeId}
        style={{ '--language-accent': themeId === 'dark' ? activeLanguage.darkAccent : activeLanguage.accent } as CSSProperties}
      >
        {showCelebration && (
          <SessionCompleteOverlay
            mode="perfect"
            accuracy={accuracy}
            correctCount={sessionCorrectCount}
            totalCount={attempts.length}
            onDismiss={dismissCelebration}
            onNewSet={resetSession}
            onReturnHome={returnHome}
          />
        )}

        {showCompletion && (
          <SessionCompleteOverlay
            mode="complete"
            accuracy={accuracy}
            correctCount={sessionCorrectCount}
            totalCount={attempts.length}
            onDismiss={dismissCompletion}
            onNewSet={resetSession}
            onReturnHome={returnHome}
          />
        )}

        <Header
          languageId={languageId}
          switchLanguage={switchLanguage}
          activeView={activeView}
          setActiveView={setActiveView}
          themeId={themeId}
          setThemeId={setThemeId}
          {...preferences}
        />

        <div className="app-content">
          {activeView === 'practice' && (
            <>
              <SessionBar
                language={activeLanguage}
                practiceTense={practiceTense}
                switchTense={switchTense}
                resetSession={resetSession}
              />

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
                  showCelebration={showCelebration}
                  selectChoice={selectChoice}
                  resetSession={resetSession}
                  moveNext={moveNext}
                  onOpenWordbook={() => openPromptInWordbook(prompt, 'practice')}
                  clock={countdownClock}
                  timerEnabled={timerEnabled}
                  toggleTimer={toggleTimer}
                  sessionTarget={sessionTarget}
                  sessionKind={sessionKind}
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
            </>
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
      </main>
    </LocaleContext>
  );
}
