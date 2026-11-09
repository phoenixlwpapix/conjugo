import { isImperative } from '../data/imperative';
import { useI18n } from '../hooks/useI18n';
import { getStudyLanguageTag, type MessageKey } from '../lib/i18n';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { createQuizQuestions, type QuizQuestion } from '../data/quiz';
import { getConjugationPronounLabel, getLanguagePracticeTenses, type Language, type PracticeTenseId } from '../data/verbs';
import { getAccuracy, type RecordedAnswer } from '../lib/scoring';
import { isEditableElement } from '../lib/keyboard';
import type { PracticeQuestionCount } from '../lib/prompts';
import type { Prompt } from '../types';
import { SessionResult, type SessionOutcome } from './SessionResult';
import { AnswerChoices, AnswerFeedback, QuestionHeader, QuestionTense } from './PracticeQuestion';
import { SessionMetrics, SessionProgressCard } from './ProgressPanel';

type QuizPanelProps = {
  active: boolean;
  language: Language;
  questionCount: PracticeQuestionCount;
  onAnswer: (answer: RecordedAnswer, prompt: Prompt) => void;
  onOpenWordbook: (prompt: Prompt) => void;
};

const difficultyLabels: Record<QuizQuestion['difficulty'], MessageKey> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

export function QuizPanel({ active, language, questionCount, onAnswer, onOpenWordbook }: QuizPanelProps) {
  const { t, locale, tenseName } = useI18n();
  const [selectedTenses, setSelectedTenses] = useState<PracticeTenseId[]>(() => getLanguagePracticeTenses(language.id).map(({ id }) => id));
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<SessionOutcome[]>([]);
  const [streak, setStreak] = useState(0);
  const quizHeadingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const question = questions[index];
  const finished = questions.length > 0 && index === questions.length;
  const correctCount = outcomes.filter((outcome) => outcome === 'correct').length;
  const answeredCount = outcomes.length;
  const accuracy = getAccuracy(correctCount, answeredCount);
  const options = getLanguagePracticeTenses(language.id);
  const allSelected = selectedTenses.length === options.length;
  const isAnswered = selected !== null;
  const selectionLabel = selectedTenses.length === 1
    ? tenseName(language, selectedTenses[0])
    : t('Selected {count} tenses or moods', { count: selectedTenses.length });
  const subjectHint = question && isImperative(question.tense)
    ? getConjugationPronounLabel(language, question.tense, question.pronoun)
    : question?.pronoun === 'he/she'
    ? { spanish: 'él', french: 'il', italian: 'lui', english: 'he' }[language.id]
    : question ? language.pronounLabels[question.pronoun] : '';

  const resetRound = (nextQuestions: QuizQuestion[]) => {
    setQuestions(nextQuestions);
    setIndex(0);
    setSelected(null);
    setOutcomes([]);
    setStreak(0);
  };

  const start = () => {
    if (selectedTenses.length > 0) resetRound(createQuizQuestions(language, selectedTenses, questionCount));
  };

  const answer = useCallback((choice: string) => {
    if (!question || selected !== null) return;
    const correct = choice === question.answer;
    const nextStreak = correct ? streak + 1 : 0;
    setSelected(choice);
    setOutcomes((current) => [...current, choice === '' ? 'skipped' : correct ? 'correct' : 'wrong']);
    setStreak(nextStreak);
    onAnswer({
      correct,
      streak: nextStreak,
      completedSet: index === questions.length - 1,
      tense: question.tense,
      verbInfinitive: question.verb.infinitive,
    }, { language, verb: question.verb, tense: question.tense, pronoun: question.pronoun });
  }, [index, language, onAnswer, question, questions.length, selected, streak]);

  const next = useCallback(() => {
    setIndex((current) => current + 1);
    setSelected(null);
  }, []);

  useEffect(() => {
    if (!active || finished) return;
    if (isAnswered) {
      feedbackRef.current?.focus();
    } else {
      quizHeadingRef.current?.focus();
    }
  }, [active, finished, isAnswered, question]);

  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!question || finished || event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey || isEditableElement(event.target)) return;
      const key = event.key.toLowerCase();
      if (selected === null) {
        const choiceIndex = ['a', 'b', 'c', 'd'].indexOf(key);
        const position = choiceIndex >= 0 ? choiceIndex : ['1', '2', '3', '4'].indexOf(key);
        const choice = question.choices[position];
        if (choice) { event.preventDefault(); answer(choice); }
      } else if (key === 'enter' || key === ' ') {
        // Let focused controls retain their native keyboard activation.
        if (event.target instanceof Element && event.target.closest('button:not(:disabled), a[href]')) return;
        event.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, answer, finished, next, question, selected]);

  const displaySentence = question?.sentence.split('____');

  return (
    <section className="quiz-page" hidden={!active} data-stage={questions.length === 0 ? 'setup' : finished ? 'finished' : 'playing'} aria-label={t('Quiz mode')}>
      <div className="practice-layout">
        {questions.length === 0 ? (
          <div className="trainer-panel" data-stage="setup">
            <div className="quiz-card-heading">
              <h1 className="workspace-title" ref={quizHeadingRef} tabIndex={-1}>{t('Quiz')}</h1>
              <p>{t('Select one or more tenses or moods. Each round has up to {count} questions with explanations after you answer.', { count: questionCount })}</p>
            </div>
            <div className="quiz-selection-toolbar">
              <span aria-live="polite">{selectionLabel}</span>
              <button type="button" onClick={() => setSelectedTenses(allSelected ? [] : options.map(({ id }) => id))}>
                {t(allSelected ? 'Deselect all' : 'Select all')}
              </button>
            </div>
            <div className="quiz-tense-grid" role="group" aria-label={t('Choose a quiz tense or mood')}>
              {options.map((option) => (
                <button
                  className="quiz-tense-option"
                  data-active={selectedTenses.includes(option.id)}
                  role="checkbox"
                  aria-checked={selectedTenses.includes(option.id)}
                  key={option.id}
                  onClick={() => setSelectedTenses((current) => current.includes(option.id) ? current.filter((id) => id !== option.id) : [...current, option.id])}
                  type="button"
                >
                  <span className="quiz-tense-copy">
                    <span>{tenseName(language, option.id)}</span>
                    {language.tenseLabels[option.id] !== tenseName(language, option.id) && <small lang={getStudyLanguageTag(language.id)}>{language.tenseLabels[option.id]}</small>}
                  </span>
                  <span className="quiz-tense-check" aria-hidden="true">
                    {selectedTenses.includes(option.id) && <Check size={11} strokeWidth={2.5} />}
                  </span>
                </button>
              ))}
            </div>
            <div className="quiz-setup-footer">
              <button className="quiz-primary" disabled={selectedTenses.length === 0} onClick={start} type="button">{t('Start quiz')} <ArrowRight size={16} aria-hidden="true" /></button>
            </div>
          </div>
        ) : finished ? (
          <div className="trainer-panel" data-stage="finished">
            <SessionResult
              mode="quiz"
              outcomes={outcomes}
              streak={streak}
              onRestart={start}
              onChangeTenses={() => resetRound([])}
            />
          </div>
        ) : question && displaySentence && (
          <div className="trainer-panel">
            <QuestionHeader
              title={t('Complete the sentence')}
              current={index + 1}
              total={questions.length}
              outcomes={outcomes}
              headingRef={quizHeadingRef}
            />
            <div className="prompt-card">
              <div className="sentence-prompt">
                <div className="prompt-context prompt-context-row">
                  {isAnswered || selectedTenses.length === 1
                    ? <QuestionTense language={language} tense={question.tense} />
                    : <span className="mixed-mode-tag">{t('Mixed practice')}</span>}
                  <div className="prompt-meta-tags">
                    <span lang={getStudyLanguageTag(language.id)}>{subjectHint} / {question.verb.infinitive}</span>
                    <span className="quiz-difficulty" data-level={question.difficulty}>
                      {t('Difficulty: {level}', { level: t(difficultyLabels[question.difficulty]) })}
                    </span>
                  </div>
                </div>
                <div className="sentence-copy">
                  <h2 lang={getStudyLanguageTag(language.id)}>
                    {displaySentence[0]}<span className="quiz-blank" data-empty={!isAnswered} aria-label={!isAnswered ? t('Blank to fill') : undefined}>{isAnswered ? question.answer : '\u00a0'}</span>{displaySentence[1]}
                  </h2>
                  {!(language.id === 'english' && locale === 'en') && <p className="prompt-translation">{question.translation[locale]}</p>}
                </div>
              </div>
            </div>
            <AnswerChoices
              languageId={language.id}
              choices={question.choices}
              selected={selected}
              correctAnswer={question.answer}
              answered={isAnswered}
              onSelect={answer}
            />
            {isAnswered ? (
              <AnswerFeedback
                result={outcomes[index]}
                title={selected === question.answer ? t('Correct!') : t('Correct answer: {answer}', { answer: question.answer })}
                description={question.explanation[locale]}
                feedbackRef={feedbackRef}
                onOpenWordbook={() => onOpenWordbook({ language, verb: question.verb, tense: question.tense, pronoun: question.pronoun })}
                onNext={next}
                finalQuestion={index === questions.length - 1}
              />
            ) : (
              <div className="answer-dock" data-result="idle">
                <div className="answer-hint">
                  <span>{t('Use A–D or 1–4 on your keyboard.')}</span>
                </div>
                <button className="quiz-skip" onClick={() => answer('')} type="button">{t('Skip and see answer')}</button>
              </div>
            )}
          </div>
        )}

        {question && (
          <aside className="progress-panel quiz-progress-panel" aria-label={t('Quiz progress')}>
            <SessionProgressCard progressPercent={Math.round(answeredCount / questions.length * 100)} remaining={questions.length - answeredCount} />
            <SessionMetrics count={correctCount} countLabel="Correct answers" accuracy={answeredCount ? accuracy : null} streak={streak} />
          </aside>
        )}
      </div>
    </section>
  );
}
