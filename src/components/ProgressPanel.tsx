import { useI18n } from '../hooks/useI18n';
import { BarChart3, Clock3, Flame, Target, Trophy } from 'lucide-react';
import { type Language } from '../data/verbs';
import { getAccuracy } from '../lib/scoring';
import type { Attempt, PracticeStats } from '../types';
import { RingMeter } from './ui/RingMeter';

interface ProgressPanelProps {
  activeLanguage: Language;
  progress: number;
  progressPercent: number;
  attempts: Attempt[];
  accuracy: number;
  streak: number;
  cumulativeStats: PracticeStats;
  sessionTarget: number;
  sessionElapsedSeconds: number;
}

const formatElapsedTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = seconds.toString().padStart(2, '0');

  return hours > 0 ? `${hours}:${paddedMinutes}:${paddedSeconds}` : `${paddedMinutes}:${paddedSeconds}`;
};

export function ProgressPanel({
  activeLanguage,
  progress,
  progressPercent,
  attempts,
  accuracy,
  streak,
  cumulativeStats,
  sessionTarget,
  sessionElapsedSeconds,
}: ProgressPanelProps) {
  const { t, languageName } = useI18n();
  const allTimeAccuracy = getAccuracy(cumulativeStats.totalCorrect, cumulativeStats.totalAnswered);
  const remaining = Math.max(sessionTarget - progress, 0);
  const elapsedTime = formatElapsedTime(sessionElapsedSeconds);

  return (
    <aside className="progress-panel" aria-label={t("Practice progress")}>
      <section className="progress-card session-progress-card">
        <div className="panel-title">
          <BarChart3 size={18} aria-hidden="true" />
          <h2>{t("This set")}</h2>
        </div>
        <RingMeter progressPercent={progressPercent} />
        <div className="session-elapsed" aria-label={t('Training time {time}', { time: elapsedTime })}>
          <Clock3 size={16} aria-hidden="true" />
          <span>{t("Training time")}</span>
          <strong>{elapsedTime}</strong>
        </div>
        <p>{remaining > 0 ? t('{count} more to complete this set', { count: remaining }) : t('Set complete. Reset or keep going.')}</p>
      </section>

      <section className="score-grid">
        <div>
          <span>{t("Answered")}</span>
          <strong>
            <Target size={18} aria-hidden="true" />
            {attempts.length}
          </strong>
        </div>
        <div>
          <span>{t("Accuracy")}</span>
          <strong>
            <Trophy size={18} aria-hidden="true" />
            {accuracy}%
          </strong>
        </div>
        <div>
          <span>{t("Streak")}</span>
          <strong>
            <Flame size={18} aria-hidden="true" />
            {streak}
          </strong>
        </div>
      </section>

      <section className="progress-card alltime-card">
        <div className="panel-title-row">
          <div className="panel-title">
            <Trophy size={18} aria-hidden="true" />
            <h2>{t("All-time Progress")}</h2>
          </div>
          <span className="language-stat-tag">{languageName(activeLanguage.id)}</span>
        </div>
        <div className="score-grid alltime-score-grid">
          <div>
            <span>{t("Total Drills")}</span>
            <strong>
              <Target size={18} aria-hidden="true" />
              {cumulativeStats.totalAnswered}
            </strong>
          </div>
          <div>
            <span>{t("Accuracy")}</span>
            <strong>
              <Trophy size={18} aria-hidden="true" />
              {allTimeAccuracy}%
            </strong>
          </div>
          <div>
            <span>{t("Max Streak")}</span>
            <strong>
              <Flame size={18} aria-hidden="true" />
              {cumulativeStats.bestStreak}
            </strong>
          </div>
        </div>
      </section>
    </aside>
  );
}
