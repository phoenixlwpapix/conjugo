import { getStudyLanguageTag } from '../lib/i18n';
import { useI18n } from '../hooks/useI18n';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import type { PracticeClock } from '../lib/practiceClock';
import { TimerReset } from 'lucide-react';
import { getPronounLabel, timerSeconds } from '../lib/prompts';
import type { Attempt, Prompt, SessionKind } from '../types';
import type { PracticeTenseId } from '../data/verbs';
import { getVerbTranslation, type TranslationLanguage } from '../data/translations';
import { SessionResult } from './SessionResult';
import { AnswerChoices, AnswerFeedback, QuestionHeader, QuestionTense } from './PracticeQuestion';

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
  reviewingLastAnswer: boolean;
  toggleResults: () => void;
  selectChoice: (choice: string) => void;
  resetSession: () => void;
  moveNext: () => void;
  onOpenWordbook: () => void;
  timeLeft: number;
  timerEnabled: boolean;
  toggleTimer: () => void;
  sessionTarget: number;
  sessionKind: SessionKind;
  translationLanguage: TranslationLanguage;
}

export function TimedTrainerPanel({ clock, ...props }: Omit<TrainerPanelProps, 'timeLeft'> & { clock: PracticeClock }) {
  const timeLeft = useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getSnapshot);
  return <TrainerPanel {...props} timeLeft={timeLeft} />;
}

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
  reviewingLastAnswer,
  toggleResults,
  selectChoice,
  resetSession,
  moveNext,
  onOpenWordbook,
  timeLeft,
  timerEnabled,
  toggleTimer,
  sessionTarget,
  sessionKind,
  translationLanguage,
}: TrainerPanelProps) {
  const { t, languageName } = useI18n();
  const actionButtonRef = useRef<HTMLButtonElement>(null);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const wasComplete = useRef(isSessionComplete);
  const showResults = isSessionComplete && attempts.length > 0 && !reviewingLastAnswer;
  const panelLabel = t('Multiple choice verb conjugation drill');
  const outcomes = attempts.map((attempt) => attempt.correct ? 'correct' : 'wrong');

  useEffect(() => {
    if (wasComplete.current && !isSessionComplete) {
      questionHeadingRef.current?.focus();
    } else if (isAnswered && !showResults && (isSessionComplete || !isCorrect)) {
      actionButtonRef.current?.focus();
    }
    wasComplete.current = isSessionComplete;
  }, [isAnswered, isCorrect, isSessionComplete, showResults]);

  if (showResults) {
    return (
      <section className="trainer-panel" data-stage="finished" aria-label={panelLabel}>
        <SessionResult
          mode="practice"
          outcomes={outcomes}
          onRestart={resetSession}
          onReviewLastAnswer={toggleResults}
        />
      </section>
    );
  }

  const pronounLabel = getPronounLabel(prompt);
  const translation = getVerbTranslation(prompt.language, prompt.verb, translationLanguage);
  const sessionTag = sessionKind === 'review' ? t('Review misses') : sessionKind === 'verbs' ? t('Hardest verbs') : practiceTense === 'mixed' ? t('Mixed practice') : null;
  const showAlertStyle = !isAnswered && timeLeft <= 3;
  const promptTextLength = Array.from(`${pronounLabel}${prompt.verb.infinitive}`).length;
  const promptDensity = promptTextLength >= 23 ? 'condensed' : promptTextLength >= 18 ? 'compact' : 'regular';

  const currentQuestion = Math.min(attempts.length + (isAnswered ? 0 : 1), sessionTarget);

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
    <section className="trainer-panel" aria-label={panelLabel}>
      <QuestionHeader
        title={t('Select the correct verb form')}
        current={currentQuestion}
        total={sessionTarget}
        outcomes={outcomes}
        headingRef={questionHeadingRef}
      >
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
      </QuestionHeader>

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
            <QuestionTense language={prompt.language} tense={prompt.tense} />
            <div className="prompt-meta-tags">
              {sessionTag && <span className="mixed-mode-tag">{sessionTag}</span>}
              <span>{languageName(prompt.language.id)}</span>
            </div>
          </div>

          <div className="prompt-display" data-density={promptDensity} lang={getStudyLanguageTag(prompt.language.id)}>
            <span className="prompt-subject">
              <span className="prompt-pronoun">{pronounLabel}</span>
              <span className="prompt-divider" aria-hidden="true">/</span>
            </span>
            <div className="prompt-verb-block">
              <strong className="prompt-infinitive">{prompt.verb.infinitive}</strong>
              {translation && <em className="prompt-translation" lang={translationLanguage}>{translation}</em>}
            </div>
          </div>
        </div>
      </div>

      <AnswerChoices
        languageId={prompt.language.id}
        choices={choices}
        selected={selectedAnswer}
        correctAnswer={correctAnswer}
        answered={isAnswered}
        onSelect={selectChoice}
      />

      {isAnswered ? (
        <AnswerFeedback
          result={isCorrect ? 'correct' : 'wrong'}
          title={t(timedOut ? "Time's up!" : isCorrect ? 'Correct!' : 'Wrong answer')}
          description={isCorrect ? (isSessionComplete ? undefined : t('next question loading')) : `${pronounLabel} → ${correctAnswer}`}
          onOpenWordbook={onOpenWordbook}
          onNext={isSessionComplete ? toggleResults : !isCorrect ? moveNext : undefined}
          nextRef={actionButtonRef}
          finalQuestion={isSessionComplete}
        />
      ) : (
        <div className="answer-dock" data-result="idle">
          <div className="answer-hint">
            <strong>{t("Choose one answer card.")}</strong>
            <span>{t("Use A–D or 1–4 on your keyboard.")}</span>
          </div>
        </div>
      )}
    </section>
  );
}
