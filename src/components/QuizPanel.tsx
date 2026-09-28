import { useState } from 'react';
import { ArrowRight, Check, Flame, RotateCcw, Target, Trophy, X } from 'lucide-react';
import { createQuizQuestions, type QuizQuestion } from '../data/quiz';
import { getLanguageTenses, type Language, type PracticeTenseId } from '../data/verbs';
import { getAccuracy, type RecordedAnswer } from '../lib/scoring';

type QuizPanelProps = {
  language: Language;
  onAnswer: (answer: RecordedAnswer) => void;
};

type Outcome = 'correct' | 'wrong' | 'skipped';

export function QuizPanel({ language, onAnswer }: QuizPanelProps) {
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
  const options = [...getLanguageTenses(language.id), { id: 'mixed' as const, label: '综合' }];
  const subjectHint = question?.pronoun === 'he/she'
    ? { spanish: 'ella', french: 'il', italian: 'lui', english: 'he' }[language.id]
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
    });
  };

  const displaySentence = question?.sentence.split('____');

  return (
    <section className="quiz-page" aria-label="Quiz mode">
      <div className="quiz-layout">
        {questions.length === 0 ? (
          <div className="quiz-card">
            <div className="quiz-card-heading">
              <span className="quiz-step">01 / 测试设置</span>
              <h2>选择测试时态</h2>
              <p>每个时态有 20 道完整句子题。每轮随机抽取 10 道，答题后查看中文语法解析。</p>
            </div>
            <div className="quiz-tense-grid" role="group" aria-label="选择测试时态">
              {options.map((option) => (
                <button
                  className="quiz-tense-option"
                  data-active={tense === option.id}
                  key={option.id}
                  onClick={() => setTense(option.id)}
                  type="button"
                >
                  {option.label}
                  {option.id === 'mixed' && <small>涵盖所有可用时态</small>}
                </button>
              ))}
            </div>
            <button className="quiz-primary" onClick={start} type="button">开始 10 道题 <ArrowRight size={18} aria-hidden="true" /></button>
          </div>
        ) : finished ? (
          <div className="quiz-card quiz-finish">
            <span className="quiz-step">本轮完成</span>
            <strong>{correctCount}<span> / 10</span></strong>
            <h2>{correctCount >= 8 ? '掌握得很好' : correctCount >= 5 ? '继续巩固' : '再练一轮'}</h2>
            <p>本轮成绩已加入统计图和时态分析。你可以继续抽取一组新题。</p>
            <div className="quiz-actions">
              <button className="quiz-primary" onClick={start} type="button"><RotateCcw size={17} aria-hidden="true" /> 再测一组</button>
              <button className="quiz-secondary" onClick={() => setQuestions([])} type="button">更换时态</button>
            </div>
          </div>
        ) : question && displaySentence && (
          <div className="quiz-card quiz-question-card">
            <div className="quiz-topline">
              <span className="quiz-step">第 {index + 1} / {questions.length} 题</span>
              <span className="quiz-difficulty">{question.difficulty}</span>
            </div>
            <div className="quiz-progress-track" aria-label={`已完成 ${answeredCount} / ${questions.length} 题`}>
              <span style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
            </div>
            <div className="quiz-question">
              <div className="quiz-question-meta">
                <span className="quiz-tense-tag">{tense === 'mixed' ? '综合' : language.tenseLabels[question.tense]}</span>
                <span>{question.verb.infinitive} · {subjectHint}</span>
              </div>
              <p className="quiz-instruction">根据句子语境判断时态，并用括号中动词的正确形式补全句子</p>
              <h2 lang={language.id === 'spanish' ? 'es' : language.id === 'french' ? 'fr' : language.id === 'italian' ? 'it' : 'en'}>
                {displaySentence[0]}<span className="quiz-blank" data-empty={selected === null} aria-label={selected === null ? '待填写' : undefined}>{selected === null ? '\u00a0' : question.answer}</span>{displaySentence[1]}
              </h2>
              <p className="quiz-translation">{question.translation}</p>
            </div>
            <div className="quiz-choices" role="group" aria-label="选择正确的动词变位">
              {question.choices.map((choice) => (
                <button
                  className="quiz-choice"
                  data-result={selected === null ? undefined : choice === question.answer ? 'correct' : choice === selected ? 'wrong' : undefined}
                  disabled={selected !== null}
                  key={choice}
                  onClick={() => answer(choice)}
                  type="button"
                >
                  <span>{choice}</span>
                  {selected !== null && choice === question.answer && <Check size={18} aria-hidden="true" />}
                  {selected === choice && choice !== question.answer && <X size={18} aria-hidden="true" />}
                </button>
              ))}
            </div>
            {selected !== null && (
              <div className="quiz-feedback" data-correct={selected === question.answer} role="status">
                <strong>{selected === question.answer ? '回答正确' : `本题目标答案：${question.answer}`}</strong>
                <p>{question.explanation}</p>
              </div>
            )}
            <div className="quiz-card-footer">
              {selected === null ? (
                <button className="quiz-skip" onClick={() => answer('')} type="button">跳过并看答案</button>
              ) : <span className="quiz-answer-state">{selected === question.answer ? '正确 +1' : '已查看解析'}</span>}
              {selected !== null && (
                <button className="quiz-primary" onClick={() => { setIndex((current) => current + 1); setSelected(null); }} type="button">
                  {index === questions.length - 1 ? '查看成绩' : '下一题'} <ArrowRight size={17} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        )}

        <aside className="quiz-sidebar" aria-label="本次测试统计">
          <div className="quiz-sidebar-head">
            <span className="quiz-step">THIS QUIZ</span>
            <h2>本次测试</h2>
            <p>{language.name} · {tense === 'mixed' ? '综合练习' : language.tenseLabels[tense]}</p>
          </div>
          <div className="quiz-sidebar-progress">
            <span>完成进度</span>
            <strong>{answeredCount}<small> / 10</small></strong>
            <div className="quiz-progress-track" aria-hidden="true"><span style={{ width: `${answeredCount * 10}%` }} /></div>
          </div>
          <div className="quiz-sidebar-stats">
            <div><Target size={18} aria-hidden="true" /><span>答对</span><strong>{correctCount}</strong></div>
            <div><Trophy size={18} aria-hidden="true" /><span>正确率</span><strong>{answeredCount ? `${accuracy}%` : '—'}</strong></div>
            <div><Flame size={18} aria-hidden="true" /><span>连对</span><strong>{streak}</strong></div>
          </div>
          <div className="quiz-sidebar-history">
            <h3>作答记录</h3>
            <div className="quiz-history-grid" aria-label="十道题的作答状态">
              {Array.from({ length: 10 }, (_, position) => (
                <span key={position} data-outcome={outcomes[position] ?? (position === index && questions.length ? 'current' : 'pending')} title={`第 ${position + 1} 题：${outcomes[position] ?? '未作答'}`}>
                  {position + 1}
                </span>
              ))}
            </div>
            <p>作答后立即查看语境与语法解析。</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
