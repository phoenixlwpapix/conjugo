import { Flame, RotateCcw, Target, Trophy } from 'lucide-react';
import { tenseOptions, type PracticeTenseId } from '../data/verbs';
import { sessionTarget } from '../lib/prompts';
import { SegmentedControl } from './ui/SegmentedControl';

type SessionBarProps = {
  accuracy: number;
  onReset: () => void;
  onTenseChange: (tense: PracticeTenseId) => void;
  practiceTense: PracticeTenseId;
  progress: number;
  streak: number;
};

export function SessionBar({ accuracy, onReset, onTenseChange, practiceTense, progress, streak }: SessionBarProps) {
  return (
    <section className="session-bar" aria-label="Practice controls">
      <SegmentedControl ariaLabel="Choose tense" onChange={onTenseChange} options={tenseOptions} value={practiceTense} />

      <div className="session-pills" aria-label="Session summary">
        <span>
          <Target size={16} aria-hidden="true" />
          {progress}/{sessionTarget}
        </span>
        <span>
          <Flame size={16} aria-hidden="true" />
          {streak}
        </span>
        <span>
          <Trophy size={16} aria-hidden="true" />
          {accuracy}%
        </span>
      </div>

      <button className="reset-button" onClick={onReset} type="button">
        <RotateCcw size={16} aria-hidden="true" />
        Reset
      </button>
    </section>
  );
}
