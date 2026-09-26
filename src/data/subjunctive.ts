import type { BaseVerbEntry, Pronoun } from './verbs';

/**
 * Present subjunctive forms, derived from each verb's existing indicative forms.
 * Regular patterns (and most "irregular" verbs) follow from those forms; only verbs with
 * a genuinely separate subjunctive stem are listed explicitly.
 */

type PersonForms = Record<Pronoun, string>;
type SixForms = [string, string, string, string, string, string];

const toPersons = ([I, you, heShe, we, youPlural, they]: SixForms): PersonForms => ({
  I,
  you,
  'he/she': heShe,
  we,
  'you plural': youPlural,
  they,
});

const unexpected = (verb: BaseVerbEntry, reason: string): never => {
  throw new Error(`Cannot derive subjunctive for "${verb.infinitive}": ${reason}`);
};

/** English present subjunctive is the bare infinitive for every person ("that she go"). */
export const englishSubjunctive = (verb: BaseVerbEntry): PersonForms => {
  const base = verb.infinitive.replace(/^to /, '');
  return toPersons([base, base, base, base, base, base]);
};

const frenchIrregular: Record<string, SixForms> = {
  être: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'],
  avoir: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'],
  aller: ['aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent'],
  faire: ['fasse', 'fasses', 'fasse', 'fassions', 'fassiez', 'fassent'],
  pouvoir: ['puisse', 'puisses', 'puisse', 'puissions', 'puissiez', 'puissent'],
  savoir: ['sache', 'saches', 'sache', 'sachions', 'sachiez', 'sachent'],
  vouloir: ['veuille', 'veuilles', 'veuille', 'voulions', 'vouliez', 'veuillent'],
  valoir: ['vaille', 'vailles', 'vaille', 'valions', 'valiez', 'vaillent'],
};

/** je/tu/il/ils come from the ils-present stem; nous/vous match the imperfect. */
export const frenchSubjunctive = (verb: BaseVerbEntry): PersonForms => {
  const irregular = frenchIrregular[verb.infinitive];
  if (irregular) {
    return toPersons(irregular);
  }

  const they = verb.forms.present.they;
  if (!they.endsWith('ent')) {
    unexpected(verb, `ils-present "${they}" does not end in -ent`);
  }

  const stem = they.slice(0, -3);
  return toPersons([
    `${stem}e`,
    `${stem}es`,
    `${stem}e`,
    verb.forms.imperfect.we,
    verb.forms.imperfect['you plural'],
    they,
  ]);
};

const spanishIrregular: Record<string, SixForms> = {
  ser: ['sea', 'seas', 'sea', 'seamos', 'seáis', 'sean'],
  estar: ['esté', 'estés', 'esté', 'estemos', 'estéis', 'estén'],
  ir: ['vaya', 'vayas', 'vaya', 'vayamos', 'vayáis', 'vayan'],
  dar: ['dé', 'des', 'dé', 'demos', 'deis', 'den'],
  saber: ['sepa', 'sepas', 'sepa', 'sepamos', 'sepáis', 'sepan'],
  haber: ['haya', 'hayas', 'haya', 'hayamos', 'hayáis', 'hayan'],
};

/** Keeps the stem's final consonant sound before e: busc→busqu, lleg→llegu, empiez→empiec. */
const spanishSpelling = (infinitive: string, stem: string) => {
  if (infinitive.endsWith('car')) return stem.replace(/c$/, 'qu');
  if (infinitive.endsWith('gar')) return stem.replace(/g$/, 'gu');
  if (infinitive.endsWith('zar')) return stem.replace(/z$/, 'c');
  return stem;
};

const stripStemAccent = (stem: string) => stem.replace('í', 'i').replace('ú', 'u');

/**
 * nosotros/vosotros keep the yo stem (tengamos, pidamos, conozcamos) except when the yo stem
 * only differs by a boot-verb diphthong or accent (pensemos, volvamos, enviemos). In that case
 * -ir verbs still raise the stem vowel (sintamos, durmamos, muramos).
 */
