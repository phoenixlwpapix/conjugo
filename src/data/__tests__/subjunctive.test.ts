import { describe, expect, it } from 'vitest';
import { languages, pronouns, type LanguageId } from '../verbs';
import { createPromptPool, getPronounLabel, withMoodMarker } from '../../lib/prompts';

const subjunctiveOf = (languageId: LanguageId, infinitive: string) => {
  const verb = languages.find((language) => language.id === languageId)!.verbs.find((entry) => entry.infinitive === infinitive);
  if (!verb) throw new Error(`missing ${languageId} verb ${infinitive}`);
  return pronouns.map((pronoun) => verb.forms.subjunctive[pronoun]);
};

// Reference tables for the patterns the derivation has to get right.
const expected: Record<Exclude<LanguageId, 'english'>, Record<string, string[]>> = {
  french: {
    parler: ['parle', 'parles', 'parle', 'parlions', 'parliez', 'parlent'],
    finir: ['finisse', 'finisses', 'finisse', 'finissions', 'finissiez', 'finissent'],
    être: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'],
    aller: ['aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent'],
    venir: ['vienne', 'viennes', 'vienne', 'venions', 'veniez', 'viennent'],
    boire: ['boive', 'boives', 'boive', 'buvions', 'buviez', 'boivent'],
    recevoir: ['reçoive', 'reçoives', 'reçoive', 'recevions', 'receviez', 'reçoivent'],
    croire: ['croie', 'croies', 'croie', 'croyions', 'croyiez', 'croient'],
    commencer: ['commence', 'commences', 'commence', 'commencions', 'commenciez', 'commencent'],
    vouloir: ['veuille', 'veuilles', 'veuille', 'voulions', 'vouliez', 'veuillent'],
  },
  spanish: {
    hablar: ['hable', 'hables', 'hable', 'hablemos', 'habléis', 'hablen'],
    tener: ['tenga', 'tengas', 'tenga', 'tengamos', 'tengáis', 'tengan'],
    pensar: ['piense', 'pienses', 'piense', 'pensemos', 'penséis', 'piensen'],
    dormir: ['duerma', 'duermas', 'duerma', 'durmamos', 'durmáis', 'duerman'],
    sentir: ['sienta', 'sientas', 'sienta', 'sintamos', 'sintáis', 'sientan'],
    pedir: ['pida', 'pidas', 'pida', 'pidamos', 'pidáis', 'pidan'],
    jugar: ['juegue', 'juegues', 'juegue', 'juguemos', 'juguéis', 'jueguen'],
    empezar: ['empiece', 'empieces', 'empiece', 'empecemos', 'empecéis', 'empiecen'],
    buscar: ['busque', 'busques', 'busque', 'busquemos', 'busquéis', 'busquen'],
    enviar: ['envíe', 'envíes', 'envíe', 'enviemos', 'enviéis', 'envíen'],
    conocer: ['conozca', 'conozcas', 'conozca', 'conozcamos', 'conozcáis', 'conozcan'],
    estar: ['esté', 'estés', 'esté', 'estemos', 'estéis', 'estén'],
    dar: ['dé', 'des', 'dé', 'demos', 'deis', 'den'],
  },
  italian: {
    parlare: ['parli', 'parli', 'parli', 'parliamo', 'parliate', 'parlino'],
    cercare: ['cerchi', 'cerchi', 'cerchi', 'cerchiamo', 'cerchiate', 'cerchino'],
    mangiare: ['mangi', 'mangi', 'mangi', 'mangiamo', 'mangiate', 'mangino'],
    finire: ['finisca', 'finisca', 'finisca', 'finiamo', 'finiate', 'finiscano'],
    venire: ['venga', 'venga', 'venga', 'veniamo', 'veniate', 'vengano'],
    uscire: ['esca', 'esca', 'esca', 'usciamo', 'usciate', 'escano'],
    essere: ['sia', 'sia', 'sia', 'siamo', 'siate', 'siano'],
    andare: ['vada', 'vada', 'vada', 'andiamo', 'andiate', 'vadano'],
    dovere: ['debba', 'debba', 'debba', 'dobbiamo', 'dobbiate', 'debbano'],
  },
};

describe('present subjunctive', () => {
  for (const [languageId, verbs] of Object.entries(expected)) {
    for (const [infinitive, forms] of Object.entries(verbs)) {
      it(`${languageId} ${infinitive}`, () => {
        expect(subjunctiveOf(languageId as LanguageId, infinitive)).toEqual(forms);
      });
    }
  }

  it('is never drilled in English', () => {
    const english = languages.find((language) => language.id === 'english')!;
    expect(createPromptPool(english, 'mixed').some((prompt) => prompt.tense === 'subjunctive')).toBe(false);
  });

  it('is part of mixed practice for the other languages', () => {
    const italian = languages.find((language) => language.id === 'italian')!;
    expect(createPromptPool(italian, 'mixed').some((prompt) => prompt.tense === 'subjunctive')).toBe(true);
  });

  it('prefixes prompts with que / qu’ / che', () => {
    expect(withMoodMarker('french', 'subjunctive', 'tu')).toBe('que tu');
    expect(withMoodMarker('french', 'subjunctive', 'elle')).toBe("qu'elle");
    expect(withMoodMarker('spanish', 'subjunctive', 'él')).toBe('que él');
    expect(withMoodMarker('italian', 'subjunctive', 'io')).toBe('che io');
    expect(withMoodMarker('french', 'present', 'il')).toBe('il');

    const spanish = languages.find((language) => language.id === 'spanish')!;
    const [prompt] = createPromptPool(spanish, 'subjunctive');
    expect(getPronounLabel(prompt)).toBe('que yo');
  });
});
