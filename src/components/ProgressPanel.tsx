import { BarChart3, BookOpenText } from 'lucide-react';
import { getAnswer, getPronounLabel, getTenseLabel, sessionTarget } from '../lib/prompts';
import type { Attempt, DailyStats } from '../types';
import { RingMeter } from './ui/RingMeter';

type TrendPoint = {
  key: string;
  label: string;
  accuracy: number;
  answered: number;
};

type ProgressPanelProps = {
  accuracy: number;
  attempts: Attempt[];
  onOpenReview: (attempt: Attempt) => void;
  progress: number;
  progressPercent: number;
  recentMisses: Attempt[];
  statsTotalAnswered: number;
  streak: number;
  todayAccuracy: number;
  todayStats: DailyStats;
  trend: TrendPoint[];
};

const getTrendPoints = (trend: TrendPoint[]) =>
  trend
    .map((item, index) => {
      const x = 10 + index * 15;
      const y = 34 - (item.answered === 0 ? 0 : item.accuracy / 100) * 28;

      return `${x},${y}`;
    })
    .join(' ');

export function ProgressPanel({
  accuracy,
  attempts,
  onOpenReview,
  progress,
  progressPercent,
  recentMisses,
  statsTotalAnswered,
  streak,
  todayAccuracy,
  todayStats,
  trend,
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

      <section className="history-card">
        <div className="panel-title">
          <BarChart3 size={18} aria-hidden="true" />
          <h2>History</h2>
        </div>
        <div className="history-metrics">
          <div>
            <span>Today</span>
            <strong>{todayAccuracy}%</strong>
          </div>
          <div>
            <span>Sets</span>
            <strong>{todayStats.sessions}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{statsTotalAnswered}</strong>
          </div>
        </div>
        <svg className="trend-line" viewBox="0 0 100 40" role="img" aria-label="Seven day accuracy trend">
          <polyline points={getTrendPoints(trend)} />
        </svg>
        <div className="trend-labels" aria-hidden="true">
          {trend.map((item) => (
            <span key={item.key}>{item.label}</span>
          ))}
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
