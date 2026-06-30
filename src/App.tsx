import { useMemo, useState } from 'react';
import { CelebrationOverlay } from './components/CelebrationOverlay';
import { Header } from './components/Header';
import { ProgressPanel } from './components/ProgressPanel';
import { SessionBar } from './components/SessionBar';
import { TrainerPanel } from './components/TrainerPanel';
import { WordBook } from './components/WordBook/WordBook';
import { languages, type LanguageId, type PracticeTenseId } from './data/verbs';
import { usePracticeSession } from './hooks/usePracticeSession';
import { useWordbook } from './hooks/useWordbook';
import type { StyleVars } from './lib/style';
import { readActiveView, readLanguageId, readPracticeTense, writeActiveView, writeLanguageId, writePracticeTense } from './lib/storage';
import type { AppView, Attempt } from './types';

export default function App() {
  const [languageId, setLanguageId] = useState<LanguageId>(readLanguageId);
  const [practiceTense, setPracticeTense] = useState<PracticeTenseId>(readPracticeTense);
  const [activeView, setActiveView] = useState<AppView>(readActiveView);
  const activeLanguage = useMemo(
    () => languages.find((language) => language.id === languageId) ?? languages[0],
    [languageId],
  );
  const practiceSession = usePracticeSession(activeLanguage, practiceTense);
  const wordbook = useWordbook(activeLanguage);

  const switchLanguage = (nextLanguageId: LanguageId) => {
    setLanguageId(nextLanguageId);
    writeLanguageId(nextLanguageId);
  };

  const switchTense = (nextTense: PracticeTenseId) => {
    setPracticeTense(nextTense);
    writePracticeTense(nextTense);
  };

  const switchView = (nextView: AppView) => {
    setActiveView(nextView);
    writeActiveView(nextView);
  };

  const openReviewInWordbook = (attempt: Attempt) => {
    wordbook.openPromptInWordbook(attempt.prompt);
    switchView('wordbook');
  };

  return (
    <main className="app-shell" style={{ '--language-accent': activeLanguage.accent } as StyleVars}>
      {practiceSession.showCelebration && <CelebrationOverlay onRestart={practiceSession.startSession} />}

      <Header
        activeLanguage={activeLanguage}
        activeView={activeView}
        languageId={languageId}
        onLanguageChange={switchLanguage}
        onViewChange={switchView}
      />

      {activeView === 'practice' ? (
        <>
          <SessionBar
            accuracy={practiceSession.accuracy}
            onReset={practiceSession.startSession}
            onTenseChange={switchTense}
            practiceTense={practiceTense}
            progress={practiceSession.progress}
            streak={practiceSession.streak}
          />

          <section className="practice-layout">
            <TrainerPanel
              activeLanguage={activeLanguage}
              attempts={practiceSession.attempts}
              choices={practiceSession.choices}
              correctAnswer={practiceSession.correctAnswer}
              isAnswered={practiceSession.isAnswered}
              isCorrect={practiceSession.isCorrect}
              isSessionComplete={practiceSession.isSessionComplete}
              onMoveNext={practiceSession.moveNext}
              onReset={practiceSession.startSession}
              onSelectChoice={practiceSession.selectChoice}
              practiceTense={practiceTense}
              prompt={practiceSession.prompt}
              selectedAnswer={practiceSession.selectedAnswer}
              showCelebration={practiceSession.showCelebration}
            />

            <ProgressPanel
              accuracy={practiceSession.accuracy}
              attempts={practiceSession.attempts}
              onOpenReview={openReviewInWordbook}
              progress={practiceSession.progress}
              progressPercent={practiceSession.progressPercent}
              recentMisses={practiceSession.recentMisses}
              statsTotalAnswered={practiceSession.stats.totalAnswered}
              streak={practiceSession.streak}
              todayAccuracy={practiceSession.todayAccuracy}
              todayStats={practiceSession.todayStats}
              trend={practiceSession.trend}
            />
          </section>
        </>
      ) : (
        <WordBook
          activeLanguage={activeLanguage}
          bookTense={wordbook.bookTense}
          filteredVerbs={wordbook.filteredVerbs}
          onQueryChange={wordbook.setWordbookQuery}
          onSelectVerb={wordbook.setSelectedVerbInfinitive}
          onTenseChange={wordbook.setBookTense}
          query={wordbook.wordbookQuery}
          selectedVerb={wordbook.selectedVerb}
          selectedVerbInfinitive={wordbook.selectedVerbInfinitive}
        />
      )}
    </main>
  );
}
