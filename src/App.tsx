import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  Check,
  Flame,
  RotateCcw,
  Search,
  Target,
  TimerReset,
  Trophy,
  X,
} from 'lucide-react';
import {
  concreteTenses,
  languages,
  pronouns,
  tenseOptions,
  type Language,
  type LanguageId,
  type PracticeTenseId,
  type Pronoun,
  type TenseId,
  type VerbEntry,
} from './data/verbs';

type AppView = 'practice' | 'wordbook';

type Prompt = {
  language: Language;
  verb: VerbEntry;
  tense: TenseId;
  pronoun: Pronoun;
};

type Attempt = {
  prompt: Prompt;
  answer: string;
  correct: boolean;
};

const sessionTarget = 20;
const autoAdvanceDelayMs = 1200;
const confettiColors = ['#174f43', '#1f65c7', '#f2b13d', '#c74735', '#0f766e'];
const confettiPieces = Array.from({ length: 44 }, (_, index) => ({
  id: index,
  color: confettiColors[index % confettiColors.length],
  delay: `${(index % 11) * 58}ms`,
  duration: `${980 + (index % 7) * 90}ms`,
  left: `${6 + ((index * 19) % 88)}%`,
  size: `${7 + (index % 4) * 2}px`,
  spin: `${(index % 2 === 0 ? 1 : -1) * (160 + index * 13)}deg`,
}));

const getPracticeTenses = (practiceTense: PracticeTenseId) =>
  practiceTense === 'mixed' ? concreteTenses.map((tense) => tense.id) : [practiceTense];

const createPromptPool = (language: Language, practiceTense: PracticeTenseId): Prompt[] =>
  language.verbs.flatMap((verb) =>
    getPracticeTenses(practiceTense).flatMap((tense) =>
      pronouns.map((pronoun) => ({
        language,
        verb,
        tense,
        pronoun,
      })),
    ),
  );

