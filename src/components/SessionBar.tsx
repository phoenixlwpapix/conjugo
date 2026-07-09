import { RotateCcw } from 'lucide-react';
import { tenseOptions, type PracticeTenseId, type LanguageId } from '../data/verbs';
import { SegmentedControl } from './ui/SegmentedControl';

interface SessionBarProps {
  languageId: LanguageId;
  practiceTense: PracticeTenseId;
  switchTense: (tense: PracticeTenseId) => void;
  resetSession: () => void;
}

export function SessionBar({ languageId, practiceTense, switchTense, resetSession }: SessionBarProps) {
  const options = tenseOptions.filter(
    (item) => (item.id !== 'imperfect' && item.id !== 'conditional') || languageId !== 'english',
  );

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
