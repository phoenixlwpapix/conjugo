import { CSSProperties, useEffect, useState } from 'react';
import { usePractice } from './hooks/usePractice';
import { Header } from './components/Header';
import { SessionBar } from './components/SessionBar';
import { TrainerPanel } from './components/TrainerPanel';
import { ProgressPanel } from './components/ProgressPanel';
import { WordBookPanel } from './components/WordBookPanel';
import { CelebrationOverlay } from './components/CelebrationOverlay';
import { CompletionOverlay } from './components/CompletionOverlay';
import { isThemeId, themeStorageKey, type ThemeId } from './data/themes';

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
    selectedVerbIndex,
    setSelectedVerbIndex,
    wordbookQuery,
    setWordbookQuery,
    selectedAnswer,
    attempts,
    streak,
    showCelebration,
    showCompletion,
    stats,
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
    dismissCelebration,
    dismissCompletion,
    clickReviewItem,
    timeLeft,
    timerEnabled,
    toggleTimer,
  } = usePractice();

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;

    try {
      window.localStorage.setItem(themeStorageKey, themeId);
    } catch {
      // Theme choice is cosmetic; keep the UI usable if storage is blocked.
    }
  }, [themeId]);

  // Keyboard Shortcuts Support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      // Reset shortcut
      if (key === 'r') {
        event.preventDefault();
        resetSession();
        return;
      }

      // Next / Reset when answered
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

      // Choice selection (1-4 or A-D)
      if (!isAnswered && !isSessionComplete) {
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
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isAnswered,
    isSessionComplete,
    choices,
    isCorrect,
    selectChoice,
    resetSession,
    moveNext,
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
        <CelebrationOverlay
          accuracy={accuracy}
          correctCount={sessionCorrectCount}
          dismissCelebration={dismissCelebration}
          resetSession={resetSession}
          returnHome={returnHome}
          totalCount={attempts.length}
        />
      )}

      {showCompletion && (
        <CompletionOverlay
          accuracy={accuracy}
          correctCount={sessionCorrectCount}
          dismissCompletion={dismissCompletion}
          resetSession={resetSession}
          returnHome={returnHome}
          totalCount={attempts.length}
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
        {activeView === 'practice' ? (
          <>
            <SessionBar
              languageId={languageId}
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
              />

              <ProgressPanel
                progress={progress}
                progressPercent={progressPercent}
                attempts={attempts}
                accuracy={accuracy}
                streak={streak}
                recentMisses={recentMisses}
                cumulativeStats={stats}
                clickReviewItem={clickReviewItem}
              />
            </section>
          </>
        ) : (
          <WordBookPanel
            activeLanguage={activeLanguage}
            selectedVerbIndex={selectedVerbIndex}
            setSelectedVerbIndex={setSelectedVerbIndex}
            wordbookQuery={wordbookQuery}
            setWordbookQuery={setWordbookQuery}
            bookTense={bookTense}
            setBookTense={setBookTense}
          />
        )}
      </div>
    </main>
  );
}
