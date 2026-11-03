import { describe, expect, it } from 'vitest';
import { languages, pronouns } from '../verbs';

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
