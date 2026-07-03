import { RotateCcw } from 'lucide-react';
import { tenseOptions, type PracticeTenseId, type LanguageId } from '../data/verbs';

interface SessionBarProps {
  languageId: LanguageId;
  practiceTense: PracticeTenseId;
  switchTense: (tense: PracticeTenseId) => void;
  resetSession: () => void;
}

export function SessionBar({
  languageId,
  practiceTense,
  switchTense,
  resetSession,
}: SessionBarProps) {
  return (
    <section className="session-bar" aria-label="Practice controls">
      <div className="segmented-control">
        {tenseOptions
          .filter((item) => (item.id !== 'imperfect' && item.id !== 'conditional') || languageId !== 'english')
          .map((item) => (
            <button
              className="segment-button"
              data-active={item.id === practiceTense}
              key={item.id}
              onClick={() => switchTense(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
      </div>

      <button className="reset-button" onClick={resetSession} type="button" title="Reset session">
        <RotateCcw size={16} aria-hidden="true" />
        <span className="reset-button-text">Reset</span>
      </button>
    </section>
  );
}
