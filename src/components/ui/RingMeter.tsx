import { useEffect, useState } from 'react';
import type { StyleVars } from '../../lib/style';

type RingMeterProps = {
  progressPercent: number;
  label?: string;
  className?: string;
  ariaLabel?: string;
};

export function RingMeter({ progressPercent, label, className, ariaLabel }: RingMeterProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    let animationFrameId = 0;

    const animate = () => {
      setAnimatedPercent((prev) => {
        const diff = progressPercent - prev;
        if (Math.abs(diff) < 0.2) {
          return progressPercent;
        }
        animationFrameId = requestAnimationFrame(animate);
        return prev + diff * 0.15;
      });
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [progressPercent]);

  return (
    <div
      className={['ring-meter', className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
      style={{ '--progress': `${animatedPercent}%` } as StyleVars}
    >
      {label ? (
        <div className="ring-meter-content">
          <strong>{Math.round(animatedPercent)}%</strong>
          <span>{label}</span>
        </div>
      ) : (
        <span>{Math.round(animatedPercent)}%</span>
      )}
    </div>
  );
}
