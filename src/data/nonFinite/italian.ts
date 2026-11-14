import type { NonFiniteVerbForms } from './types';

const regularAre = (
  infinitive: string,
  presentParticiple?: string,
  accepted?: NonFiniteVerbForms['accepted'],
): NonFiniteVerbForms => {
  const stem = infinitive.slice(0, -3);
  return {
    pastParticiple: `${stem}ato`,
    ...(presentParticiple ? { presentParticiple } : {}),
    gerund: `${stem}ando`,
    ...(accepted ? { accepted } : {}),
  };
};

const regularEre = (
  infinitive: string,
  presentParticiple?: string,
  accepted?: NonFiniteVerbForms['accepted'],
): NonFiniteVerbForms => {
  const stem = infinitive.slice(0, -3);
  return {
    pastParticiple: `${stem}uto`,
    ...(presentParticiple ? { presentParticiple } : {}),
    gerund: `${stem}endo`,
    ...(accepted ? { accepted } : {}),
  };
};

const regularIre = (
  infinitive: string,
  presentParticiple?: string,
  accepted?: NonFiniteVerbForms['accepted'],
): NonFiniteVerbForms => {
  const stem = infinitive.slice(0, -3);
  return {
    pastParticiple: `${stem}ito`,
    ...(presentParticiple ? { presentParticiple } : {}),
    gerund: `${stem}endo`,
    ...(accepted ? { accepted } : {}),
  };
};

const entry = (
  pastParticiple: string,
  gerund: string,
  presentParticiple?: string,
  accepted?: NonFiniteVerbForms['accepted'],
): NonFiniteVerbForms => ({
  pastParticiple,
  ...(presentParticiple ? { presentParticiple } : {}),
  gerund,
  ...(accepted ? { accepted } : {}),
});

