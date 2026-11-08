import { describe, expect, it } from 'vitest';
import { createPromptPool } from '../../lib/prompts';
import { getLanguagePracticeTenses, languages, pronouns } from '../verbs';

describe('French passé simple', () => {
  const french = languages.find((language) => language.id === 'french')!;

  // OQLF: https://vitrinelinguistique.oqlf.gouv.qc.ca/24207/la-grammaire/le-verbe/conjugaison/formes-du-passe-simple
  it.each([
    ['parler', ['parlai', 'parlas', 'parla', 'parlâmes', 'parlâtes', 'parlèrent']],
    ['manger', ['mangeai', 'mangeas', 'mangea', 'mangeâmes', 'mangeâtes', 'mangèrent']],
    ['commencer', ['commençai', 'commenças', 'commença', 'commençâmes', 'commençâtes', 'commencèrent']],
    ['finir', ['finis', 'finis', 'finit', 'finîmes', 'finîtes', 'finirent']],
    ['être', ['fus', 'fus', 'fut', 'fûmes', 'fûtes', 'furent']],
    ['avoir', ['eus', 'eus', 'eut', 'eûmes', 'eûtes', 'eurent']],
    ['recevoir', ['reçus', 'reçus', 'reçut', 'reçûmes', 'reçûtes', 'reçurent']],
    ['venir', ['vins', 'vins', 'vint', 'vînmes', 'vîntes', 'vinrent']],
    ['naître', ['naquis', 'naquis', 'naquit', 'naquîmes', 'naquîtes', 'naquirent']],
  ])('conjugates %s for all six persons', (infinitive, expected) => {
    const verb = french.verbs.find((entry) => entry.infinitive === infinitive)!;
    expect(pronouns.map((pronoun) => verb.forms.passeSimple[pronoun])).toEqual(expected);
  });

  it('provides 600 French prompts, including in mixed practice', () => {
    const dedicated = createPromptPool(french, 'passeSimple');
    expect(dedicated).toHaveLength(600);
    expect(dedicated.every(({ verb, pronoun }) => Boolean(verb.forms.passeSimple[pronoun]))).toBe(true);
    expect(createPromptPool(french, 'mixed').filter(({ tense }) => tense === 'passeSimple')).toHaveLength(dedicated.length);
    for (const language of languages.filter(({ id }) => id !== 'french')) {
      expect(createPromptPool(language, 'passeSimple')).toEqual([]);
    }
  });

  it('keeps the French past tenses together and matches the number of Spanish options', () => {
    const frenchOptions = getLanguagePracticeTenses('french').map(({ id }) => id);
    const spanishOptions = getLanguagePracticeTenses('spanish').map(({ id }) => id);
    expect(frenchOptions.slice(0, 4)).toEqual(['present', 'past', 'passeSimple', 'imperfect']);
    expect(spanishOptions.slice(0, 3)).toEqual(['present', 'past', 'imperfect']);
    expect(frenchOptions).toHaveLength(spanishOptions.length);
  });
});

// RAE, model 46 (OÍR), p. 1502:
// https://www.rae.es/diccionario-estudiante/docs/conjugaciones-verbales.pdf#page=26
describe('oír accent placement', () => {
  const expected = {
    future: ['oiré', 'oirás', 'oirá', 'oiremos', 'oiréis', 'oirán'],
    conditional: ['oiría', 'oirías', 'oiría', 'oiríamos', 'oiríais', 'oirían'],
  };

  for (const tense of ['future', 'conditional'] as const) {
    it(`matches the RAE ${tense} paradigm for all six persons`, () => {
      const verb = languages.find((language) => language.id === 'spanish')?.verbs
        .find((entry) => entry.infinitive === 'oír');
      expect(verb).toBeDefined();
      expect(pronouns.map((pronoun) => verb!.forms[tense][pronoun])).toEqual(expected[tense]);
    });
  }
});
