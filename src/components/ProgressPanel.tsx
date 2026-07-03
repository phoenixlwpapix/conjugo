import { useEffect, useState } from 'react';
import { BarChart3, BookOpenText, Flame, Target, Trophy } from 'lucide-react';
import { type Attempt, type CumulativeStats } from '../hooks/usePractice';
import { concreteTenses, type TenseId } from '../data/verbs';

interface ProgressPanelProps {
  progress: number;
  progressPercent: number;
  attempts: Attempt[];
  accuracy: number;
  streak: number;
  recentMisses: Attempt[];
  cumulativeStats: CumulativeStats;
  clickReviewItem: (verbInfinitive: string) => void;
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
  progress,
  progressPercent,
  attempts,
  accuracy,
  streak,
  recentMisses,
  cumulativeStats,
  clickReviewItem,
}: ProgressPanelProps) {
  const allTimeAccuracy = cumulativeStats.totalAttempts === 0 
    ? 0 
    : Math.round((cumulativeStats.totalCorrect / cumulativeStats.totalAttempts) * 100);

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
        <div className="panel-title">
          <Trophy size={18} aria-hidden="true" />
          <h2>All-time Progress</h2>
        </div>
        <div className="score-grid" style={{ margin: '14px -16px -16px', borderRadius: '0 0 8px 8px', boxShadow: 'none', border: 'none', borderTop: '1px solid rgba(20, 32, 28, 0.1)' }}>
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
            Wrong choices will land here. Click a card to look up the verb in the Word Book.
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
                  onClick={() => clickReviewItem(infinitive)}
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
                  title="Click to view conjugation in Word Book"
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
    </aside>
  );
}
