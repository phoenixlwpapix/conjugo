import type { Prompt } from '../types';
import { isNonFiniteForm } from '../data/nonFinite/types';
import { getAnswer } from './prompts';

const normalize = (answer: string) => answer.trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ').replace(/[‘’]/g, "'");

// Keep Spanish ñ distinct from n when comparing accent differences.
const withoutAccents = (answer: string) => answer.split('ñ')
  .map((part) => part.normalize('NFD').replace(/\p{M}/gu, '')).join('ñ');

export function gradeTypedAnswer(input: string, prompt: Prompt): 'correct' | 'accent' | 'wrong' {
  const answer = normalize(input);
  const accepted = [normalize(getAnswer(prompt))];
  if (isNonFiniteForm(prompt.tense)) {
    accepted.push(...(prompt.verb.nonFinite?.accepted?.[prompt.tense] ?? []).map(normalize));
  }
  if (prompt.tense === 'imperfectSubjunctive' && prompt.verb.imperfectSubjunctiveSe) {
    accepted.push(normalize(prompt.verb.imperfectSubjunctiveSe[prompt.pronoun]));
  }
  if (accepted.includes(answer)) return 'correct';
  if (!accepted.some((form) => withoutAccents(form) === withoutAccents(answer))) return 'wrong';

  // Accent marks can distinguish two valid forms of the same verb, such as hablo and habló.
  const otherForms = Object.values(prompt.verb.forms).flatMap((forms) => Object.values(forms));
  if (prompt.verb.imperfectSubjunctiveSe) otherForms.push(...Object.values(prompt.verb.imperfectSubjunctiveSe));
  return otherForms.some((form) => normalize(form) === answer) ? 'wrong' : 'accent';
}
