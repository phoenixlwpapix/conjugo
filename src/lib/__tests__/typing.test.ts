import { describe, expect, it } from 'vitest';
import { languages, type LanguageId, type TenseId } from '../../data/verbs';
import type { Pronoun } from '../../types';
import { gradeTypedAnswer } from '../typing';

function makePrompt(languageId: LanguageId, infinitive: string, tense: TenseId, pronoun: Pronoun) {
  const language = languages.find((item) => item.id === languageId)!;
  const verb = language.verbs.find((item) => item.infinitive === infinitive)!;
  return { language, verb, tense, pronoun };
}

describe('typed answers', () => {
  it('accepts case, surrounding spaces and decomposed Unicode', () => {
    const prompt = makePrompt('spanish', 'hablar', 'past', 'he/she');
    expect(gradeTypedAnswer('  HABLO\u0301  ', prompt)).toBe('correct');
    expect(gradeTypedAnswer('hablo', prompt)).toBe('wrong');
  });

  it('distinguishes accent-only differences from misspellings', () => {
    const prompt = makePrompt('french', 'être', 'present', 'you plural');
    expect(gradeTypedAnswer('etes', prompt)).toBe('accent');
    expect(gradeTypedAnswer('etess', prompt)).toBe('wrong');
  });

  it('accepts the matching Spanish -se variant and preserves ñ as a distinct letter', () => {
    const prompt = makePrompt('spanish', 'enseñar', 'imperfectSubjunctive', 'we');
    expect(gradeTypedAnswer('enseñásemos', prompt)).toBe('correct');
    expect(gradeTypedAnswer('enseñasemos', prompt)).toBe('accent');
    expect(gradeTypedAnswer('enseñase', prompt)).toBe('wrong');
    expect(gradeTypedAnswer('ensenásemos', prompt)).toBe('wrong');
  });

  it('accepts spacing differences in multiword conjugations', () => {
    const prompt = makePrompt('french', 'parler', 'past', 'I');
    expect(gradeTypedAnswer(' ai    parlé ', prompt)).toBe('correct');
  });
});
