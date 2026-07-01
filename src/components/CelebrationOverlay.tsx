import { CSSProperties } from 'react';
import { Trophy, X } from 'lucide-react';

interface CelebrationOverlayProps {
  resetSession: () => void;
  dismissCelebration: () => void;
}

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

export function CelebrationOverlay({ resetSession, dismissCelebration }: CelebrationOverlayProps) {
  return (
    <section className="celebration-layer" aria-live="polite" aria-label="Perfect set completed">
      <div 
        className="celebration-backdrop" 
        onClick={dismissCelebration}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(20, 32, 28, 0.4)',
          backdropFilter: 'blur(3px)',
          zIndex: 0,
          pointerEvents: 'auto',
          animation: 'celebration-pop 280ms ease-out both'
        }}
      />
      
      <div className="confetti-field" aria-hidden="true" style={{ pointerEvents: 'none', zIndex: 1 }}>
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
      
      <div className="celebration-card" style={{ zIndex: 2, pointerEvents: 'auto' }}>
        <Trophy size={28} aria-hidden="true" style={{ color: 'var(--gold)' }} />
        <div>
          <strong>Perfect set</strong>
          <span>20/20 correct</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={resetSession} type="button">
            Start again
          </button>
          <button 
            onClick={dismissCelebration} 
            type="button" 
            aria-label="Dismiss celebration"
            style={{
              minHeight: '40px',
              width: '40px',
              padding: 0,
              border: '1px solid rgba(20, 32, 28, 0.15)',
              borderRadius: '8px',
              color: 'var(--ink)',
              background: '#ffffff',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