const shufflePrompts = (prompts: Prompt[]) => {
  const shuffled = [...prompts];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

const createSessionPrompts = (language: Language, practiceTense: PracticeTenseId) =>
  shufflePrompts(createPromptPool(language, practiceTense)).slice(0, sessionTarget);

const getFallbackPrompt = (language: Language, practiceTense: PracticeTenseId): Prompt => {
  const firstVerb = language.verbs[0];

  if (!firstVerb) {
    throw new Error(`${language.name} needs at least one verb`);
  }

  return {
    language,
    verb: firstVerb,
    tense: getPracticeTenses(practiceTense)[0],
    pronoun: pronouns[0],
  };
};

const getAnswer = (prompt: Prompt) => prompt.verb.forms[prompt.tense][prompt.pronoun];

const getPronounLabel = (prompt: Prompt) => prompt.language.pronounLabels[prompt.pronoun];

const getTenseLabel = (tense: TenseId) => concreteTenses.find((item) => item.id === tense)?.label ?? tense;

const getAccuracy = (correct: number, total: number) => (total === 0 ? 0 : Math.round((correct / total) * 100));

const stableScore = (value: string, seed: number) =>
  Array.from(value).reduce((score, character) => score + character.charCodeAt(0), seed * 37);

const getChoices = (prompt: Prompt, seed: number) => {
  const correctAnswer = getAnswer(prompt);
  const sameTenseDistractors = pronouns
    .map((pronoun) => prompt.verb.forms[prompt.tense][pronoun])
    .filter((value, index, values) => value !== correctAnswer && values.indexOf(value) === index)
    .sort((first, second) => stableScore(first, seed) - stableScore(second, seed))
    .slice(0, 3);
  const fallbackDistractors = concreteTenses
    .flatMap((tense) => pronouns.map((pronoun) => prompt.verb.forms[tense.id][pronoun]))
    .filter(
      (value, index, values) =>
        value !== correctAnswer && !sameTenseDistractors.includes(value) && values.indexOf(value) === index,
    )
    .sort((first, second) => stableScore(first, seed) - stableScore(second, seed))
    .slice(0, 3 - sameTenseDistractors.length);
  const distractors = [...sameTenseDistractors, ...fallbackDistractors];

  return [correctAnswer, ...distractors].sort((first, second) => stableScore(first, seed + 11) - stableScore(second, seed + 11));
};

export default function App() {
  const [languageId, setLanguageId] = useState<LanguageId>('spanish');
  const [practiceTense, setPracticeTense] = useState<PracticeTenseId>('present');
  const [activeView, setActiveView] = useState<AppView>('practice');
  const [bookTense, setBookTense] = useState<TenseId>('present');
  const [selectedVerbIndex, setSelectedVerbIndex] = useState(0);
  const [wordbookQuery, setWordbookQuery] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeLanguage = useMemo(
    () => languages.find((language) => language.id === languageId) ?? languages[0],
    [languageId],
  );
  const [sessionPrompts, setSessionPrompts] = useState<Prompt[]>(() =>
    createSessionPrompts(activeLanguage, practiceTense),
  );

  const prompt = sessionPrompts[Math.min(promptIndex, sessionPrompts.length - 1)] ?? getFallbackPrompt(activeLanguage, practiceTense);
  const selectedVerb = activeLanguage.verbs[selectedVerbIndex] ?? activeLanguage.verbs[0];
  const filteredVerbs = useMemo(() => {
    const normalizedQuery = wordbookQuery.trim().toLowerCase();

    return activeLanguage.verbs
      .map((verb, index) => ({ index, verb }))
      .filter(({ verb }) => {
        if (!normalizedQuery) {
          return true;
        }

        return `${verb.infinitive} ${verb.translation}`.toLowerCase().includes(normalizedQuery);
      });
  }, [activeLanguage, wordbookQuery]);
  const choices = useMemo(() => getChoices(prompt, promptIndex), [prompt, promptIndex]);
  const correctAnswer = getAnswer(prompt);
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === correctAnswer;
  const correctCount = attempts.filter((attempt) => attempt.correct).length;
  const accuracy = getAccuracy(correctCount, attempts.length);
  const progress = Math.min(attempts.length, sessionTarget);
  const progressPercent = Math.round((progress / sessionTarget) * 100);
  const recentMisses = attempts.filter((attempt) => !attempt.correct).slice(0, 4);
  const isSessionComplete = attempts.length >= sessionTarget;

  useEffect(
    () => () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
    },
    [],
  );

  const clearAutoAdvance = () => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  };

  const resetQuestion = () => {
    setSelectedAnswer(null);
  };

  const moveNext = () => {
    clearAutoAdvance();
    setPromptIndex((current) => Math.min(current + 1, sessionTarget - 1));
    resetQuestion();
  };

  const startSession = (language: Language, tense: PracticeTenseId) => {
    clearAutoAdvance();
    setSessionPrompts(createSessionPrompts(language, tense));
    setPromptIndex(0);
    setAttempts([]);
    setStreak(0);
    setShowCelebration(false);
    resetQuestion();
  };

  const resetSession = () => {
    startSession(activeLanguage, practiceTense);
  };

  const switchLanguage = (nextLanguageId: LanguageId) => {
    const nextLanguage = languages.find((language) => language.id === nextLanguageId) ?? languages[0];

    setLanguageId(nextLanguageId);
    setSelectedVerbIndex(0);
    setWordbookQuery('');
    startSession(nextLanguage, practiceTense);
  };

  const switchTense = (nextTense: PracticeTenseId) => {
    setPracticeTense(nextTense);
    startSession(activeLanguage, nextTense);
  };

  const selectChoice = (choice: string) => {
    if (isAnswered || isSessionComplete) {
      return;
    }

    clearAutoAdvance();
    const choiceIsCorrect = choice === correctAnswer;
    const nextAttemptTotal = attempts.length + 1;
    const nextCorrectTotal = correctCount + (choiceIsCorrect ? 1 : 0);
    const perfectSetComplete = choiceIsCorrect && nextAttemptTotal >= sessionTarget && nextCorrectTotal >= sessionTarget;

    setSelectedAnswer(choice);
    setAttempts((current) => [{ prompt, answer: choice, correct: choiceIsCorrect }, ...current]);
    setStreak((current) => (choiceIsCorrect ? current + 1 : 0));

    if (perfectSetComplete) {
      setShowCelebration(true);
      return;
    }

    if (choiceIsCorrect && nextAttemptTotal < sessionTarget) {
      autoAdvanceTimer.current = setTimeout(() => {
        setPromptIndex((current) => Math.min(current + 1, sessionTarget - 1));
        setSelectedAnswer(null);
        autoAdvanceTimer.current = null;
      }, autoAdvanceDelayMs);
    }
  };

  return (
    <main className="app-shell" style={{ '--language-accent': activeLanguage.accent } as CSSProperties}>
      {showCelebration && (
        <section className="celebration-layer" aria-live="polite" aria-label="Perfect set completed">
          <div className="confetti-field" aria-hidden="true">
            {confettiPieces.map((piece) => (
              <span
                key={piece.id}
                style={
                  {
                    '--confetti-color': piece.color,
                    '--confetti-delay': piece.delay,
                    '--confetti-duration': piece.duration,
                    '--confetti-left': piece.left,
                    '--confetti-size': piece.size,
                    '--confetti-spin': piece.spin,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <div className="celebration-card">
            <Trophy size={28} aria-hidden="true" />
            <div>
              <strong>Perfect set</strong>
              <span>{sessionTarget}/{sessionTarget} correct</span>
            </div>
            <button onClick={resetSession} type="button">
              Start again
            </button>
          </div>
        </section>
      )}

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

      {activeView === 'practice' ? (
        <>
          <section className="session-bar" aria-label="Practice controls">
            <div className="segmented-control">
              {tenseOptions.map((item) => (
                <button
                  className="segment-button"
                  data-active={item.id === practiceTense}
                  key={item.id}
                  onClick={() => switchTense(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="session-pills" aria-label="Session summary">
              <span>
                <Target size={16} aria-hidden="true" />
                {progress}/{sessionTarget}
              </span>
              <span>
                <Flame size={16} aria-hidden="true" />
                {streak}
              </span>
              <span>
                <Trophy size={16} aria-hidden="true" />
                {accuracy}%
              </span>
            </div>

            <button className="reset-button" onClick={resetSession} type="button">
              <RotateCcw size={16} aria-hidden="true" />
              Reset
            </button>
          </section>

          <section className="practice-layout">
            <section className="trainer-panel" aria-label="Multiple choice verb conjugation drill">
              <div className="trainer-head">
                <div>
                  <span className="eyebrow">Question {Math.min(attempts.length + 1, sessionTarget)}</span>
                  <h1>Conjugation drill</h1>
                </div>
                <div className="timer-chip">
                  <TimerReset size={17} aria-hidden="true" />
                  Fast recall
                </div>
              </div>

              <div className="prompt-card">
                <div className="prompt-main">
                  <div className="prompt-context">
                    <span>{activeLanguage.name}</span>
                    <span>{getTenseLabel(prompt.tense)}</span>
                    {practiceTense === 'mixed' && <span>Mixed</span>}
                  </div>

                  <div className="prompt-stem">
                    <span>Pronoun</span>
                    <h2>{getPronounLabel(prompt)}</h2>
                  </div>

                  <div className="verb-meaning">
                    <span>Infinitive</span>
                    <strong>{prompt.verb.infinitive}</strong>
                    <em>{prompt.verb.translation}</em>
                  </div>
                </div>
                <div className="prompt-side">
                  <span>Build</span>
                  <strong>{getPronounLabel(prompt)} + {prompt.verb.infinitive}</strong>
                  <small>{getTenseLabel(prompt.tense)}</small>
                </div>
              </div>

              <div className="choice-grid" aria-label="Answer choices">
                {choices.map((choice, index) => {
                  const isSelectedChoice = selectedAnswer === choice;
                  const isCorrectChoice = isAnswered && choice === correctAnswer;
                  const isWrongChoice = isAnswered && isSelectedChoice && choice !== correctAnswer;

                  return (
                    <button
                      aria-label={`Option ${String.fromCharCode(65 + index)}: ${choice}`}
                      className="choice-card"
                      data-correct={isCorrectChoice}
                      data-wrong={isWrongChoice}
                      disabled={isAnswered}
                      key={choice}
                      onClick={() => selectChoice(choice)}
                      type="button"
                    >
                      <span className="choice-index">{String.fromCharCode(65 + index)}</span>
                      <strong>{choice}</strong>
                      {isCorrectChoice && <Check size={18} aria-label="Correct answer" />}
                      {isWrongChoice && <X size={18} aria-label="Wrong answer" />}
                    </button>
                  );
                })}
              </div>

              <div className="answer-dock" data-result={isAnswered ? (isCorrect ? 'correct' : 'wrong') : 'idle'}>
                {isAnswered ? (
                  <>
                    <div>
                      <strong>{isCorrect ? 'Good hit.' : 'Missed this one.'}</strong>
                      <span>
                        {getPronounLabel(prompt)} + {prompt.verb.infinitive} = {correctAnswer}
                        {isCorrect && !showCelebration ? ' · next question loading' : ''}
                      </span>
                    </div>
                    {!isCorrect &&
                      (isSessionComplete ? (
                        <button className="next-button" onClick={resetSession} type="button">
                          New set
                          <RotateCcw size={17} aria-hidden="true" />
                        </button>
                      ) : (
                        <button className="next-button" onClick={moveNext} type="button">
                          Next
                          <ArrowRight size={17} aria-hidden="true" />
                        </button>
                      ))}
                  </>
                ) : (
                  <div>
                    <strong>Choose one answer card.</strong>
                  </div>
                )}
              </div>
            </section>

            <aside className="progress-panel" aria-label="Practice progress">
              <section className="progress-card">
                <div className="panel-title">
                  <BarChart3 size={18} aria-hidden="true" />
                  <h2>Today</h2>
                </div>
                <div className="ring-meter" style={{ '--progress': `${progressPercent}%` } as CSSProperties}>
                  <span>{progressPercent}%</span>
                </div>
                <p>
                  {sessionTarget - progress > 0
                    ? `${sessionTarget - progress} more to complete this set`
                    : 'Set complete. Reset or keep going.'}
                </p>
              </section>

              <section className="score-grid">
                <div>
                  <span>Answered</span>
                  <strong>{attempts.length}</strong>
                </div>
                <div>
                  <span>Accuracy</span>
                  <strong>{accuracy}%</strong>
                </div>
                <div>
                  <span>Streak</span>
                  <strong>{streak}</strong>
                </div>
              </section>

              <section className="review-card">
                <div className="panel-title">
                  <BookOpenText size={18} aria-hidden="true" />
                  <h2>Review</h2>
                </div>
                {recentMisses.length === 0 ? (
                  <p className="empty-state">Wrong choices will land here so the next round can target them.</p>
                ) : (
                  <div className="miss-list">
                    {recentMisses.map((attempt, index) => (
                      <div className="miss-item" key={`${attempt.prompt.verb.infinitive}-${attempt.answer}-${index}`}>
                        <span>
                          {getPronounLabel(attempt.prompt)} · {getTenseLabel(attempt.prompt.tense)} ·{' '}
                          {attempt.prompt.verb.infinitive}
                        </span>
                        <strong>{getAnswer(attempt.prompt)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </aside>
          </section>
        </>
      ) : (
        <section className="wordbook-layout" aria-label={`${activeLanguage.name} verb book`}>
          <aside className="verb-list-panel">
            <div className="wordbook-heading">
              <div>
                <span className="eyebrow">{activeLanguage.nativeName}</span>
                <h1>Verb Book</h1>
              </div>
              <span>{activeLanguage.verbs.length} verbs</span>
            </div>

            <label className="wordbook-search">
              <Search size={16} aria-hidden="true" />
              <input
                aria-label="Search verbs"
                onChange={(event) => setWordbookQuery(event.target.value)}
                placeholder="Search verbs"
                type="search"
                value={wordbookQuery}
              />
            </label>

            <div className="verb-list" aria-label={`${activeLanguage.name} verbs`}>
              {filteredVerbs.length === 0 ? (
                <p className="empty-state">No verbs match this search.</p>
              ) : (
                filteredVerbs.map(({ verb, index }) => (
                  <button
                    className="verb-list-item"
                    data-active={selectedVerbIndex === index}
                    key={verb.infinitive}
                    onClick={() => setSelectedVerbIndex(index)}
                    type="button"
                  >
                    <span className="verb-list-number">{String(index + 1).padStart(2, '0')}</span>
                    <strong>{verb.infinitive}</strong>
                    <span>{verb.translation}</span>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="conjugation-panel" aria-label={`${selectedVerb.infinitive} conjugation table`}>
            <div className="conjugation-head">
              <div>
                <span className="eyebrow">{activeLanguage.name}</span>
                <h2>{selectedVerb.infinitive}</h2>
                <p>{selectedVerb.translation}</p>
              </div>

              <div className="book-tense-tabs" aria-label="Choose tense">
                {concreteTenses.map((item) => (
                  <button
                    className="book-tense-button"
                    data-active={item.id === bookTense}
                    key={item.id}
                    onClick={() => setBookTense(item.id)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="conjugation-table">
              {pronouns.map((pronoun) => (
                <div className="conjugation-row" key={pronoun}>
                  <span>{activeLanguage.pronounLabels[pronoun]}</span>
                  <strong>{selectedVerb.forms[bookTense][pronoun]}</strong>
                </div>
              ))}
            </div>
          </section>
        </section>
      )}
    </main>
  );
}
