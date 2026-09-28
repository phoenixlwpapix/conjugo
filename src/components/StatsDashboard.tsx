import { BarChart3, CalendarDays, ClipboardList, Crosshair, Flame, Layers, Target, Trophy, type LucideIcon } from 'lucide-react';
import { getVerbTranslation, type TranslationLanguage } from '../data/translations';
import type { Language, TenseId } from '../data/verbs';
import { getDaysUntilDue, isMissDue, reviewBoxCount } from '../lib/misses';
import { getPracticeTenses } from '../lib/prompts';
import { getAccuracy, getHardestVerbs, getTenseBreakdown, getWeakestTense } from '../lib/scoring';
import type { DailyStats, PracticeStats, StoredMiss } from '../types';
import { RingMeter } from './ui/RingMeter';

type TrendPoint = {
  key: string;
  label: string;
  accuracy: number;
  answered: number;
};

type StatsDashboardProps = {
  activeLanguage: Language;
  bestStreak: number;
  storedMisses: StoredMiss[];
  stats: PracticeStats;
  todayAccuracy: number;
  todayStats: DailyStats;
  trend: TrendPoint[];
  translationLanguage: TranslationLanguage;
  onStartMissPractice: () => void;
  onDrillTense: (tense: TenseId) => void;
  onDrillVerbs: (verbInfinitives: string[]) => void;
};

type KpiItem = {
  icon: LucideIcon;
  label: string;
  value: string;
};

const chartTicks = [100, 75, 50, 25, 0];

const formatDue = (miss: StoredMiss) => {
  const days = getDaysUntilDue(miss);
  if (days === 0) return 'due now';
  if (days === 1) return 'due tomorrow';
  return `due in ${days} days`;
};

