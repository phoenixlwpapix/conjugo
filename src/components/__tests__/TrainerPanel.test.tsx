import type { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { languages } from '../../data/verbs';
import { TrainerPanel } from '../TrainerPanel';
import { createPracticeClock } from '../../lib/practiceClock';
import type { Prompt } from '../../types';

const language = languages[0];
const prompt: Prompt = { language, verb: language.verbs[0], tense: 'present', pronoun: 'I' };
const answer = prompt.verb.forms.present.I;
const renderPanel = (overrides: Partial<ComponentProps<typeof TrainerPanel>> = {}) => renderToStaticMarkup(
  <TrainerPanel
    attempts={[]}
    prompt={prompt}
    practiceTense="present"
    choices={[answer, 'incorrect']}
    selectedAnswer={null}
    timedOut={false}
    correctAnswer={answer}
    isAnswered={false}
    isCorrect={false}
    isSessionComplete={false}
    reviewingLastAnswer={false}
    toggleResults={vi.fn()}
    selectChoice={vi.fn()}
    resetSession={vi.fn()}
    onBackHome={vi.fn()}
    moveNext={vi.fn()}
    onOpenWordbook={vi.fn()}
    timeLeft={10}
    elapsedClock={createPracticeClock(0, 1)}
    timerEnabled={false}
    toggleTimer={vi.fn()}
    sessionTarget={20}
    sessionKind="standard"
    translationLanguage="en"
    {...overrides}
  />,
);

describe('practice feedback', () => {
  it.each([true, false])('keeps the first question number during feedback (correct: %s)', (correct) => {
    const html = renderPanel({
      attempts: [{ prompt, answer, correct }], isAnswered: true, isCorrect: correct, selectedAnswer: answer,
    });
    expect(html).toContain('Question 1<');
    expect(html).not.toContain('data-state="current"');
    expect(html).toContain(correct ? 'Correct!' : `Correct answer: ${answer}`);
    expect(html).toContain('View conjugations');
  });

  it('preserves outcomes in question order and highlights the next unanswered question', () => {
    const html = renderPanel({ attempts: [{ prompt, answer, correct: true }, { prompt, answer: '', correct: false, timedOut: true }] });
    expect(html).toContain('Question 3<');
    expect(Array.from(html.matchAll(/data-state="([^"]+)"/g), (match) => match[1]).slice(0, 3))
      .toEqual(['correct', 'wrong', 'current']);
  });

  it('renders a compact header streak badge when streak is at least 2', () => {
    expect(renderPanel({ streak: 1 })).not.toContain('class="header-streak-badge"');
    const html = renderPanel({ streak: 4 });
    expect(html).toContain('class="header-streak-badge"');
    expect(html).toContain('aria-label="Streak: 4"');
  });

  it.each([true, false])('shows results inside the trainer after completion (correct: %s)', (correct) => {
    const html = renderPanel({
      attempts: Array.from({ length: 20 }, () => ({ prompt, answer, correct })),
      isAnswered: true, isCorrect: correct, isSessionComplete: true, selectedAnswer: answer,
    });
    expect(html).toMatch(/<section class="trainer-panel" data-stage="finished"[^>]*><div class="session-result"/);
    expect(html).toContain('Practice complete');
    expect(html).toContain(`${correct ? 20 : 0}/20 correct`);
    expect(html).toContain('New set');
    expect(html).toContain('Review last answer');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('Answer choices');
  });

  it('keeps the last answer and its verb book link available from the results', () => {
    const html = renderPanel({
      attempts: [{ prompt, answer: '', correct: false, timedOut: true }],
      isAnswered: true, timedOut: true, isSessionComplete: true, reviewingLastAnswer: true, sessionTarget: 1,
    });
    expect(html).toContain("Time&#x27;s up!");
    expect(html).toContain(`Correct answer: ${answer}`);
    expect(html).toContain('View conjugations');
    expect(html).toContain('View results');
  });

  it('offers a way back home after a miss review', () => {
    const html = renderPanel({
      attempts: [{ prompt, answer, correct: true }],
      isSessionComplete: true, sessionTarget: 1, sessionKind: 'review',
    });
    expect(html).toMatch(/<div class="result-actions"><button[^>]*>.*New set<\/button><button[^>]*>.*Back to home<\/button><\/div>/);
  });
});
