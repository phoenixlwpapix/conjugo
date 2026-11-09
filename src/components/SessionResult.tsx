import { useEffect, useRef } from 'react';
import { BookOpenText, Check, CircleCheck, House, Minus, RotateCcw, SlidersHorizontal, Trophy, X } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { getAccuracy } from '../lib/scoring';

const outcomeDetails = {
  correct: { label: 'Correct', Icon: Check },
  wrong: { label: 'Missed', Icon: X },
  skipped: { label: 'Skipped', Icon: Minus },
} as const;

export type SessionOutcome = keyof typeof outcomeDetails;

type SessionResultProps = {
  outcomes: SessionOutcome[];
  onRestart: () => void;
} & (
  | { mode: 'practice'; onReviewLastAnswer: () => void; onBackHome?: () => void }
  | { mode: 'quiz'; onChangeTenses: () => void; streak: number }
);

function ResultConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let cancelled = false;
    let reset: (() => void) | undefined;
    void import('canvas-confetti').then(({ default: confetti }) => {
      if (cancelled) return;
      const burst = confetti.create(canvas, { resize: true });
      reset = burst.reset;
      return burst({
        particleCount: 80,
        spread: 90,
        startVelocity: 27,
        origin: { x: 0.82, y: 0.32 },
        colors: ['#174f43', '#1f65c7', '#f2b13d', '#c74735', '#0f766e'],
      });
    }).catch(() => {
      // The summary remains usable if the animation cannot load.
    });

    return () => {
      cancelled = true;
      reset?.();
    };
  }, []);

  return <canvas ref={canvasRef} className="result-confetti" aria-hidden="true" />;
}

export function SessionResult(props: SessionResultProps) {
  const { t } = useI18n();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { mode, outcomes, onRestart } = props;
  const correct = outcomes.filter((outcome) => outcome === 'correct').length;
  const skipped = outcomes.filter((outcome) => outcome === 'skipped').length;
  const total = outcomes.length;
  const perfect = total > 0 && correct === total;
  const Stamp = perfect ? Trophy : CircleCheck;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="session-result" data-perfect={perfect}>
      <header className="result-header">
        <h1 className="workspace-title" ref={headingRef} tabIndex={-1}>
          {t(mode === 'practice' ? 'Practice complete' : 'Quiz complete')}
        </h1>
        <p className="result-score">
          <span className="result-sr-only">{t('{correct}/{count} correct', { correct, count: total })}</span>
          <strong aria-hidden="true">{correct}<span> / {total}</span></strong>
          <span aria-hidden="true">{t('Correct answers')}</span>
        </p>
        <span className="result-stamp" aria-hidden="true"><Stamp strokeWidth={1.5} /></span>
      </header>

      <dl className="result-metrics">
        <div><dt>{t('Accuracy')}</dt><dd>{getAccuracy(correct, total)}%</dd></div>
        <div><dt>{t('Missed')}</dt><dd>{total - correct - skipped}</dd></div>
        {props.mode === 'quiz' && (
          <>
            <div><dt>{t('Skipped')}</dt><dd>{skipped}</dd></div>
            <div><dt>{t('Streak')}</dt><dd>{props.streak}</dd></div>
          </>
        )}
      </dl>

      <div className="result-history">
        <h2>{t('Answer history')}</h2>
        <ol className="result-trail" role="list">
          {outcomes.map((outcome, index) => {
            const { label, Icon } = outcomeDetails[outcome];
            const description = t('Question {number}: {outcome}', { number: index + 1, outcome: t(label) });
            return (
              <li key={index} data-outcome={outcome} title={description}>
                <span className="result-sr-only">{description}</span>
                <span aria-hidden="true">{index + 1}</span>
                <Icon size={11} strokeWidth={2.4} aria-hidden="true" />
              </li>
            );
          })}
        </ol>
      </div>

      <div className="result-actions">
        <button className="quiz-primary" onClick={onRestart} type="button">
          <RotateCcw size={16} aria-hidden="true" />{t(mode === 'practice' ? 'New set' : 'New quiz')}
        </button>
        {props.mode === 'practice' ? (
          <button className="quiz-secondary" onClick={props.onBackHome ?? props.onReviewLastAnswer} type="button">
            {props.onBackHome ? <House size={16} aria-hidden="true" /> : <BookOpenText size={16} aria-hidden="true" />}
            {t(props.onBackHome ? 'Back to home' : 'Review last answer')}
          </button>
        ) : (
          <button className="quiz-secondary" onClick={props.onChangeTenses} type="button">
            <SlidersHorizontal size={16} aria-hidden="true" />{t('Change tense or mood')}
          </button>
        )}
      </div>

      {perfect && <ResultConfetti />}
    </div>
  );
}
