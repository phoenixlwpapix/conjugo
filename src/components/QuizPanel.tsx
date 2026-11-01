import { isImperative } from '../data/imperative';
import { useI18n } from '../hooks/useI18n';
import { getStudyLanguageTag, type MessageKey } from '../lib/i18n';
import { useEffect, useState } from 'react';
import { ArrowRight, BookOpenText, Check, Flame, RotateCcw, Target, Trophy, X } from 'lucide-react';
import { createQuizQuestions, type QuizQuestion } from '../data/quiz';
import { getConjugationPronounLabel, getLanguagePracticeTenses, type Language, type PracticeTenseId } from '../data/verbs';
import { getAccuracy, type RecordedAnswer } from '../lib/scoring';
import { isEditableElement } from '../lib/focusTrap';
import type { Prompt } from '../types';

type QuizPanelProps = {
  active: boolean;
  language: Language;
  onAnswer: (answer: RecordedAnswer, prompt: Prompt) => void;
  onOpenWordbook: (prompt: Prompt) => void;
};

type Outcome = 'correct' | 'wrong' | 'skipped';
const difficultyLabels: Record<QuizQuestion['difficulty'], MessageKey> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const outcomeLabels: Record<Outcome | 'current' | 'pending', MessageKey> = { correct: 'Correct', wrong: 'Missed', skipped: 'Skipped', current: 'Current question', pending: 'Not answered' };

