import { getStudyLanguageTag } from '../lib/i18n';
import { useI18n } from '../hooks/useI18n';
import { useEffect, useRef } from 'react';
import { TimerReset, Check, X, RotateCcw, ArrowRight } from 'lucide-react';
import { getPronounLabel, timerSeconds } from '../lib/prompts';
import type { Attempt, Prompt, SessionKind } from '../types';
import type { PracticeTenseId } from '../data/verbs';
import { getVerbTranslation, type TranslationLanguage } from '../data/translations';

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
  sessionKind: SessionKind;
  translationLanguage: TranslationLanguage;
}

const getTenseColor = (tense: Prompt['tense']) => {
  if (tense === 'present') return 'var(--green)';
  if (tense === 'past') return 'var(--red)';
  if (tense === 'imperfect') return 'var(--purple)';
  if (tense === 'conditional') return 'var(--gold)';
  if (tense === 'subjunctive') return 'var(--teal)';
  return 'var(--blue)';
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
  sessionKind,
  translationLanguage,
}: TrainerPanelProps) {
  const { t, languageName, tenseName } = useI18n();
  const actionButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isAnswered && !isCorrect) {
      actionButtonRef.current?.focus();
    }
  }, [isAnswered, isCorrect]);

  const pronounLabel = getPronounLabel(prompt);
  const tenseLabel = tenseName(prompt.language, prompt.tense);
  const translation = getVerbTranslation(prompt.language, prompt.verb, translationLanguage);
  const sessionTag = sessionKind === 'review' ? t('Review misses') : sessionKind === 'verbs' ? t('Hardest verbs') : practiceTense === 'mixed' ? t('Mixed practice') : null;
  const showAlertStyle = !isAnswered && timeLeft <= 3;
  const promptTextLength = Array.from(`${pronounLabel}${prompt.verb.infinitive}`).length;
  const promptDensity = promptTextLength >= 23 ? 'condensed' : promptTextLength >= 18 ? 'compact' : 'regular';

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
    <section className="trainer-panel" aria-label={t("Multiple choice verb conjugation drill")}>
      <div className="trainer-head">
        <div>
          <span className="eyebrow">
            {t('Question {number}', { number: Math.min(attempts.length + 1, sessionTarget) })}
            <span className="question-total"> / {sessionTarget}</span>
          </span>
          <h1>{t('Select the correct verb form')}</h1>
        </div>

        <button
          className="timer-ring-btn"
          onClick={toggleTimer}
          type="button"
          title={t(timerEnabled ? 'Click to disable timer' : 'Click to enable timer')}
          aria-label={
            !timerEnabled
              ? t('Timer off')
              : timedOut
                ? t("Time's up")
                : isAnswered
                  ? t('Timer complete')
                  : t('{seconds} seconds left', { seconds: timeLeft })
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

      <div className="question-progress" aria-hidden="true">
        {Array.from({ length: sessionTarget }, (_, index) => (
          <span key={index} data-state={attempts[index] ? (attempts[index].correct ? 'correct' : 'wrong') : index === attempts.length ? 'current' : 'pending'} />
        ))}
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
              {sessionTag && <span className="mixed-mode-tag">{sessionTag}</span>}
              <span>{languageName(prompt.language.id)}</span>
            </div>
          </div>

          <div className="prompt-display" data-density={promptDensity} lang={getStudyLanguageTag(prompt.language.id)}>
            <span className="prompt-pronoun">{pronounLabel}</span>
            <span className="prompt-divider" aria-hidden="true">
              /
            </span>
            <div className="prompt-verb-block">
              <strong className="prompt-infinitive">{prompt.verb.infinitive}</strong>
              {translation && <em className="prompt-translation" lang={translationLanguage}>{translation}</em>}
            </div>
          </div>
        </div>
      </div>

      <div className="choice-grid" aria-label={t("Answer choices")}>
        {choices.map((choice, index) => {
          const isSelectedChoice = selectedAnswer === choice;
          const isCorrectChoice = isAnswered && choice === correctAnswer;
          const isWrongChoice = isAnswered && isSelectedChoice && choice !== correctAnswer;

          return (
            <button
              aria-label={t('Option {letter}: {answer}', { letter: String.fromCharCode(65 + index), answer: choice })}
              className="choice-card"
              data-correct={isCorrectChoice}
              data-wrong={isWrongChoice}
              disabled={isAnswered}
              key={`${index}-${choice}`}
              onClick={() => selectChoice(choice)}
              type="button"
            >
              <span className="choice-index">{String.fromCharCode(65 + index)}</span>
              <strong lang={getStudyLanguageTag(prompt.language.id)}>{choice}</strong>
              {isCorrectChoice && <Check size={18} aria-label={t("Correct answer")} />}
              {isWrongChoice && <X size={18} aria-label={t("Wrong answer")} />}
            </button>
          );
        })}
      </div>

      <div className="answer-dock" data-result={isAnswered ? (isCorrect ? 'correct' : 'wrong') : 'idle'}>
        {isAnswered ? (
          <>
            <div>
              <strong>{t(timedOut ? "Time's up!" : isCorrect ? 'Correct!' : 'Wrong answer')}</strong>
              <span>
                {isCorrect
                  ? !showCelebration && !isSessionComplete
                    ? t('next question loading')
                    : ''
                  : `${pronounLabel} + ${prompt.verb.infinitive} = ${correctAnswer}`}
              </span>
            </div>
            {!isCorrect &&
              (isSessionComplete ? (
                <button ref={actionButtonRef} className="next-button" onClick={resetSession} type="button">
                  {t("New set")}
                  <RotateCcw size={17} aria-hidden="true" />
                </button>
              ) : (
                <button ref={actionButtonRef} className="next-button" onClick={moveNext} type="button">
                  {t("Next")}
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              ))}
          </>
        ) : (
          <div>
            <strong>{t("Choose one answer card.")}</strong>
            <span>{t("Use A–D or 1–4 on your keyboard.")}</span>
          </div>
        )}
      </div>
    </section>
  );
}
