import type { StyleVars } from '../../lib/style';

type RingMeterProps = {
  progressPercent: number;
};

export function RingMeter({ progressPercent }: RingMeterProps) {
  return (
    <div className="ring-meter" style={{ '--progress': `${progressPercent}%` } as StyleVars}>
      <span>{progressPercent}%</span>
    </div>
  );
}
