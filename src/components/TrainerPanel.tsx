import { getStudyLanguageTag } from '../lib/i18n';
import { useI18n } from '../hooks/useI18n';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import type { PracticeClock } from '../lib/practiceClock';
import { TimerReset } from 'lucide-react';
import { getPronounLabel, timerSeconds } from '../lib/prompts';
import type { Attempt, PracticeAnswerMode, Prompt, SessionKind } from '../types';
import type { PracticeTenseId } from '../data/verbs';
import { getVerbTranslation, type TranslationLanguage } from '../data/translations';
import { SessionResult } from './SessionResult';
import { SessionElapsed } from './SessionElapsed';
import { AnswerChoices, AnswerFeedback, QuestionHeader, QuestionTense } from './PracticeQuestion';
import { TypingAnswer } from './TypingAnswer';
import { FavoriteButton } from './WordBook/FavoriteButton';

interface TrainerPanelProps {
  attempts: Attempt[];
  prompt: Prompt;
  isFavorite: boolean;
  onToggleFavorite: (infinitive: string) => void;
  practiceTense: PracticeTenseId;
  answerMode: PracticeAnswerMode;
  sessionVersion: number;
  showAccentHint: boolean;
  choices: string[];
  selectedAnswer: string | null;
  timedOut: boolean;
  correctAnswer: string;
  isAnswered: boolean;
  isCorrect: boolean;
  isSessionComplete: boolean;
  reviewingLastAnswer: boolean;
  toggleResults: () => void;
  submitAnswer: (answer: string) => void;
  resetSession: () => void;
  onBackHome: () => void;
  moveNext: () => void;
  onOpenWordbook: () => void;
  timeLeft: number;
  elapsedClock: PracticeClock;
  timerEnabled: boolean;
  toggleTimer: () => void;
  sessionTarget: number;
  sessionKind: SessionKind;
  streak?: number;
  autoAdvanceStopped?: boolean;
  translationLanguage: TranslationLanguage;
}

export function TimedTrainerPanel({ clock, ...props }: Omit<TrainerPanelProps, 'timeLeft'> & { clock: PracticeClock }) {
  const timeLeft = useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getSnapshot);
  return <TrainerPanel {...props} timeLeft={timeLeft} />;
}

export function TrainerPanel({
  attempts,
  prompt,
  isFavorite,
  onToggleFavorite,
  practiceTense,
  answerMode,
  sessionVersion,
  showAccentHint,
  choices,
  selectedAnswer,
  timedOut,
  correctAnswer,
  isAnswered,
  isCorrect,
  isSessionComplete,
  reviewingLastAnswer,
  toggleResults,
  submitAnswer,
  resetSession,
  onBackHome,
  moveNext,
  onOpenWordbook,
  timeLeft,
  elapsedClock,
  timerEnabled,
  toggleTimer,
  sessionTarget,
  sessionKind,
  streak = 0,
  autoAdvanceStopped = false,
  translationLanguage,
}: TrainerPanelProps) {
  const { t, languageName } = useI18n();
  const actionButtonRef = useRef<HTMLButtonElement>(null);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const wasComplete = useRef(isSessionComplete);
  const wasAnswered = useRef(isAnswered);
  const showResults = isSessionComplete && attempts.length > 0 && !reviewingLastAnswer;
  const isTyping = answerMode === 'typing';
  const panelLabel = t(isTyping ? 'Typing verb conjugation drill' : 'Multiple choice verb conjugation drill');
  const outcomes = attempts.map((attempt) => attempt.correct ? 'correct' : 'wrong');
  const canManualAdvance = isTyping || !isCorrect || autoAdvanceStopped;

  useEffect(() => {
    if (isTyping && wasAnswered.current && !isAnswered) {
      answerInputRef.current?.focus();
    } else if (wasComplete.current && !isSessionComplete) {
      questionHeadingRef.current?.focus();
    } else if (isAnswered && !showResults && (isSessionComplete || canManualAdvance)) {
      actionButtonRef.current?.focus();
    }
    wasComplete.current = isSessionComplete;
    wasAnswered.current = isAnswered;
  }, [canManualAdvance, isAnswered, isSessionComplete, isTyping, showResults]);

  if (showResults) {
    return (
      <section className="trainer-panel" data-stage="finished" aria-label={panelLabel}>
        <SessionResult
          mode="practice"
          outcomes={outcomes}
          elapsedClock={elapsedClock}
          onRestart={resetSession}
          onReviewLastAnswer={toggleResults}
          onBackHome={sessionKind === 'review' ? onBackHome : undefined}
        />
      </section>
    );
  }

  const pronounLabel = getPronounLabel(prompt);
  const studyLanguageTag = getStudyLanguageTag(prompt.language.id);
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
  const correctAnswerLabel = t('Correct answer: {answer}', { answer: correctAnswer });

  return (
    <section className="trainer-panel" aria-label={panelLabel}>
      <QuestionHeader
        title={t(isTyping ? 'Type the correct verb form' : 'Select the correct verb form')}
        current={currentQuestion}
        total={sessionTarget}
        outcomes={outcomes}
        streak={streak}
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
              <span className="prompt-language">{languageName(prompt.language.id)}</span>
              <SessionElapsed clock={elapsedClock} compact />
            </div>
          </div>

          <div className="prompt-display-row">
            <div className="prompt-display" data-density={promptDensity}>
              <span className="prompt-subject" lang={studyLanguageTag}>
                <span className="prompt-pronoun">{pronounLabel}</span>
                <span className="prompt-divider" aria-hidden="true">/</span>
              </span>
              <div className="prompt-verb-block">
                <strong className="prompt-infinitive" lang={studyLanguageTag}>{prompt.verb.infinitive}</strong>
                {translation && <em className="prompt-translation" lang={translationLanguage}>{translation}</em>}
              </div>
            </div>
            <FavoriteButton infinitive={prompt.verb.infinitive} isFavorite={isFavorite} onToggle={onToggleFavorite} />
          </div>
        </div>
      </div>

      {!isTyping ? (
        <AnswerChoices
          languageId={prompt.language.id}
          choices={choices}
          selected={selectedAnswer}
          correctAnswer={correctAnswer}
          answered={isAnswered}
          onSelect={submitAnswer}
        />
      ) : isAnswered ? (
        selectedAnswer !== null && (
          <p className="typing-submission">{t('Your answer')} <strong lang={getStudyLanguageTag(prompt.language.id)}>{selectedAnswer}</strong></p>
        )
      ) : (
        <TypingAnswer
          key={`${sessionVersion}-${currentQuestion}`}
          inputRef={answerInputRef}
          languageId={prompt.language.id}
          showAccentHint={showAccentHint}
          onSubmit={submitAnswer}
        />
      )}

      {isAnswered ? (
        <AnswerFeedback
          result={isCorrect ? 'correct' : 'wrong'}
          title={timedOut ? t("Time's up!") : isCorrect ? t('Correct!') : correctAnswerLabel}
          description={timedOut ? correctAnswerLabel : !canManualAdvance && !isSessionComplete ? t('next question loading') : undefined}
          onOpenWordbook={onOpenWordbook}
          onNext={isSessionComplete ? toggleResults : canManualAdvance ? moveNext : undefined}
          nextRef={actionButtonRef}
          finalQuestion={isSessionComplete}
        />
      ) : !isTyping && (
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