export const italianNonFiniteForms: Record<string, NonFiniteVerbForms> = {
  // Auxiliary, modal, and core irregular verbs
  essere: entry('stato', 'essendo'),
  avere: entry('avuto', 'avendo', 'avente'),
  stare: entry('stato', 'stando', 'stante'),
  andare: entry('andato', 'andando', 'andante'),
  dare: entry('dato', 'dando'),
  fare: entry('fatto', 'facendo', 'facente'),
  dire: entry('detto', 'dicendo'),
  potere: entry('potuto', 'potendo', 'potente'),
  volere: entry('voluto', 'volendo', 'volente'),
  dovere: entry('dovuto', 'dovendo'),
  sapere: entry('saputo', 'sapendo', 'sapiente'),
  vedere: entry('visto', 'vedendo', 'vedente', { pastParticiple: ['veduto'] }),
  venire: entry('venuto', 'venendo'),
  bere: entry('bevuto', 'bevendo'),
  uscire: entry('uscito', 'uscendo', 'uscente'),
  rimanere: entry('rimasto', 'rimanendo', 'rimanente'),
  tenere: entry('tenuto', 'tenendo', 'tenente'),
  piacere: entry('piaciuto', 'piacendo'),
  tacere: entry('taciuto', 'tacendo'),
  cadere: entry('caduto', 'cadendo', 'cadente'),
  salire: entry('salito', 'salendo'),
  morire: entry('morto', 'morendo', 'morente'),
  nascere: entry('nato', 'nascendo', 'nascente'),
  vivere: entry('vissuto', 'vivendo', 'vivente'),
  conoscere: entry('conosciuto', 'conoscendo', 'conoscente'),

  // Irregular -ere / -ire / -rre past participles or stems
  prendere: entry('preso', 'prendendo'),
  mettere: entry('messo', 'mettendo'),
  permettere: entry('permesso', 'permettendo'),
  promettere: entry('promesso', 'promettendo', 'promettente'),
  leggere: entry('letto', 'leggendo'),
  scrivere: entry('scritto', 'scrivendo', 'scrivente'),
  rispondere: entry('risposto', 'rispondendo', 'rispondente'),
  aprire: entry('aperto', 'aprendo'),
  coprire: entry('coperto', 'coprendo', 'coprente'),
  scoprire: entry('scoperto', 'scoprendo'),
  offrire: entry('offerto', 'offrendo', 'offerente'),
  chiudere: entry('chiuso', 'chiudendo'),
  chiedere: entry('chiesto', 'chiedendo'),
  correre: entry('corso', 'correndo', 'corrente'),
  ridere: entry('riso', 'ridendo', 'ridente'),
  sorridere: entry('sorriso', 'sorridendo', 'sorridente'),
  piangere: entry('pianto', 'piangendo', 'piangente'),
  scegliere: entry('scelto', 'scegliendo'),
  togliere: entry('tolto', 'togliendo'),
  raccogliere: entry('raccolto', 'raccogliendo'),
  vincere: entry('vinto', 'vincendo', 'vincente'),
  rompere: entry('rotto', 'rompendo'),
  raggiungere: entry('raggiunto', 'raggiungendo'),
  aggiungere: entry('aggiunto', 'aggiungendo'),
  spegnere: entry('spento', 'spegnendo'),
  accendere: entry('acceso', 'accendendo'),
  muovere: entry('mosso', 'muovendo', 'movente'),
  scendere: entry('sceso', 'scendendo'),
  spendere: entry('speso', 'spendendo'),
  decidere: entry('deciso', 'decidendo'),
  nascondere: entry('nascosto', 'nascondendo'),
  proporre: entry('proposto', 'proponendo', 'proponente'),
  tradurre: entry('tradotto', 'traducendo'),
  produrre: entry('prodotto', 'producendo'),

  // Regular -are verbs
  parlare: regularAre('parlare', 'parlante'),
  amare: regularAre('amare', 'amante'),
  guardare: regularAre('guardare'),
  ascoltare: regularAre('ascoltare'),
  trovare: regularAre('trovare'),
  pensare: regularAre('pensare', 'pensante'),
  lavorare: regularAre('lavorare', 'lavorante'),
  camminare: regularAre('camminare'),
  domandare: regularAre('domandare'),
  portare: regularAre('portare', 'portante'),
  abitare: regularAre('abitare', 'abitante'),
  studiare: regularAre('studiare'),
  visitare: regularAre('visitare'),
  cantare: regularAre('cantare', 'cantante'),
  ballare: regularAre('ballare'),
  preparare: regularAre('preparare'),
  usare: regularAre('usare'),
  accettare: regularAre('accettare'),
  rifiutare: regularAre('rifiutare'),
  invitare: regularAre('invitare', 'invitante'),
  aiutare: regularAre('aiutare', 'aiutante'),
  comprare: regularAre('comprare'),
  mangiare: regularAre('mangiare'),
  pagare: regularAre('pagare', 'pagante'),
  giocare: regularAre('giocare'),
  cercare: regularAre('cercare'),
  entrare: regularAre('entrare', 'entrante'),
  tornare: regularAre('tornare', 'tornante'),
  arrivare: regularAre('arrivare'),
  suonare: regularAre('suonare', 'suonante'),
  cucinare: regularAre('cucinare'),
  lavare: regularAre('lavare'),
  svegliare: regularAre('svegliare'),
  spiegare: regularAre('spiegare'),
  regalare: regularAre('regalare'),
  mandare: regularAre('mandare', 'mandante'),
  incontrare: regularAre('incontrare'),
  aspettare: regularAre('aspettare'),
  volare: regularAre('volare', 'volante'),
  nuotare: regularAre('nuotare'),
  riposare: regularAre('riposare', 'riposante'),
  viaggiare: regularAre('viaggiare', 'viaggiante'),
  cambiare: regularAre('cambiare'),
  guidare: regularAre('guidare'),

  // Regular -ere verbs
  credere: regularEre('credere', 'credente'),
  vendere: regularEre('vendere'),
  ricevere: regularEre('ricevere', 'ricevente'),
  perdere: regularEre('perdere', 'perdente', { pastParticiple: ['perso'] }),
  temere: regularEre('temere'),
  battere: regularEre('battere', 'battente'),

  // Regular -ire verbs (including -isc- verbs, which do not take -isc- in non-finite forms)
  dormire: regularIre('dormire', 'dormiente'),
  sentire: regularIre('sentire'),
  servire: regularIre('servire', 'servente'),
  capire: regularIre('capire'),
  finire: regularIre('finire'),
  costruire: regularIre('costruire'),
  partire: regularIre('partire', 'partente'),
  pulire: regularIre('pulire'),
  vestire: regularIre('vestire'),
  seguire: regularIre('seguire', 'seguente'),
  preferire: regularIre('preferire'),
};
