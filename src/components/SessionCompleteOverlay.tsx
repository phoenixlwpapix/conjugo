import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Target, Trophy, AlertCircle, RotateCcw, Home, X } from 'lucide-react';
import { useFocusTrap } from '../lib/focusTrap';

type SessionCompleteOverlayProps = {
  mode: 'perfect' | 'complete';
  accuracy: number;
  correctCount: number;
  totalCount: number;
  onDismiss: () => void;
  onNewSet: () => void;
  onReturnHome: () => void;
};

const confettiColors = ['#174f43', '#1f65c7', '#f2b13d', '#c74735', '#0f766e'];

export function SessionCompleteOverlay({
  mode,
  accuracy,
  correctCount,
  totalCount,
  onDismiss,
  onNewSet,
  onReturnHome,
}: SessionCompleteOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const missedCount = totalCount - correctCount;
  const isPerfect = mode === 'perfect';
  const titleId = isPerfect ? 'celebration-title' : 'completion-title';
  useFocusTrap(true, dialogRef);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  useEffect(() => {
    if (
      !isPerfect ||
      !confettiCanvasRef.current ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const burst = confetti.create(confettiCanvasRef.current, {
      resize: true,
      useWorker: true,
    });
    const endTime = Date.now() + 2_000;
    let frameId = 0;

    const fire = () => {
      burst({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: confettiColors,
      });
      burst({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: confettiColors,
      });

      if (Date.now() < endTime) {
        frameId = window.requestAnimationFrame(fire);
      }
    };

    fire();

    return () => {
      window.cancelAnimationFrame(frameId);
      burst.reset();
    };
  }, [isPerfect]);

  return (
    <section
      className="celebration-layer"
      aria-label={isPerfect ? 'Perfect set completed' : 'Set completed'}
      aria-live="polite"
    >
      <div className="celebration-backdrop" onClick={onDismiss} />

      {isPerfect && (
        <canvas ref={confettiCanvasRef} className="confetti-field" aria-hidden="true" />
      )}

      <div
        ref={dialogRef}
        className="completion-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button className="completion-close" onClick={onDismiss} type="button" aria-label="Dismiss completion summary">
          <X size={18} aria-hidden="true" />
        </button>

        <div className="completion-inner">
          <div className="completion-header">
            <span className="eyebrow" data-tone={isPerfect ? 'gold' : 'accent'}>
              {isPerfect ? 'Perfect set!' : 'Set completed'}
            </span>
            <h2 id={titleId}>
              {isPerfect ? `Flawless victory! Finished all ${totalCount}.` : 'Nice work finishing the set!'}
            </h2>
          </div>

          <div className="completion-stat-grid">
            <div className="completion-stat-card">
              <Target size={22} aria-hidden="true" data-tone={isPerfect ? 'gold' : 'accent'} />
              <strong>{accuracy}%</strong>
              <span>Accuracy</span>
            </div>
            <div className="completion-stat-card">
              <Trophy size={22} aria-hidden="true" data-tone="gold" />
              <strong>{correctCount}</strong>
              <span>Correct</span>
            </div>
            <div className="completion-stat-card">
              <AlertCircle size={22} aria-hidden="true" data-tone={missedCount > 0 ? 'danger' : 'muted'} />
              <strong>{missedCount}</strong>
              <span>Missed</span>
            </div>
          </div>

          <div className="completion-actions">
            <button className="completion-primary" onClick={onNewSet} type="button">
              <RotateCcw size={17} aria-hidden="true" />
              New set
            </button>
            <button className="completion-secondary" onClick={onReturnHome} type="button">
              <Home size={17} aria-hidden="true" />
              Back to practice
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