function AccuracyChart({ trend }: { trend: TrendPoint[] }) {
  const summary = trend
    .map((item) => `${item.label}: ${item.answered === 0 ? 'no attempts' : `${item.accuracy}% of ${item.answered}`}`)
    .join(', ');

  return (
    <div className="stats-trend-chart accuracy-chart" role="img" aria-label={`Seven day accuracy. ${summary}`}>
      <div className="accuracy-chart-axis" aria-hidden="true">
        {chartTicks.map((tick) => (
          <span key={tick}>{tick}%</span>
        ))}
      </div>
      <div className="accuracy-chart-plot" aria-hidden="true">
        {trend.map((item) => {
          const isEmpty = item.answered === 0;

          return (
            <div className="accuracy-chart-column" key={item.key}>
              <div className="accuracy-chart-track">
                <div
                  className="accuracy-chart-bar"
                  data-empty={isEmpty}
                  style={{ height: isEmpty ? undefined : `${item.accuracy}%` }}
                  title={isEmpty ? `${item.label}: no attempts` : `${item.label}: ${item.accuracy}% of ${item.answered}`}
                >
                  <span className="accuracy-chart-value">{isEmpty ? '–' : `${item.accuracy}%`}</span>
                </div>
              </div>
              <span className="accuracy-chart-label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StatsDashboard({
  activeLanguage,
  bestStreak,
  storedMisses,
  stats,
  todayAccuracy,
  todayStats,
  trend,
  translationLanguage,
  onStartMissPractice,
  onDrillTense,
  onDrillVerbs,
}: StatsDashboardProps) {
  const overallAccuracy = getAccuracy(stats.totalCorrect, stats.totalAnswered);
  const activeDays = Object.values(stats.days).filter((day) => day.answered > 0).length;
  const completedSets = Object.values(stats.days).reduce((total, day) => total + day.sessions, 0);
  const recentMisses = storedMisses.slice(0, 12);
  const dueMissCount = storedMisses.filter((miss) => isMissDue(miss)).length;
  const bestTrendAccuracy = trend.reduce((best, item) => (item.answered > 0 ? Math.max(best, item.accuracy) : best), 0);
  const totalWeekAnswers = trend.reduce((total, item) => total + item.answered, 0);
  const tenseBreakdown = getTenseBreakdown(stats, getPracticeTenses('mixed', activeLanguage.id));
  const weakestTense = getWeakestTense(tenseBreakdown);
  const hardestVerbs = getHardestVerbs(
    stats,
    activeLanguage.verbs.map((verb) => verb.infinitive),
  );
  const todayGrade =
    todayStats.answered === 0
      ? ''
      : todayAccuracy >= 90
        ? 'Excellent'
        : todayAccuracy >= 75
          ? 'Great'
          : todayAccuracy >= 60
            ? 'Getting there'
            : 'Keep at it';
  const kpis: KpiItem[] = [
    { icon: Target, label: 'Total answered', value: stats.totalAnswered.toString() },
    { icon: Trophy, label: 'Total correct', value: stats.totalCorrect.toString() },
    { icon: Flame, label: 'Best streak', value: bestStreak.toString() },
    { icon: Layers, label: 'Sets completed', value: completedSets.toString() },
  ];
  const quiz = stats.quiz ?? { answered: 0, correct: 0, sessions: 0, byTense: {} };
  const quizAccuracy = getAccuracy(quiz.correct, quiz.answered);

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

      <section className="stats-quiz-card" aria-label="Quiz performance">
        <div className="panel-title">
          <ClipboardList size={18} aria-hidden="true" />
          <div><h2>Quiz results</h2><span>Quiz answers are included in the seven day accuracy chart and tense breakdown.</span></div>
        </div>
        <div className="stats-quiz-values">
          <div><strong>{quiz.sessions}</strong><span>quizzes completed</span></div>
          <div><strong>{quiz.correct}/{quiz.answered}</strong><span>correct answers</span></div>
          <div><strong>{quiz.answered ? `${quizAccuracy}%` : '—'}</strong><span>quiz accuracy</span></div>
        </div>
      </section>

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

          <AccuracyChart trend={trend} />
        </section>

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
            {todayGrade && <b className="stats-today-grade">{todayGrade}</b>}
          </div>
          <div className="stats-today-compare">
            <div>
              <span>Today</span>
              <strong>{todayAccuracy}%</strong>
            </div>
            <div>
              <span>Overall</span>
              <strong>{overallAccuracy}%</strong>
            </div>
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
            <div>
              <span>Missed</span>
              <strong>{Math.max(0, todayStats.answered - todayStats.correct)}</strong>
            </div>
          </div>
        </section>

        <section className="stats-weak-card">
          <div className="panel-title">
            <Crosshair size={18} aria-hidden="true" />
            <div>
              <h2>Weak spots</h2>
              <span>
                {weakestTense
                  ? `Weakest tense: ${activeLanguage.tenseLabels[weakestTense.tense]}`
                  : 'Answer a few more prompts to surface weak spots.'}
              </span>
            </div>
          </div>

          <div className="stats-weak-grid">
            <div className="stats-weak-section">
              <h3>By tense</h3>
              <ul className="stats-tense-list">
                {tenseBreakdown.map((item) => {
                  const label = activeLanguage.tenseLabels[item.tense];
                  const isWeakest = weakestTense?.tense === item.tense;

                  return (
                    <li data-weakest={isWeakest} key={item.tense}>
                      <span className="stats-tense-name">
                        {label}
                        {isWeakest && <b className="stats-weak-tag">Weakest</b>}
                      </span>
                      <span className="stats-tense-meter" aria-hidden="true">
                        <span style={{ width: `${item.answered === 0 ? 0 : item.accuracy}%` }} />
                      </span>
                      <span className="stats-tense-value">
                        {item.answered === 0 ? '—' : `${item.accuracy}%`}
                        <small>{item.answered} answered</small>
                      </span>
                      <button
                        aria-label={`Drill ${label}`}
                        className="stats-drill-button"
                        onClick={() => onDrillTense(item.tense)}
                        type="button"
                      >
                        Drill
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="stats-weak-section">
              <div className="stats-weak-section-head">
                <h3>Hardest verbs</h3>
                <button
                  className="stats-review-start-button"
                  disabled={hardestVerbs.length === 0}
                  onClick={() => onDrillVerbs(hardestVerbs.map((item) => item.verbInfinitive))}
                  type="button"
                >
                  Drill these verbs
                </button>
              </div>
              {hardestVerbs.length === 0 ? (
                <p className="empty-state">Verbs you miss after at least 3 answers will appear here.</p>
              ) : (
                <ol className="stats-verb-list">
                  {hardestVerbs.map((item) => {
                    const verb = activeLanguage.verbs.find((entry) => entry.infinitive === item.verbInfinitive);
                    const translation = verb ? getVerbTranslation(activeLanguage, verb, translationLanguage) : '';

                    return (
                      <li key={item.verbInfinitive}>
                        <div>
                          <strong className="stats-review-verb">{item.verbInfinitive}</strong>
                          {translation && <span>{translation}</span>}
                        </div>
                        <span className="stats-verb-score">
                          {item.accuracy}%
                          <small>
                            {item.correct}/{item.answered} correct
                          </small>
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        </section>

        <section className="stats-review-card">
          <div className="stats-card-head">
            <div className="panel-title">
              <Target size={18} aria-hidden="true" />
              <div>
                <h2>Review load</h2>
                <span>
                  {storedMisses.length} saved misses · {dueMissCount} due. Each needs {reviewBoxCount} clean passes on
                  separate days.
                </span>
              </div>
            </div>
            <button
              className="stats-review-start-button"
              disabled={storedMisses.length === 0}
              onClick={onStartMissPractice}
              type="button"
            >
              Practice misses
            </button>
          </div>
          {recentMisses.length === 0 ? (
            <p className="empty-state">No saved misses yet. Your future review load will appear here.</p>
          ) : (
            <div className="stats-review-table-wrap">
              <table className="stats-review-table">
                <thead>
                  <tr>
                    <th>Tense</th>
                    <th>Pronoun</th>
                    <th>Verb</th>
                    <th>Answer</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMisses.map((miss) => {
                    const verb = activeLanguage.verbs.find((entry) => entry.infinitive === miss.verbInfinitive);
                    const displayAnswer = miss.answer || (verb ? verb.forms[miss.tense][miss.pronoun] : '');

                    return (
                      <tr key={`${miss.languageId}-${miss.verbInfinitive}-${miss.tense}-${miss.pronoun}`}>
                        <td>{activeLanguage.tenseLabels[miss.tense]}</td>
                        <td>{activeLanguage.pronounLabels[miss.pronoun]}</td>
                        <td className="stats-review-verb">{miss.verbInfinitive}</td>
                        <td className="stats-review-answer">{displayAnswer}</td>
                        <td className="stats-review-box" data-due={isMissDue(miss)}>
                          Box {miss.box}/{reviewBoxCount} · {formatDue(miss)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
