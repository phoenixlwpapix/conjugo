import { useI18n } from '../hooks/useI18n';
import { BarChart3, Clock3, Flame, Target, Trophy } from 'lucide-react';
import { type Language } from '../data/verbs';
import { getAccuracy } from '../lib/scoring';
import type { Attempt, PracticeStats } from '../types';
import { RingMeter } from './ui/RingMeter';
import { useSyncExternalStore, type ReactNode } from 'react';
import type { PracticeClock } from '../lib/practiceClock';
import type { MessageKey } from '../lib/i18n';

interface ProgressPanelProps {
  activeLanguage: Language;
  progress: number;
  progressPercent: number;
  attempts: Attempt[];
  accuracy: number;
  streak: number;
  cumulativeStats: PracticeStats;
  sessionTarget: number;
  elapsedClock: PracticeClock;
}

const formatElapsedTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = seconds.toString().padStart(2, '0');

  return hours > 0 ? `${hours}:${paddedMinutes}:${paddedSeconds}` : `${paddedMinutes}:${paddedSeconds}`;
};

function SessionElapsed({ clock }: { clock: PracticeClock }) {
  const { t } = useI18n();
  const seconds = useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getSnapshot);
  const elapsedTime = formatElapsedTime(seconds);
  return (
    <div className="session-elapsed" aria-label={t('Training time {time}', { time: elapsedTime })}>
      <Clock3 size={16} aria-hidden="true" />
      <span>{t('Training time')}</span>
      <strong>{elapsedTime}</strong>
    </div>
  );
}

export function SessionProgressCard({ progressPercent, remaining, children }: { progressPercent: number; remaining: number; children?: ReactNode }) {
  const { t } = useI18n();
  return (
    <section className="progress-card session-progress-card">
      <div className="panel-title">
        <BarChart3 size={18} aria-hidden="true" />
        <h2>{t('This set')}</h2>
      </div>
      <RingMeter progressPercent={progressPercent} />
      {children}
      <p>{remaining > 0 ? t('{count} more to complete this set', { count: remaining }) : t('Set complete. Reset or keep going.')}</p>
    </section>
  );
}

type SessionMetricsProps = {
  count: number;
  countLabel: Extract<MessageKey, 'Answered' | 'Correct answers'>;
  accuracy: number | null;
  streak: number;
};

export function SessionMetrics({ count, countLabel, accuracy, streak }: SessionMetricsProps) {
  const { t } = useI18n();
  return (
    <section className="score-grid">
      <div>
        <span>{t(countLabel)}</span>
        <strong>
          <Target size={18} aria-hidden="true" />
          {count}
        </strong>
      </div>
      <div>
        <span>{t('Accuracy')}</span>
        <strong>
          <Trophy size={18} aria-hidden="true" />
          {accuracy === null ? '—' : `${accuracy}%`}
        </strong>
      </div>
      <div>
        <span>{t('Streak')}</span>
        <strong>
          <Flame size={18} aria-hidden="true" />
          {streak}
        </strong>
      </div>
    </section>
  );
}

export function ProgressPanel({
  activeLanguage,
  progress,
  progressPercent,
  attempts,
  accuracy,
  streak,
  cumulativeStats,
  sessionTarget,
  elapsedClock,
}: ProgressPanelProps) {
  const { t, languageName } = useI18n();
  const allTimeAccuracy = getAccuracy(cumulativeStats.totalCorrect, cumulativeStats.totalAnswered);
  const remaining = Math.max(sessionTarget - progress, 0);

  return (
    <aside className="progress-panel" aria-label={t("Practice progress")}>
      <SessionProgressCard progressPercent={progressPercent} remaining={remaining}>
        <SessionElapsed clock={elapsedClock} />
      </SessionProgressCard>
      <SessionMetrics count={attempts.length} countLabel="Answered" accuracy={accuracy} streak={streak} />

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
