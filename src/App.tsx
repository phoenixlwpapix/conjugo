import { CSSProperties, useEffect } from 'react';
import { usePractice } from './hooks/usePractice';
import { Header } from './components/Header';
import { SessionBar } from './components/SessionBar';
import { TrainerPanel } from './components/TrainerPanel';
import { ProgressPanel } from './components/ProgressPanel';
import { WordBookPanel } from './components/WordBookPanel';
import { CelebrationOverlay } from './components/CelebrationOverlay';

export default function App() {
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
    clickReviewItem,
    timeLeft,
    timerEnabled,
    toggleTimer,
  } = usePractice();

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

  return (
    <main className="app-shell" style={{ '--language-accent': activeLanguage.accent } as CSSProperties}>
      {showCelebration && (
        <CelebrationOverlay
          resetSession={resetSession}
          dismissCelebration={dismissCelebration}
        />
      )}

      <Header
        languageId={languageId}
        switchLanguage={switchLanguage}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className="app-content">
        {activeView === 'practice' ? (
          <>
            <SessionBar
              languageId={languageId}
              practiceTense={practiceTense}
              switchTense={switchTense}
              progress={progress}
              streak={streak}
              accuracy={accuracy}
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
