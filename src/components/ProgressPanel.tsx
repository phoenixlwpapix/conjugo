import { BarChart3, BookOpenText } from 'lucide-react';
import { getAnswer, getPronounLabel, getTenseLabel, sessionTarget } from '../lib/prompts';
import type { Attempt } from '../types';
import { RingMeter } from './ui/RingMeter';

type ProgressPanelProps = {
  accuracy: number;
  attempts: Attempt[];
  onOpenReview: (attempt: Attempt) => void;
  progress: number;
  progressPercent: number;
  recentMisses: Attempt[];
  streak: number;
};

export function ProgressPanel({
  accuracy,
  attempts,
  onOpenReview,
  progress,
  progressPercent,
  recentMisses,
  streak,
}: ProgressPanelProps) {
  return (
    <aside className="progress-panel" aria-label="Practice progress">
      <section className="progress-card">
        <div className="panel-title">
          <BarChart3 size={18} aria-hidden="true" />
          <h2>Today</h2>
        </div>
        <RingMeter progressPercent={progressPercent} />
        <p>
          {sessionTarget - progress > 0 ? `${sessionTarget - progress} more to complete this set` : 'Set complete. Start a fresh set.'}
        </p>
      </section>

      <section className="score-grid">
        <div>
          <span>Answered</span>
          <strong>{attempts.length}</strong>
        </div>
        <div>
          <span>Accuracy</span>
          <strong>{accuracy}%</strong>
        </div>
        <div>
          <span>Streak</span>
          <strong>{streak}</strong>
        </div>
      </section>

      <section className="review-card">
        <div className="panel-title">
          <BookOpenText size={18} aria-hidden="true" />
          <h2>Review</h2>
        </div>
        {recentMisses.length === 0 ? (
          <p className="empty-state">Wrong choices will land here and bias the next round.</p>
        ) : (
          <div className="miss-list">
            {recentMisses.map((attempt, index) => (
              <button
                className="miss-item"
                key={`${attempt.prompt.verb.infinitive}-${attempt.answer}-${index}`}
                onClick={() => onOpenReview(attempt)}
                type="button"
              >
                <span>
                  {getPronounLabel(attempt.prompt)} · {getTenseLabel(attempt.prompt.tense)} · {attempt.prompt.verb.infinitive}
                </span>
                <strong>{getAnswer(attempt.prompt)}</strong>
              </button>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}
