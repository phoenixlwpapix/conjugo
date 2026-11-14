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
    isFavorite={false}
    onToggleFavorite={vi.fn()}
    practiceTense="present"
    answerMode="choice"
    sessionVersion={0}
    showAccentHint={false}
    choices={[answer, 'incorrect']}
    selectedAnswer={null}
    timedOut={false}
    correctAnswer={answer}
    isAnswered={false}
    isCorrect={false}
    isSessionComplete={false}
    reviewingLastAnswer={false}
    toggleResults={vi.fn()}
    submitAnswer={vi.fn()}
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
    showVerbGloss
    {...overrides}
  />,
);

describe('practice feedback', () => {
  it('shows the verb meaning only when the practice preference is enabled', () => {
    const french = languages.find(({ id }) => id === 'french')!;
    const frenchPrompt = { ...prompt, language: french, verb: french.verbs[0] };
    expect(renderPanel({ prompt: frenchPrompt })).toContain('class="prompt-translation"');
    expect(renderPanel({ prompt: frenchPrompt, showVerbGloss: false })).not.toContain('class="prompt-translation"');
  });
  it('keeps a live region ready before answering and shows Next when auto-advance is off', () => {
    expect(renderPanel()).toContain('<div class="sr-only" role="status"></div>');
    const html = renderPanel({
      autoAdvanceStopped: true, attempts: [{ prompt, answer, correct: true }],
      isAnswered: true, isCorrect: true, selectedAnswer: answer,
    });
    expect(html).toContain('<div class="sr-only" role="status">Correct!</div>');
    expect(html).toContain('class="next-button"');
  });
  it.each([false, true])('shows the verb favorite button with pressed state %s', (isFavorite) => {
    const html = renderPanel({ isFavorite });
    expect(html).toContain(`aria-label="Favorite ${prompt.verb.infinitive}" aria-pressed="${isFavorite}"`);
    expect(html).toContain(`fill="${isFavorite ? 'currentColor' : 'none'}"`);
  });

  it('replaces the choices with a text field and study-language characters in Typing', () => {
    const french = languages.find(({ id }) => id === 'french')!;
    const html = renderPanel({ prompt: { ...prompt, language: french, verb: french.verbs[0] }, answerMode: 'typing', showAccentHint: true });
    expect(html).toContain('aria-label="Your answer"');
    expect(html).toContain('aria-label="Accent characters"');
    expect(html).toContain('Check the accent marks and try again.');
    expect(html).not.toContain('Answer choices');
  });

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
