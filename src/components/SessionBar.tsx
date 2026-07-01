import { Target, Flame, Trophy, RotateCcw } from 'lucide-react';
import { tenseOptions, type PracticeTenseId, type LanguageId } from '../data/verbs';

interface SessionBarProps {
  languageId: LanguageId;
  practiceTense: PracticeTenseId;
  switchTense: (tense: PracticeTenseId) => void;
  progress: number;
  streak: number;
  accuracy: number;
  resetSession: () => void;
}

export function SessionBar({
  languageId,
  practiceTense,
  switchTense,
  progress,
  streak,
  accuracy,
  resetSession,
}: SessionBarProps) {
  return (
    <section className="session-bar" aria-label="Practice controls">
      <div className="segmented-control">
        {tenseOptions
          .filter((item) => item.id !== 'imperfect' || languageId !== 'english')
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

      <div className="session-pills" aria-label="Session summary">
        <span>
          <Target size={16} aria-hidden="true" />
          {progress}/20
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

      <button className="reset-button" onClick={resetSession} type="button">
        <RotateCcw size={16} aria-hidden="true" />
        Reset
      </button>
    </section>
  );
}
