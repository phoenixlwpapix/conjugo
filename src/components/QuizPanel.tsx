import { useState } from 'react';
import { ArrowRight, Check, ClipboardList, RotateCcw, X } from 'lucide-react';
import { createQuizQuestions, type QuizQuestion } from '../data/quiz';
import { getLanguageTenses, type Language, type PracticeTenseId } from '../data/verbs';
import type { RecordedAnswer } from '../lib/scoring';

type QuizPanelProps = {
  language: Language;
  onAnswer: (answer: RecordedAnswer) => void;
};

export function QuizPanel({ language, onAnswer }: QuizPanelProps) {
  const [tense, setTense] = useState<PracticeTenseId>('mixed');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const question = questions[index];
  const finished = questions.length > 0 && index === questions.length;
  const options = [...getLanguageTenses(language.id), { id: 'mixed' as const, label: 'Mixed' }];

  const start = () => {
    setQuestions(createQuizQuestions(language, tense));
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
  };

  const answer = (choice: string) => {
    if (!question || selected !== null) return;
    const correct = choice === question.answer;
    setSelected(choice);
    setCorrectCount((current) => current + (correct ? 1 : 0));
    onAnswer({
      correct,
      streak: 0,
      completedSet: index === questions.length - 1,
      tense: question.tense,
      verbInfinitive: question.verb.infinitive,
    });
  };

  return (
    <section className="quiz-page" aria-label="Quiz mode">
      <div className="quiz-hero">
        <span className="eyebrow"><ClipboardList size={16} aria-hidden="true" /> Test your tenses</span>
        <h1>Quiz</h1>
        <p>Ten contextual questions. Choose the right tense and the right form for the subject.</p>
      </div>

      {questions.length === 0 ? (
        <div className="quiz-card">
          <div className="quiz-card-heading">
            <span className="quiz-step">01 / SETUP</span>
            <h2>Choose your focus</h2>
            <p>Each tense has 20 questions from starter to challenge level. Every round draws 10 at random.</p>
          </div>
          <div className="quiz-tense-grid" role="group" aria-label="Choose quiz tense">
            {options.map((option) => (
              <button
                className="quiz-tense-option"
                data-active={tense === option.id}
                key={option.id}
                onClick={() => setTense(option.id)}
                type="button"
              >
                {option.label}
                {option.id === 'mixed' && <small>All available tenses</small>}
              </button>
            ))}
          </div>
          <button className="quiz-primary" onClick={start} type="button">Start 10-question quiz <ArrowRight size={18} aria-hidden="true" /></button>
        </div>
      ) : finished ? (
        <div className="quiz-card quiz-finish">
          <span className="quiz-step">ROUND COMPLETE</span>
          <strong>{correctCount}<span> / 10</span></strong>
          <h2>{correctCount >= 8 ? 'Excellent work' : correctCount >= 5 ? 'Good progress' : 'Keep practicing'}</h2>
          <p>Your answers are included in the performance dashboard. Review the explanations again in a new round.</p>
          <div className="quiz-actions">
            <button className="quiz-primary" onClick={start} type="button"><RotateCcw size={17} aria-hidden="true" /> New random set</button>
            <button className="quiz-secondary" onClick={() => setQuestions([])} type="button">Change tense</button>
          </div>
        </div>
      ) : question && (
        <div className="quiz-card">
          <div className="quiz-topline">
            <span className="quiz-step">QUESTION {index + 1} / {questions.length}</span>
            <span className="quiz-difficulty">{question.difficulty}</span>
          </div>
          <div className="quiz-progress-track" aria-label={`${index} of ${questions.length} questions completed`}>
            <span style={{ width: `${(index / questions.length) * 100}%` }} />
          </div>
          <div className="quiz-question">
            <span className="quiz-context-label">SITUATION</span>
            <h2>{question.situation}</h2>
            <div className="quiz-prompt-form">{language.pronounLabels[question.pronoun]} <span>____</span></div>
            <p>Verb: <strong>{question.verb.infinitive}</strong> · Choose the form that fits this context.</p>
          </div>
          <div className="quiz-choices" role="group" aria-label="Answer choices">
            {question.choices.map((choice, choiceIndex) => (
              <button
                className="quiz-choice"
                data-result={selected === null ? undefined : choice === question.answer ? 'correct' : choice === selected ? 'wrong' : undefined}
                disabled={selected !== null}
                key={`${choice}-${choiceIndex}`}
                onClick={() => answer(choice)}
                type="button"
              >
                <span className="quiz-choice-letter">{String.fromCharCode(65 + choiceIndex)}</span>
                <span>{choice}</span>
                {selected !== null && choice === question.answer && <Check size={18} aria-hidden="true" />}
                {selected === choice && choice !== question.answer && <X size={18} aria-hidden="true" />}
              </button>
            ))}
          </div>
          {selected !== null && (
            <div className="quiz-feedback" data-correct={selected === question.answer} role="status">
              <strong>{selected === question.answer ? 'Correct' : `The correct answer is ${question.answer}`}</strong>
              <p>{question.explanation}</p>
              <button className="quiz-primary" onClick={() => { setIndex((current) => current + 1); setSelected(null); }} type="button">
                {index === questions.length - 1 ? 'See results' : 'Next question'} <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
