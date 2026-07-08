import { useEffect, useState } from 'react';
import { BarChart3, BookOpenText, Flame, Target, Trophy, X } from 'lucide-react';
import { type Attempt, type CumulativeStats } from '../hooks/usePractice';
import { concreteTenses, pronouns, type Language, type TenseId } from '../data/verbs';

interface ProgressPanelProps {
  activeLanguage: Language;
  progress: number;
  progressPercent: number;
  attempts: Attempt[];
  accuracy: number;
  streak: number;
  recentMisses: Attempt[];
  cumulativeStats: CumulativeStats;
  onReviewModalChange: (isOpen: boolean) => void;
}

const getPronounLabel = (prompt: Attempt['prompt']) => prompt.selectedPronounLabel || prompt.language.pronounLabels[prompt.pronoun];
const getTenseLabel = (tense: TenseId) => concreteTenses.find((item) => item.id === tense)?.label ?? tense;
const getAnswer = (prompt: Attempt['prompt']) => prompt.verb.forms[prompt.tense][prompt.pronoun];

// Custom animated ring meter using requestAnimationFrame lerp
function RingMeter({ percent }: { percent: number }) {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setAnimatedPercent((prev) => {
        const diff = percent - prev;
        if (Math.abs(diff) < 0.2) {
          return percent;
        }
        const next = prev + diff * 0.15; // smooth interpolation speed
        animationFrameId = requestAnimationFrame(animate);
        return next;
      });
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [percent]);

  return (
    <div className="ring-meter" style={{ '--progress': `${animatedPercent}%` } as React.CSSProperties}>
      <span>{Math.round(animatedPercent)}%</span>
    </div>
  );
}

export function ProgressPanel({
  activeLanguage,
  progress,
  progressPercent,
  attempts,
  accuracy,
  streak,
  recentMisses,
  cumulativeStats,
  onReviewModalChange,
}: ProgressPanelProps) {
  const [activeMiss, setActiveMiss] = useState<Attempt | null>(null);
  const allTimeAccuracy = cumulativeStats.totalAttempts === 0 
    ? 0 
    : Math.round((cumulativeStats.totalCorrect / cumulativeStats.totalAttempts) * 100);
  const activeMissTenseLabel = activeMiss ? getTenseLabel(activeMiss.prompt.tense) : '';

  useEffect(() => {
    onReviewModalChange(Boolean(activeMiss));

    return () => onReviewModalChange(false);
  }, [activeMiss, onReviewModalChange]);

  useEffect(() => {
    if (!activeMiss) {
      return undefined;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMiss(null);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [activeMiss]);

  return (
    <aside className="progress-panel" aria-label="Practice progress">
      <section className="progress-card">
        <div className="panel-title">
          <BarChart3 size={18} aria-hidden="true" />
          <h2>Today's Session</h2>
        </div>
        <RingMeter percent={progressPercent} />
        <p>
          {20 - progress > 0
            ? `${20 - progress} more to complete this set`
            : 'Set complete. Reset or keep going.'}
        </p>
      </section>

      <section className="score-grid">
        <div>
          <span>Answered</span>
          <strong>
            <Target size={18} aria-hidden="true" />
            {attempts.length}
          </strong>
        </div>
        <div>
          <span>Accuracy</span>
          <strong>
            <Trophy size={18} aria-hidden="true" />
            {accuracy}%
          </strong>
        </div>
        <div>
          <span>Streak</span>
          <strong>
            <Flame size={18} aria-hidden="true" />
            {streak}
          </strong>
        </div>
      </section>

      <section className="progress-card" style={{ paddingBottom: '12px' }}>
        <div className="panel-title-row">
          <div className="panel-title">
            <Trophy size={18} aria-hidden="true" />
            <h2>All-time Progress</h2>
          </div>
          <span className="language-stat-tag">{activeLanguage.name}</span>
        </div>
        <div className="score-grid" style={{ margin: '14px -16px -16px', borderRadius: '0 0 8px 8px', boxShadow: 'none', border: 'none', borderTop: '1px solid var(--subtle-border)' }}>
          <div>
            <span>Total Drills</span>
            <strong>
              <Target size={18} aria-hidden="true" />
              {cumulativeStats.totalAttempts}
            </strong>
          </div>
          <div>
            <span>Accuracy</span>
            <strong>
              <Trophy size={18} aria-hidden="true" />
              {allTimeAccuracy}%
            </strong>
          </div>
          <div>
            <span>Max Streak</span>
            <strong>
              <Flame size={18} aria-hidden="true" />
              {cumulativeStats.maxStreak}
            </strong>
          </div>
        </div>
      </section>

      <section className="review-card">
        <div className="panel-title">
          <BookOpenText size={18} aria-hidden="true" />
          <h2>Review (Recent Misses)</h2>
        </div>
        {recentMisses.length === 0 ? (
          <p className="empty-state" style={{ marginTop: '12px' }}>
            Wrong choices will land here. Click a card to inspect this tense.
          </p>
        ) : (
          <div className="miss-list">
            {recentMisses.map((attempt, index) => {
              const label = getPronounLabel(attempt.prompt);
              const tense = getTenseLabel(attempt.prompt.tense);
              const infinitive = attempt.prompt.verb.infinitive;
              const correctForm = getAnswer(attempt.prompt);

              return (
                <button
                  className="miss-item clickable-miss-item"
                  key={`${infinitive}-${attempt.answer}-${index}`}
                  onClick={() => setActiveMiss(attempt)}
                  style={{
                    border: 'none',
                    textAlign: 'left',
                    width: '100%',
                    cursor: 'pointer',
                    display: 'grid',
                    gap: '4px',
                    transition: 'transform 150ms ease, background 150ms ease'
                  }}
                  type="button"
                  title="View this tense"
                >
                  <span>
                    {label} · {tense} · {infinitive}
                  </span>
                  <strong>{correctForm}</strong>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {activeMiss && (
        <div
          className="miss-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveMiss(null);
            }
          }}
        >
          <section
            aria-labelledby="miss-modal-title"
            aria-modal="true"
            className="miss-modal"
            role="dialog"
          >
            <div className="miss-modal-head">
              <div>
                <span className="eyebrow">{activeMissTenseLabel}</span>
                <h2 id="miss-modal-title">{activeMiss.prompt.verb.infinitive}</h2>
                <p>{activeMiss.prompt.verb.translation}</p>
              </div>
              <button
                aria-label="Close conjugation detail"
                className="modal-close-button"
                onClick={() => setActiveMiss(null)}
                type="button"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="miss-conjugation-list">
              {pronouns.map((pronoun) => (
                <div className="miss-conjugation-row" data-current={pronoun === activeMiss.prompt.pronoun} key={pronoun}>
                  <span>{activeMiss.prompt.language.pronounLabels[pronoun]}</span>
                  <strong>{activeMiss.prompt.verb.forms[activeMiss.prompt.tense][pronoun]}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}
