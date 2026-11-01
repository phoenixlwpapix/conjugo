import type { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { languages } from '../../data/verbs';
import { TrainerPanel } from '../TrainerPanel';
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
    showCelebration={false}
    selectChoice={vi.fn()}
    resetSession={vi.fn()}
    moveNext={vi.fn()}
    onOpenWordbook={vi.fn()}
    timeLeft={10}
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
    expect(html).toContain('View in verb book');
  });

  it('preserves outcomes in question order and highlights the next unanswered question', () => {
    const html = renderPanel({ attempts: [{ prompt, answer, correct: true }, { prompt, answer: '', correct: false, timedOut: true }] });
    expect(html).toContain('Question 3<');
    expect(html).toContain('data-state="correct"></span><span data-state="wrong"></span><span data-state="current"');
  });

  it.each([true, false])('offers a new set after completion regardless of the last answer (%s)', (correct) => {
    const html = renderPanel({
      attempts: Array.from({ length: 20 }, () => ({ prompt, answer, correct })),
      isAnswered: true, isCorrect: correct, isSessionComplete: true, selectedAnswer: answer,
    });
    expect(html).toContain('Question 20<');
    expect(html).toMatch(/class="next-button"[^>]*>New set/);
  });
});
