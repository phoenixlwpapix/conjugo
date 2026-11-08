import { ArrowRight, BookOpenText, Check, X } from 'lucide-react';
import type { ReactNode, Ref } from 'react';
import { useI18n } from '../hooks/useI18n';
import { getStudyLanguageTag } from '../lib/i18n';
import type { Prompt } from '../types';
import type { SessionOutcome } from './SessionResult';

const questionStateLabels = {
  correct: 'Correct',
  wrong: 'Missed',
  skipped: 'Skipped',
  current: 'Current question',
  pending: 'Not answered',
} as const;

type QuestionHeaderProps = {
  title: string;
  current: number;
  total: number;
  outcomes: readonly SessionOutcome[];
  headingRef?: Ref<HTMLHeadingElement>;
  children?: ReactNode;
};

export function QuestionHeader({ title, current, total, outcomes, headingRef, children }: QuestionHeaderProps) {
  const { t } = useI18n();
  return (
    <>
      <div className="trainer-head">
        <div>
          <span className="eyebrow">
            {t('Question {number}', { number: current })}
            <span className="question-total"> / {total}</span>
          </span>
          <h1 className="workspace-title" ref={headingRef} tabIndex={-1}>{title}</h1>
        </div>
        {children}
      </div>
      <ol className="question-progress" role="list" aria-label={t('Question outcomes')}>
        {Array.from({ length: total }, (_, index) => {
          const state = outcomes[index] ?? (index === current - 1 ? 'current' : 'pending');
          const label = t('Question {number}: {outcome}', { number: index + 1, outcome: t(questionStateLabels[state]) });
          return <li key={index} data-state={state} title={label}><span className="sr-only">{label}</span></li>;
        })}
      </ol>
    </>
  );
}

const tenseColors: Partial<Record<Prompt['tense'], string>> = {
  present: 'var(--green)',
  past: 'var(--red)',
  imperfect: 'var(--purple)',
  conditional: 'var(--gold)',
  subjunctive: 'var(--teal)',
  imperfectSubjunctive: 'var(--teal)',
};

export function QuestionTense({ language, tense }: Pick<Prompt, 'language' | 'tense'>) {
  const { tenseName } = useI18n();
  const background = tenseColors[tense] ?? 'var(--blue)';
  return <span className="tense-badge" data-tense={tense} style={{ background }}>{tenseName(language, tense)}</span>;
}

type AnswerChoicesProps = {
  languageId: Prompt['language']['id'];
  choices: readonly string[];
  selected: string | null;
  correctAnswer: string;
  answered: boolean;
  onSelect: (choice: string) => void;
};

export function AnswerChoices({ languageId, choices, selected, correctAnswer, answered, onSelect }: AnswerChoicesProps) {
  const { t } = useI18n();
  return (
    <div className="choice-grid" role="group" aria-label={t('Answer choices')}>
      {choices.map((choice, index) => {
        const letter = String.fromCharCode(65 + index);
        const correct = answered && choice === correctAnswer;
        const wrong = answered && selected === choice && !correct;
        return (
          <button
            aria-label={t('Option {letter}: {answer}', { letter, answer: choice })}
            className="choice-card"
            data-correct={correct}
            data-wrong={wrong}
            disabled={answered}
            key={choice}
            onClick={() => onSelect(choice)}
            type="button"
          >
            <span className="choice-index" aria-hidden="true">{letter}</span>
            <strong lang={getStudyLanguageTag(languageId)}>{choice}</strong>
            {correct && <Check size={18} aria-label={t('Correct answer')} />}
            {wrong && <X size={18} aria-label={t('Wrong answer')} />}
          </button>
        );
      })}
    </div>
  );
}

type AnswerFeedbackProps = {
  result: SessionOutcome;
  title: string;
  description?: string;
  feedbackRef?: Ref<HTMLDivElement>;
  onOpenWordbook: () => void;
  onNext?: () => void;
  nextRef?: Ref<HTMLButtonElement>;
  finalQuestion?: boolean;
};

export function AnswerFeedback({ result, title, description, feedbackRef, onOpenWordbook, onNext, nextRef, finalQuestion }: AnswerFeedbackProps) {
  const { t } = useI18n();
  const bookLabel = t('View in verb book');
  return (
    <div className="answer-dock" data-result={result}>
      <div className="answer-feedback" ref={feedbackRef} role="status" tabIndex={feedbackRef ? -1 : undefined}>
        <strong>{title}</strong>
        {description && <span>{description}</span>}
      </div>
      <button aria-label={bookLabel} className="wordbook-link" onClick={onOpenWordbook} title={bookLabel} type="button">
        <BookOpenText size={16} aria-hidden="true" />
      </button>
      {onNext && (
        <button ref={nextRef} className="next-button" onClick={onNext} type="button">
          {t(finalQuestion ? 'View results' : 'Next')}
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