export function QuizPanel({ active, language, onAnswer, onOpenWordbook }: QuizPanelProps) {
  const { t, locale, languageName, tenseName } = useI18n();
  const [tense, setTense] = useState<PracticeTenseId>('mixed');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [streak, setStreak] = useState(0);
  const question = questions[index];
  const finished = questions.length > 0 && index === questions.length;
  const correctCount = outcomes.filter((outcome) => outcome === 'correct').length;
  const answeredCount = outcomes.length;
  const accuracy = getAccuracy(correctCount, answeredCount);
  const options = [...getLanguagePracticeTenses(language.id), { id: 'mixed' as const }];
  const subjectHint = question && isImperative(question.tense)
    ? getConjugationPronounLabel(language, question.tense, question.pronoun)
    : question?.pronoun === 'he/she'
    ? { spanish: 'él', french: 'il', italian: 'lui', english: 'he' }[language.id]
    : question ? language.pronounLabels[question.pronoun] : '';

  const start = () => {
    setQuestions(createQuizQuestions(language, tense));
    setIndex(0);
    setSelected(null);
    setOutcomes([]);
    setStreak(0);
  };

  const answer = (choice: string) => {
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
  };

  const next = () => {
    setIndex((current) => current + 1);
    setSelected(null);
  };

  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!question || finished || event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey || isEditableElement(event.target) || document.querySelector('[aria-modal="true"]')) return;
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
  });

  const displaySentence = question?.sentence.split('____');

  return (
    <section className="quiz-page" hidden={!active} data-stage={questions.length === 0 ? 'setup' : finished ? 'finished' : 'playing'} aria-label={t('Quiz mode')}>
      <div className="quiz-layout">
        {questions.length === 0 ? (
          <div className="quiz-card quiz-setup-card">
            <div className="quiz-card-heading">
              <h1 className="workspace-title">{t('Quiz')}</h1>
              <p>{t('Choose a tense or mood, or try mixed practice. Each round has 10 questions with explanations after you answer.')}</p>
            </div>
            <div className="quiz-tense-grid" role="group" aria-label={t('Choose a quiz tense or mood')}>
              {options.map((option) => (
                <button
                  className="quiz-tense-option"
                  data-active={tense === option.id}
                  data-mixed={option.id === 'mixed'}
                  aria-pressed={tense === option.id}
                  key={option.id}
                  onClick={() => setTense(option.id)}
                  type="button"
                >
                  <span className="quiz-tense-copy">
                    <span>{tenseName(language, option.id)}</span>
                    {option.id === 'mixed' ? <small>{t(language.id === 'english' ? 'All available tenses' : 'Commands practiced separately')}</small> : language.tenseLabels[option.id] !== tenseName(language, option.id) && <small lang={getStudyLanguageTag(language.id)}>{language.tenseLabels[option.id]}</small>}
                  </span>
                  <span className="quiz-tense-check" aria-hidden="true">
                    {tense === option.id && <Check size={11} strokeWidth={2.5} />}
                  </span>
                </button>
              ))}
            </div>
            <div className="quiz-setup-footer">
              <button className="quiz-primary" onClick={start} type="button">{t('Start quiz')} <ArrowRight size={16} aria-hidden="true" /></button>
            </div>
          </div>
        ) : finished ? (
          <div className="quiz-card quiz-finish">
            <span className="quiz-step">{t('Round complete')}</span>
            <strong>{correctCount}<span> / 10</span></strong>
            <h2>{t(correctCount >= 8 ? 'Well mastered' : correctCount >= 5 ? 'Keep practicing' : 'Try another round')}</h2>
            <p>{t('Your results have been added to your statistics and tense/mood breakdown. Try a new set of questions.')}</p>
            <div className="quiz-actions">
              <button className="quiz-primary" onClick={start} type="button"><RotateCcw size={17} aria-hidden="true" /> {t('New quiz')}</button>
              <button className="quiz-secondary" onClick={() => setQuestions([])} type="button">{t('Change tense or mood')}</button>
            </div>
          </div>
        ) : question && displaySentence && (
          <div className="quiz-card quiz-question-card">
            <div className="quiz-topline">
              <span className="quiz-step">{t('Question {number} / {count}', { number: index + 1, count: questions.length })}</span>
              <span className="quiz-difficulty">{t(difficultyLabels[question.difficulty])}</span>
            </div>
            <div className="quiz-progress-track" aria-label={t('Completed {number} / {count} questions', { number: answeredCount, count: questions.length })}>
              <span style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
            </div>
            <div className="quiz-question">
              <div className="quiz-question-meta">
                <span className="quiz-tense-tag">{tenseName(language, tense === 'mixed' ? 'mixed' : question.tense)}</span>
                <span>{question.verb.infinitive} · {subjectHint}</span>
              </div>
              <p className="quiz-instruction">{t('Complete the sentence with the correct verb form. Use the context to choose the tense or mood.')}</p>
              <h2 lang={getStudyLanguageTag(language.id)}>
                {displaySentence[0]}<span className="quiz-blank" data-empty={selected === null} aria-label={selected === null ? t('Blank to fill') : undefined}>{selected === null ? '\u00a0' : question.answer}</span>{displaySentence[1]}
              </h2>
              {!(language.id === 'english' && locale === 'en') && <p className="quiz-translation">{question.translation[locale]}</p>}
            </div>
            <div className="quiz-choices" role="group" aria-label={t('Choose the correct conjugation')}>
              {question.choices.map((choice, choiceIndex) => (
                <button
                  className="quiz-choice"
                  aria-label={t('Option {letter}: {answer}', { letter: String.fromCharCode(65 + choiceIndex), answer: choice })}
                  lang={getStudyLanguageTag(language.id)}
                  data-result={selected === null ? undefined : choice === question.answer ? 'correct' : choice === selected ? 'wrong' : undefined}
                  disabled={selected !== null}
                  key={choice}
                  onClick={() => answer(choice)}
                  type="button"
                >
                  <span className="choice-index" aria-hidden="true">{String.fromCharCode(65 + choiceIndex)}</span>
                  <span>{choice}</span>
                  {selected !== null && choice === question.answer && <Check size={18} aria-hidden="true" />}
                  {selected === choice && choice !== question.answer && <X size={18} aria-hidden="true" />}
                </button>
              ))}
            </div>
            {selected !== null && (
              <div className="quiz-feedback" data-correct={selected === question.answer} role="status">
                <strong>{selected === question.answer ? t('Correct!') : t('Target answer: {answer}', { answer: question.answer })}</strong>
                <p>{question.explanation[locale]}</p>
                <button className="quiz-wordbook-link" onClick={() => onOpenWordbook({ language, verb: question.verb, tense: question.tense, pronoun: question.pronoun })} type="button">
                  <BookOpenText size={16} aria-hidden="true" />{t('View in verb book')}
                </button>
              </div>
            )}
            <div className="quiz-card-footer">
              {selected === null ? (
                <button className="quiz-skip" onClick={() => answer('')} type="button">{t('Skip and see answer')}</button>
              ) : <span className="quiz-answer-state">{t(selected === question.answer ? 'Correct +1' : 'Explanation viewed')}</span>}
              {selected !== null && (
                <button className="quiz-primary" onClick={next} type="button">
                  {t(index === questions.length - 1 ? 'View results' : 'Next question')} <ArrowRight size={17} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        )}

        <aside className="quiz-sidebar" aria-label={t('Quiz progress')}>
          <div className="quiz-sidebar-head">
            <div className="panel-title"><Target size={18} aria-hidden="true" /><h2>{t('This round')}</h2></div>
            <p>{languageName(language.id)} · {tenseName(language, tense)}</p>
          </div>
          <div className="quiz-sidebar-progress">
            <span>{t('Completed')}</span>
            <strong>{answeredCount}<small> / 10</small></strong>
            <div className="quiz-progress-track" aria-hidden="true"><span style={{ width: `${answeredCount * 10}%` }} /></div>
          </div>
          <div className="quiz-sidebar-stats">
            <div><Target size={18} aria-hidden="true" /><span>{t('Correct answers')}</span><strong>{correctCount}</strong></div>
            <div><Trophy size={18} aria-hidden="true" /><span>{t('Accuracy')}</span><strong>{answeredCount ? `${accuracy}%` : '—'}</strong></div>
            <div><Flame size={18} aria-hidden="true" /><span>{t('Streak')}</span><strong>{streak}</strong></div>
          </div>
          <div className="quiz-sidebar-history">
            <h3>{t('Answer history')}</h3>
            <div className="quiz-history-grid" aria-label={t('Question outcomes')}>
              {Array.from({ length: 10 }, (_, position) => (
                <span key={position} data-outcome={outcomes[position] ?? (position === index && questions.length ? 'current' : 'pending')} title={t('Question {number}: {outcome}', { number: position + 1, outcome: t(outcomeLabels[outcomes[position] ?? (position === index && questions.length ? 'current' : 'pending')]) })}>
                  {position + 1}
                </span>
              ))}
            </div>
            <p>{t('See the context and grammar explanation after answering.')}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