const spanishPluralStem = (infinitive: string, yoStem: string, infinitiveStem: string, isIrVerb: boolean) => {
  if (yoStem === infinitiveStem) return yoStem;

  const diphthongs: Array<{ from: string; to: string; raised?: string }> = [
    { from: 'ie', to: 'e', raised: 'i' },
    { from: 'ue', to: 'o', raised: 'u' },
    { from: 'ue', to: 'u' },
  ];

  for (const { from, to, raised } of diphthongs) {
    const index = yoStem.indexOf(from);
    if (index !== -1 && yoStem.replace(from, to) === infinitiveStem) {
      return isIrVerb && raised
        ? `${infinitiveStem.slice(0, index)}${raised}${infinitiveStem.slice(index + 1)}`
        : infinitiveStem;
    }
  }

  if (stripStemAccent(yoStem) === infinitiveStem) return infinitiveStem;

  return yoStem;
};

export const spanishSubjunctive = (verb: BaseVerbEntry): PersonForms => {
  const irregular = spanishIrregular[verb.infinitive];
  if (irregular) {
    return toPersons(irregular);
  }

  const { infinitive } = verb;
  const yo = verb.forms.present.I;
  if (!yo.endsWith('o')) {
    unexpected(verb, `yo-present "${yo}" does not end in -o`);
  }

  const ending = stripStemAccent(infinitive.slice(-2));
  const vowel = ending === 'ar' ? 'e' : 'a';
  const yoStem = yo.slice(0, -1);
  const singularStem = spanishSpelling(infinitive, yoStem);
  const pluralStem = spanishSpelling(
    infinitive,
    spanishPluralStem(infinitive, yoStem, infinitive.slice(0, -2), ending === 'ir'),
  );

  return toPersons([
    `${singularStem}${vowel}`,
    `${singularStem}${vowel}s`,
    `${singularStem}${vowel}`,
    `${pluralStem}${vowel}mos`,
    `${pluralStem}${vowel === 'e' ? 'éis' : 'áis'}`,
    `${singularStem}${vowel}n`,
  ]);
};

const italianIrregular: Record<string, SixForms> = {
  essere: ['sia', 'sia', 'sia', 'siamo', 'siate', 'siano'],
  avere: ['abbia', 'abbia', 'abbia', 'abbiamo', 'abbiate', 'abbiano'],
  sapere: ['sappia', 'sappia', 'sappia', 'sappiamo', 'sappiate', 'sappiano'],
  andare: ['vada', 'vada', 'vada', 'andiamo', 'andiate', 'vadano'],
  fare: ['faccia', 'faccia', 'faccia', 'facciamo', 'facciate', 'facciano'],
  dare: ['dia', 'dia', 'dia', 'diamo', 'diate', 'diano'],
  stare: ['stia', 'stia', 'stia', 'stiamo', 'stiate', 'stiano'],
  dovere: ['debba', 'debba', 'debba', 'dobbiamo', 'dobbiate', 'debbano'],
};

/**
 * -are singulars equal the tu-present (parli, cerchi, studi); -ere/-ire singulars use the
 * io stem (veda, venga, finisca). noi matches the indicative and voi swaps -iamo for -iate.
 */
export const italianSubjunctive = (verb: BaseVerbEntry): PersonForms => {
  const irregular = italianIrregular[verb.infinitive];
  if (irregular) {
    return toPersons(irregular);
  }

  const we = verb.forms.present.we;
  if (!we.endsWith('iamo')) {
    unexpected(verb, `noi-present "${we}" does not end in -iamo`);
  }

  let singular: string;
  if (verb.infinitive.endsWith('are')) {
    singular = verb.forms.present.you;
  } else {
    const io = verb.forms.present.I;
    if (!io.endsWith('o')) {
      unexpected(verb, `io-present "${io}" does not end in -o`);
    }
    singular = `${io.slice(0, -1)}a`;
  }

  return toPersons([singular, singular, singular, we, `${we.slice(0, -4)}iate`, `${singular}no`]);
};

export const withSubjunctive = (
  verbs: BaseVerbEntry[],
  derive: (verb: BaseVerbEntry) => PersonForms,
) => verbs.map((verb) => ({ ...verb, forms: { ...verb.forms, subjunctive: derive(verb) } }));
