import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import type { StyleVars } from '../lib/style';
import { sessionTarget } from '../lib/prompts';

const confettiColors = ['#174f43', '#1f65c7', '#f2b13d', '#c74735', '#0f766e'];

type CelebrationOverlayProps = {
  onRestart: () => void;
};

export function CelebrationOverlay({ onRestart }: CelebrationOverlayProps) {
  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 44 }, (_, index) => ({
        id: index,
        color: confettiColors[index % confettiColors.length],
        delay: `${(index % 11) * 58}ms`,
        duration: `${980 + (index % 7) * 90}ms`,
        left: `${6 + ((index * 19) % 88)}%`,
        size: `${7 + (index % 4) * 2}px`,
        spin: `${(index % 2 === 0 ? 1 : -1) * (160 + index * 13)}deg`,
      })),
    [],
  );

  return (
    <section className="celebration-layer" aria-live="polite" aria-label="Perfect set completed">
      <div className="celebration-backdrop" aria-hidden="true" />
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
              } as StyleVars
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
        <button onClick={onRestart} type="button">
          Start again
        </button>
      </div>
    </section>
  );
}
