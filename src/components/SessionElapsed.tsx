import { Clock3 } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { useI18n } from '../hooks/useI18n';
import type { PracticeClock } from '../lib/practiceClock';

const formatElapsedTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = minutes.toString().padStart(2, '0');
  const paddedSeconds = seconds.toString().padStart(2, '0');

  return hours > 0 ? `${hours}:${paddedMinutes}:${paddedSeconds}` : `${paddedMinutes}:${paddedSeconds}`;
};

export function SessionElapsed({ clock, compact = false }: { clock: PracticeClock; compact?: boolean }) {
  const { t } = useI18n();
  const seconds = useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getSnapshot);
  const elapsedTime = formatElapsedTime(seconds);

  return (
    <div className="session-elapsed" data-compact={compact} role="group" aria-label={t('Training time {time}', { time: elapsedTime })}>
      <Clock3 size={compact ? 13 : 16} aria-hidden="true" />
      {!compact && <span>{t('Training time')}</span>}
      <strong>{elapsedTime}</strong>
    </div>
  );
}
