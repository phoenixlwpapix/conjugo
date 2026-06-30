import { ArrowRight, Check, RotateCcw, TimerReset, X } from 'lucide-react';
import { type Language, type PracticeTenseId } from '../data/verbs';
import { getAnswer, getPronounLabel, getTenseLabel, sessionTarget } from '../lib/prompts';
import type { Attempt, Prompt } from '../types';

type TrainerPanelProps = {
  activeLanguage: Language;
  attempts: Attempt[];
  choices: string[];
  correctAnswer: string;
  isAnswered: boolean;
  isCorrect: boolean;
  isSessionComplete: boolean;
  onMoveNext: () => void;
  onReset: () => void;
  onSelectChoice: (choice: string) => void;
  practiceTense: PracticeTenseId;
  prompt: Prompt;
  selectedAnswer: string | null;
  showCelebration: boolean;
};

export function TrainerPanel({
  activeLanguage,
  attempts,
  choices,
  correctAnswer,
  isAnswered,
  isCorrect,
  isSessionComplete,
  onMoveNext,
  onReset,
  onSelectChoice,
  practiceTense,
  prompt,
  selectedAnswer,
  showCelebration,
}: TrainerPanelProps) {
  return (
    <section className="trainer-panel" aria-label="Multiple choice verb conjugation drill">
      <div className="trainer-head">
        <div>
          <span className="eyebrow">Question {Math.min(attempts.length + 1, sessionTarget)}</span>
          <h1>Conjugation drill</h1>
        </div>
        <div className="timer-chip">
          <TimerReset size={17} aria-hidden="true" />
          Fast recall
        </div>
      </div>

      <div className="prompt-card">
        <div className="prompt-main">
          <div className="prompt-context">
            <span>{activeLanguage.name}</span>
            <span>{getTenseLabel(prompt.tense)}</span>
            {practiceTense === 'mixed' && <span>Mixed</span>}
          </div>

          <div className="prompt-stem">
            <span>Pronoun</span>
            <h2>{getPronounLabel(prompt)}</h2>
          </div>

          <div className="verb-meaning">
            <span>Infinitive</span>
            <strong>{prompt.verb.infinitive}</strong>
            <em>{prompt.verb.translation}</em>
          </div>
        </div>
      </div>

      <div className="choice-grid" aria-label="Answer choices">
        {choices.map((choice, index) => {
          const isSelectedChoice = selectedAnswer === choice;
          const isCorrectChoice = isAnswered && choice === correctAnswer;
          const isWrongChoice = isAnswered && isSelectedChoice && choice !== correctAnswer;

          return (
            <button
              aria-label={`Option ${String.fromCharCode(65 + index)}: ${choice}`}
              className="choice-card"
              data-correct={isCorrectChoice}
              data-wrong={isWrongChoice}
              disabled={isAnswered}
              key={choice}
              onClick={() => onSelectChoice(choice)}
              type="button"
            >
              <span className="choice-index">{String.fromCharCode(65 + index)}</span>
              <strong>{choice}</strong>
              {isCorrectChoice && <Check size={18} aria-label="Correct answer" />}
              {isWrongChoice && <X size={18} aria-label="Wrong answer" />}
            </button>
          );
        })}
      </div>

      <div className="answer-dock" data-result={isAnswered ? (isCorrect ? 'correct' : 'wrong') : 'idle'}>
        {isAnswered ? (
          <>
            <div>
              <strong>{isCorrect ? 'Good hit.' : 'Missed this one.'}</strong>
              <span>
                {getPronounLabel(prompt)} + {prompt.verb.infinitive} = {getAnswer(prompt)}
                {isCorrect && !showCelebration ? ' · next question loading' : ''}
              </span>
            </div>
            {!isCorrect &&
              (isSessionComplete ? (
                <button className="next-button" onClick={onReset} type="button">
                  New set
                  <RotateCcw size={17} aria-hidden="true" />
                </button>
              ) : (
                <button className="next-button" onClick={onMoveNext} type="button">
                  Next
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              ))}
          </>
        ) : (
          <div>
            <strong>Choose one answer card.</strong>
          </div>
        )}
      </div>
    </section>
  );
}
