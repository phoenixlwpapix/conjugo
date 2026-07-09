import { useEffect, useRef } from 'react';
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
const confettiPieces = Array.from({ length: 44 }, (_, index) => ({
  id: index,
  color: confettiColors[index % confettiColors.length],
  delay: `${(index % 11) * 58}ms`,
  duration: `${980 + (index % 7) * 90}ms`,
  left: `${6 + ((index * 19) % 88)}%`,
  size: `${7 + (index % 4) * 2}px`,
  spin: `${(index % 2 === 0 ? 1 : -1) * (160 + index * 13)}deg`,
}));

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

  const missedCount = totalCount - correctCount;
  const isPerfect = mode === 'perfect';
  const titleId = isPerfect ? 'celebration-title' : 'completion-title';

  return (
    <section
      className="celebration-layer"
      aria-label={isPerfect ? 'Perfect set completed' : 'Set completed'}
      aria-live="polite"
    >
      <div className="celebration-backdrop" onClick={onDismiss} />

      {isPerfect && (
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
                } as React.CSSProperties
              }
            />
          ))}
        </div>
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
