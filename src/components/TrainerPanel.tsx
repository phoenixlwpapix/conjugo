import { useEffect, useRef } from 'react';
import { TimerReset, Check, X, RotateCcw, ArrowRight } from 'lucide-react';
import { getPronounLabel, getTenseLabel, timerSeconds } from '../lib/prompts';
import type { Attempt, Prompt } from '../types';
import type { PracticeTenseId } from '../data/verbs';

interface TrainerPanelProps {
  attempts: Attempt[];
  prompt: Prompt;
  practiceTense: PracticeTenseId;
  choices: string[];
  selectedAnswer: string | null;
  timedOut: boolean;
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
  sessionTarget: number;
}

const getTenseColor = (tense: Prompt['tense']) => {
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
  timedOut,
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
  sessionTarget,
}: TrainerPanelProps) {
  const actionButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isAnswered && !isCorrect) {
      actionButtonRef.current?.focus();
    }
  }, [isAnswered, isCorrect]);

  const pronounLabel = getPronounLabel(prompt);
  const tenseLabel = getTenseLabel(prompt.tense);
  const showAlertStyle = !isAnswered && timeLeft <= 3;

  const size = 40;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = timerEnabled && !isAnswered ? timeLeft / timerSeconds : isAnswered && timerEnabled ? 0 : 1;
  const dashOffset = circumference * (1 - progress);

  const ringColor = !timerEnabled
    ? 'var(--line)'
    : timedOut || showAlertStyle
      ? 'var(--red)'
      : 'var(--language-accent, var(--green))';

  const iconColor = !timerEnabled ? 'var(--muted)' : timedOut || showAlertStyle ? 'var(--red)' : 'var(--ink)';

  return (
    <section className="trainer-panel" aria-label="Multiple choice verb conjugation drill">
      <div className="trainer-head">
        <div>
          <span className="eyebrow">
            Question {Math.min(attempts.length + 1, sessionTarget)}
          </span>
          <h1>{getLocalizedTitle(prompt.language.id)}</h1>
          <p className="scope-note">6 person forms</p>
        </div>

        <button
          className="timer-ring-btn"
          onClick={toggleTimer}
          type="button"
          title={timerEnabled ? 'Click to disable timer' : 'Click to enable timer'}
          aria-label={
            !timerEnabled
              ? 'Timer off'
              : timedOut
                ? "Time's up"
                : isAnswered
                  ? 'Timer complete'
                  : `${timeLeft} seconds left`
          }
        >
          <svg
            className="timer-ring-svg"
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            aria-hidden="true"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--panel-border)"
              strokeWidth={strokeWidth}
            />
            <circle
              className="timer-ring-progress"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              data-ticking={timerEnabled && !isAnswered ? 'true' : 'false'}
            />
          </svg>
          <TimerReset
            size={16}
            aria-hidden="true"
            className="timer-ring-icon"
            style={{ color: iconColor, opacity: timerEnabled ? 1 : 0.4 }}
          />
          {showAlertStyle && timerEnabled && <span className="timer-pulse-ring" aria-hidden="true" />}
        </button>
      </div>

      <div className="prompt-card">
        {!isAnswered && timerEnabled && (
          <div
            className="timer-progress-bar"
            data-alert={showAlertStyle ? 'true' : 'false'}
            style={{ width: `${(timeLeft / timerSeconds) * 100}%` }}
          />
        )}

        <div className="prompt-main prompt-main-stack">
          <div className="prompt-context prompt-context-row">
            <span className="tense-badge" data-tense={prompt.tense} style={{ background: getTenseColor(prompt.tense) }}>
              {tenseLabel}
            </span>
            <div className="prompt-meta-tags">
              {practiceTense === 'mixed' && <span className="mixed-mode-tag">Mixed Mode</span>}
              <span>{prompt.language.name}</span>
            </div>
          </div>

          <div className="prompt-display">
            <span className="prompt-pronoun">{pronounLabel}</span>
            <span className="prompt-divider" aria-hidden="true">
              /
            </span>
            <div className="prompt-verb-block">
              <strong className="prompt-infinitive">{prompt.verb.infinitive}</strong>
              <em className="prompt-translation">{prompt.verb.translation}</em>
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
              key={`${index}-${choice}`}
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
              <strong>{timedOut ? "Time's up!" : isCorrect ? 'Good hit.' : 'Missed this one.'}</strong>
              <span>
                {isCorrect
                  ? !showCelebration && !isSessionComplete
                    ? 'next question loading'
                    : ''
                  : `${pronounLabel} + ${prompt.verb.infinitive} = ${correctAnswer}`}
              </span>
            </div>
            {!isCorrect &&
              (isSessionComplete ? (
                <button ref={actionButtonRef} className="next-button" onClick={resetSession} type="button">
                  New set
                  <RotateCcw size={17} aria-hidden="true" />
                </button>
              ) : (
                <button ref={actionButtonRef} className="next-button" onClick={moveNext} type="button">
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
