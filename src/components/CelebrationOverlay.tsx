import { type CSSProperties } from 'react';
import { Target, Trophy, AlertCircle, RotateCcw, Home, X } from 'lucide-react';

interface CelebrationOverlayProps {
  accuracy: number;
  correctCount: number;
  dismissCelebration: () => void;
  resetSession: () => void;
  returnHome: () => void;
  totalCount: number;
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

export function CelebrationOverlay({
  accuracy,
  correctCount,
  dismissCelebration,
  resetSession,
  returnHome,
  totalCount,
}: CelebrationOverlayProps) {
  const missedCount = totalCount - correctCount;

  return (
    <section className="celebration-layer" aria-live="polite" aria-label="Perfect set completed">
      {/* Semi-transparent Backdrop overlay */}
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
      
      {/* Confetti Animation Field */}
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

      {/* Styled scorecard exactly matching the completion card, with confetti falling */}
      <div className="completion-card" role="dialog" aria-modal="true" aria-labelledby="completion-title" style={{ zIndex: 2 }}>
        <button
          className="completion-close"
          onClick={dismissCelebration}
          type="button"
          aria-label="Dismiss completion summary"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className="completion-inner" style={{ gap: '24px' }}>
          <div className="completion-header" style={{ textAlign: 'center', justifyItems: 'center' }}>
            <span className="eyebrow" style={{ color: 'var(--gold)' }}>Perfect set!</span>
            <h2 id="completion-title" style={{ fontSize: '1.45rem' }}>Flawless victory! Finished all {totalCount}.</h2>
          </div>

          {/* Simple, visual stats cards matching main page aesthetics */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '12px',
              width: '100%',
              margin: '4px 0'
            }}
          >
            {/* Accuracy Card */}
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 12px',
                borderRadius: '8px',
                border: '1px solid var(--panel-border)',
                background: 'var(--paper-strong)',
                textAlign: 'center',
                gap: '8px'
              }}
            >
              <Target size={22} style={{ color: 'var(--gold)' }} />
              <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--ink)', fontFamily: 'Lora, serif', lineHeight: 1 }}>
                {accuracy}%
              </strong>
              <span style={{ fontSize: '0.66rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.04em' }}>
                Accuracy
              </span>
            </div>

            {/* Correct Card */}
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 12px',
                borderRadius: '8px',
                border: '1px solid var(--panel-border)',
                background: 'var(--paper-strong)',
                textAlign: 'center',
                gap: '8px'
              }}
            >
              <Trophy size={22} style={{ color: 'var(--gold)' }} />
              <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--ink)', fontFamily: 'Lora, serif', lineHeight: 1 }}>
                {correctCount}
              </strong>
              <span style={{ fontSize: '0.66rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.04em' }}>
                Correct
              </span>
            </div>

            {/* Missed Card */}
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 12px',
                borderRadius: '8px',
                border: '1px solid var(--panel-border)',
                background: 'var(--paper-strong)',
                textAlign: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={22} style={{ color: 'var(--muted)' }} />
              <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--ink)', fontFamily: 'Lora, serif', lineHeight: 1 }}>
                {missedCount}
              </strong>
              <span style={{ fontSize: '0.66rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.04em' }}>
                Missed
              </span>
            </div>
          </div>

          <div className="completion-actions">
            <button className="completion-primary" onClick={resetSession} type="button">
              <RotateCcw size={17} aria-hidden="true" />
              New set
            </button>
            <button className="completion-secondary" onClick={returnHome} type="button">
              <Home size={17} aria-hidden="true" />
              Return home
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
