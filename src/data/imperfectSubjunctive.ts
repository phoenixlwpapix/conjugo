import type { Pronoun, VerbEntry } from './verbs';

type PersonForms = Record<Pronoun, string>;
type PreteriteVerb = Pick<VerbEntry, 'infinitive'> & { forms: Pick<VerbEntry['forms'], 'past'> };

/** All stems, including irregular ones, come from ellos in the preterite minus -ron. */
export function spanishImperfectSubjunctive(verb: PreteriteVerb, variant: 'ra' | 'se'): PersonForms {
  const preterite = verb.forms.past.they;
  if (!preterite.endsWith('ron')) throw new Error(`Cannot derive imperfect subjunctive for ${verb.infinitive}: ${preterite}`);
  const stem = preterite.slice(0, -3);
  const accents: Record<string, string> = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };
  const accentedStem = `${stem.slice(0, -1)}${accents[stem.slice(-1)] ?? stem.slice(-1)}`;
  return {
    I: `${stem}${variant}`, you: `${stem}${variant}s`, 'he/she': `${stem}${variant}`,
    we: `${accentedStem}${variant === 'ra' ? 'ramos' : 'semos'}`,
    'you plural': `${stem}${variant === 'ra' ? 'rais' : 'seis'}`,
    they: `${stem}${variant}n`,
  };
}
