import { lazy, Suspense, useEffect, useState, type CSSProperties } from 'react';
import { usePractice } from './hooks/usePractice';
import { Header } from './components/Header';
import { SessionBar } from './components/SessionBar';
import { TrainerPanel } from './components/TrainerPanel';
import { ProgressPanel } from './components/ProgressPanel';
import { WordBook } from './components/WordBook/WordBook';
import { SessionCompleteOverlay } from './components/SessionCompleteOverlay';
import { isEditableElement } from './lib/focusTrap';
import { isThemeId, themeStorageKey, type ThemeId } from './data/themes';

const StatsDashboard = lazy(() =>
  import('./components/StatsDashboard').then((module) => ({ default: module.StatsDashboard })),
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
    setWordbookSort,
    selectedVerb,
    selectedVerbInfinitive,
    setSelectedVerbInfinitive,
    filteredVerbs,
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
    recentMisses,
    isSessionComplete,
    selectChoice,
    resetSession,
    moveNext,
    startMissReview,
    dismissCelebration,
    dismissCompletion,
    timeLeft,
    timerEnabled,
    timerPaused,
    setTimerPaused,
    toggleTimer,
    todayStats,
    todayAccuracy,
    trend,
    sessionTarget,
  } = usePractice();

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

      if (activeView !== 'practice' || showCelebration || showCompletion || timerPaused) {
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
    timerPaused,
  ]);

  const sessionCorrectCount = attempts.filter((attempt) => attempt.correct).length;

  const returnHome = () => {
    dismissCompletion();
    dismissCelebration();
    setActiveView('practice');
  };

  return (
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
              <TrainerPanel
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
                timeLeft={timeLeft}
                timerEnabled={timerEnabled}
                toggleTimer={toggleTimer}
                sessionTarget={sessionTarget}
              />

              <ProgressPanel
                activeLanguage={activeLanguage}
                progress={progress}
                progressPercent={progressPercent}
                attempts={attempts}
                accuracy={accuracy}
                streak={streak}
                recentMisses={recentMisses}
                cumulativeStats={stats}
                sessionTarget={sessionTarget}
                onReviewModalChange={setTimerPaused}
              />
            </section>
          </>
        )}

        {activeView === 'stats' && (
          <Suspense
            fallback={
              <section className="stats-loading-card" aria-busy="true" aria-label="Loading stats">
                Loading performance dashboard…
              </section>
            }
          >
            <StatsDashboard
              bestStreak={stats.bestStreak}
              storedMisses={storedMisses}
              stats={stats}
              todayAccuracy={todayAccuracy}
              todayStats={todayStats}
              trend={trend}
              onStartMissPractice={startMissReview}
            />
          </Suspense>
        )}

        {activeView === 'wordbook' && selectedVerb && (
          <WordBook
            activeLanguage={activeLanguage}
            bookTense={bookTense}
            filteredVerbs={filteredVerbs}
            onQueryChange={setWordbookQuery}
            onSortChange={setWordbookSort}
            onSelectVerb={setSelectedVerbInfinitive}
            onTenseChange={setBookTense}
            query={wordbookQuery}
            sort={wordbookSort}
            selectedVerb={selectedVerb}
            selectedVerbInfinitive={selectedVerbInfinitive}
          />
        )}
      </div>
    </main>
  );
}
