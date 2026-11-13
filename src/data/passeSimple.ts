import type { Pronoun } from './verbs';

type Ending = 'i' | 'u' | 'in';

const stems: Partial<Record<string, [stem: string, ending: Ending]>> = {
  accueillir: ['accueill', 'i'],
  attendre: ['attend', 'i'], apprendre: ['appr', 'i'], battre: ['batt', 'i'],
  choisir: ['chois', 'i'], comprendre: ['compr', 'i'], conduire: ['conduis', 'i'],
  construire: ['construis', 'i'], couvrir: ['couvr', 'i'], craindre: ['craign', 'i'],
  découvrir: ['découvr', 'i'],
  dire: ['d', 'i'], dormir: ['dorm', 'i'], écrire: ['écriv', 'i'],
  entendre: ['entend', 'i'], éteindre: ['éteign', 'i'], faire: ['f', 'i'], finir: ['fin', 'i'],
  fuir: ['fu', 'i'], grandir: ['grand', 'i'], grossir: ['gross', 'i'], maigrir: ['maigr', 'i'],
  mentir: ['ment', 'i'], mettre: ['m', 'i'], naître: ['naqu', 'i'],
  obéir: ['obé', 'i'], offrir: ['offr', 'i'], ouvrir: ['ouvr', 'i'],
  partir: ['part', 'i'], peindre: ['peign', 'i'], perdre: ['perd', 'i'],
  permettre: ['perm', 'i'], prendre: ['pr', 'i'], produire: ['produis', 'i'],
  promettre: ['prom', 'i'],
  réfléchir: ['réfléch', 'i'], rejoindre: ['rejoign', 'i'], remplir: ['rempl', 'i'], rendre: ['rend', 'i'],
  répondre: ['répond', 'i'], réussir: ['réuss', 'i'], rire: ['r', 'i'],
  rompre: ['romp', 'i'], sentir: ['sent', 'i'], servir: ['serv', 'i'],
  sortir: ['sort', 'i'], souffrir: ['souffr', 'i'], sourire: ['sour', 'i'],
  suivre: ['suiv', 'i'], traduire: ['traduis', 'i'], vendre: ['vend', 'i'], vieillir: ['vieill', 'i'], voir: ['v', 'i'],

  avoir: ['e', 'u'], boire: ['b', 'u'], connaître: ['conn', 'u'],
  courir: ['cour', 'u'], croire: ['cr', 'u'], devoir: ['d', 'u'],
  être: ['f', 'u'], lire: ['l', 'u'], mourir: ['mour', 'u'],
  paraître: ['par', 'u'], plaire: ['pl', 'u'],
  pouvoir: ['p', 'u'], recevoir: ['reç', 'u'], résoudre: ['résol', 'u'], savoir: ['s', 'u'],
  valoir: ['val', 'u'], vivre: ['véc', 'u'], vouloir: ['voul', 'u'],

  devenir: ['dev', 'in'], obtenir: ['obt', 'in'], revenir: ['rev', 'in'], tenir: ['t', 'in'], venir: ['v', 'in'],
};

const endings = {
  i: ['is', 'is', 'it', 'îmes', 'îtes', 'irent'],
  u: ['us', 'us', 'ut', 'ûmes', 'ûtes', 'urent'],
  in: ['ins', 'ins', 'int', 'înmes', 'întes', 'inrent'],
} as const;

export function frenchPasseSimple(infinitive: string): Record<Pronoun, string> {
  if (infinitive.endsWith('er')) {
    const stem = infinitive.slice(0, -2);
    // Keep the soft c or g before a/â. The -èrent ending needs neither change.
    const aStem = stem.replace(/c$/, 'ç').replace(/g$/, 'ge');
    return {
      I: `${aStem}ai`, you: `${aStem}as`, 'he/she': `${aStem}a`,
      we: `${aStem}âmes`, 'you plural': `${aStem}âtes`, they: `${stem}èrent`,
    };
  }

  const pattern = stems[infinitive];
  if (!pattern) throw new Error(`Missing passé simple stem for ${infinitive}`);
  const [stem, ending] = pattern;
  const [first, second, third, firstPlural, secondPlural, thirdPlural] = endings[ending];
  return {
    I: stem + first, you: stem + second, 'he/she': stem + third,
    we: stem + firstPlural, 'you plural': stem + secondPlural, they: stem + thirdPlural,
  };
}
