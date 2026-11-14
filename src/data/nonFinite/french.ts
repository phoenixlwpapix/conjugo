import type { NonFiniteVerbForms } from './types';

const regularErVerbs = [
  'parler', 'aimer', 'regarder', 'écouter', 'chercher', 'trouver', 'donner', 'penser',
  'travailler', 'jouer', 'marcher', 'demander', 'fermer', 'porter', 'habiter', 'étudier',
  'visiter', 'chanter', 'danser', 'préparer', 'gagner', 'oublier', 'expliquer', 'présenter',
  'utiliser', 'manger', 'acheter', 'payer', 'rester', 'envoyer', 'essayer', 'tomber',
  'arriver', 'monter', 'rentrer', 'voyager', 'commencer', 'aider', 'laver', 'rencontrer',
  'traverser', 'appeler', 'préférer',
] as const;

const regularIrVerbs = [
  'finir', 'choisir', 'réussir', 'remplir', 'grandir', 'réfléchir',
  'grossir', 'maigrir', 'vieillir', 'obéir',
] as const;

const regularReVerbs = [
  'vendre', 'attendre', 'répondre', 'perdre', 'rendre', 'entendre', 'rompre',
] as const;

const irregularNonFinitePairs: Record<string, readonly [pastParticiple: string, presentParticiple: string]> = {
  // Auxiliaries, modals, and aller
  être: ['été', 'étant'],
  avoir: ['eu', 'ayant'],
  aller: ['allé', 'allant'],
  faire: ['fait', 'faisant'],
  dire: ['dit', 'disant'],
  pouvoir: ['pu', 'pouvant'],
  vouloir: ['voulu', 'voulant'],
  savoir: ['su', 'sachant'],
  devoir: ['dû', 'devant'],
  valoir: ['valu', 'valant'],

  // Irregular -oir / -re perception and cognition
  voir: ['vu', 'voyant'],
  croire: ['cru', 'croyant'],
  boire: ['bu', 'buvant'],
  lire: ['lu', 'lisant'],
  écrire: ['écrit', 'écrivant'],
  connaître: ['connu', 'connaissant'],
  paraître: ['paru', 'paraissant'],
  naître: ['né', 'naissant'],
  vivre: ['vécu', 'vivant'],
  plaire: ['plu', 'plaisant'],
  rire: ['ri', 'riant'],
  sourire: ['souri', 'souriant'],
  suivre: ['suivi', 'suivant'],
  résoudre: ['résolu', 'résolvant'],
  recevoir: ['reçu', 'recevant'],

  // -prendre, -mettre, -battre
  prendre: ['pris', 'prenant'],
  comprendre: ['compris', 'comprenant'],
  apprendre: ['appris', 'apprenant'],
  mettre: ['mis', 'mettant'],
  permettre: ['permis', 'permettant'],
  promettre: ['promis', 'promettant'],
  battre: ['battu', 'battant'],

  // -uire and -aindre / -eindre / -oindre
  conduire: ['conduit', 'conduisant'],
  construire: ['construit', 'construisant'],
  traduire: ['traduit', 'traduisant'],
  produire: ['produit', 'produisant'],
  craindre: ['craint', 'craignant'],
  peindre: ['peint', 'peignant'],
  éteindre: ['éteint', 'éteignant'],
  rejoindre: ['rejoint', 'rejoignant'],

  // Irregular -ir verbs
  venir: ['venu', 'venant'],
  devenir: ['devenu', 'devenant'],
  revenir: ['revenu', 'revenant'],
  tenir: ['tenu', 'tenant'],
  obtenir: ['obtenu', 'obtenant'],
  dormir: ['dormi', 'dormant'],
  partir: ['parti', 'partant'],
  sortir: ['sorti', 'sortant'],
  sentir: ['senti', 'sentant'],
  servir: ['servi', 'servant'],
  mentir: ['menti', 'mentant'],
  ouvrir: ['ouvert', 'ouvrant'],
  offrir: ['offert', 'offrant'],
  découvrir: ['découvert', 'découvrant'],
  souffrir: ['souffert', 'souffrant'],
  couvrir: ['couvert', 'couvrant'],
  accueillir: ['accueilli', 'accueillant'],
  courir: ['couru', 'courant'],
  mourir: ['mort', 'mourant'],
  fuir: ['fui', 'fuyant'],
};

function buildErForms(infinitive: string): NonFiniteVerbForms {
  const stem = infinitive.slice(0, -2);
  // Keep soft c/g before -ant (e.g. commençant, mangeant).
  const antStem = stem.replace(/c$/, 'ç').replace(/g$/, 'ge');
  return {
    pastParticiple: `${stem}é`,
    presentParticiple: `${antStem}ant`,
  };
}

function buildIrForms(infinitive: string): NonFiniteVerbForms {
  const stem = infinitive.slice(0, -2);
  return {
    pastParticiple: `${stem}i`,
    presentParticiple: `${stem}issant`,
  };
}

function buildReForms(infinitive: string): NonFiniteVerbForms {
  const stem = infinitive.slice(0, -2);
  return {
    pastParticiple: `${stem}u`,
    presentParticiple: `${stem}ant`,
  };
}

export const frenchNonFiniteForms: Record<string, NonFiniteVerbForms> = {
  ...Object.fromEntries(regularErVerbs.map((verb) => [verb, buildErForms(verb)])),
  ...Object.fromEntries(regularIrVerbs.map((verb) => [verb, buildIrForms(verb)])),
  ...Object.fromEntries(regularReVerbs.map((verb) => [verb, buildReForms(verb)])),
  ...Object.fromEntries(
    Object.entries(irregularNonFinitePairs).map(([verb, [pastParticiple, presentParticiple]]) => [
      verb,
      { pastParticiple, presentParticiple },
    ]),
  ),
};
