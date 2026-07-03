import { Target, Trophy, AlertCircle, RotateCcw, Home, X } from 'lucide-react';

interface CompletionOverlayProps {
  accuracy: number;
  correctCount: number;
  dismissCompletion: () => void;
  resetSession: () => void;
  returnHome: () => void;
  totalCount: number;
}

export function CompletionOverlay({
  accuracy,
  correctCount,
  dismissCompletion,
  resetSession,
  returnHome,
  totalCount,
}: CompletionOverlayProps) {
  const missedCount = totalCount - correctCount;

  return (
    <section className="celebration-layer" aria-label="Set completed" aria-live="polite">
      <div className="celebration-backdrop" onClick={dismissCompletion} />

      <div className="completion-card" role="dialog" aria-modal="true" aria-labelledby="completion-title">
        <button
          className="completion-close"
          onClick={dismissCompletion}
          type="button"
          aria-label="Dismiss completion summary"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className="completion-inner" style={{ gap: '24px' }}>
          <div className="completion-header" style={{ textAlign: 'center', justifyItems: 'center' }}>
            <span className="eyebrow" style={{ color: 'var(--language-accent, var(--green))' }}>Set completed</span>
            <h2 id="completion-title" style={{ fontSize: '1.45rem' }}>Nice work finishing the set!</h2>
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
              <Target size={22} style={{ color: 'var(--language-accent, var(--green))' }} />
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
              <AlertCircle size={22} style={{ color: missedCount > 0 ? 'var(--red)' : 'var(--muted)' }} />
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
