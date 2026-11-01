import type { LanguageId, Pronoun, VerbEntry } from './verbs';

type PersonForms = Record<Pronoun, string>;
type InputVerb = Omit<VerbEntry, 'forms'> & {
  forms: Omit<VerbEntry['forms'], 'imperfectSubjunctive'>;
};

/** All stems, including irregular ones, come from ellos in the preterite minus -ron. */
export function spanishImperfectSubjunctive(verb: Pick<InputVerb, 'infinitive' | 'forms'>, variant: 'ra' | 'se'): PersonForms {
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

/** -se is reference data, never a separate target tense or a wrong-answer candidate. */
export const withImperfectSubjunctive = (verbs: InputVerb[], languageId: LanguageId): VerbEntry[] =>
  verbs.map((verb) => ({
    ...verb,
    forms: {
      ...verb.forms,
      imperfectSubjunctive: languageId === 'spanish'
        ? spanishImperfectSubjunctive(verb, 'ra')
        : { I: '', you: '', 'he/she': '', we: '', 'you plural': '', they: '' },
    },
    ...(languageId === 'spanish' ? { imperfectSubjunctiveSe: spanishImperfectSubjunctive(verb, 'se') } : {}),
  }));
