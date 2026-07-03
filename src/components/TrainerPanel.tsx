import { TimerReset, Check, X, RotateCcw, ArrowRight } from 'lucide-react';
import { concreteTenses, type TenseId } from '../data/verbs';
import { type Prompt, type Attempt } from '../hooks/usePractice';

interface TrainerPanelProps {
  attempts: Attempt[];
  prompt: Prompt;
  practiceTense: string;
  choices: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  isAnswered: boolean;
  isCorrect: boolean;
  isSessionComplete: boolean;
  showCelebration: boolean;
  selectChoice: (choice: string) => void;
  resetSession: () => void;
  moveNext: () => void;
  timeLeft: number;
  timerEnabled: boolean;
  toggleTimer: () => void;
}

const getPronounLabel = (prompt: Prompt) => prompt.selectedPronounLabel || prompt.language.pronounLabels[prompt.pronoun];
const getTenseLabel = (tense: TenseId) => concreteTenses.find((item) => item.id === tense)?.label ?? tense;

const getTenseColor = (tense: TenseId) => {
  if (tense === 'present') return 'var(--green)';
  if (tense === 'past') return 'var(--red)';
  if (tense === 'imperfect') return 'var(--purple)';
  if (tense === 'conditional') return 'var(--gold)';
  return 'var(--blue)';
};

const getLocalizedTitle = (languageId: string) => {
  switch (languageId) {
    case 'spanish':
      return 'Selecciona la forma verbal correcta';
    case 'french':
      return 'Sélectionnez la forme verbale correcte';
    case 'italian':
      return 'Seleziona la forma verbale corretta';
    default:
      return 'Select the correct verb form';
  }
};

export function TrainerPanel({
  attempts,
  prompt,
  practiceTense,
  choices,
  selectedAnswer,
  correctAnswer,
  isAnswered,
  isCorrect,
  isSessionComplete,
  showCelebration,
  selectChoice,
  resetSession,
  moveNext,
  timeLeft,
  timerEnabled,
  toggleTimer,
}: TrainerPanelProps) {
  const pronounLabel = getPronounLabel(prompt);
  const tenseLabel = getTenseLabel(prompt.tense);

  const isTimeout = selectedAnswer === '[Timeout]';
  const showAlertStyle = !isAnswered && timeLeft <= 3;

  return (
    <section className="trainer-panel" aria-label="Multiple choice verb conjugation drill">
      <div className="trainer-head">
        <div>
          <span className="eyebrow">Question {Math.min(attempts.length + 1, 20)}</span>
          <h1>{getLocalizedTitle(prompt.language.id)}</h1>
        </div>
        {(() => {
          const TIMER_TOTAL = 8;
          const size = 40;
          const strokeWidth = 3;
          const radius = (size - strokeWidth) / 2;
          const circumference = 2 * Math.PI * radius;
          const progress = timerEnabled && !isAnswered ? timeLeft / TIMER_TOTAL : isAnswered && timerEnabled ? 0 : 1;
          const dashOffset = circumference * (1 - progress);

          const ringColor = !timerEnabled
            ? 'var(--line)'
            : isTimeout
              ? 'var(--red)'
              : showAlertStyle
                ? 'var(--red)'
                : 'var(--language-accent, var(--green))';

          const iconColor = !timerEnabled
            ? 'var(--muted)'
            : isTimeout || showAlertStyle
              ? 'var(--red)'
              : 'var(--ink)';

          return (
            <button
              className="timer-ring-btn"
              onClick={toggleTimer}
              type="button"
              title={timerEnabled ? "Click to disable timer" : "Click to enable timer"}
              aria-label={
                !timerEnabled
                  ? 'Timer off'
                  : isTimeout
                    ? "Time's up"
                    : isAnswered
                      ? 'Timer complete'
                      : `${timeLeft} seconds left`
              }
              style={{
                cursor: 'pointer',
                position: 'relative',
                width: size,
                height: size,
                padding: 0,
                border: 'none',
                borderRadius: '50%',
                background: 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                flexShrink: 0,
                transition: 'transform 100ms ease',
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.9)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'none'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            >
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
              >
                {/* Track ring */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="var(--panel-border)"
                  strokeWidth={strokeWidth}
                />
                {/* Progress ring */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{
                    transition: timerEnabled && !isAnswered
                      ? 'stroke-dashoffset 1s linear, stroke 0.3s ease'
                      : 'stroke-dashoffset 0.3s ease, stroke 0.3s ease',
                  }}
                />
              </svg>
              <TimerReset
                size={16}
                aria-hidden="true"
                style={{
                  color: iconColor,
                  opacity: timerEnabled ? 1 : 0.4,
                  transition: 'color 0.2s, opacity 0.2s',
                  position: 'relative',
                  zIndex: 1,
                }}
              />
              {/* Pulse animation on alert */}
              {showAlertStyle && timerEnabled && (
                <span
                  style={{
                    position: 'absolute',
                    inset: -2,
                    borderRadius: '50%',
                    border: '2px solid var(--red)',
                    opacity: 0.4,
                    animation: 'timer-pulse 1s ease-in-out infinite',
                  }}
                />
              )}
            </button>
          );
        })()}
      </div>

      <div className="prompt-card" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Sleek countdown progress bar */}
        {!isAnswered && timerEnabled && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '4px',
              width: `${(timeLeft / 8) * 100}%`,
              background: showAlertStyle ? 'var(--red)' : 'var(--language-accent, var(--green))',
              transition: 'width 1s linear, background-color 0.2s ease',
              zIndex: 10
            }}
          />
        )}

        <div className="prompt-main" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', width: '100%' }}>
          <div className="prompt-context" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ background: getTenseColor(prompt.tense), color: '#111', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              {tenseLabel}
            </span>

            <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
              {practiceTense === 'mixed' && <span style={{ background: 'var(--gold)', color: '#111' }}>Mixed Mode</span>}
              <span>{prompt.language.name}</span>
            </div>
          </div>

          {/* Clean, typographic prompt layout (No stiff labels or math signs) */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'baseline', 
              flexWrap: 'wrap', 
              gap: '12px 20px',
              marginTop: '4px'
            }}
          >
            <span style={{ fontFamily: 'Lora, serif', fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)', fontWeight: 900, color: 'var(--ink)', lineHeight: 1 }}>
              {pronounLabel}
            </span>

            <span style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 300, color: 'var(--muted)', opacity: 0.5, fontFamily: 'Lora, serif', lineHeight: 1 }}>
              /
            </span>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)', fontWeight: 900, fontFamily: 'Lora, serif', color: 'var(--language-accent, var(--green))', lineHeight: 1 }}>
                {prompt.verb.infinitive}
              </strong>
              <em style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)', color: 'var(--muted)', fontStyle: 'normal', fontWeight: 800 }}>
                {prompt.verb.translation}
              </em>
            </div>
          </div>
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
              <strong>{isTimeout ? "Time's up!" : isCorrect ? 'Good hit.' : 'Missed this one.'}</strong>
              <span>
                {isCorrect
                  ? (!showCelebration && !isSessionComplete ? 'next question loading' : '')
                  : `${pronounLabel} + ${prompt.verb.infinitive} = ${correctAnswer}`}
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
  );
}
