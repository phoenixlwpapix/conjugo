import { RotateCcw } from 'lucide-react';
import { concreteTenses, type PracticeTenseId, type Language } from '../data/verbs';
import { SegmentedControl } from './ui/SegmentedControl';

interface SessionBarProps {
  language: Language;
  practiceTense: PracticeTenseId;
  switchTense: (tense: PracticeTenseId) => void;
  resetSession: () => void;
}

export function SessionBar({ language, practiceTense, switchTense, resetSession }: SessionBarProps) {
  const options: Array<{ id: PracticeTenseId; label: string }> = [
    ...concreteTenses
      .filter((item) => (item.id !== 'imperfect' && item.id !== 'conditional') || language.id !== 'english')
      .map((item) => ({ id: item.id, label: language.tenseLabels[item.id] })),
    { id: 'mixed', label: language.tenseLabels.mixed },
  ];

  return (
    <section className="session-bar" aria-label="Practice controls">
      <SegmentedControl
        ariaLabel="Choose tense"
        onChange={switchTense}
        options={options}
        value={practiceTense}
      />

      <button className="reset-button" onClick={resetSession} type="button" title="Reset session">
        <RotateCcw size={16} aria-hidden="true" />
        <span className="reset-button-text">Reset</span>
      </button>
    </section>
  );
}
