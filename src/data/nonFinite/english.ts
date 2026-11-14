import type { NonFiniteForm, NonFiniteVerbForms } from './types';

type VerbSpec =
  | readonly [base: string, pastParticiple: string, presentParticiple: string]
  | readonly [
      base: string,
      pastParticiple: string,
      presentParticiple: string,
      accepted: Partial<Record<NonFiniteForm, readonly string[]>>,
    ];

const doubleFinalConsonantBases = new Set([
  'begin',
  'cut',
  'forget',
  'get',
  'hit',
  'let',
  'prefer',
  'put',
  'run',
  'shut',
  'sit',
  'stop',
  'swim',
  'win',
]);

const keepFinalEBases = new Set(['be', 'see']);

function buildPresentParticiple(base: string): string {
  if (keepFinalEBases.has(base)) return `${base}ing`;
  if (base.endsWith('e')) return `${base.slice(0, -1)}ing`;
  if (doubleFinalConsonantBases.has(base)) return `${base}${base.slice(-1)}ing`;
  return `${base}ing`;
}

function buildRegularPastParticiple(base: string): string {
  if (base.endsWith('e')) return `${base}d`;
  if (base.endsWith('y') && !/[aeiou]y$/.test(base)) return `${base.slice(0, -1)}ied`;
  if (doubleFinalConsonantBases.has(base)) return `${base}${base.slice(-1)}ed`;
  return `${base}ed`;
}

function regular(
  base: string,
  accepted?: Partial<Record<NonFiniteForm, readonly string[]>>,
): VerbSpec {
  const pastParticiple = buildRegularPastParticiple(base);
  const presentParticiple = buildPresentParticiple(base);
  return accepted ? [base, pastParticiple, presentParticiple, accepted] : [base, pastParticiple, presentParticiple];
}

function irregular(
  base: string,
  pastParticiple: string,
  presentParticiple = buildPresentParticiple(base),
  accepted?: Partial<Record<NonFiniteForm, readonly string[]>>,
): VerbSpec {
  return accepted ? [base, pastParticiple, presentParticiple, accepted] : [base, pastParticiple, presentParticiple];
}

const englishVerbSpecs: readonly VerbSpec[] = [
  irregular('be', 'been'),
  irregular('have', 'had'),
  irregular('go', 'gone'),
  irregular('do', 'done'),
  irregular('say', 'said'),
  irregular('make', 'made'),
  irregular('know', 'known'),
  irregular('think', 'thought'),
  irregular('take', 'taken'),
  irregular('see', 'seen'),
  irregular('come', 'come'),
  regular('want'),
  regular('use'),
  irregular('get', 'gotten', undefined, { pastParticiple: ['got'] }),
  irregular('give', 'given'),
  irregular('find', 'found'),
  irregular('tell', 'told'),
  regular('work'),
  regular('call'),
  regular('try'),
  regular('ask'),
  regular('need'),
  irregular('feel', 'felt'),
  irregular('become', 'become'),
  irregular('leave', 'left'),
  irregular('put', 'put'),
  irregular('mean', 'meant'),
  irregular('keep', 'kept'),
  irregular('let', 'let'),
  irregular('begin', 'begun'),
  regular('seem'),
  regular('help'),
  regular('talk'),
  regular('turn'),
  regular('start'),
  irregular('show', 'shown'),
  irregular('hear', 'heard'),
  regular('play'),
  irregular('run', 'run'),
  regular('move'),
  regular('live'),
  regular('believe'),
  irregular('bring', 'brought'),
  irregular('write', 'written'),
  irregular('sit', 'sat'),
  irregular('stand', 'stood'),
  irregular('lose', 'lost'),
  irregular('pay', 'paid'),
  irregular('meet', 'met'),
  regular('learn', { pastParticiple: ['learnt'] }),
  irregular('eat', 'eaten'),
  irregular('drink', 'drunk'),
  irregular('read', 'read'),
  irregular('buy', 'bought'),
  irregular('sleep', 'slept'),
  regular('love'),
  regular('like'),
  regular('watch'),
  regular('open'),
  regular('close'),
  irregular('speak', 'spoken'),
  irregular('understand', 'understood'),
  regular('walk'),
  regular('wait'),
  irregular('forget', 'forgotten'),
  regular('remember'),
  irregular('send', 'sent'),
  irregular('sing', 'sung'),
  regular('dance'),
  irregular('swim', 'swum'),
  irregular('fly', 'flown'),
  irregular('drive', 'driven'),
  irregular('ride', 'ridden'),
  regular('cook'),
  irregular('build', 'built'),
  irregular('grow', 'grown'),
  irregular('break', 'broken'),
  irregular('catch', 'caught'),
  regular('carry'),
  irregular('wear', 'worn'),
  irregular('sell', 'sold'),
  irregular('spend', 'spent'),
  irregular('teach', 'taught'),
  regular('visit'),
  regular('travel', { pastParticiple: ['travelled'], presentParticiple: ['travelling'] }),
  irregular('win', 'won'),
  regular('stop'),
  regular('laugh'),
  regular('listen'),
  regular('look'),
  regular('stay'),
  irregular('fall', 'fallen'),
  irregular('cut', 'cut'),
  irregular('hurt', 'hurt'),
  regular('hope'),
  regular('join'),
  regular('arrive'),
  regular('change'),
  irregular('choose', 'chosen'),
  regular('finish'),
  irregular('hold', 'held'),
  irregular('draw', 'drawn'),
  irregular('throw', 'thrown'),
  irregular('wake', 'woken'),
  irregular('rise', 'risen'),
  irregular('hide', 'hidden'),
  irregular('hit', 'hit'),
  irregular('cost', 'cost'),
  irregular('shut', 'shut'),
  irregular('lend', 'lent'),
  irregular('shake', 'shaken'),
  irregular('steal', 'stolen'),
  irregular('freeze', 'frozen'),
  irregular('ring', 'rung'),
  irregular('feed', 'fed'),
  irregular('lead', 'led'),
  irregular('fight', 'fought'),
  irregular('forgive', 'forgiven'),
  regular('translate'),
  regular('prefer'),
];

export const englishNonFiniteForms: Record<string, NonFiniteVerbForms> = Object.fromEntries(
  englishVerbSpecs.map(([base, pastParticiple, presentParticiple, accepted]) => [
    `to ${base}`,
    accepted
      ? { pastParticiple, presentParticiple, accepted }
      : { pastParticiple, presentParticiple },
  ]),
);
