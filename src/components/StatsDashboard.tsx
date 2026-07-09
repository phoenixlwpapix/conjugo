import { BarChart3, CalendarDays, Flame, RotateCcw, Target, Trophy, type LucideIcon } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { languages } from '../data/verbs';
import { getAccuracy } from '../lib/scoring';
import type { DailyStats, PracticeStats, StoredMiss } from '../types';
import { RingMeter } from './ui/RingMeter';

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

type KpiItem = {
  icon: LucideIcon;
  label: string;
  value: string;
};

type ChartPoint = TrendPoint & {
  chartAccuracy: number;
};

const toChartData = (trend: TrendPoint[]): ChartPoint[] =>
  trend.map((item) => ({
    ...item,
    chartAccuracy: item.answered === 0 ? 0 : item.accuracy,
  }));

const formatPercentTick = (value: number) => `${value}%`;

export function StatsDashboard({ bestStreak, storedMisses, stats, todayAccuracy, todayStats, trend }: StatsDashboardProps) {
  const overallAccuracy = getAccuracy(stats.totalCorrect, stats.totalAnswered);
  const activeDays = Object.values(stats.days).filter((day) => day.answered > 0).length;
  const completedSets = Object.values(stats.days).reduce((total, day) => total + day.sessions, 0);
  const recentMisses = storedMisses.slice(0, 6);
  const chartData = toChartData(trend);
  const bestTrendAccuracy = trend.reduce((best, item) => (item.answered > 0 ? Math.max(best, item.accuracy) : best), 0);
  const totalWeekAnswers = trend.reduce((total, item) => total + item.answered, 0);
  const kpis: KpiItem[] = [
    { icon: Target, label: 'Total answered', value: stats.totalAnswered.toString() },
    { icon: Trophy, label: 'Total correct', value: stats.totalCorrect.toString() },
    { icon: Flame, label: 'Best streak', value: bestStreak.toString() },
    { icon: RotateCcw, label: 'Review load', value: storedMisses.length.toString() },
  ];

  return (
    <section className="stats-dashboard" aria-label="Performance dashboard">
      <div className="stats-hero">
        <div className="stats-hero-copy">
          <span className="eyebrow">Scoreboard</span>
          <h1>Performance dashboard</h1>
          <p>Track recall quality, recent momentum, and the prompts that still need another clean pass.</p>
          <div className="stats-hero-facts" aria-label="Practice summary">
            <span>{completedSets} sets</span>
            <span>{activeDays} active days</span>
            <span>{totalWeekAnswers} answers this week</span>
          </div>
        </div>
        <RingMeter
          progressPercent={overallAccuracy}
          label="overall"
          className="stats-hero-score"
          ariaLabel={`Overall accuracy ${overallAccuracy}%`}
        />
      </div>

      <div className="stats-kpi-grid">
        {kpis.map(({ icon: Icon, label, value }) => (
          <article key={label}>
            <span className="stats-kpi-icon">
              <Icon size={18} aria-hidden="true" />
            </span>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="stats-main-grid">
        <section className="stats-trend-card">
          <div className="stats-card-head">
            <div className="panel-title">
              <BarChart3 size={18} aria-hidden="true" />
              <div>
                <h2>Seven day accuracy</h2>
                <span>Answered prompts are plotted by day.</span>
              </div>
            </div>
            <div className="stats-chart-summary">
              <strong>{bestTrendAccuracy}%</strong>
              <span>best day</span>
            </div>
          </div>

          <div className="stats-trend-chart" role="img" aria-label="Seven day accuracy trend">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ bottom: 8, left: -8, right: 10, top: 12 }}>
                <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 5" vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  dy={8}
                  tick={{ fill: 'var(--chart-axis-text)', fontSize: 12, fontWeight: 800 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  domain={[0, 100]}
                  tick={{ fill: 'var(--chart-axis-text)', fontSize: 12, fontWeight: 800 }}
                  tickFormatter={formatPercentTick}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--chart-tooltip-surface)',
                    border: '1px solid var(--chart-tooltip-border)',
                    borderRadius: 8,
                    boxShadow: 'var(--shadow)',
                    fontWeight: 800,
                  }}
                  cursor={{ stroke: 'var(--chart-grid)', strokeWidth: 1 }}
                  itemStyle={{ color: 'var(--chart-tooltip-value)', fontWeight: 900 }}
                  labelStyle={{ color: 'var(--chart-tooltip-label)', fontWeight: 900 }}
                  formatter={(value, _name, item) => {
                    const payload = item.payload as ChartPoint;

                    return [payload.answered === 0 ? 'No attempts' : `${value}%`, 'Accuracy'];
                  }}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="chartAccuracy" name="Accuracy" radius={[8, 8, 3, 3]} barSize={36}>
                  {chartData.map((item) => (
                    <Cell
                      fill={item.answered === 0 ? 'var(--control)' : 'var(--language-accent, var(--green))'}
                      key={item.key}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="stats-side-stack">
          <section className="stats-today-card">
            <div className="panel-title">
              <CalendarDays size={18} aria-hidden="true" />
              <div>
                <h2>Today</h2>
                <span>Current calendar day</span>
              </div>
            </div>
            <div className="stats-today-meter">
              <strong>{todayAccuracy}%</strong>
              <span>today accuracy</span>
              <em>{todayStats.correct}/{todayStats.answered} correct</em>
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
              <div>
                <h2>Review load</h2>
                <span>{storedMisses.length} saved misses</span>
              </div>
            </div>
            {recentMisses.length === 0 ? (
              <p className="empty-state">No saved misses yet. Your future review load will appear here.</p>
            ) : (
              <div className="stats-review-list">
                {recentMisses.map((miss) => {
                  const lang = languages.find((l) => l.id === miss.languageId);
                  const verb = lang?.verbs.find((v) => v.infinitive === miss.verbInfinitive);
                  const correctAnswer = verb ? verb.forms[miss.tense][miss.pronoun] : '';
                  const displayAnswer = miss.answer || correctAnswer;

                  return (
                    <div key={`${miss.languageId}-${miss.verbInfinitive}-${miss.tense}-${miss.pronoun}`}>
                      <span>
                        {miss.languageId} · {miss.tense} · {miss.pronoun}
                      </span>
                      <strong>{miss.verbInfinitive}</strong>
                      <em>{displayAnswer}</em>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
