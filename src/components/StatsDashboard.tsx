import { formatStudyDate, translate, type Locale } from '../lib/i18n';
import { useI18n } from '../hooks/useI18n';
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

const formatDue = (miss: StoredMiss, locale: Locale) => {
  const days = getDaysUntilDue(miss);
  if (days === 0) return translate(locale, 'due now');
  if (days === 1) return translate(locale, 'due tomorrow');
  return translate(locale, 'due in {days} days', { days });
};

function AccuracyChart({ trend }: { trend: TrendPoint[] }) {
  const { t } = useI18n();
  const summary = trend
    .map((item) => `${item.label}: ${item.answered === 0 ? t('no attempts') : t('{accuracy}% of {count}', { accuracy: item.accuracy, count: item.answered })}`)
    .join(', ');

  return (
    <div className="stats-trend-chart accuracy-chart" role="img" aria-label={t('Seven day accuracy. {summary}', { summary })}>
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
                  title={isEmpty ? `${item.label}: ${t('no attempts')}` : `${item.label}: ${t('{accuracy}% of {count}', { accuracy: item.accuracy, count: item.answered })}`}
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
  const { t, locale, tenseName } = useI18n();
  const localizedTrend = trend.map((point) => ({ ...point, label: formatStudyDate(point.key, locale) }));
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
        ? t('Excellent')
        : todayAccuracy >= 75
          ? t('Great')
          : todayAccuracy >= 60
            ? t('Getting there')
            : t('Keep at it');
  const kpis: KpiItem[] = [
    { icon: Target, label: t('Total answered'), value: stats.totalAnswered.toString() },
    { icon: Trophy, label: t('Total correct'), value: stats.totalCorrect.toString() },
    { icon: Flame, label: t('Best streak'), value: bestStreak.toString() },
    { icon: Layers, label: t('Sets completed'), value: completedSets.toString() },
  ];
  const quiz = stats.quiz ?? { answered: 0, correct: 0, sessions: 0, byTense: {} };
  const quizAccuracy = getAccuracy(quiz.correct, quiz.answered);

  return (
    <section className="stats-dashboard" aria-label={t("Performance dashboard")}>
      <div className="stats-hero">
        <div className="stats-hero-copy">
          <span className="eyebrow">{t("Scoreboard")}</span>
          <h1>{t("Performance dashboard")}</h1>
          <p>{t("Track recall quality, recent momentum, and the prompts that still need another clean pass.")}</p>
          <div className="stats-hero-facts" aria-label={t("Practice summary")}>
            <span>{t('{count} sets', { count: completedSets })}</span>
            <span>{t('{count} active days', { count: activeDays })}</span>
            <span>{t('{count} answers this week', { count: totalWeekAnswers })}</span>
          </div>
        </div>
        <RingMeter
          progressPercent={overallAccuracy}
          label={t("overall")}
          className="stats-hero-score"
          ariaLabel={t('Overall accuracy {accuracy}%', { accuracy: overallAccuracy })}
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

      <section className="stats-quiz-card" aria-label={t("Quiz performance")}>
        <div className="panel-title">
          <ClipboardList size={18} aria-hidden="true" />
          <div><h2>{t("Quiz results")}</h2><span>{t("Quiz answers are included in the seven day accuracy chart and tense breakdown.")}</span></div>
        </div>
        <div className="stats-quiz-values">
          <div><strong>{quiz.sessions}</strong><span>{t("quizzes completed")}</span></div>
          <div><strong>{quiz.correct}/{quiz.answered}</strong><span>{t('Correct answers')}</span></div>
          <div><strong>{quiz.answered ? `${quizAccuracy}%` : '—'}</strong><span>{t("quiz accuracy")}</span></div>
        </div>
      </section>

      <div className="stats-main-grid">
        <section className="stats-trend-card">
          <div className="stats-card-head">
            <div className="panel-title">
              <BarChart3 size={18} aria-hidden="true" />
              <div>
                <h2>{t("Seven day accuracy")}</h2>
                <span>{t("Answered prompts are plotted by day.")}</span>
              </div>
            </div>
            <div className="stats-chart-summary">
              <strong>{bestTrendAccuracy}%</strong>
              <span>{t("best day")}</span>
            </div>
          </div>

          <AccuracyChart trend={localizedTrend} />
        </section>

        <section className="stats-today-card">
          <div className="panel-title">
            <CalendarDays size={18} aria-hidden="true" />
            <div>
              <h2>{t("Today")}</h2>
              <span>{t("Current calendar day")}</span>
            </div>
          </div>
          <div className="stats-today-meter">
            <strong>{todayAccuracy}%</strong>
            <span>{t("today accuracy")}</span>
            {todayGrade && <b className="stats-today-grade">{todayGrade}</b>}
          </div>
          <div className="stats-today-compare">
            <div>
              <span>{t("Today")}</span>
              <strong>{todayAccuracy}%</strong>
            </div>
            <div>
              <span>{t("Overall")}</span>
              <strong>{overallAccuracy}%</strong>
            </div>
          </div>
          <div className="stats-today-breakdown">
            <div>
              <span>{t("Sets")}</span>
              <strong>{todayStats.sessions}</strong>
            </div>
            <div>
              <span>{t("Answered")}</span>
              <strong>{todayStats.answered}</strong>
            </div>
            <div>
              <span>{t("Missed")}</span>
              <strong>{Math.max(0, todayStats.answered - todayStats.correct)}</strong>
            </div>
          </div>
        </section>

        <section className="stats-weak-card">
          <div className="panel-title">
            <Crosshair size={18} aria-hidden="true" />
            <div>
              <h2>{t("Weak spots")}</h2>
              <span>
                {weakestTense
                  ? t('Weakest tense: {tense}', { tense: tenseName(activeLanguage, weakestTense.tense) })
                  : t('Answer a few more prompts to surface weak spots.')}
              </span>
            </div>
          </div>

          <div className="stats-weak-grid">
            <div className="stats-weak-section">
              <h3>{t("By tense")}</h3>
              <ul className="stats-tense-list">
                {tenseBreakdown.map((item) => {
                  const label = tenseName(activeLanguage, item.tense);
                  const isWeakest = weakestTense?.tense === item.tense;

                  return (
                    <li data-weakest={isWeakest} key={item.tense}>
                      <span className="stats-tense-name">
                        {label}
                        {isWeakest && <b className="stats-weak-tag">{t("Weakest")}</b>}
                      </span>
                      <span className="stats-tense-meter" aria-hidden="true">
                        <span style={{ width: `${item.answered === 0 ? 0 : item.accuracy}%` }} />
                      </span>
                      <span className="stats-tense-value">
                        {item.answered === 0 ? '—' : `${item.accuracy}%`}
                        <small>{t('{count} answered', { count: item.answered })}</small>
                      </span>
                      <button
                        aria-label={t('Drill {tense}', { tense: label })}
                        className="stats-drill-button"
                        onClick={() => onDrillTense(item.tense)}
                        type="button"
                      >
                        {t("Drill")}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="stats-weak-section">
              <div className="stats-weak-section-head">
                <h3>{t("Hardest verbs")}</h3>
                <button
                  className="stats-review-start-button"
                  disabled={hardestVerbs.length === 0}
                  onClick={() => onDrillVerbs(hardestVerbs.map((item) => item.verbInfinitive))}
                  type="button"
                >
                  {t("Drill these verbs")}
                </button>
              </div>
              {hardestVerbs.length === 0 ? (
                <p className="empty-state">{t("Verbs you miss after at least 3 answers will appear here.")}</p>
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
                            {t('{correct}/{count} correct', { correct: item.correct, count: item.answered })}
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
                <h2>{t("Review load")}</h2>
                <span>
                  {t('{saved} saved misses · {due} due. Each needs {passes} clean passes on separate days.', { saved: storedMisses.length, due: dueMissCount, passes: reviewBoxCount })}
                </span>
              </div>
            </div>
            <button
              className="stats-review-start-button"
              disabled={storedMisses.length === 0}
              onClick={onStartMissPractice}
              type="button"
            >
              {t("Practice misses")}
            </button>
          </div>
          {recentMisses.length === 0 ? (
            <p className="empty-state">{t("No saved misses yet. Your future review load will appear here.")}</p>
          ) : (
            <div className="stats-review-table-wrap">
              <table className="stats-review-table">
                <thead>
                  <tr>
                    <th>{t("Tense")}</th>
                    <th>{t("Pronoun")}</th>
                    <th>{t("Verb")}</th>
                    <th>{t("Answer")}</th>
                    <th>{t("Review")}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMisses.map((miss) => {
                    const verb = activeLanguage.verbs.find((entry) => entry.infinitive === miss.verbInfinitive);
                    const displayAnswer = miss.answer || (verb ? verb.forms[miss.tense][miss.pronoun] : '');

                    return (
                      <tr key={`${miss.languageId}-${miss.verbInfinitive}-${miss.tense}-${miss.pronoun}`}>
                        <td>{tenseName(activeLanguage, miss.tense)}</td>
                        <td>{activeLanguage.pronounLabels[miss.pronoun]}</td>
                        <td className="stats-review-verb">{miss.verbInfinitive}</td>
                        <td className="stats-review-answer">{displayAnswer}</td>
                        <td className="stats-review-box" data-due={isMissDue(miss)}>
                          {t('Box {box}/{count} · {due}', { box: miss.box, count: reviewBoxCount, due: formatDue(miss, locale) })}
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
