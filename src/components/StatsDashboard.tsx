import { BarChart3, CalendarDays, Flame, Target, Trophy } from 'lucide-react';
import { getAccuracy } from '../lib/scoring';
import type { StyleVars } from '../lib/style';
import type { DailyStats, PracticeStats, StoredMiss } from '../types';

type TrendPoint = {
  key: string;
  label: string;
  accuracy: number;
  answered: number;
};

type StatsDashboardProps = {
  bestStreak: number;
  storedMisses: StoredMiss[];
  stats: PracticeStats;
  todayAccuracy: number;
  todayStats: DailyStats;
  trend: TrendPoint[];
};

const getTrendPoints = (trend: TrendPoint[]) =>
  trend
    .map((item, index) => {
      const x = 8 + index * 14;
      const y = 42 - (item.answered === 0 ? 0 : item.accuracy / 100) * 34;

      return `${x},${y}`;
    })
    .join(' ');

const getTrendAreaPoints = (trend: TrendPoint[]) => {
  const line = getTrendPoints(trend);

  return `8,46 ${line} 92,46`;
};

export function StatsDashboard({ bestStreak, storedMisses, stats, todayAccuracy, todayStats, trend }: StatsDashboardProps) {
  const overallAccuracy = getAccuracy(stats.totalCorrect, stats.totalAnswered);
  const activeDays = Object.values(stats.days).filter((day) => day.answered > 0).length;
  const recentMisses = storedMisses.slice(0, 6);

  return (
    <section className="stats-dashboard" aria-label="Performance dashboard">
      <div className="stats-hero">
        <div>
          <span className="eyebrow">Scoreboard</span>
          <h1>Performance dashboard</h1>
          <p>Track your recall, session rhythm, streak ceiling, and the verbs that still deserve another look.</p>
        </div>
        <div
          className="stats-hero-score"
          aria-label={`Overall accuracy ${overallAccuracy}%`}
          style={{ '--score-progress': `${overallAccuracy}%` } as StyleVars}
        >
          <strong>{overallAccuracy}%</strong>
          <span>overall</span>
        </div>
      </div>

      <div className="stats-kpi-grid">
        <article>
          <Target size={19} aria-hidden="true" />
          <span>Total answered</span>
          <strong>{stats.totalAnswered}</strong>
        </article>
        <article>
          <Trophy size={19} aria-hidden="true" />
          <span>Total correct</span>
          <strong>{stats.totalCorrect}</strong>
        </article>
        <article>
          <Flame size={19} aria-hidden="true" />
          <span>Best streak</span>
          <strong>{bestStreak}</strong>
        </article>
        <article>
          <CalendarDays size={19} aria-hidden="true" />
          <span>Active days</span>
          <strong>{activeDays}</strong>
        </article>
      </div>

      <div className="stats-main-grid">
        <section className="stats-trend-card">
          <div className="panel-title">
            <BarChart3 size={18} aria-hidden="true" />
            <h2>Seven day accuracy</h2>
          </div>
          <svg className="stats-trend-chart" viewBox="0 0 100 50" role="img" aria-label="Seven day accuracy trend">
            <polygon points={getTrendAreaPoints(trend)} />
            <polyline points={getTrendPoints(trend)} />
          </svg>
          <div className="stats-trend-days" aria-hidden="true">
            {trend.map((item) => (
              <span key={item.key}>
                <strong>{item.answered === 0 ? '-' : `${item.accuracy}%`}</strong>
                {item.label}
              </span>
            ))}
          </div>
        </section>

        <section className="stats-today-card">
          <div className="panel-title">
            <CalendarDays size={18} aria-hidden="true" />
            <h2>Today</h2>
          </div>
          <div className="stats-today-meter">
            <strong>{todayAccuracy}%</strong>
            <span>{todayStats.correct}/{todayStats.answered} correct</span>
          </div>
          <div className="stats-today-breakdown">
            <div>
              <span>Sets</span>
              <strong>{todayStats.sessions}</strong>
            </div>
            <div>
              <span>Answered</span>
              <strong>{todayStats.answered}</strong>
            </div>
          </div>
        </section>

        <section className="stats-review-card">
          <div className="panel-title">
            <Target size={18} aria-hidden="true" />
            <h2>Review load</h2>
          </div>
          {recentMisses.length === 0 ? (
            <p className="empty-state">No saved misses yet. Your future review load will appear here.</p>
          ) : (
            <div className="stats-review-list">
              {recentMisses.map((miss) => (
                <div key={`${miss.languageId}-${miss.verbInfinitive}-${miss.tense}-${miss.pronoun}`}>
                  <span>{miss.languageId} · {miss.tense} · {miss.pronoun}</span>
                  <strong>{miss.verbInfinitive}</strong>
                  <em>{miss.answer}</em>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
