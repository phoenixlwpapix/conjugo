import { spanishImperfectSubjunctive } from './imperfectSubjunctive';
import { isImperative, withImperative } from './imperative';
import { frenchPasseSimple } from './passeSimple';
import { nonFiniteFormsByLanguage } from './nonFinite/forms';
import { isNonFiniteForm, type NonFiniteForm, type NonFiniteVerbForms } from './nonFinite/types';
import { englishSubjunctive, frenchSubjunctive, italianSubjunctive, spanishSubjunctive, withSubjunctive } from './subjunctive';

export type LanguageId = 'english' | 'french' | 'spanish' | 'italian';
export type TenseId = 'present' | 'past' | 'passeSimple' | 'imperfect' | 'future' | 'conditional' | 'subjunctive' | 'imperfectSubjunctive' | 'imperative' | 'imperativeNegative' | NonFiniteForm;
export type PracticeTenseId = TenseId | 'commands' | 'nonFinite' | 'mixed';
export type Pronoun = 'I' | 'you' | 'he/she' | 'we' | 'you plural' | 'they';

export type VerbEntry = {
  infinitive: string;
  translation: string;
  forms: Record<TenseId, Record<Pronoun, string>>;
  imperfectSubjunctiveSe?: Record<Pronoun, string>;
  nonFinite?: NonFiniteVerbForms;
};

/** Authored forms before adding derived tenses and moods. */
export type BaseVerbEntry = {
  infinitive: string;
  translation: string;
  forms: Omit<VerbEntry['forms'], 'passeSimple' | 'subjunctive' | 'imperfectSubjunctive' | 'imperative' | 'imperativeNegative' | NonFiniteForm>;
};

export type Language = {
  id: LanguageId;
  name: string;
  nativeName: string;
  accent: string;
  darkAccent: string;
  pronounLabels: Record<Pronoun, string>;
  tenseLabels: Record<PracticeTenseId, string>;
  verbs: VerbEntry[];
  /** Pronouns hidden by learner preferences (e.g. Spanish vosotros). */
  excludedPronouns?: Pronoun[];
};

type Forms = BaseVerbEntry['forms'];

export const concreteTenses: Array<{ id: TenseId; label: string }> = [
  { id: 'present', label: 'Present' },
  { id: 'past', label: 'Past' },
  { id: 'passeSimple', label: 'Simple past' },
  { id: 'imperfect', label: 'Imperfect' },
  { id: 'future', label: 'Future' },
  { id: 'conditional', label: 'Conditional' },
  { id: 'subjunctive', label: 'Subjunctive' },
  { id: 'imperfectSubjunctive', label: 'Imperfect subjunctive' },
  { id: 'imperative', label: 'Affirmative imperative' },
  { id: 'imperativeNegative', label: 'Negative imperative' },
  { id: 'pastParticiple', label: 'Past participle' },
  { id: 'presentParticiple', label: 'Present participle' },
  { id: 'gerund', label: 'Gerund' },
];

/** English drills only cover the tenses it marks with distinct verb forms. */
const englishTenses: TenseId[] = ['present', 'past', 'future'];

export const isTenseAvailable = (languageId: LanguageId, tense: TenseId) => {
  if (tense === 'pastParticiple') return true;
  if (tense === 'presentParticiple') return languageId === 'english' || languageId === 'french';
  if (tense === 'gerund') return languageId === 'spanish' || languageId === 'italian';
  if (tense === 'passeSimple') return languageId === 'french';
  if (tense === 'imperfectSubjunctive') return languageId === 'spanish';
  return languageId !== 'english' || englishTenses.includes(tense);
};

export const getLanguageTenses = (languageId: LanguageId) =>
  concreteTenses.filter((tense) => isTenseAvailable(languageId, tense.id));

/** Practice groups both command polarities while reference tables keep their concrete forms. */
export const getLanguagePracticeTenses = (languageId: LanguageId): Array<{ id: PracticeTenseId; label: string }> => [
  ...getLanguageTenses(languageId).filter(({ id }) => !isImperative(id) && !isNonFiniteForm(id)),
  ...(languageId === 'english' ? [] : [{ id: 'commands' as const, label: 'Imperative' }]),
  { id: 'nonFinite', label: 'Non-finite forms' },
];

export const tenseOptions: Array<{ id: PracticeTenseId; label: string }> = [
  ...concreteTenses,
  { id: 'mixed', label: 'Mixed' },
];

export const pronouns: Pronoun[] = ['I', 'you', 'he/she', 'we', 'you plural', 'they'];

export const getLanguagePronouns = (language: Pick<Language, 'excludedPronouns'>): Pronoun[] =>
  language.excludedPronouns?.length ? pronouns.filter((pronoun) => !language.excludedPronouns?.includes(pronoun)) : pronouns;

/** Spanish address pronouns use third-person forms. Commands only show the addressee. */
export const getConjugationPronounLabel = (language: Language, tense: TenseId, pronoun: Pronoun): string => {
  if (isNonFiniteForm(tense)) return '';
  const label = language.pronounLabels[pronoun];
  if (language.id === 'spanish' && (pronoun === 'he/she' || pronoun === 'they')) {
    const addressee = pronoun === 'he/she' ? 'usted' : 'ustedes';
    return isImperative(tense) ? addressee : `${label}/${addressee}`;
  }
  if (language.id === 'italian' && pronoun === 'he/she') return isImperative(tense) ? 'Lei' : `${label}/Lei`;
  return label;
};

export const getConjugationPronouns = (language: Language, tense: TenseId, verb?: VerbEntry): Pronoun[] =>
  getLanguagePronouns(language).filter((pronoun) => {
    // Keep one storage slot per non-finite form for practice, quiz and review.
    if (isNonFiniteForm(tense)) return isTenseAvailable(language.id, tense) && pronoun === 'he/she' && (!verb || Boolean(verb.nonFinite?.[tense]));
    if (tense === 'imperfectSubjunctive' || tense === 'passeSimple') return isTenseAvailable(language.id, tense);
    if (!isImperative(tense)) return true;
    if (verb) return Boolean(verb.forms[tense][pronoun]);
    return language.verbs.some((entry) => Boolean(entry.forms[tense][pronoun]));
  });

const verb = (infinitive: string, translation: string, forms: Forms): BaseVerbEntry => ({
  infinitive,
  translation,
  forms,
});

const englishVerb = (base: string, translation: string, presentThird: string, past: string) =>
  verb(`to ${base}`, translation, {
    present: { I: base, you: base, 'he/she': presentThird, we: base, 'you plural': base, they: base },
    past: { I: past, you: past, 'he/she': past, we: past, 'you plural': past, they: past },
    imperfect: { I: past, you: past, 'he/she': past, we: past, 'you plural': past, they: past },
    future: { I: `will ${base}`, you: `will ${base}`, 'he/she': `will ${base}`, we: `will ${base}`, 'you plural': `will ${base}`, they: `will ${base}` },
    conditional: { I: `would ${base}`, you: `would ${base}`, 'he/she': `would ${base}`, we: `would ${base}`, 'you plural': `would ${base}`, they: `would ${base}` },
  });

const frenchImperfect = (stem: string) => ({
  I: `${stem}ais`,
  you: `${stem}ais`,
  'he/she': `${stem}ait`,
  we: `${stem}ions`,
  'you plural': `${stem}iez`,
  they: `${stem}aient`,
});

const frenchConditional = (futureStem: string) => frenchImperfect(futureStem);

const spanishArImperfect = (stem: string) => ({
  I: `${stem}aba`,
  you: `${stem}abas`,
  'he/she': `${stem}aba`,
  we: `${stem}ábamos`,
  'you plural': `${stem}abais`,
  they: `${stem}aban`,
});

const spanishErIrImperfect = (stem: string) => ({
  I: `${stem}ía`,
  you: `${stem}ías`,
  'he/she': `${stem}ía`,
  we: `${stem}íamos`,
  'you plural': `${stem}íais`,
  they: `${stem}ían`,
});

const spanishConditional = (stem: string) => spanishErIrImperfect(stem);

const italianAreImperfect = (stem: string) => ({
  I: `${stem}avo`,
  you: `${stem}avi`,
  'he/she': `${stem}ava`,
  we: `${stem}avamo`,
  'you plural': `${stem}avate`,
  they: `${stem}avano`,
});

const italianEreImperfect = (stem: string) => ({
  I: `${stem}evo`,
  you: `${stem}evi`,
  'he/she': `${stem}eva`,
  we: `${stem}evamo`,
  'you plural': `${stem}evate`,
  they: `${stem}evano`,
});

const italianIreImperfect = (stem: string) => ({
  I: `${stem}ivo`,
  you: `${stem}ivi`,
  'he/she': `${stem}iva`,
  we: `${stem}ivamo`,
  'you plural': `${stem}ivate`,
  they: `${stem}ivano`,
});

const italianConditional = (stem: string) => ({
  I: `${stem}ei`,
  you: `${stem}esti`,
  'he/she': `${stem}ebbe`,
  we: `${stem}emmo`,
  'you plural': `${stem}este`,
  they: `${stem}ebbero`,
});

const frenchFuture = (stem: string) => ({
  I: `${stem}ai`,
  you: `${stem}as`,
  'he/she': `${stem}a`,
  we: `${stem}ons`,
  'you plural': `${stem}ez`,
  they: `${stem}ont`,
});

const frenchCompound = (participle: string) => ({
  I: `ai ${participle}`,
  you: `as ${participle}`,
  'he/she': `a ${participle}`,
  we: `avons ${participle}`,
  'you plural': `avez ${participle}`,
  they: `ont ${participle}`,
});

const frenchErVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -2);

  return verb(infinitive, translation, {
    present: { I: `${stem}e`, you: `${stem}es`, 'he/she': `${stem}e`, we: `${stem}ons`, 'you plural': `${stem}ez`, they: `${stem}ent` },
    past: frenchCompound(`${stem}é`),
    imperfect: frenchImperfect(stem),
    future: frenchFuture(infinitive),
    conditional: frenchConditional(infinitive),
  });
};

const frenchIrVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -2);

  return verb(infinitive, translation, {
    present: { I: `${stem}is`, you: `${stem}is`, 'he/she': `${stem}it`, we: `${stem}issons`, 'you plural': `${stem}issez`, they: `${stem}issent` },
    past: frenchCompound(`${stem}i`),
    imperfect: frenchImperfect(`${stem}iss`),
    future: frenchFuture(infinitive),
    conditional: frenchConditional(infinitive),
  });
};

const frenchReVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -2);
  const futureStem = infinitive.slice(0, -1);

  return verb(infinitive, translation, {
    present: { I: `${stem}s`, you: `${stem}s`, 'he/she': stem, we: `${stem}ons`, 'you plural': `${stem}ez`, they: `${stem}ent` },
    past: frenchCompound(`${stem}u`),
    imperfect: frenchImperfect(stem),
    future: frenchFuture(futureStem),
    conditional: frenchConditional(futureStem),
  });
};

const spanishFuture = (stem: string) => ({
  I: `${stem}é`,
  you: `${stem}ás`,
  'he/she': `${stem}á`,
  we: `${stem}emos`,
  'you plural': `${stem}éis`,
  they: `${stem}án`,
});

const spanishArVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -2);

  return verb(infinitive, translation, {
    present: { I: `${stem}o`, you: `${stem}as`, 'he/she': `${stem}a`, we: `${stem}amos`, 'you plural': `${stem}áis`, they: `${stem}an` },
    past: { I: `${stem}é`, you: `${stem}aste`, 'he/she': `${stem}ó`, we: `${stem}amos`, 'you plural': `${stem}asteis`, they: `${stem}aron` },
    imperfect: spanishArImperfect(stem),
    future: spanishFuture(infinitive),
    conditional: spanishConditional(infinitive),
  });
};

const spanishErVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -2);

  return verb(infinitive, translation, {
    present: { I: `${stem}o`, you: `${stem}es`, 'he/she': `${stem}e`, we: `${stem}emos`, 'you plural': `${stem}éis`, they: `${stem}en` },
    past: { I: `${stem}í`, you: `${stem}iste`, 'he/she': `${stem}ió`, we: `${stem}imos`, 'you plural': `${stem}isteis`, they: `${stem}ieron` },
    imperfect: spanishErIrImperfect(stem),
    future: spanishFuture(infinitive),
    conditional: spanishConditional(infinitive),
  });
};

const spanishIrVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -2);

  return verb(infinitive, translation, {
    present: { I: `${stem}o`, you: `${stem}es`, 'he/she': `${stem}e`, we: `${stem}imos`, 'you plural': `${stem}ís`, they: `${stem}en` },
    past: { I: `${stem}í`, you: `${stem}iste`, 'he/she': `${stem}ió`, we: `${stem}imos`, 'you plural': `${stem}isteis`, they: `${stem}ieron` },
    imperfect: spanishErIrImperfect(stem),
    future: spanishFuture(infinitive),
    conditional: spanishConditional(infinitive),
  });
};

const italianFuture = (stem: string) => ({
  I: `${stem}ò`,
  you: `${stem}ai`,
  'he/she': `${stem}à`,
  we: `${stem}emo`,
  'you plural': `${stem}ete`,
  they: `${stem}anno`,
});

const italianCompound = (participle: string) => ({
  I: `ho ${participle}`,
  you: `hai ${participle}`,
  'he/she': `ha ${participle}`,
  we: `abbiamo ${participle}`,
  'you plural': `avete ${participle}`,
  they: `hanno ${participle}`,
});

const italianAreVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -3);
  // -iare/-ciare/-giare verbs: "tu" drops the duplicated i (studi, mangi),
  // "noi" keeps a single i (studiamo, mangiamo), and the future/conditional
  // stem drops the i after ci/gi (mangerò, comincerò) but keeps it elsewhere (studierò).
  const softStem = stem.endsWith('i');
  const futureStem = stem.endsWith('ci') || stem.endsWith('gi') ? stem.slice(0, -1) : stem;

  return verb(infinitive, translation, {
    present: { I: `${stem}o`, you: softStem ? stem : `${stem}i`, 'he/she': `${stem}a`, we: softStem ? `${stem.slice(0, -1)}iamo` : `${stem}iamo`, 'you plural': `${stem}ate`, they: `${stem}ano` },
    past: italianCompound(`${stem}ato`),
    imperfect: italianAreImperfect(stem),
    future: italianFuture(`${futureStem}er`),
    conditional: italianConditional(`${futureStem}er`),
  });
};

const italianEreVerb = (infinitive: string, translation: string, pastParticiple?: string) => {
  const stem = infinitive.slice(0, -3);

  return verb(infinitive, translation, {
    present: { I: `${stem}o`, you: `${stem}i`, 'he/she': `${stem}e`, we: `${stem}iamo`, 'you plural': `${stem}ete`, they: `${stem}ono` },
    past: italianCompound(pastParticiple ?? `${stem}uto`),
    imperfect: italianEreImperfect(stem),
    future: italianFuture(infinitive.slice(0, -1)),
    conditional: italianConditional(infinitive.slice(0, -1)),
  });
};

const italianIreVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -3);

  return verb(infinitive, translation, {
    present: { I: `${stem}o`, you: `${stem}i`, 'he/she': `${stem}e`, we: `${stem}iamo`, 'you plural': `${stem}ite`, they: `${stem}ono` },
    past: italianCompound(`${stem}ito`),
    imperfect: italianIreImperfect(stem),
    future: italianFuture(infinitive.slice(0, -1)),
    conditional: italianConditional(infinitive.slice(0, -1)),
  });
};

const italianIscVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -3);

  return verb(infinitive, translation, {
    present: { I: `${stem}isco`, you: `${stem}isci`, 'he/she': `${stem}isce`, we: `${stem}iamo`, 'you plural': `${stem}ite`, they: `${stem}iscono` },
    past: italianCompound(`${stem}ito`),
    imperfect: italianIreImperfect(stem),
    future: italianFuture(infinitive.slice(0, -1)),
    conditional: italianConditional(infinitive.slice(0, -1)),
  });
};

const englishVerbs: BaseVerbEntry[] = [
  verb('to be', '是 / 存在', {
    present: { I: 'am', you: 'are', 'he/she': 'is', we: 'are', 'you plural': 'are', they: 'are' },
    past: { I: 'was', you: 'were', 'he/she': 'was', we: 'were', 'you plural': 'were', they: 'were' },
    imperfect: { I: 'was', you: 'were', 'he/she': 'was', we: 'were', 'you plural': 'were', they: 'were' },
    future: { I: 'will be', you: 'will be', 'he/she': 'will be', we: 'will be', 'you plural': 'will be', they: 'will be' },
    conditional: { I: 'would be', you: 'would be', 'he/she': 'would be', we: 'would be', 'you plural': 'would be', they: 'would be' },
  }),
  englishVerb('have', '有', 'has', 'had'),
  englishVerb('go', '去', 'goes', 'went'),
  englishVerb('do', '做', 'does', 'did'),
  englishVerb('say', '说', 'says', 'said'),
  englishVerb('make', '制作 / 使', 'makes', 'made'),
  englishVerb('know', '知道', 'knows', 'knew'),
  englishVerb('think', '想 / 认为', 'thinks', 'thought'),
  englishVerb('take', '拿 / 带', 'takes', 'took'),
  englishVerb('see', '看见', 'sees', 'saw'),
  englishVerb('come', '来', 'comes', 'came'),
  englishVerb('want', '想要', 'wants', 'wanted'),
  englishVerb('use', '使用', 'uses', 'used'),
  englishVerb('get', '得到 / 到达', 'gets', 'got'),
  englishVerb('give', '给', 'gives', 'gave'),
  englishVerb('find', '找到', 'finds', 'found'),
  englishVerb('tell', '告诉', 'tells', 'told'),
  englishVerb('work', '工作', 'works', 'worked'),
  englishVerb('call', '打电话 / 称呼', 'calls', 'called'),
  englishVerb('try', '尝试', 'tries', 'tried'),
  englishVerb('ask', '问', 'asks', 'asked'),
  englishVerb('need', '需要', 'needs', 'needed'),
  englishVerb('feel', '感觉', 'feels', 'felt'),
  englishVerb('become', '变成', 'becomes', 'became'),
  englishVerb('leave', '离开', 'leaves', 'left'),
  englishVerb('put', '放置', 'puts', 'put'),
  englishVerb('mean', '意思是', 'means', 'meant'),
  englishVerb('keep', '保持', 'keeps', 'kept'),
  englishVerb('let', '让', 'lets', 'let'),
  englishVerb('begin', '开始', 'begins', 'began'),
  englishVerb('seem', '似乎', 'seems', 'seemed'),
  englishVerb('help', '帮助', 'helps', 'helped'),
  englishVerb('talk', '谈话', 'talks', 'talked'),
  englishVerb('turn', '转向 / 变成', 'turns', 'turned'),
  englishVerb('start', '开始', 'starts', 'started'),
  englishVerb('show', '展示', 'shows', 'showed'),
  englishVerb('hear', '听见', 'hears', 'heard'),
  englishVerb('play', '玩 / 演奏', 'plays', 'played'),
  englishVerb('run', '跑 / 运营', 'runs', 'ran'),
  englishVerb('move', '移动', 'moves', 'moved'),
  englishVerb('live', '生活 / 居住', 'lives', 'lived'),
  englishVerb('believe', '相信', 'believes', 'believed'),
  englishVerb('bring', '带来', 'brings', 'brought'),
  englishVerb('write', '写', 'writes', 'wrote'),
  englishVerb('sit', '坐', 'sits', 'sat'),
  englishVerb('stand', '站立', 'stands', 'stood'),
  englishVerb('lose', '失去 / 输', 'loses', 'lost'),
  englishVerb('pay', '支付', 'pays', 'paid'),
  englishVerb('meet', '遇见', 'meets', 'met'),
  englishVerb('learn', '学习', 'learns', 'learned'),
  englishVerb('eat', '吃', 'eats', 'ate'),
  englishVerb('drink', '喝', 'drinks', 'drank'),
  englishVerb('read', '读', 'reads', 'read'),
  englishVerb('buy', '买', 'buys', 'bought'),
  englishVerb('sleep', '睡觉', 'sleeps', 'slept'),
  englishVerb('love', '爱', 'loves', 'loved'),
  englishVerb('like', '喜欢', 'likes', 'liked'),
  englishVerb('watch', '观看', 'watches', 'watched'),
  englishVerb('open', '打开', 'opens', 'opened'),
  englishVerb('close', '关闭', 'closes', 'closed'),
  englishVerb('speak', '说 / 讲', 'speaks', 'spoke'),
  englishVerb('understand', '理解', 'understands', 'understood'),
  englishVerb('walk', '走路', 'walks', 'walked'),
  englishVerb('wait', '等待', 'waits', 'waited'),
  englishVerb('forget', '忘记', 'forgets', 'forgot'),
  englishVerb('remember', '记得', 'remembers', 'remembered'),
  englishVerb('send', '发送', 'sends', 'sent'),
  englishVerb('sing', '唱歌', 'sings', 'sang'),
  englishVerb('dance', '跳舞', 'dances', 'danced'),
  englishVerb('swim', '游泳', 'swims', 'swam'),
  englishVerb('fly', '飞', 'flies', 'flew'),
  englishVerb('drive', '驾驶', 'drives', 'drove'),
  englishVerb('ride', '骑', 'rides', 'rode'),
  englishVerb('cook', '做饭', 'cooks', 'cooked'),
  englishVerb('build', '建造', 'builds', 'built'),
  englishVerb('grow', '生长 / 种植', 'grows', 'grew'),
  englishVerb('break', '打破', 'breaks', 'broke'),
  englishVerb('catch', '抓住', 'catches', 'caught'),
  englishVerb('carry', '携带', 'carries', 'carried'),
  englishVerb('wear', '穿', 'wears', 'wore'),
  englishVerb('sell', '卖', 'sells', 'sold'),
  englishVerb('spend', '花费', 'spends', 'spent'),
  englishVerb('teach', '教', 'teaches', 'taught'),
  englishVerb('visit', '参观 / 拜访', 'visits', 'visited'),
  englishVerb('travel', '旅行', 'travels', 'traveled'),
  englishVerb('win', '赢', 'wins', 'won'),
  englishVerb('stop', '停止', 'stops', 'stopped'),
  englishVerb('laugh', '笑', 'laughs', 'laughed'),
  englishVerb('listen', '听', 'listens', 'listened'),
  englishVerb('look', '看', 'looks', 'looked'),
  englishVerb('stay', '停留', 'stays', 'stayed'),
  englishVerb('fall', '跌倒 / 掉落', 'falls', 'fell'),
  englishVerb('cut', '切', 'cuts', 'cut'),
  englishVerb('hurt', '伤害', 'hurts', 'hurt'),
  englishVerb('hope', '希望', 'hopes', 'hoped'),
  englishVerb('join', '加入', 'joins', 'joined'),
  englishVerb('arrive', '到达', 'arrives', 'arrived'),
  englishVerb('change', '改变', 'changes', 'changed'),
  englishVerb('choose', '选择', 'chooses', 'chose'),
  englishVerb('finish', '完成', 'finishes', 'finished'),
  englishVerb('hold', '拿着 / 握住', 'holds', 'held'),
  englishVerb('draw', '画 / 拉', 'draws', 'drew'),
  englishVerb('throw', '扔 / 投', 'throws', 'threw'),
  englishVerb('wake', '醒 / 叫醒', 'wakes', 'woke'),
  englishVerb('rise', '升起 / 增加', 'rises', 'rose'),
  englishVerb('hide', '藏 / 躲藏', 'hides', 'hid'),
  englishVerb('hit', '击打 / 碰撞', 'hits', 'hit'),
  englishVerb('cost', '花费 / 值', 'costs', 'cost'),
  englishVerb('shut', '关上 / 闭拢', 'shuts', 'shut'),
  englishVerb('lend', '借出', 'lends', 'lent'),
  englishVerb('shake', '摇晃 / 握手', 'shakes', 'shook'),
  englishVerb('steal', '偷窃', 'steals', 'stole'),
  englishVerb('freeze', '结冰 / 冻住', 'freezes', 'froze'),
  englishVerb('ring', '响铃 / 打电话', 'rings', 'rang'),
  englishVerb('feed', '喂养', 'feeds', 'fed'),
  englishVerb('lead', '带领 / 引导', 'leads', 'led'),
  englishVerb('fight', '战斗 / 争吵', 'fights', 'fought'),
  englishVerb('forgive', '原谅', 'forgives', 'forgave'),
  englishVerb('translate', '翻译', 'translates', 'translated'),
  englishVerb('prefer', '更喜欢 / 宁愿', 'prefers', 'preferred'),
];

const frenchVerbs: BaseVerbEntry[] = [
  verb('être', '是 / 存在', {
    present: { I: 'suis', you: 'es', 'he/she': 'est', we: 'sommes', 'you plural': 'êtes', they: 'sont' },
    past: { I: 'ai été', you: 'as été', 'he/she': 'a été', we: 'avons été', 'you plural': 'avez été', they: 'ont été' },
    imperfect: frenchImperfect('ét'),
    future: { I: 'serai', you: 'seras', 'he/she': 'sera', we: 'serons', 'you plural': 'serez', they: 'seront' },
    conditional: frenchConditional('ser'),
  }),
  verb('avoir', '有', {
    present: { I: 'ai', you: 'as', 'he/she': 'a', we: 'avons', 'you plural': 'avez', they: 'ont' },
    past: { I: 'ai eu', you: 'as eu', 'he/she': 'a eu', we: 'avons eu', 'you plural': 'avez eu', they: 'ont eu' },
    imperfect: frenchImperfect('av'),
    future: { I: 'aurai', you: 'auras', 'he/she': 'aura', we: 'aurons', 'you plural': 'aurez', they: 'auront' },
    conditional: frenchConditional('aur'),
  }),
  verb('aller', '去', {
    present: { I: 'vais', you: 'vas', 'he/she': 'va', we: 'allons', 'you plural': 'allez', they: 'vont' },
    past: { I: 'suis allé', you: 'es allé', 'he/she': 'est allé', we: 'sommes allés', 'you plural': 'êtes allés', they: 'sont allés' },
    imperfect: frenchImperfect('all'),
    future: { I: 'irai', you: 'iras', 'he/she': 'ira', we: 'irons', 'you plural': 'irez', they: 'iront' },
    conditional: frenchConditional('ir'),
  }),
  verb('faire', '做 / 制作', {
    present: { I: 'fais', you: 'fais', 'he/she': 'fait', we: 'faisons', 'you plural': 'faites', they: 'font' },
    past: frenchCompound('fait'),
    imperfect: frenchImperfect('fais'),
    future: frenchFuture('fer'),
    conditional: frenchConditional('fer'),
  }),
  verb('dire', '说', {
    present: { I: 'dis', you: 'dis', 'he/she': 'dit', we: 'disons', 'you plural': 'dites', they: 'disent' },
    past: frenchCompound('dit'),
    imperfect: frenchImperfect('dis'),
    future: frenchFuture('dir'),
    conditional: frenchConditional('dir'),
  }),
  verb('pouvoir', '能够', {
    present: { I: 'peux', you: 'peux', 'he/she': 'peut', we: 'pouvons', 'you plural': 'pouvez', they: 'peuvent' },
    past: frenchCompound('pu'),
    imperfect: frenchImperfect('pouv'),
    future: frenchFuture('pourr'),
    conditional: frenchConditional('pourr'),
  }),
  verb('vouloir', '想要', {
    present: { I: 'veux', you: 'veux', 'he/she': 'veut', we: 'voulons', 'you plural': 'voulez', they: 'veulent' },
    past: frenchCompound('voulu'),
    imperfect: frenchImperfect('voul'),
    future: frenchFuture('voudr'),
    conditional: frenchConditional('voudr'),
  }),
  verb('savoir', '知道', {
    present: { I: 'sais', you: 'sais', 'he/she': 'sait', we: 'savons', 'you plural': 'savez', they: 'savent' },
    past: frenchCompound('su'),
    imperfect: frenchImperfect('sav'),
    future: frenchFuture('saur'),
    conditional: frenchConditional('saur'),
  }),
  verb('voir', '看见', {
    present: { I: 'vois', you: 'vois', 'he/she': 'voit', we: 'voyons', 'you plural': 'voyez', they: 'voient' },
    past: frenchCompound('vu'),
    imperfect: frenchImperfect('voy'),
    future: frenchFuture('verr'),
    conditional: frenchConditional('verr'),
  }),
  verb('prendre', '拿 / 乘坐', {
    present: { I: 'prends', you: 'prends', 'he/she': 'prend', we: 'prenons', 'you plural': 'prenez', they: 'prennent' },
    past: frenchCompound('pris'),
    imperfect: frenchImperfect('pren'),
    future: frenchFuture('prendr'),
    conditional: frenchConditional('prendr'),
  }),
  verb('mettre', '放置 / 穿上', {
    present: { I: 'mets', you: 'mets', 'he/she': 'met', we: 'mettons', 'you plural': 'mettez', they: 'mettent' },
    past: frenchCompound('mis'),
    imperfect: frenchImperfect('mett'),
    future: frenchFuture('mettr'),
    conditional: frenchConditional('mettr'),
  }),
  verb('devoir', '必须 / 应该', {
    present: { I: 'dois', you: 'dois', 'he/she': 'doit', we: 'devons', 'you plural': 'devez', they: 'doivent' },
    past: frenchCompound('dû'),
    imperfect: frenchImperfect('dev'),
    future: frenchFuture('devr'),
    conditional: frenchConditional('devr'),
  }),
  verb('lire', '读', {
    present: { I: 'lis', you: 'lis', 'he/she': 'lit', we: 'lisons', 'you plural': 'lisez', they: 'lisent' },
    past: frenchCompound('lu'),
    imperfect: frenchImperfect('lis'),
    future: frenchFuture('lir'),
    conditional: frenchConditional('lir'),
  }),
  verb('écrire', '写', {
    present: { I: 'écris', you: 'écris', 'he/she': 'écrit', we: 'écrivons', 'you plural': 'écrivez', they: 'écrivent' },
    past: frenchCompound('écrit'),
    imperfect: frenchImperfect('écriv'),
    future: frenchFuture('écrir'),
    conditional: frenchConditional('écrir'),
  }),
  frenchErVerb('parler', '说 / 交谈'),
  frenchErVerb('aimer', '喜欢 / 爱'),
  frenchErVerb('regarder', '看'),
  frenchErVerb('écouter', '听'),
  frenchErVerb('chercher', '寻找'),
  frenchErVerb('trouver', '找到'),
  frenchErVerb('donner', '给'),
  frenchErVerb('penser', '想 / 认为'),
  frenchErVerb('travailler', '工作'),
  frenchErVerb('jouer', '玩 / 演奏'),
  frenchErVerb('marcher', '走路'),
  frenchErVerb('demander', '询问 / 请求'),
  frenchErVerb('fermer', '关闭'),
  frenchErVerb('porter', '穿 / 携带'),
  frenchErVerb('habiter', '居住'),
  frenchErVerb('étudier', '学习'),
  frenchErVerb('visiter', '参观'),
  frenchErVerb('chanter', '唱歌'),
  frenchErVerb('danser', '跳舞'),
  frenchErVerb('préparer', '准备'),
  frenchErVerb('gagner', '赢得 / 赚取'),
  frenchErVerb('oublier', '忘记'),
  frenchErVerb('expliquer', '解释'),
  frenchErVerb('présenter', '介绍'),
  frenchErVerb('utiliser', '使用'),
  frenchIrVerb('finir', '完成'),
  frenchIrVerb('choisir', '选择'),
  frenchIrVerb('réussir', '成功'),
  frenchIrVerb('remplir', '填满'),
  frenchIrVerb('grandir', '成长'),
  frenchIrVerb('réfléchir', '思考'),
  frenchReVerb('vendre', '卖'),
  frenchReVerb('attendre', '等待'),
  frenchReVerb('répondre', '回答'),
  frenchReVerb('perdre', '失去 / 输'),
  frenchReVerb('rendre', '归还 / 使得'),
  verb('venir', '来', {
    present: { I: 'viens', you: 'viens', 'he/she': 'vient', we: 'venons', 'you plural': 'venez', they: 'viennent' },
    past: { I: 'suis venu', you: 'es venu', 'he/she': 'est venu', we: 'sommes venus', 'you plural': 'êtes venus', they: 'sont venus' },
    imperfect: frenchImperfect('ven'),
    future: frenchFuture('viendr'),
    conditional: frenchConditional('viendr'),
  }),
  verb('devenir', '变成', {
    present: { I: 'deviens', you: 'deviens', 'he/she': 'devient', we: 'devenons', 'you plural': 'devenez', they: 'deviennent' },
    past: { I: 'suis devenu', you: 'es devenu', 'he/she': 'est devenu', we: 'sommes devenus', 'you plural': 'êtes devenus', they: 'sont devenus' },
    imperfect: frenchImperfect('deven'),
    future: frenchFuture('deviendr'),
    conditional: frenchConditional('deviendr'),
  }),
  verb('manger', '吃', {
    present: { I: 'mange', you: 'manges', 'he/she': 'mange', we: 'mangeons', 'you plural': 'mangez', they: 'mangent' },
    past: frenchCompound('mangé'),
    imperfect: frenchImperfect('mang'),
    future: frenchFuture('manger'),
    conditional: frenchConditional('manger'),
  }),
  verb('boire', '喝', {
    present: { I: 'bois', you: 'bois', 'he/she': 'boit', we: 'buvons', 'you plural': 'buvez', they: 'boivent' },
    past: frenchCompound('bu'),
    imperfect: frenchImperfect('buv'),
    future: frenchFuture('boir'),
    conditional: frenchConditional('boir'),
  }),
  verb('acheter', '买', {
    present: { I: 'achète', you: 'achètes', 'he/she': 'achète', we: 'achetons', 'you plural': 'achetez', they: 'achètent' },
    past: frenchCompound('acheté'),
    imperfect: frenchImperfect('achet'),
    future: frenchFuture('achèter'),
    conditional: frenchConditional('achèter'),
  }),
  verb('dormir', '睡觉', {
    present: { I: 'dors', you: 'dors', 'he/she': 'dort', we: 'dormons', 'you plural': 'dormez', they: 'dorment' },
    past: frenchCompound('dormi'),
    imperfect: frenchImperfect('dorm'),
    future: frenchFuture('dormir'),
    conditional: frenchConditional('dormir'),
  }),
  verb('ouvrir', '打开', {
    present: { I: 'ouvre', you: 'ouvres', 'he/she': 'ouvre', we: 'ouvrons', 'you plural': 'ouvrez', they: 'ouvrent' },
    past: frenchCompound('ouvert'),
    imperfect: frenchImperfect('ouvr'),
    future: frenchFuture('ouvrir'),
    conditional: frenchConditional('ouvrir'),
  }),
  verb('partir', '离开 / 出发', {
    present: { I: 'pars', you: 'pars', 'he/she': 'part', we: 'partons', 'you plural': 'partez', they: 'partent' },
    past: { I: 'suis parti', you: 'es parti', 'he/she': 'est parti', we: 'sommes partis', 'you plural': 'êtes partis', they: 'sont partis' },
    imperfect: frenchImperfect('part'),
    future: frenchFuture('partir'),
    conditional: frenchConditional('partir'),
  }),
  verb('croire', '相信', {
    present: { I: 'crois', you: 'crois', 'he/she': 'croit', we: 'croyons', 'you plural': 'croyez', they: 'croient' },
    past: frenchCompound('cru'),
    imperfect: frenchImperfect('croy'),
    future: frenchFuture('croir'),
    conditional: frenchConditional('croir'),
  }),
  verb('connaître', '认识 / 知道', {
    present: { I: 'connais', you: 'connais', 'he/she': 'connaît', we: 'connaissons', 'you plural': 'connaissez', they: 'connaissent' },
    past: frenchCompound('connu'),
    imperfect: frenchImperfect('connaiss'),
    future: frenchFuture('connaîtr'),
    conditional: frenchConditional('connaîtr'),
  }),
  verb('courir', '跑', {
    present: { I: 'cours', you: 'cours', 'he/she': 'court', we: 'courons', 'you plural': 'courez', they: 'courent' },
    past: frenchCompound('couru'),
    imperfect: frenchImperfect('cour'),
    future: frenchFuture('courr'),
    conditional: frenchConditional('courr'),
  }),
  verb('payer', '支付', {
    present: { I: 'paie', you: 'paies', 'he/she': 'paie', we: 'payons', 'you plural': 'payez', they: 'paient' },
    past: frenchCompound('payé'),
    imperfect: frenchImperfect('pay'),
    future: frenchFuture('paier'),
    conditional: frenchConditional('paier'),
  }),
  verb('recevoir', '收到', {
    present: { I: 'reçois', you: 'reçois', 'he/she': 'reçoit', we: 'recevons', 'you plural': 'recevez', they: 'reçoivent' },
    past: frenchCompound('reçu'),
    imperfect: frenchImperfect('recev'),
    future: frenchFuture('recevr'),
    conditional: frenchConditional('recevr'),
  }),
  verb('rester', '停留 / 留下', {
    present: { I: 'reste', you: 'restes', 'he/she': 'reste', we: 'restons', 'you plural': 'restez', they: 'restent' },
    past: { I: 'suis resté', you: 'es resté', 'he/she': 'est resté', we: 'sommes restés', 'you plural': 'êtes restés', they: 'sont restés' },
    imperfect: frenchImperfect('rest'),
    future: frenchFuture('rester'),
    conditional: frenchConditional('rester'),
  }),
  verb('suivre', '跟随', {
    present: { I: 'suis', you: 'suis', 'he/she': 'suit', we: 'suivons', 'you plural': 'suivez', they: 'suivent' },
    past: frenchCompound('suivi'),
    imperfect: frenchImperfect('suiv'),
    future: frenchFuture('suivr'),
    conditional: frenchConditional('suivr'),
  }),
  verb('sentir', '感觉 / 闻到', {
    present: { I: 'sens', you: 'sens', 'he/she': 'sent', we: 'sentons', 'you plural': 'sentez', they: 'sentent' },
    past: frenchCompound('senti'),
    imperfect: frenchImperfect('sent'),
    future: frenchFuture('sentir'),
    conditional: frenchConditional('sentir'),
  }),
  verb('servir', '服务', {
    present: { I: 'sers', you: 'sers', 'he/she': 'sert', we: 'servons', 'you plural': 'servez', they: 'servent' },
    past: frenchCompound('servi'),
    imperfect: frenchImperfect('serv'),
    future: frenchFuture('servir'),
    conditional: frenchConditional('servir'),
  }),
  verb('tenir', '拿着 / 保持', {
    present: { I: 'tiens', you: 'tiens', 'he/she': 'tient', we: 'tenons', 'you plural': 'tenez', they: 'tiennent' },
    past: frenchCompound('tenu'),
    imperfect: frenchImperfect('ten'),
    future: frenchFuture('tiendr'),
    conditional: frenchConditional('tiendr'),
  }),
  verb('envoyer', '发送', {
    present: { I: 'envoie', you: 'envoies', 'he/she': 'envoie', we: 'envoyons', 'you plural': 'envoyez', they: 'envoient' },
    past: frenchCompound('envoyé'),
    imperfect: frenchImperfect('envoy'),
    future: frenchFuture('enverr'),
    conditional: frenchConditional('enverr'),
  }),
  verb('essayer', '尝试', {
    present: { I: 'essaie', you: 'essaies', 'he/she': 'essaie', we: 'essayons', 'you plural': 'essayez', they: 'essaient' },
    past: frenchCompound('essayé'),
    imperfect: frenchImperfect('essay'),
    future: frenchFuture('essaier'),
    conditional: frenchConditional('essaier'),
  }),
  verb('tomber', '掉落', {
    present: { I: 'tombe', you: 'tombes', 'he/she': 'tombe', we: 'tombons', 'you plural': 'tombez', they: 'tombent' },
    past: { I: 'suis tombé', you: 'es tombé', 'he/she': 'est tombé', we: 'sommes tombés', 'you plural': 'êtes tombés', they: 'sont tombés' },
    imperfect: frenchImperfect('tomb'),
    future: frenchFuture('tomber'),
    conditional: frenchConditional('tomber'),
  }),
  verb('sortir', '出去', {
    present: { I: 'sors', you: 'sors', 'he/she': 'sort', we: 'sortons', 'you plural': 'sortez', they: 'sortent' },
    past: { I: 'suis sorti', you: 'es sorti', 'he/she': 'est sorti', we: 'sommes sortis', 'you plural': 'êtes sortis', they: 'sont sortis' },
    imperfect: frenchImperfect('sort'),
    future: frenchFuture('sortir'),
    conditional: frenchConditional('sortir'),
  }),
  verb('arriver', '到达', {
    present: { I: 'arrive', you: 'arrives', 'he/she': 'arrive', we: 'arrivons', 'you plural': 'arrivez', they: 'arrivent' },
    past: { I: 'suis arrivé', you: 'es arrivé', 'he/she': 'est arrivé', we: 'sommes arrivés', 'you plural': 'êtes arrivés', they: 'sont arrivés' },
    imperfect: frenchImperfect('arriv'),
    future: frenchFuture('arriver'),
    conditional: frenchConditional('arriver'),
  }),
  verb('monter', '爬上', {
    present: { I: 'monte', you: 'montes', 'he/she': 'monte', we: 'montons', 'you plural': 'montez', they: 'montent' },
    past: { I: 'suis monté', you: 'es monté', 'he/she': 'est monté', we: 'sommes montés', 'you plural': 'êtes montés', they: 'sont montés' },
    imperfect: frenchImperfect('mont'),
    future: frenchFuture('monter'),
    conditional: frenchConditional('monter'),
  }),
  verb('rentrer', '返回 / 回家', {
    present: { I: 'rentre', you: 'rentres', 'he/she': 'rentre', we: 'rentrons', 'you plural': 'rentrez', they: 'rentrent' },
    past: { I: 'suis rentré', you: 'es rentré', 'he/she': 'est rentré', we: 'sommes rentrés', 'you plural': 'êtes rentrés', they: 'sont rentrés' },
    imperfect: frenchImperfect('rentr'),
    future: frenchFuture('rentrer'),
    conditional: frenchConditional('rentrer'),
  }),
  verb('voyager', '旅行', {
    present: { I: 'voyage', you: 'voyages', 'he/she': 'voyage', we: 'voyageons', 'you plural': 'voyagez', they: 'voyagent' },
    past: frenchCompound('voyagé'),
    imperfect: frenchImperfect('voyag'),
    future: frenchFuture('voyager'),
    conditional: frenchConditional('voyager'),
  }),
  verb('commencer', '开始', {
    present: { I: 'commence', you: 'commences', 'he/she': 'commence', we: 'commençons', 'you plural': 'commencez', they: 'commencent' },
    past: frenchCompound('commencé'),
    // ç only before a/o: commençais, but commencions / commenciez.
    imperfect: { ...frenchImperfect('commenç'), we: 'commencions', 'you plural': 'commenciez' },
    future: frenchFuture('commencer'),
    conditional: frenchConditional('commencer'),
  }),
  verb('mentir', '说谎', {
    present: { I: 'mens', you: 'mens', 'he/she': 'ment', we: 'mentons', 'you plural': 'mentez', they: 'mentent' },
    past: frenchCompound('menti'),
    imperfect: frenchImperfect('ment'),
    future: frenchFuture('mentir'),
    conditional: frenchConditional('mentir'),
  }),
  verb('mourir', '死', {
    present: { I: 'meurs', you: 'meurs', 'he/she': 'meurt', we: 'mourons', 'you plural': 'mourez', they: 'meurent' },
    past: { I: 'suis mort', you: 'es mort', 'he/she': 'est mort', we: 'sommes morts', 'you plural': 'êtes morts', they: 'sont morts' },
    imperfect: frenchImperfect('mour'),
    future: frenchFuture('mourr'),
    conditional: frenchConditional('mourr'),
  }),
  verb('naître', '出生', {
    present: { I: 'nais', you: 'nais', 'he/she': 'naît', we: 'naissons', 'you plural': 'naissez', they: 'naissent' },
    past: { I: 'suis né', you: 'es né', 'he/she': 'est né', we: 'sommes nés', 'you plural': 'êtes nés', they: 'sont nés' },
    imperfect: frenchImperfect('naiss'),
    future: frenchFuture('naîtr'),
    conditional: frenchConditional('naîtr'),
  }),
  verb('vivre', '生活', {
    present: { I: 'vis', you: 'vis', 'he/she': 'vit', we: 'vivons', 'you plural': 'vivez', they: 'vivent' },
    past: frenchCompound('vécu'),
    imperfect: frenchImperfect('viv'),
    future: frenchFuture('vivr'),
    conditional: frenchConditional('vivr'),
  }),
  verb('comprendre', '理解', {
    present: { I: 'comprends', you: 'comprends', 'he/she': 'comprend', we: 'comprenons', 'you plural': 'comprenez', they: 'comprennent' },
    past: frenchCompound('compris'),
    imperfect: frenchImperfect('compren'),
    future: frenchFuture('comprendr'),
    conditional: frenchConditional('comprendr'),
  }),
  verb('apprendre', '学习 / 得知', {
    present: { I: 'apprends', you: 'apprends', 'he/she': 'apprend', we: 'apprenons', 'you plural': 'apprenez', they: 'apprennent' },
    past: frenchCompound('appris'),
    imperfect: frenchImperfect('appren'),
    future: frenchFuture('apprendr'),
    conditional: frenchConditional('apprendr'),
  }),
  frenchReVerb('entendre', '听见'),
  verb('battre', '打 / 击败', {
    present: { I: 'bats', you: 'bats', 'he/she': 'bat', we: 'battons', 'you plural': 'battez', they: 'battent' },
    past: frenchCompound('battu'),
    imperfect: frenchImperfect('batt'),
    future: frenchFuture('battr'),
    conditional: frenchConditional('battr'),
  }),
  verb('rompre', '打破', {
    present: { I: 'romps', you: 'romps', 'he/she': 'rompt', we: 'rompons', 'you plural': 'rompez', they: 'rompent' },
    past: frenchCompound('rompu'),
    imperfect: frenchImperfect('romp'),
    future: frenchFuture('rompr'),
    conditional: frenchConditional('rompr'),
  }),
  verb('offrir', '提供 / 赠送', {
    present: { I: 'offre', you: 'offres', 'he/she': 'offre', we: 'offrons', 'you plural': 'offrez', they: 'offrent' },
    past: frenchCompound('offert'),
    imperfect: frenchImperfect('offr'),
    future: frenchFuture('offrir'),
    conditional: frenchConditional('offrir'),
  }),
  verb('découvrir', '发现', {
    present: { I: 'découvre', you: 'découvres', 'he/she': 'découvre', we: 'découvrons', 'you plural': 'découvrez', they: 'découvrent' },
    past: frenchCompound('découvert'),
    imperfect: frenchImperfect('découvr'),
    future: frenchFuture('découvrir'),
    conditional: frenchConditional('découvrir'),
  }),
  verb('souffrir', '受苦 / 忍受', {
    present: { I: 'souffre', you: 'souffres', 'he/she': 'souffre', we: 'souffrons', 'you plural': 'souffrez', they: 'souffrent' },
    past: frenchCompound('souffert'),
    imperfect: frenchImperfect('souffr'),
    future: frenchFuture('souffrir'),
    conditional: frenchConditional('souffrir'),
  }),
  verb('rire', '笑', {
    present: { I: 'ris', you: 'ris', 'he/she': 'rit', we: 'rions', 'you plural': 'riez', they: 'rient' },
    past: frenchCompound('ri'),
    imperfect: frenchImperfect('ri'),
    future: frenchFuture('rir'),
    conditional: frenchConditional('rir'),
  }),
  verb('sourire', '微笑', {
    present: { I: 'souris', you: 'souris', 'he/she': 'sourit', we: 'sourions', 'you plural': 'souriez', they: 'sourient' },
    past: frenchCompound('souri'),
    imperfect: frenchImperfect('souri'),
    future: frenchFuture('sourire'),
    conditional: frenchConditional('sourire'),
  }),
  frenchIrVerb('grossir', '变胖'),
  frenchIrVerb('maigrir', '变瘦'),
  frenchIrVerb('vieillir', '变老'),
  frenchIrVerb('obéir', '服从'),
  verb('valoir', '值', {
    present: { I: 'vaux', you: 'vaux', 'he/she': 'vaut', we: 'valons', 'you plural': 'valez', they: 'valent' },
    past: frenchCompound('valu'),
    imperfect: frenchImperfect('val'),
    future: frenchFuture('vaudr'),
    conditional: frenchConditional('vaudr'),
  }),
  frenchErVerb('aider', '帮助'),
  frenchErVerb('laver', '洗'),
  frenchErVerb('rencontrer', '遇见'),
  frenchErVerb('traverser', '穿过'),
  verb('conduire', '驾驶 / 引导', {
    present: { I: 'conduis', you: 'conduis', 'he/she': 'conduit', we: 'conduisons', 'you plural': 'conduisez', they: 'conduisent' },
    past: frenchCompound('conduit'),
    imperfect: frenchImperfect('conduis'),
    future: frenchFuture('conduir'),
    conditional: frenchConditional('conduir'),
  }),
  verb('construire', '建造', {
    present: { I: 'construis', you: 'construis', 'he/she': 'construit', we: 'construisons', 'you plural': 'construisez', they: 'construisent' },
    past: frenchCompound('construit'),
    imperfect: frenchImperfect('construis'),
    future: frenchFuture('construir'),
    conditional: frenchConditional('construir'),
  }),
  verb('traduire', '翻译', {
    present: { I: 'traduis', you: 'traduis', 'he/she': 'traduit', we: 'traduisons', 'you plural': 'traduisez', they: 'traduisent' },
    past: frenchCompound('traduit'),
    imperfect: frenchImperfect('traduis'),
    future: frenchFuture('traduir'),
    conditional: frenchConditional('traduir'),
  }),
  verb('produire', '生产 / 产生', {
    present: { I: 'produis', you: 'produis', 'he/she': 'produit', we: 'produisons', 'you plural': 'produisez', they: 'produisent' },
    past: frenchCompound('produit'),
    imperfect: frenchImperfect('produis'),
    future: frenchFuture('produir'),
    conditional: frenchConditional('produir'),
  }),
  verb('craindre', '害怕 / 担心', {
    present: { I: 'crains', you: 'crains', 'he/she': 'craint', we: 'craignons', 'you plural': 'craignez', they: 'craignent' },
    past: frenchCompound('craint'),
    imperfect: frenchImperfect('craign'),
    future: frenchFuture('craindr'),
    conditional: frenchConditional('craindr'),
  }),
  verb('peindre', '画 / 粉刷', {
    present: { I: 'peins', you: 'peins', 'he/she': 'peint', we: 'peignons', 'you plural': 'peignez', they: 'peignent' },
    past: frenchCompound('peint'),
    imperfect: frenchImperfect('peign'),
    future: frenchFuture('peindr'),
    conditional: frenchConditional('peindr'),
  }),
  verb('éteindre', '关掉 / 熄灭', {
    present: { I: 'éteins', you: 'éteins', 'he/she': 'éteint', we: 'éteignons', 'you plural': 'éteignez', they: 'éteignent' },
    past: frenchCompound('éteint'),
    imperfect: frenchImperfect('éteign'),
    future: frenchFuture('éteindr'),
    conditional: frenchConditional('éteindr'),
  }),
  verb('rejoindre', '会合 / 加入', {
    present: { I: 'rejoins', you: 'rejoins', 'he/she': 'rejoint', we: 'rejoignons', 'you plural': 'rejoignez', they: 'rejoignent' },
    past: frenchCompound('rejoint'),
    imperfect: frenchImperfect('rejoign'),
    future: frenchFuture('rejoindr'),
    conditional: frenchConditional('rejoindr'),
  }),
  verb('plaire', '使喜欢 / 讨人喜欢', {
    present: { I: 'plais', you: 'plais', 'he/she': 'plaît', we: 'plaisons', 'you plural': 'plaisez', they: 'plaisent' },
    past: frenchCompound('plu'),
    imperfect: frenchImperfect('plais'),
    future: frenchFuture('plair'),
    conditional: frenchConditional('plair'),
  }),
  verb('paraître', '显得 / 出现', {
    present: { I: 'parais', you: 'parais', 'he/she': 'paraît', we: 'paraissons', 'you plural': 'paraissez', they: 'paraissent' },
    past: frenchCompound('paru'),
    imperfect: frenchImperfect('paraiss'),
    future: frenchFuture('paraîtr'),
    conditional: frenchConditional('paraîtr'),
  }),
  verb('résoudre', '解决 / 决定', {
    present: { I: 'résous', you: 'résous', 'he/she': 'résout', we: 'résolvons', 'you plural': 'résolvez', they: 'résolvent' },
    past: frenchCompound('résolu'),
    imperfect: frenchImperfect('résolv'),
    future: frenchFuture('résoudr'),
    conditional: frenchConditional('résoudr'),
  }),
  verb('permettre', '允许', {
    present: { I: 'permets', you: 'permets', 'he/she': 'permet', we: 'permettons', 'you plural': 'permettez', they: 'permettent' },
    past: frenchCompound('permis'),
    imperfect: frenchImperfect('permett'),
    future: frenchFuture('permettr'),
    conditional: frenchConditional('permettr'),
  }),
  verb('promettre', '承诺 / 答应', {
    present: { I: 'promets', you: 'promets', 'he/she': 'promet', we: 'promettons', 'you plural': 'promettez', they: 'promettent' },
    past: frenchCompound('promis'),
    imperfect: frenchImperfect('promett'),
    future: frenchFuture('promettr'),
    conditional: frenchConditional('promettr'),
  }),
  verb('revenir', '回来', {
    present: { I: 'reviens', you: 'reviens', 'he/she': 'revient', we: 'revenons', 'you plural': 'revenez', they: 'reviennent' },
    past: { I: 'suis revenu', you: 'es revenu', 'he/she': 'est revenu', we: 'sommes revenus', 'you plural': 'êtes revenus', they: 'sont revenus' },
    imperfect: frenchImperfect('reven'),
    future: frenchFuture('reviendr'),
    conditional: frenchConditional('reviendr'),
  }),
  verb('obtenir', '获得', {
    present: { I: 'obtiens', you: 'obtiens', 'he/she': 'obtient', we: 'obtenons', 'you plural': 'obtenez', they: 'obtiennent' },
    past: frenchCompound('obtenu'),
    imperfect: frenchImperfect('obten'),
    future: frenchFuture('obtiendr'),
    conditional: frenchConditional('obtiendr'),
  }),
  verb('couvrir', '覆盖', {
    present: { I: 'couvre', you: 'couvres', 'he/she': 'couvre', we: 'couvrons', 'you plural': 'couvrez', they: 'couvrent' },
    past: frenchCompound('couvert'),
    imperfect: frenchImperfect('couvr'),
    future: frenchFuture('couvrir'),
    conditional: frenchConditional('couvrir'),
  }),
  verb('accueillir', '欢迎 / 接待', {
    present: { I: 'accueille', you: 'accueilles', 'he/she': 'accueille', we: 'accueillons', 'you plural': 'accueillez', they: 'accueillent' },
    past: frenchCompound('accueilli'),
    imperfect: frenchImperfect('accueill'),
    future: frenchFuture('accueiller'),
    conditional: frenchConditional('accueiller'),
  }),
  verb('fuir', '逃跑 / 避开', {
    present: { I: 'fuis', you: 'fuis', 'he/she': 'fuit', we: 'fuyons', 'you plural': 'fuyez', they: 'fuient' },
    past: frenchCompound('fui'),
    imperfect: frenchImperfect('fuy'),
    future: frenchFuture('fuir'),
    conditional: frenchConditional('fuir'),
  }),
  verb('appeler', '打电话 / 称呼', {
    present: { I: 'appelle', you: 'appelles', 'he/she': 'appelle', we: 'appelons', 'you plural': 'appelez', they: 'appellent' },
    past: frenchCompound('appelé'),
    imperfect: frenchImperfect('appel'),
    future: frenchFuture('appeller'),
    conditional: frenchConditional('appeller'),
  }),
  verb('préférer', '更喜欢 / 宁愿', {
    present: { I: 'préfère', you: 'préfères', 'he/she': 'préfère', we: 'préférons', 'you plural': 'préférez', they: 'préfèrent' },
    past: frenchCompound('préféré'),
    imperfect: frenchImperfect('préfér'),
    future: frenchFuture('préférer'),
    conditional: frenchConditional('préférer'),
  }),
];

const spanishVerbs: BaseVerbEntry[] = [
  verb('ser', '是 / 本质', {
    present: { I: 'soy', you: 'eres', 'he/she': 'es', we: 'somos', 'you plural': 'sois', they: 'son' },
    past: { I: 'fui', you: 'fuiste', 'he/she': 'fue', we: 'fuimos', 'you plural': 'fuisteis', they: 'fueron' },
    imperfect: { I: 'era', you: 'eras', 'he/she': 'era', we: 'éramos', 'you plural': 'erais', they: 'eran' },
    future: { I: 'seré', you: 'serás', 'he/she': 'será', we: 'seremos', 'you plural': 'seréis', they: 'serán' },
    conditional: spanishConditional('ser'),
  }),
  verb('tener', '有', {
    present: { I: 'tengo', you: 'tienes', 'he/she': 'tiene', we: 'tenemos', 'you plural': 'tenéis', they: 'tienen' },
    past: { I: 'tuve', you: 'tuviste', 'he/she': 'tuvo', we: 'tuvimos', 'you plural': 'tuvisteis', they: 'tuvieron' },
    imperfect: spanishErIrImperfect('ten'),
    future: { I: 'tendré', you: 'tendrás', 'he/she': 'tendrá', we: 'tendremos', 'you plural': 'tendréis', they: 'tendrán' },
    conditional: spanishConditional('tendr'),
  }),
  verb('ir', '去', {
    present: { I: 'voy', you: 'vas', 'he/she': 'va', we: 'vamos', 'you plural': 'vais', they: 'van' },
    past: { I: 'fui', you: 'fuiste', 'he/she': 'fue', we: 'fuimos', 'you plural': 'fuisteis', they: 'fueron' },
    imperfect: { I: 'iba', you: 'ibas', 'he/she': 'iba', we: 'íbamos', 'you plural': 'ibais', they: 'iban' },
    future: { I: 'iré', you: 'irás', 'he/she': 'irá', we: 'iremos', 'you plural': 'iréis', they: 'irán' },
    conditional: spanishConditional('ir'),
  }),
  verb('estar', '是 / 处于', {
    present: { I: 'estoy', you: 'estás', 'he/she': 'está', we: 'estamos', 'you plural': 'estáis', they: 'están' },
    past: { I: 'estuve', you: 'estuviste', 'he/she': 'estuvo', we: 'estuvimos', 'you plural': 'estuvisteis', they: 'estuvieron' },
    imperfect: spanishArImperfect('est'),
    future: spanishFuture('estar'),
    conditional: spanishConditional('estar'),
  }),
  verb('hacer', '做 / 制作', {
    present: { I: 'hago', you: 'haces', 'he/she': 'hace', we: 'hacemos', 'you plural': 'hacéis', they: 'hacen' },
    past: { I: 'hice', you: 'hiciste', 'he/she': 'hizo', we: 'hicimos', 'you plural': 'hicisteis', they: 'hicieron' },
    imperfect: spanishErIrImperfect('hac'),
    future: spanishFuture('har'),
    conditional: spanishConditional('har'),
  }),
  verb('decir', '说', {
    present: { I: 'digo', you: 'dices', 'he/she': 'dice', we: 'decimos', 'you plural': 'decís', they: 'dicen' },
    past: { I: 'dije', you: 'dijiste', 'he/she': 'dijo', we: 'dijimos', 'you plural': 'dijisteis', they: 'dijeron' },
    imperfect: spanishErIrImperfect('dec'),
    future: spanishFuture('dir'),
    conditional: spanishConditional('dir'),
  }),
  verb('poder', '能够', {
    present: { I: 'puedo', you: 'puedes', 'he/she': 'puede', we: 'podemos', 'you plural': 'podéis', they: 'pueden' },
    past: { I: 'pude', you: 'pudiste', 'he/she': 'pudo', we: 'pudimos', 'you plural': 'pudisteis', they: 'pudieron' },
    imperfect: spanishErIrImperfect('pod'),
    future: spanishFuture('podr'),
    conditional: spanishConditional('podr'),
  }),
  verb('querer', '想要 / 爱', {
    present: { I: 'quiero', you: 'quieres', 'he/she': 'quiere', we: 'queremos', 'you plural': 'queréis', they: 'quieren' },
    past: { I: 'quise', you: 'quisiste', 'he/she': 'quiso', we: 'quisimos', 'you plural': 'quisisteis', they: 'quisieron' },
    imperfect: spanishErIrImperfect('quer'),
    future: spanishFuture('querr'),
    conditional: spanishConditional('querr'),
  }),
  verb('saber', '知道', {
    present: { I: 'sé', you: 'sabes', 'he/she': 'sabe', we: 'sabemos', 'you plural': 'sabéis', they: 'saben' },
    past: { I: 'supe', you: 'supiste', 'he/she': 'supo', we: 'supimos', 'you plural': 'supisteis', they: 'supieron' },
    imperfect: spanishErIrImperfect('sab'),
    future: spanishFuture('sabr'),
    conditional: spanishConditional('sabr'),
  }),
  verb('ver', '看见', {
    present: { I: 'veo', you: 'ves', 'he/she': 've', we: 'vemos', 'you plural': 'veis', they: 'ven' },
    past: { I: 'vi', you: 'viste', 'he/she': 'vio', we: 'vimos', 'you plural': 'visteis', they: 'vieron' },
    imperfect: spanishErIrImperfect('ve'),
    future: spanishFuture('ver'),
    conditional: spanishConditional('ver'),
  }),
  verb('venir', '来', {
    present: { I: 'vengo', you: 'vienes', 'he/she': 'viene', we: 'venimos', 'you plural': 'venís', they: 'vienen' },
    past: { I: 'vine', you: 'viniste', 'he/she': 'vino', we: 'vinimos', 'you plural': 'vinisteis', they: 'vinieron' },
    imperfect: spanishErIrImperfect('ven'),
    future: spanishFuture('vendr'),
    conditional: spanishConditional('vendr'),
  }),
  verb('poner', '放置', {
    present: { I: 'pongo', you: 'pones', 'he/she': 'pone', we: 'ponemos', 'you plural': 'ponéis', they: 'ponen' },
    past: { I: 'puse', you: 'pusiste', 'he/she': 'puso', we: 'pusimos', 'you plural': 'pusisteis', they: 'pusieron' },
    imperfect: spanishErIrImperfect('pon'),
    future: spanishFuture('pondr'),
    conditional: spanishConditional('pondr'),
  }),
  verb('salir', '出去 / 离开', {
    present: { I: 'salgo', you: 'sales', 'he/she': 'sale', we: 'salimos', 'you plural': 'salís', they: 'salen' },
    past: { I: 'salí', you: 'saliste', 'he/she': 'salió', we: 'salimos', 'you plural': 'salisteis', they: 'salieron' },
    imperfect: spanishErIrImperfect('sal'),
    future: spanishFuture('saldr'),
    conditional: spanishConditional('saldr'),
  }),
  verb('dar', '给', {
    present: { I: 'doy', you: 'das', 'he/she': 'da', we: 'damos', 'you plural': 'dais', they: 'dan' },
    past: { I: 'di', you: 'diste', 'he/she': 'dio', we: 'dimos', 'you plural': 'disteis', they: 'dieron' },
    imperfect: spanishArImperfect('d'),
    future: spanishFuture('dar'),
    conditional: spanishConditional('dar'),
  }),
  spanishArVerb('hablar', '说 / 交谈'),
  spanishArVerb('amar', '爱'),
  spanishArVerb('mirar', '看'),
  spanishArVerb('escuchar', '听'),
  spanishArVerb('trabajar', '工作'),
  spanishArVerb('caminar', '走路'),
  spanishArVerb('preguntar', '问'),
  spanishArVerb('llamar', '打电话 / 称呼'),
  spanishArVerb('llevar', '携带 / 穿'),
  spanishArVerb('dejar', '留下 / 允许'),
  spanishArVerb('pasar', '经过 / 发生'),
  spanishArVerb('esperar', '等待 / 希望'),
  spanishArVerb('estudiar', '学习'),
  spanishArVerb('visitar', '参观'),
  spanishArVerb('cantar', '唱歌'),
  spanishArVerb('bailar', '跳舞'),
  spanishArVerb('preparar', '准备'),
  spanishArVerb('ganar', '赢得 / 赚取'),
  spanishArVerb('olvidar', '忘记'),
  spanishArVerb('usar', '使用'),
  spanishArVerb('aceptar', '接受'),
  spanishArVerb('necesitar', '需要'),
  spanishErVerb('comer', '吃'),
  spanishErVerb('beber', '喝'),
  spanishErVerb('aprender', '学习'),
  spanishErVerb('vender', '卖'),
  spanishErVerb('comprender', '理解'),
  spanishErVerb('correr', '跑'),
  spanishErVerb('responder', '回答'),
  spanishIrVerb('vivir', '生活 / 居住'),
  spanishIrVerb('abrir', '打开'),
  spanishIrVerb('escribir', '写'),
  spanishIrVerb('recibir', '收到'),
  spanishIrVerb('decidir', '决定'),
  spanishIrVerb('subir', '上升 / 上传'),
  spanishIrVerb('compartir', '分享'),
  verb('haber', '有 / 助动词', {
    present: { I: 'he', you: 'has', 'he/she': 'ha', we: 'hemos', 'you plural': 'habéis', they: 'han' },
    past: { I: 'hube', you: 'hubiste', 'he/she': 'hubo', we: 'hubimos', 'you plural': 'hubisteis', they: 'hubieron' },
    imperfect: spanishErIrImperfect('hab'),
    future: spanishFuture('habr'),
    conditional: spanishConditional('habr'),
  }),
  verb('leer', '读', {
    present: { I: 'leo', you: 'lees', 'he/she': 'lee', we: 'leemos', 'you plural': 'leéis', they: 'leen' },
    past: { I: 'leí', you: 'leíste', 'he/she': 'leyó', we: 'leímos', 'you plural': 'leísteis', they: 'leyeron' },
    imperfect: spanishErIrImperfect('le'),
    future: spanishFuture('leer'),
    conditional: spanishConditional('leer'),
  }),
  verb('oír', '听见', {
    present: { I: 'oigo', you: 'oyes', 'he/she': 'oye', we: 'oímos', 'you plural': 'oís', they: 'oyen' },
    past: { I: 'oí', you: 'oíste', 'he/she': 'oyó', we: 'oímos', 'you plural': 'oísteis', they: 'oyeron' },
    imperfect: spanishErIrImperfect('o'),
    // RAE conjugation model 46: oír loses its infinitive accent in these stems.
    future: spanishFuture('oir'),
    conditional: spanishConditional('oir'),
  }),
  verb('pensar', '想 / 认为', {
    present: { I: 'pienso', you: 'piensas', 'he/she': 'piensa', we: 'pensamos', 'you plural': 'pensáis', they: 'piensan' },
    past: { I: 'pensé', you: 'pensaste', 'he/she': 'pensó', we: 'pensamos', 'you plural': 'pensasteis', they: 'pensaron' },
    imperfect: spanishArImperfect('pens'),
    future: spanishFuture('pensar'),
    conditional: spanishConditional('pensar'),
  }),
  verb('buscar', '寻找', {
    present: { I: 'busco', you: 'buscas', 'he/she': 'busca', we: 'buscamos', 'you plural': 'buscáis', they: 'buscan' },
    past: { I: 'busqué', you: 'buscaste', 'he/she': 'buscó', we: 'buscamos', 'you plural': 'buscasteis', they: 'buscaron' },
    imperfect: spanishArImperfect('busc'),
    future: spanishFuture('buscar'),
    conditional: spanishConditional('buscar'),
  }),
  verb('encontrar', '找到 / 遇见', {
    present: { I: 'encuentro', you: 'encuentras', 'he/she': 'encuentra', we: 'encontramos', 'you plural': 'encontráis', they: 'encuentran' },
    past: { I: 'encontré', you: 'encontraste', 'he/she': 'encontró', we: 'encontramos', 'you plural': 'encontrasteis', they: 'encontraron' },
    imperfect: spanishArImperfect('encontr'),
    future: spanishFuture('encontrar'),
    conditional: spanishConditional('encontrar'),
  }),
  spanishArVerb('comprar', '买'),
  verb('pagar', '支付', {
    present: { I: 'pago', you: 'pagas', 'he/she': 'paga', we: 'pagamos', 'you plural': 'pagáis', they: 'pagan' },
    past: { I: 'pagué', you: 'pagaste', 'he/she': 'pagó', we: 'pagamos', 'you plural': 'pagasteis', they: 'pagaron' },
    imperfect: spanishArImperfect('pag'),
    future: spanishFuture('pagar'),
    conditional: spanishConditional('pagar'),
  }),
  verb('dormir', '睡觉', {
    present: { I: 'duermo', you: 'duermes', 'he/she': 'duerme', we: 'dormimos', 'you plural': 'dormís', they: 'duermen' },
    past: { I: 'dormí', you: 'dormiste', 'he/she': 'durmió', we: 'dormimos', 'you plural': 'dormisteis', they: 'durmieron' },
    imperfect: spanishErIrImperfect('dorm'),
    future: spanishFuture('dormir'),
    conditional: spanishConditional('dormir'),
  }),
  verb('conocer', '认识', {
    present: { I: 'conozco', you: 'conoces', 'he/she': 'conoce', we: 'conocemos', 'you plural': 'conocéis', they: 'conocen' },
    past: { I: 'conocí', you: 'conociste', 'he/she': 'conoció', we: 'conocimos', 'you plural': 'conocisteis', they: 'conocieron' },
    imperfect: spanishErIrImperfect('conoc'),
    future: spanishFuture('conocer'),
    conditional: spanishConditional('conocer'),
  }),
  verb('creer', '相信', {
    present: { I: 'creo', you: 'crees', 'he/she': 'cree', we: 'creemos', 'you plural': 'creéis', they: 'creen' },
    past: { I: 'creí', you: 'creíste', 'he/she': 'creyó', we: 'creímos', 'you plural': 'creísteis', they: 'creyeron' },
    imperfect: spanishErIrImperfect('cre'),
    future: spanishFuture('creer'),
    conditional: spanishConditional('creer'),
  }),
  verb('pedir', '请求 / 点餐', {
    present: { I: 'pido', you: 'pides', 'he/she': 'pide', we: 'pedimos', 'you plural': 'pedís', they: 'piden' },
    past: { I: 'pedí', you: 'pediste', 'he/she': 'pidió', we: 'pedimos', 'you plural': 'pedisteis', they: 'pidieron' },
    imperfect: spanishErIrImperfect('ped'),
    future: spanishFuture('pedir'),
    conditional: spanishConditional('pedir'),
  }),
  verb('sentir', '感觉', {
    present: { I: 'siento', you: 'sientes', 'he/she': 'siente', we: 'sentimos', 'you plural': 'sentís', they: 'sienten' },
    past: { I: 'sentí', you: 'sentiste', 'he/she': 'sintió', we: 'sentimos', 'you plural': 'sentisteis', they: 'sintieron' },
    imperfect: spanishErIrImperfect('sent'),
    future: spanishFuture('sentir'),
    conditional: spanishConditional('sentir'),
  }),
  verb('jugar', '玩 / 打（球）', {
    present: { I: 'juego', you: 'juegas', 'he/she': 'juega', we: 'jugamos', 'you plural': 'jugáis', they: 'juegan' },
    past: { I: 'jugué', you: 'jugaste', 'he/she': 'jugó', we: 'jugamos', 'you plural': 'jugasteis', they: 'jugaron' },
    imperfect: spanishArImperfect('jug'),
    future: spanishFuture('jugar'),
    conditional: spanishConditional('jugar'),
  }),
  verb('traer', '带来', {
    present: { I: 'traigo', you: 'traes', 'he/she': 'trae', we: 'traemos', 'you plural': 'traéis', they: 'traen' },
    past: { I: 'traje', you: 'trajiste', 'he/she': 'trajo', we: 'trajimos', 'you plural': 'trajisteis', they: 'trajeron' },
    imperfect: spanishErIrImperfect('tra'),
    future: spanishFuture('traer'),
    conditional: spanishConditional('traer'),
  }),
  verb('empezar', '开始', {
    present: { I: 'empiezo', you: 'empiezas', 'he/she': 'empieza', we: 'empezamos', 'you plural': 'empezáis', they: 'empiezan' },
    past: { I: 'empecé', you: 'empezaste', 'he/she': 'empezó', we: 'empezamos', 'you plural': 'empezasteis', they: 'empezaron' },
    imperfect: spanishArImperfect('empez'),
    future: spanishFuture('empezar'),
    conditional: spanishConditional('empezar'),
  }),
  verb('llegar', '到达', {
    present: { I: 'llego', you: 'llegas', 'he/she': 'llega', we: 'llegamos', 'you plural': 'llegáis', they: 'llegan' },
    past: { I: 'llegué', you: 'llegaste', 'he/she': 'llegó', we: 'llegamos', 'you plural': 'llegasteis', they: 'llegaron' },
    imperfect: spanishArImperfect('lleg'),
    future: spanishFuture('llegar'),
    conditional: spanishConditional('llegar'),
  }),
  spanishArVerb('quedar', '留下 / 约定'),
  spanishErVerb('romper', '打破 / 弄坏'),
  verb('tocar', '触摸 / 演奏', {
    present: { I: 'toco', you: 'tocas', 'he/she': 'toca', we: 'tocamos', 'you plural': 'tocáis', they: 'tocan' },
    past: { I: 'toqué', you: 'tocaste', 'he/she': 'tocó', we: 'tocamos', 'you plural': 'tocasteis', they: 'tocaron' },
    imperfect: spanishArImperfect('toc'),
    future: spanishFuture('tocar'),
    conditional: spanishConditional('tocar'),
  }),
  spanishArVerb('tomar', '拿 / 喝'),
  verb('entender', '理解', {
    present: { I: 'entiendo', you: 'entiendes', 'he/she': 'entiende', we: 'entendemos', 'you plural': 'entendéis', they: 'entienden' },
    past: { I: 'entendí', you: 'entendiste', 'he/she': 'entendió', we: 'entendimos', 'you plural': 'entendisteis', they: 'entendieron' },
    imperfect: spanishErIrImperfect('entend'),
    future: spanishFuture('entender'),
    conditional: spanishConditional('entender'),
  }),
  verb('perder', '失去 / 输', {
    present: { I: 'pierdo', you: 'pierdes', 'he/she': 'pierde', we: 'perdemos', 'you plural': 'perdéis', they: 'pierden' },
    past: { I: 'perdí', you: 'perdiste', 'he/she': 'perdió', we: 'perdimos', 'you plural': 'perdisteis', they: 'perdieron' },
    imperfect: spanishErIrImperfect('perd'),
    future: spanishFuture('perder'),
    conditional: spanishConditional('perder'),
  }),
  verb('volver', '返回', {
    present: { I: 'vuelvo', you: 'vuelves', 'he/she': 'vuelve', we: 'volvemos', 'you plural': 'volvéis', they: 'vuelven' },
    past: { I: 'volví', you: 'volviste', 'he/she': 'volvió', we: 'volvimos', 'you plural': 'volvisteis', they: 'volvieron' },
    imperfect: spanishErIrImperfect('volv'),
    future: spanishFuture('volver'),
    conditional: spanishConditional('volver'),
  }),
  verb('devolver', '归还', {
    present: { I: 'devuelvo', you: 'devuelves', 'he/she': 'devuelve', we: 'devolvemos', 'you plural': 'devolvéis', they: 'devuelven' },
    past: { I: 'devolví', you: 'devolviste', 'he/she': 'devolvió', we: 'devolvimos', 'you plural': 'devolvisteis', they: 'devolvieron' },
    imperfect: spanishErIrImperfect('devolv'),
    future: spanishFuture('devolver'),
    conditional: spanishConditional('devolver'),
  }),
  verb('contar', '数 / 讲述', {
    present: { I: 'cuento', you: 'cuentas', 'he/she': 'cuenta', we: 'contamos', 'you plural': 'contáis', they: 'cuentan' },
    past: { I: 'conté', you: 'contaste', 'he/she': 'contó', we: 'contamos', 'you plural': 'contasteis', they: 'contaron' },
    imperfect: spanishArImperfect('cont'),
    future: spanishFuture('contar'),
    conditional: spanishConditional('contar'),
  }),
  verb('costar', '花费 / 值', {
    present: { I: 'cuesto', you: 'cuestas', 'he/she': 'cuesta', we: 'costamos', 'you plural': 'costáis', they: 'cuestan' },
    past: { I: 'costé', you: 'costaste', 'he/she': 'costó', we: 'costamos', 'you plural': 'costasteis', they: 'costaron' },
    imperfect: spanishArImperfect('cost'),
    future: spanishFuture('costar'),
    conditional: spanishConditional('costar'),
  }),
  verb('seguir', '跟随 / 继续', {
    present: { I: 'sigo', you: 'sigues', 'he/she': 'sigue', we: 'seguimos', 'you plural': 'seguís', they: 'siguen' },
    past: { I: 'seguí', you: 'seguiste', 'he/she': 'siguió', we: 'seguimos', 'you plural': 'seguisteis', they: 'siguieron' },
    imperfect: spanishErIrImperfect('segu'),
    future: spanishFuture('seguir'),
    conditional: spanishConditional('seguir'),
  }),
  verb('conseguir', '获得', {
    present: { I: 'consigo', you: 'consigues', 'he/she': 'consigue', we: 'conseguimos', 'you plural': 'conseguís', they: 'consiguen' },
    past: { I: 'conseguí', you: 'conseguiste', 'he/she': 'consiguió', we: 'conseguimos', 'you plural': 'conseguisteis', they: 'consiguieron' },
    imperfect: spanishErIrImperfect('consegu'),
    future: spanishFuture('conseguir'),
    conditional: spanishConditional('conseguir'),
  }),
  verb('elegir', '选择', {
    present: { I: 'elijo', you: 'eliges', 'he/she': 'elige', we: 'elegimos', 'you plural': 'elegís', they: 'eligen' },
    past: { I: 'elegí', you: 'elegiste', 'he/she': 'eligió', we: 'elegimos', 'you plural': 'elegisteis', they: 'eligieron' },
    imperfect: spanishErIrImperfect('eleg'),
    future: spanishFuture('elegir'),
    conditional: spanishConditional('elegir'),
  }),
  verb('enviar', '发送', {
    present: { I: 'envío', you: 'envías', 'he/she': 'envía', we: 'enviamos', 'you plural': 'enviáis', they: 'envían' },
    past: { I: 'envié', you: 'enviaste', 'he/she': 'envió', we: 'enviamos', 'you plural': 'enviasteis', they: 'enviaron' },
    imperfect: spanishArImperfect('envi'),
    future: spanishFuture('enviar'),
    conditional: spanishConditional('enviar'),
  }),
  verb('cerrar', '关闭', {
    present: { I: 'cierro', you: 'cierras', 'he/she': 'cierra', we: 'cerramos', 'you plural': 'cerráis', they: 'cierran' },
    past: { I: 'cerré', you: 'cerraste', 'he/she': 'cerró', we: 'cerramos', 'you plural': 'cerrasteis', they: 'cerraron' },
    imperfect: spanishArImperfect('cerr'),
    future: spanishFuture('cerrar'),
    conditional: spanishConditional('cerrar'),
  }),
  verb('apagar', '关掉', {
    present: { I: 'apago', you: 'apagas', 'he/she': 'apaga', we: 'apagamos', 'you plural': 'apagáis', they: 'apagan' },
    past: { I: 'apagué', you: 'apagaste', 'he/she': 'apagó', we: 'apagamos', 'you plural': 'apagasteis', they: 'apagaron' },
    imperfect: spanishArImperfect('apag'),
    future: spanishFuture('apagar'),
    conditional: spanishConditional('apagar'),
  }),
  verb('encender', '打开（灯）', {
    present: { I: 'enciendo', you: 'enciendes', 'he/she': 'enciende', we: 'encendemos', 'you plural': 'encendéis', they: 'encienden' },
    past: { I: 'encendí', you: 'encendiste', 'he/she': 'encendió', we: 'encendimos', 'you plural': 'encendisteis', they: 'encendieron' },
    imperfect: spanishErIrImperfect('encend'),
    future: spanishFuture('encender'),
    conditional: spanishConditional('encender'),
  }),
  verb('recordar', '记得', {
    present: { I: 'recuerdo', you: 'recuerdas', 'he/she': 'recuerda', we: 'recordamos', 'you plural': 'recordáis', they: 'recuerdan' },
    past: { I: 'recordé', you: 'recordaste', 'he/she': 'recordó', we: 'recordamos', 'you plural': 'recordasteis', they: 'recordaron' },
    imperfect: spanishArImperfect('record'),
    future: spanishFuture('recordar'),
    conditional: spanishConditional('recordar'),
  }),
  verb('morir', '死', {
    present: { I: 'muero', you: 'mueres', 'he/she': 'muere', we: 'morimos', 'you plural': 'morís', they: 'mueren' },
    past: { I: 'morí', you: 'moriste', 'he/she': 'murió', we: 'morimos', 'you plural': 'moristeis', they: 'murieron' },
    imperfect: spanishErIrImperfect('mor'),
    future: spanishFuture('morir'),
    conditional: spanishConditional('morir'),
  }),
  verb('nacer', '出生', {
    present: { I: 'nazco', you: 'naces', 'he/she': 'nace', we: 'nacemos', 'you plural': 'nacéis', they: 'nacen' },
    past: { I: 'nací', you: 'naciste', 'he/she': 'nació', we: 'nacimos', 'you plural': 'nacisteis', they: 'nacieron' },
    imperfect: spanishErIrImperfect('nac'),
    future: spanishFuture('nacer'),
    conditional: spanishConditional('nacer'),
  }),
  verb('volar', '飞', {
    present: { I: 'vuelo', you: 'vuelas', 'he/she': 'vuela', we: 'volamos', 'you plural': 'voláis', they: 'vuelan' },
    past: { I: 'volé', you: 'volaste', 'he/she': 'voló', we: 'volamos', 'you plural': 'volasteis', they: 'volaron' },
    imperfect: spanishArImperfect('vol'),
    future: spanishFuture('volar'),
    conditional: spanishConditional('volar'),
  }),
  spanishArVerb('viajar', '旅行'),
  spanishArVerb('nadar', '游泳'),
  spanishArVerb('enseñar', '教'),
  spanishArVerb('ayudar', '帮助'),
  spanishArVerb('cambiar', '改变'),
  spanishArVerb('cocinar', '做饭'),
  spanishArVerb('terminar', '结束'),
  spanishArVerb('saludar', '打招呼'),
  spanishArVerb('desayunar', '吃早餐'),
  spanishArVerb('cenar', '吃晚餐'),
  spanishArVerb('mandar', '发送 / 命令'),
  spanishArVerb('regalar', '赠送'),
  verb('caer', '跌倒 / 掉落', {
    present: { I: 'caigo', you: 'caes', 'he/she': 'cae', we: 'caemos', 'you plural': 'caéis', they: 'caen' },
    past: { I: 'caí', you: 'caíste', 'he/she': 'cayó', we: 'caímos', 'you plural': 'caísteis', they: 'cayeron' },
    imperfect: spanishErIrImperfect('ca'),
    future: spanishFuture('caer'),
    conditional: spanishConditional('caer'),
  }),
  verb('caber', '容纳 / 装下', {
    present: { I: 'quepo', you: 'cabes', 'he/she': 'cabe', we: 'cabemos', 'you plural': 'cabéis', they: 'caben' },
    past: { I: 'cupe', you: 'cupiste', 'he/she': 'cupo', we: 'cupimos', 'you plural': 'cupisteis', they: 'cupieron' },
    imperfect: spanishErIrImperfect('cab'),
    future: spanishFuture('cabr'),
    conditional: spanishConditional('cabr'),
  }),
  verb('valer', '值 / 价值', {
    present: { I: 'valgo', you: 'vales', 'he/she': 'vale', we: 'valemos', 'you plural': 'valéis', they: 'valen' },
    past: { I: 'valí', you: 'valiste', 'he/she': 'valió', we: 'valimos', 'you plural': 'valisteis', they: 'valieron' },
    imperfect: spanishErIrImperfect('val'),
    future: spanishFuture('valdr'),
    conditional: spanishConditional('valdr'),
  }),
  verb('conducir', '驾驶', {
    present: { I: 'conduzco', you: 'conduces', 'he/she': 'conduce', we: 'conducimos', 'you plural': 'conducís', they: 'conducen' },
    past: { I: 'conduje', you: 'condujiste', 'he/she': 'condujo', we: 'condujimos', 'you plural': 'condujisteis', they: 'condujeron' },
    imperfect: spanishErIrImperfect('conduc'),
    future: spanishFuture('conducir'),
    conditional: spanishConditional('conducir'),
  }),
  verb('traducir', '翻译', {
    present: { I: 'traduzco', you: 'traduces', 'he/she': 'traduce', we: 'traducimos', 'you plural': 'traducís', they: 'traducen' },
    past: { I: 'traduje', you: 'tradujiste', 'he/she': 'tradujo', we: 'tradujimos', 'you plural': 'tradujisteis', they: 'tradujeron' },
    imperfect: spanishErIrImperfect('traduc'),
    future: spanishFuture('traducir'),
    conditional: spanishConditional('traducir'),
  }),
  verb('producir', '生产 / 产生', {
    present: { I: 'produzco', you: 'produces', 'he/she': 'produce', we: 'producimos', 'you plural': 'producís', they: 'producen' },
    past: { I: 'produje', you: 'produjiste', 'he/she': 'produjo', we: 'produjimos', 'you plural': 'produjisteis', they: 'produjeron' },
    imperfect: spanishErIrImperfect('produc'),
    future: spanishFuture('producir'),
    conditional: spanishConditional('producir'),
  }),
  verb('andar', '走 / 行走', {
    present: { I: 'ando', you: 'andas', 'he/she': 'anda', we: 'andamos', 'you plural': 'andáis', they: 'andan' },
    past: { I: 'anduve', you: 'anduviste', 'he/she': 'anduvo', we: 'anduvimos', 'you plural': 'anduvisteis', they: 'anduvieron' },
    imperfect: spanishArImperfect('and'),
    future: spanishFuture('andar'),
    conditional: spanishConditional('andar'),
  }),
  verb('construir', '建造', {
    present: { I: 'construyo', you: 'construyes', 'he/she': 'construye', we: 'construimos', 'you plural': 'construís', they: 'construyen' },
    past: { I: 'construí', you: 'construiste', 'he/she': 'construyó', we: 'construimos', 'you plural': 'construisteis', they: 'construyeron' },
    imperfect: spanishErIrImperfect('constru'),
    future: spanishFuture('construir'),
    conditional: spanishConditional('construir'),
  }),
  verb('huir', '逃跑', {
    present: { I: 'huyo', you: 'huyes', 'he/she': 'huye', we: 'huimos', 'you plural': 'huis', they: 'huyen' },
    past: { I: 'huí', you: 'huiste', 'he/she': 'huyó', we: 'huimos', 'you plural': 'huisteis', they: 'huyeron' },
    imperfect: spanishErIrImperfect('hu'),
    future: spanishFuture('huir'),
    conditional: spanishConditional('huir'),
  }),
  verb('incluir', '包含 / 包括', {
    present: { I: 'incluyo', you: 'incluyes', 'he/she': 'incluye', we: 'incluimos', 'you plural': 'incluís', they: 'incluyen' },
    past: { I: 'incluí', you: 'incluiste', 'he/she': 'incluyó', we: 'incluimos', 'you plural': 'incluisteis', they: 'incluyeron' },
    imperfect: spanishErIrImperfect('inclu'),
    future: spanishFuture('incluir'),
    conditional: spanishConditional('incluir'),
  }),
  verb('reír', '笑', {
    present: { I: 'río', you: 'ríes', 'he/she': 'ríe', we: 'reímos', 'you plural': 'reís', they: 'ríen' },
    past: { I: 'reí', you: 'reíste', 'he/she': 'rió', we: 'reímos', 'you plural': 'reísteis', they: 'rieron' },
    imperfect: spanishErIrImperfect('re'),
    future: spanishFuture('reir'),
    conditional: spanishConditional('reir'),
  }),
  verb('servir', '服务', {
    present: { I: 'sirvo', you: 'sirves', 'he/she': 'sirve', we: 'servimos', 'you plural': 'servís', they: 'sirven' },
    past: { I: 'serví', you: 'serviste', 'he/she': 'sirvió', we: 'servimos', 'you plural': 'servisteis', they: 'sirvieron' },
    imperfect: spanishErIrImperfect('serv'),
    future: spanishFuture('servir'),
    conditional: spanishConditional('servir'),
  }),
  verb('repetir', '重复', {
    present: { I: 'repito', you: 'repites', 'he/she': 'repite', we: 'repetimos', 'you plural': 'repetís', they: 'repiten' },
    past: { I: 'repetí', you: 'repetiste', 'he/she': 'repitió', we: 'repetimos', 'you plural': 'repetisteis', they: 'repitieron' },
    imperfect: spanishErIrImperfect('repet'),
    future: spanishFuture('repetir'),
    conditional: spanishConditional('repetir'),
  }),
  verb('mentir', '说谎', {
    present: { I: 'miento', you: 'mientes', 'he/she': 'miente', we: 'mentimos', 'you plural': 'mentís', they: 'mienten' },
    past: { I: 'mentí', you: 'mentiste', 'he/she': 'mintió', we: 'mentimos', 'you plural': 'mentisteis', they: 'mintieron' },
    imperfect: spanishErIrImperfect('ment'),
    future: spanishFuture('mentir'),
    conditional: spanishConditional('mentir'),
  }),
  verb('preferir', '更喜欢 / 宁愿', {
    present: { I: 'prefiero', you: 'prefieres', 'he/she': 'prefiere', we: 'preferimos', 'you plural': 'preferís', they: 'prefieren' },
    past: { I: 'preferí', you: 'preferiste', 'he/she': 'prefirió', we: 'preferimos', 'you plural': 'preferisteis', they: 'prefirieron' },
    imperfect: spanishErIrImperfect('prefer'),
    future: spanishFuture('preferir'),
    conditional: spanishConditional('preferir'),
  }),
  verb('mantener', '保持 / 维持', {
    present: { I: 'mantengo', you: 'mantienes', 'he/she': 'mantiene', we: 'mantenemos', 'you plural': 'mantenéis', they: 'mantienen' },
    past: { I: 'mantuve', you: 'mantuviste', 'he/she': 'mantuvo', we: 'mantuvimos', 'you plural': 'mantuvisteis', they: 'mantuvieron' },
    imperfect: spanishErIrImperfect('manten'),
    future: spanishFuture('mantendr'),
    conditional: spanishConditional('mantendr'),
  }),
  verb('suponer', '假设 / 认为', {
    present: { I: 'supongo', you: 'supones', 'he/she': 'supone', we: 'suponemos', 'you plural': 'suponéis', they: 'suponen' },
    past: { I: 'supuse', you: 'supusiste', 'he/she': 'supuso', we: 'supusimos', 'you plural': 'supusisteis', they: 'supusieron' },
    imperfect: spanishErIrImperfect('supon'),
    future: spanishFuture('supondr'),
    conditional: spanishConditional('supondr'),
  }),
  verb('ofrecer', '提供', {
    present: { I: 'ofrezco', you: 'ofreces', 'he/she': 'ofrece', we: 'ofrecemos', 'you plural': 'ofrecéis', they: 'ofrecen' },
    past: { I: 'ofrecí', you: 'ofreciste', 'he/she': 'ofreció', we: 'ofrecimos', 'you plural': 'ofrecisteis', they: 'ofrecieron' },
    imperfect: spanishErIrImperfect('ofrec'),
    future: spanishFuture('ofrecer'),
    conditional: spanishConditional('ofrecer'),
  }),
  verb('parecer', '似乎 / 看起来', {
    present: { I: 'parezco', you: 'pareces', 'he/she': 'parece', we: 'parecemos', 'you plural': 'parecéis', they: 'parecen' },
    past: { I: 'parecí', you: 'pareciste', 'he/she': 'pareció', we: 'parecimos', 'you plural': 'parecisteis', they: 'parecieron' },
    imperfect: spanishErIrImperfect('parec'),
    future: spanishFuture('parecer'),
    conditional: spanishConditional('parecer'),
  }),
  verb('mostrar', '展示 / 显示', {
    present: { I: 'muestro', you: 'muestras', 'he/she': 'muestra', we: 'mostramos', 'you plural': 'mostráis', they: 'muestran' },
    past: { I: 'mostré', you: 'mostraste', 'he/she': 'mostró', we: 'mostramos', 'you plural': 'mostrasteis', they: 'mostraron' },
    imperfect: spanishArImperfect('mostr'),
    future: spanishFuture('mostrar'),
    conditional: spanishConditional('mostrar'),
  }),
];

const italianVerbs: BaseVerbEntry[] = [
  verb('essere', '是 / 存在', {
    present: { I: 'sono', you: 'sei', 'he/she': 'è', we: 'siamo', 'you plural': 'siete', they: 'sono' },
    past: { I: 'sono stato', you: 'sei stato', 'he/she': 'è stato', we: 'siamo stati', 'you plural': 'siete stati', they: 'sono stati' },
    imperfect: { I: 'ero', you: 'eri', 'he/she': 'era', we: 'eravamo', 'you plural': 'eravate', they: 'erano' },
    future: { I: 'sarò', you: 'sarai', 'he/she': 'sarà', we: 'saremo', 'you plural': 'sarete', they: 'saranno' },
    conditional: italianConditional('sar'),
  }),
  verb('avere', '有', {
    present: { I: 'ho', you: 'hai', 'he/she': 'ha', we: 'abbiamo', 'you plural': 'avete', they: 'hanno' },
    past: { I: 'ho avuto', you: 'hai avuto', 'he/she': 'ha avuto', we: 'abbiamo avuto', 'you plural': 'avete avuto', they: 'hanno avuto' },
    imperfect: italianEreImperfect('av'),
    future: { I: 'avrò', you: 'avrai', 'he/she': 'avrà', we: 'avremo', 'you plural': 'avrete', they: 'avranno' },
    conditional: italianConditional('avr'),
  }),
  verb('andare', '去', {
    present: { I: 'vado', you: 'vai', 'he/she': 'va', we: 'andiamo', 'you plural': 'andate', they: 'vanno' },
    past: { I: 'sono andato', you: 'sei andato', 'he/she': 'è andato', we: 'siamo andati', 'you plural': 'siete andati', they: 'sono andati' },
    imperfect: italianAreImperfect('and'),
    future: { I: 'andrò', you: 'andrai', 'he/she': 'andrà', we: 'andremo', 'you plural': 'andrete', they: 'andranno' },
    conditional: italianConditional('andr'),
  }),
  verb('fare', '做 / 制作', {
    present: { I: 'faccio', you: 'fai', 'he/she': 'fa', we: 'facciamo', 'you plural': 'fate', they: 'fanno' },
    past: italianCompound('fatto'),
    imperfect: italianEreImperfect('fac'),
    future: italianFuture('far'),
    conditional: italianConditional('far'),
  }),
  verb('dire', '说', {
    present: { I: 'dico', you: 'dici', 'he/she': 'dice', we: 'diciamo', 'you plural': 'dite', they: 'dicono' },
    past: italianCompound('detto'),
    imperfect: italianEreImperfect('dic'),
    future: italianFuture('dir'),
    conditional: italianConditional('dir'),
  }),
  verb('potere', '能够', {
    present: { I: 'posso', you: 'puoi', 'he/she': 'può', we: 'possiamo', 'you plural': 'potete', they: 'possono' },
    past: italianCompound('potuto'),
    imperfect: italianEreImperfect('pot'),
    future: italianFuture('potr'),
    conditional: italianConditional('potr'),
  }),
  verb('volere', '想要', {
    present: { I: 'voglio', you: 'vuoi', 'he/she': 'vuole', we: 'vogliamo', 'you plural': 'volete', they: 'vogliono' },
    past: italianCompound('voluto'),
    imperfect: italianEreImperfect('vol'),
    future: italianFuture('vorr'),
    conditional: italianConditional('vorr'),
  }),
  verb('sapere', '知道', {
    present: { I: 'so', you: 'sai', 'he/she': 'sa', we: 'sappiamo', 'you plural': 'sapete', they: 'sanno' },
    past: italianCompound('saputo'),
    imperfect: italianEreImperfect('sap'),
    future: italianFuture('sapr'),
    conditional: italianConditional('sapr'),
  }),
  verb('vedere', '看见', {
    present: { I: 'vedo', you: 'vedi', 'he/she': 'vede', we: 'vediamo', 'you plural': 'vedete', they: 'vedono' },
    past: italianCompound('visto'),
    imperfect: italianEreImperfect('ved'),
    future: italianFuture('vedr'),
    conditional: italianConditional('vedr'),
  }),
  verb('venire', '来', {
    present: { I: 'vengo', you: 'vieni', 'he/she': 'viene', we: 'veniamo', 'you plural': 'venite', they: 'vengono' },
    past: { I: 'sono venuto', you: 'sei venuto', 'he/she': 'è venuto', we: 'siamo venuti', 'you plural': 'siete venuti', they: 'sono venuti' },
    imperfect: italianIreImperfect('ven'),
    future: italianFuture('verr'),
    conditional: italianConditional('verr'),
  }),
  verb('prendere', '拿 / 乘坐', {
    present: { I: 'prendo', you: 'prendi', 'he/she': 'prende', we: 'prendiamo', 'you plural': 'prendete', they: 'prendono' },
    past: italianCompound('preso'),
    imperfect: italianEreImperfect('prend'),
    future: italianFuture('prender'),
    conditional: italianConditional('prender'),
  }),
  verb('mettere', '放置 / 穿上', {
    present: { I: 'metto', you: 'metti', 'he/she': 'mette', we: 'mettiamo', 'you plural': 'mettete', they: 'mettono' },
    past: italianCompound('messo'),
    imperfect: italianEreImperfect('mett'),
    future: italianFuture('metter'),
    conditional: italianConditional('metter'),
  }),
  verb('dovere', '必须 / 应该', {
    present: { I: 'devo', you: 'devi', 'he/she': 'deve', we: 'dobbiamo', 'you plural': 'dovete', they: 'devono' },
    past: italianCompound('dovuto'),
    imperfect: italianEreImperfect('dov'),
    future: italianFuture('dovr'),
    conditional: italianConditional('dovr'),
  }),
  verb('leggere', '读', {
    present: { I: 'leggo', you: 'leggi', 'he/she': 'legge', we: 'leggiamo', 'you plural': 'leggete', they: 'leggono' },
    past: italianCompound('letto'),
    imperfect: italianEreImperfect('legg'),
    future: italianFuture('legger'),
    conditional: italianConditional('legger'),
  }),
  verb('scrivere', '写', {
    present: { I: 'scrivo', you: 'scrivi', 'he/she': 'scrive', we: 'scriviamo', 'you plural': 'scrivete', they: 'scrivono' },
    past: italianCompound('scritto'),
    imperfect: italianEreImperfect('scriv'),
    future: italianFuture('scriver'),
    conditional: italianConditional('scriver'),
  }),
  italianAreVerb('parlare', '说 / 交谈'),
  italianAreVerb('amare', '爱'),
  italianAreVerb('guardare', '看'),
  italianAreVerb('ascoltare', '听'),
  italianAreVerb('trovare', '找到'),
  italianAreVerb('pensare', '想 / 认为'),
  italianAreVerb('lavorare', '工作'),
  italianAreVerb('camminare', '走路'),
  italianAreVerb('domandare', '询问'),
  italianAreVerb('portare', '携带 / 穿'),
  italianAreVerb('abitare', '居住'),
  italianAreVerb('studiare', '学习'),
  italianAreVerb('visitare', '参观'),
  italianAreVerb('cantare', '唱歌'),
  italianAreVerb('ballare', '跳舞'),
  italianAreVerb('preparare', '准备'),
  italianAreVerb('usare', '使用'),
  italianAreVerb('accettare', '接受'),
  italianAreVerb('rifiutare', '拒绝'),
  italianAreVerb('invitare', '邀请'),
  italianAreVerb('aiutare', '帮助'),
  italianAreVerb('comprare', '购买'),
  italianEreVerb('credere', '相信'),
  italianEreVerb('vendere', '卖'),
  italianEreVerb('ricevere', '收到'),
  italianEreVerb('rispondere', '回答', 'risposto'),
  italianEreVerb('perdere', '失去 / 输'),
  italianEreVerb('temere', '害怕'),
  italianEreVerb('battere', '敲打 / 击败'),
  italianIreVerb('dormire', '睡觉'),
  italianIreVerb('sentire', '听见 / 感觉'),
  italianIreVerb('servire', '服务 / 需要'),
  italianIscVerb('capire', '理解'),
  italianIscVerb('finire', '完成'),
  italianIscVerb('costruire', '建造'),
  verb('dare', '给', {
    present: { I: 'do', you: 'dai', 'he/she': 'dà', we: 'diamo', 'you plural': 'date', they: 'danno' },
    past: italianCompound('dato'),
    imperfect: italianAreImperfect('d'),
    future: italianFuture('dar'),
    conditional: italianConditional('dar'),
  }),
  verb('aprire', '打开', {
    present: { I: 'apro', you: 'apri', 'he/she': 'apre', we: 'apriamo', 'you plural': 'aprite', they: 'aprono' },
    past: italianCompound('aperto'),
    imperfect: italianIreImperfect('apr'),
    future: italianFuture('aprir'),
    conditional: italianConditional('aprir'),
  }),
  italianAreVerb('mangiare', '吃'),
  verb('bere', '喝', {
    present: { I: 'bevo', you: 'bevi', 'he/she': 'beve', we: 'beviamo', 'you plural': 'bevete', they: 'bevono' },
    past: italianCompound('bevuto'),
    imperfect: italianEreImperfect('bev'),
    future: italianFuture('berr'),
    conditional: italianConditional('berr'),
  }),
  verb('chiudere', '关闭', {
    present: { I: 'chiudo', you: 'chiudi', 'he/she': 'chiude', we: 'chiudiamo', 'you plural': 'chiudete', they: 'chiudono' },
    past: italianCompound('chiuso'),
    imperfect: italianEreImperfect('chiud'),
    future: italianFuture('chiuder'),
    conditional: italianConditional('chiuder'),
  }),
  verb('conoscere', '认识', {
    present: { I: 'conosco', you: 'conosci', 'he/she': 'conosce', we: 'conosciamo', 'you plural': 'conoscete', they: 'conoscono' },
    past: italianCompound('conosciuto'),
    imperfect: italianEreImperfect('conosc'),
    future: italianFuture('conoscer'),
    conditional: italianConditional('conoscer'),
  }),
  verb('chiedere', '问', {
    present: { I: 'chiedo', you: 'chiedi', 'he/she': 'chiede', we: 'chiediamo', 'you plural': 'chiedete', they: 'chiedono' },
    past: italianCompound('chiesto'),
    imperfect: italianEreImperfect('chied'),
    future: italianFuture('chieder'),
    conditional: italianConditional('chieder'),
  }),
  verb('uscire', '出去', {
    present: { I: 'esco', you: 'esci', 'he/she': 'esce', we: 'usciamo', 'you plural': 'uscite', they: 'escono' },
    past: { I: 'sono uscito', you: 'sei uscito', 'he/she': 'è uscito', we: 'siamo usciti', 'you plural': 'siete usciti', they: 'sono usciti' },
    imperfect: italianIreImperfect('usc'),
    future: italianFuture('uscir'),
    conditional: italianConditional('uscir'),
  }),
  verb('vivere', '生活 / 居住', {
    present: { I: 'vivo', you: 'vivi', 'he/she': 'vive', we: 'viviamo', 'you plural': 'vivete', they: 'vivono' },
    past: italianCompound('vissuto'),
    imperfect: italianEreImperfect('viv'),
    future: italianFuture('vivr'),
    conditional: italianConditional('vivr'),
  }),
  verb('partire', '离开 / 出发', {
    present: { I: 'parto', you: 'parti', 'he/she': 'parte', we: 'partiamo', 'you plural': 'partite', they: 'partono' },
    past: { I: 'sono partito', you: 'sei partito', 'he/she': 'è partito', we: 'siamo partiti', 'you plural': 'siete partiti', they: 'sono partiti' },
    imperfect: italianIreImperfect('part'),
    future: italianFuture('partir'),
    conditional: italianConditional('partir'),
  }),
  verb('pagare', '支付', {
    present: { I: 'pago', you: 'paghi', 'he/she': 'paga', we: 'paghiamo', 'you plural': 'pagate', they: 'pagano' },
    past: italianCompound('pagato'),
    imperfect: italianAreImperfect('pag'),
    future: italianFuture('pagher'),
    conditional: italianConditional('pagher'),
  }),
  verb('giocare', '玩', {
    present: { I: 'gioco', you: 'giochi', 'he/she': 'gioca', we: 'giochiamo', 'you plural': 'giocate', they: 'giocano' },
    past: italianCompound('giocato'),
    imperfect: italianAreImperfect('gioc'),
    future: italianFuture('giocher'),
    conditional: italianConditional('giocher'),
  }),
  verb('cercare', '寻找', {
    present: { I: 'cerco', you: 'cerchi', 'he/she': 'cerca', we: 'cerchiamo', 'you plural': 'cercate', they: 'cercano' },
    past: italianCompound('cercato'),
    imperfect: italianAreImperfect('cerc'),
    future: italianFuture('cercher'),
    conditional: italianConditional('cercher'),
  }),
  verb('entrare', '进入', {
    present: { I: 'entro', you: 'entri', 'he/she': 'entra', we: 'entriamo', 'you plural': 'entrate', they: 'entrano' },
    past: { I: 'sono entrato', you: 'sei entrato', 'he/she': 'è entrato', we: 'siamo entrati', 'you plural': 'siete entrati', they: 'sono entrati' },
    imperfect: italianAreImperfect('entr'),
    future: italianFuture('entrer'),
    conditional: italianConditional('entrer'),
  }),
  verb('tornare', '返回', {
    present: { I: 'torno', you: 'torni', 'he/she': 'torna', we: 'torniamo', 'you plural': 'tornate', they: 'tornano' },
    past: { I: 'sono tornato', you: 'sei tornato', 'he/she': 'è tornato', we: 'siamo tornati', 'you plural': 'siete tornati', they: 'sono tornati' },
    imperfect: italianAreImperfect('torn'),
    future: italianFuture('torner'),
    conditional: italianConditional('torner'),
  }),
  verb('arrivare', '到达', {
    present: { I: 'arrivo', you: 'arrivi', 'he/she': 'arriva', we: 'arriviamo', 'you plural': 'arrivate', they: 'arrivano' },
    past: { I: 'sono arrivato', you: 'sei arrivato', 'he/she': 'è arrivato', we: 'siamo arrivati', 'you plural': 'siete arrivati', they: 'sono arrivati' },
    imperfect: italianAreImperfect('arriv'),
    future: italianFuture('arriver'),
    conditional: italianConditional('arriver'),
  }),
  verb('rimanere', '留下', {
    present: { I: 'rimango', you: 'rimani', 'he/she': 'rimane', we: 'rimaniamo', 'you plural': 'rimanete', they: 'rimangono' },
    past: { I: 'sono rimasto', you: 'sei rimasto', 'he/she': 'è rimasto', we: 'siamo rimasti', 'you plural': 'siete rimasti', they: 'sono rimasti' },
    imperfect: italianEreImperfect('riman'),
    future: italianFuture('rimarr'),
    conditional: italianConditional('rimarr'),
  }),
  verb('nascere', '出生', {
    present: { I: 'nasco', you: 'nasci', 'he/she': 'nasce', we: 'nasciamo', 'you plural': 'nascete', they: 'nascono' },
    past: { I: 'sono nato', you: 'sei nato', 'he/she': 'è nato', we: 'siamo nati', 'you plural': 'siete nati', they: 'sono nati' },
    imperfect: italianEreImperfect('nasc'),
    future: italianFuture('nascer'),
    conditional: italianConditional('nascer'),
  }),
  verb('morire', '死', {
    present: { I: 'muoio', you: 'muori', 'he/she': 'muore', we: 'moriamo', 'you plural': 'morite', they: 'muoiono' },
    past: { I: 'sono morto', you: 'sei morto', 'he/she': 'è morto', we: 'siamo morti', 'you plural': 'siete morti', they: 'sono morti' },
    imperfect: italianIreImperfect('mor'),
    future: italianFuture('morir'),
    conditional: italianConditional('morir'),
  }),
  verb('stare', '处于 / 保持', {
    present: { I: 'sto', you: 'stai', 'he/she': 'sta', we: 'stiamo', 'you plural': 'state', they: 'stanno' },
    past: { I: 'sono stato', you: 'sei stato', 'he/she': 'è stato', we: 'siamo stati', 'you plural': 'siete stati', they: 'sono stati' },
    imperfect: italianAreImperfect('st'),
    future: italianFuture('star'),
    conditional: italianConditional('star'),
  }),
  italianAreVerb('suonare', '演奏'),
  italianAreVerb('cucinare', '做饭'),
  italianAreVerb('lavare', '洗'),
  italianIscVerb('pulire', '打扫'),
  verb('offrire', '提供', {
    present: { I: 'offro', you: 'offri', 'he/she': 'offre', we: 'offriamo', 'you plural': 'offrite', they: 'offrono' },
    past: italianCompound('offerto'),
    imperfect: italianIreImperfect('offr'),
    future: italianFuture('offrir'),
    conditional: italianConditional('offrir'),
  }),
  verb('coprire', '覆盖', {
    present: { I: 'copro', you: 'copri', 'he/she': 'copre', we: 'copriamo', 'you plural': 'coprite', they: 'coprono' },
    past: italianCompound('coperto'),
    imperfect: italianIreImperfect('copr'),
    future: italianFuture('coprir'),
    conditional: italianConditional('coprir'),
  }),
  italianAreVerb('svegliare', '唤醒'),
  verb('spiegare', '解释', {
    present: { I: 'spiego', you: 'spieghi', 'he/she': 'spiega', we: 'spieghiamo', 'you plural': 'spiegate', they: 'spiegano' },
    past: italianCompound('spiegato'),
    imperfect: italianAreImperfect('spieg'),
    future: italianFuture('spiegher'),
    conditional: italianConditional('spiegher'),
  }),
  italianAreVerb('regalare', '赠送'),
  italianAreVerb('mandare', '发送'),
  italianAreVerb('incontrare', '遇见'),
  italianAreVerb('aspettare', '等待'),
  verb('correre', '跑', {
    present: { I: 'corro', you: 'corri', 'he/she': 'corre', we: 'corriamo', 'you plural': 'correte', they: 'corrono' },
    past: italianCompound('corso'),
    imperfect: italianEreImperfect('corr'),
    future: italianFuture('correr'),
    conditional: italianConditional('correr'),
  }),
  verb('ridere', '笑', {
    present: { I: 'rido', you: 'ridi', 'he/she': 'ride', we: 'ridiamo', 'you plural': 'ridete', they: 'ridono' },
    past: italianCompound('riso'),
    imperfect: italianEreImperfect('rid'),
    future: italianFuture('rider'),
    conditional: italianConditional('rider'),
  }),
  verb('sorridere', '微笑', {
    present: { I: 'sorrido', you: 'sorridi', 'he/she': 'sorride', we: 'sorridiamo', 'you plural': 'sorridete', they: 'sorridono' },
    past: italianCompound('sorriso'),
    imperfect: italianEreImperfect('sorrid'),
    future: italianFuture('sorrider'),
    conditional: italianConditional('sorrider'),
  }),
  verb('piangere', '哭', {
    present: { I: 'piango', you: 'piangi', 'he/she': 'piange', we: 'piangiamo', 'you plural': 'piangete', they: 'piangono' },
    past: italianCompound('pianto'),
    imperfect: italianEreImperfect('piang'),
    future: italianFuture('pianger'),
    conditional: italianConditional('pianger'),
  }),
  verb('scegliere', '选择', {
    present: { I: 'scelgo', you: 'scegli', 'he/she': 'sceglie', we: 'scegliamo', 'you plural': 'scegliete', they: 'scelgono' },
    past: italianCompound('scelto'),
    imperfect: italianEreImperfect('scegl'),
    future: italianFuture('sceglier'),
    conditional: italianConditional('sceglier'),
  }),
  verb('vincere', '赢', {
    present: { I: 'vinco', you: 'vinci', 'he/she': 'vince', we: 'vinciamo', 'you plural': 'vincete', they: 'vincono' },
    past: italianCompound('vinto'),
    imperfect: italianEreImperfect('vinc'),
    future: italianFuture('vincer'),
    conditional: italianConditional('vincer'),
  }),
  verb('rompere', '打破', {
    present: { I: 'rompo', you: 'rompi', 'he/she': 'rompe', we: 'rompiamo', 'you plural': 'rompete', they: 'rompono' },
    past: italianCompound('rotto'),
    imperfect: italianEreImperfect('romp'),
    future: italianFuture('romper'),
    conditional: italianConditional('romper'),
  }),
  verb('tenere', '拿着 / 保持', {
    present: { I: 'tengo', you: 'tieni', 'he/she': 'tiene', we: 'teniamo', 'you plural': 'tenete', they: 'tengono' },
    past: italianCompound('tenuto'),
    imperfect: italianEreImperfect('ten'),
    future: italianFuture('terr'),
    conditional: italianConditional('terr'),
  }),
  verb('raggiungere', '达到 / 赶上', {
    present: { I: 'raggiungo', you: 'raggiungi', 'he/she': 'raggiunge', we: 'raggiungiamo', 'you plural': 'raggiungete', they: 'raggiungono' },
    past: italianCompound('raggiunto'),
    imperfect: italianEreImperfect('raggiung'),
    future: italianFuture('raggiunger'),
    conditional: italianConditional('raggiunger'),
  }),
  verb('spegnere', '关掉', {
    present: { I: 'spengo', you: 'spegni', 'he/she': 'spegne', we: 'spegniamo', 'you plural': 'spegnete', they: 'spengono' },
    past: italianCompound('spento'),
    imperfect: italianEreImperfect('spegn'),
    future: italianFuture('spegner'),
    conditional: italianConditional('spegner'),
  }),
  verb('accendere', '打开（灯）', {
    present: { I: 'accendo', you: 'accendi', 'he/she': 'accende', we: 'accendiamo', 'you plural': 'accendete', they: 'accendono' },
    past: italianCompound('acceso'),
    imperfect: italianEreImperfect('accend'),
    future: italianFuture('accender'),
    conditional: italianConditional('accender'),
  }),
  verb('vestire', '穿衣', {
    present: { I: 'vesto', you: 'vesti', 'he/she': 'veste', we: 'vestiamo', 'you plural': 'vestite', they: 'vestono' },
    past: italianCompound('vestito'),
    imperfect: italianIreImperfect('vest'),
    future: italianFuture('vestir'),
    conditional: italianConditional('vestir'),
  }),
  verb('seguire', '跟随', {
    present: { I: 'seguo', you: 'segui', 'he/she': 'segue', we: 'seguiamo', 'you plural': 'seguite', they: 'seguono' },
    past: italianCompound('seguito'),
    imperfect: italianIreImperfect('segu'),
    future: italianFuture('seguir'),
    conditional: italianConditional('seguir'),
  }),
  italianAreVerb('volare', '飞'),
  italianAreVerb('nuotare', '游泳'),
  italianAreVerb('riposare', '休息'),
  italianAreVerb('viaggiare', '旅行'),
  italianAreVerb('cambiare', '改变'),
  verb('salire', '上去 / 登上', {
    present: { I: 'salgo', you: 'sali', 'he/she': 'sale', we: 'saliamo', 'you plural': 'salite', they: 'salgono' },
    past: { I: 'sono salito', you: 'sei salito', 'he/she': 'è salito', we: 'siamo saliti', 'you plural': 'siete saliti', they: 'sono saliti' },
    imperfect: italianIreImperfect('sal'),
    future: italianFuture('salir'),
    conditional: italianConditional('salir'),
  }),
  verb('cadere', '跌倒 / 掉落', {
    present: { I: 'cado', you: 'cadi', 'he/she': 'cade', we: 'cadiamo', 'you plural': 'cadete', they: 'cadono' },
    past: { I: 'sono caduto', you: 'sei caduto', 'he/she': 'è caduto', we: 'siamo caduti', 'you plural': 'siete caduti', they: 'sono caduti' },
    imperfect: italianEreImperfect('cad'),
    future: italianFuture('cadr'),
    conditional: italianConditional('cadr'),
  }),
  verb('togliere', '拿走 / 脱下', {
    present: { I: 'tolgo', you: 'togli', 'he/she': 'toglie', we: 'togliamo', 'you plural': 'togliete', they: 'tolgono' },
    past: italianCompound('tolto'),
    imperfect: italianEreImperfect('togli'),
    future: italianFuture('toglier'),
    conditional: italianConditional('toglier'),
  }),
  verb('raccogliere', '收集 / 捡起', {
    present: { I: 'raccolgo', you: 'raccogli', 'he/she': 'raccoglie', we: 'raccogliamo', 'you plural': 'raccogliete', they: 'raccolgono' },
    past: italianCompound('raccolto'),
    imperfect: italianEreImperfect('raccogli'),
    future: italianFuture('raccoglier'),
    conditional: italianConditional('raccoglier'),
  }),
  verb('proporre', '提议 / 建议', {
    present: { I: 'propongo', you: 'proponi', 'he/she': 'propone', we: 'proponiamo', 'you plural': 'proponete', they: 'propongono' },
    past: italianCompound('proposto'),
    imperfect: italianEreImperfect('propon'),
    future: italianFuture('proporr'),
    conditional: italianConditional('proporr'),
  }),
  verb('tradurre', '翻译', {
    present: { I: 'traduco', you: 'traduci', 'he/she': 'traduce', we: 'traduciamo', 'you plural': 'traducete', they: 'traducono' },
    past: italianCompound('tradotto'),
    imperfect: italianEreImperfect('traduc'),
    future: italianFuture('tradurr'),
    conditional: italianConditional('tradurr'),
  }),
  verb('produrre', '生产 / 产生', {
    present: { I: 'produco', you: 'produci', 'he/she': 'produce', we: 'produciamo', 'you plural': 'producete', they: 'producono' },
    past: italianCompound('prodotto'),
    imperfect: italianEreImperfect('produc'),
    future: italianFuture('produrr'),
    conditional: italianConditional('produrr'),
  }),
  verb('piacere', '喜欢 / 讨人喜欢', {
    present: { I: 'piaccio', you: 'piaci', 'he/she': 'piace', we: 'piacciamo', 'you plural': 'piacete', they: 'piacciono' },
    past: { I: 'sono piaciuto', you: 'sei piaciuto', 'he/she': 'è piaciuto', we: 'siamo piaciuti', 'you plural': 'siete piaciuti', they: 'sono piaciuti' },
    imperfect: italianEreImperfect('piac'),
    future: italianFuture('piacer'),
    conditional: italianConditional('piacer'),
  }),
  verb('tacere', '保持沉默', {
    present: { I: 'taccio', you: 'taci', 'he/she': 'tace', we: 'tacciamo', 'you plural': 'tacete', they: 'tacciono' },
    past: italianCompound('taciuto'),
    imperfect: italianEreImperfect('tac'),
    future: italianFuture('tacer'),
    conditional: italianConditional('tacer'),
  }),
  verb('muovere', '移动', {
    present: { I: 'muovo', you: 'muovi', 'he/she': 'muove', we: 'muoviamo', 'you plural': 'muovete', they: 'muovono' },
    past: italianCompound('mosso'),
    imperfect: italianEreImperfect('muov'),
    future: italianFuture('muover'),
    conditional: italianConditional('muover'),
  }),
  verb('scendere', '下来 / 下车', {
    present: { I: 'scendo', you: 'scendi', 'he/she': 'scende', we: 'scendiamo', 'you plural': 'scendete', they: 'scendono' },
    past: { I: 'sono sceso', you: 'sei sceso', 'he/she': 'è sceso', we: 'siamo scesi', 'you plural': 'siete scesi', they: 'sono scesi' },
    imperfect: italianEreImperfect('scend'),
    future: italianFuture('scender'),
    conditional: italianConditional('scender'),
  }),
  verb('spendere', '花费', {
    present: { I: 'spendo', you: 'spendi', 'he/she': 'spende', we: 'spendiamo', 'you plural': 'spendete', they: 'spendono' },
    past: italianCompound('speso'),
    imperfect: italianEreImperfect('spend'),
    future: italianFuture('spender'),
    conditional: italianConditional('spender'),
  }),
  verb('decidere', '决定', {
    present: { I: 'decido', you: 'decidi', 'he/she': 'decide', we: 'decidiamo', 'you plural': 'decidete', they: 'decidono' },
    past: italianCompound('deciso'),
    imperfect: italianEreImperfect('decid'),
    future: italianFuture('decider'),
    conditional: italianConditional('decider'),
  }),
  verb('permettere', '允许', {
    present: { I: 'permetto', you: 'permetti', 'he/she': 'permette', we: 'permettiamo', 'you plural': 'permettete', they: 'permettono' },
    past: italianCompound('permesso'),
    imperfect: italianEreImperfect('permett'),
    future: italianFuture('permetter'),
    conditional: italianConditional('permetter'),
  }),
  verb('promettere', '承诺 / 答应', {
    present: { I: 'prometto', you: 'prometti', 'he/she': 'promette', we: 'promettiamo', 'you plural': 'promettete', they: 'promettono' },
    past: italianCompound('promesso'),
    imperfect: italianEreImperfect('promett'),
    future: italianFuture('prometter'),
    conditional: italianConditional('prometter'),
  }),
  verb('nascondere', '藏 / 隐藏', {
    present: { I: 'nascondo', you: 'nascondi', 'he/she': 'nasconde', we: 'nascondiamo', 'you plural': 'nascondete', they: 'nascondono' },
    past: italianCompound('nascosto'),
    imperfect: italianEreImperfect('nascond'),
    future: italianFuture('nasconder'),
    conditional: italianConditional('nasconder'),
  }),
  verb('aggiungere', '添加 / 补充', {
    present: { I: 'aggiungo', you: 'aggiungi', 'he/she': 'aggiunge', we: 'aggiungiamo', 'you plural': 'aggiungete', they: 'aggiungono' },
    past: italianCompound('aggiunto'),
    imperfect: italianEreImperfect('aggiung'),
    future: italianFuture('aggiunger'),
    conditional: italianConditional('aggiunger'),
  }),
  verb('scoprire', '发现', {
    present: { I: 'scopro', you: 'scopri', 'he/she': 'scopre', we: 'scopriamo', 'you plural': 'scoprite', they: 'scoprono' },
    past: italianCompound('scoperto'),
    imperfect: italianIreImperfect('scopr'),
    future: italianFuture('scoprir'),
    conditional: italianConditional('scoprir'),
  }),
  italianIscVerb('preferire', '更喜欢 / 宁愿'),
  italianAreVerb('guidare', '驾驶'),
];

const emptyForms = (): Record<Pronoun, string> => ({ I: '', you: '', 'he/she': '', we: '', 'you plural': '', they: '' });

const nonFiniteLabels: Record<LanguageId, Record<NonFiniteForm | 'nonFinite', string>> = {
  english: { pastParticiple: 'Past participle', presentParticiple: 'Present participle', gerund: 'Gerund', nonFinite: 'Non-finite forms' },
  french: { pastParticiple: 'Participe passé', presentParticiple: 'Participe présent', gerund: 'Gérondif', nonFinite: 'Formes non personnelles' },
  spanish: { pastParticiple: 'Participio', presentParticiple: 'Participio presente', gerund: 'Gerundio', nonFinite: 'Formas no personales' },
  italian: { pastParticiple: 'Participio passato', presentParticiple: 'Participio presente', gerund: 'Gerundio', nonFinite: 'Forme indefinite' },
};

const buildVerbEntries = (verbs: BaseVerbEntry[], languageId: LanguageId, deriveSubjunctive: Parameters<typeof withSubjunctive>[1]): VerbEntry[] =>
  withImperative(withSubjunctive(verbs, deriveSubjunctive), languageId).map((verb) => {
    const nonFinite = nonFiniteFormsByLanguage[languageId][verb.infinitive];
    return {
      ...verb,
      nonFinite,
      forms: {
        ...verb.forms,
        passeSimple: languageId === 'french' ? frenchPasseSimple(verb.infinitive) : emptyForms(),
        imperfectSubjunctive: languageId === 'spanish' ? spanishImperfectSubjunctive(verb, 'ra') : emptyForms(),
        pastParticiple: { ...emptyForms(), 'he/she': nonFinite?.pastParticiple ?? '' },
        presentParticiple: { ...emptyForms(), 'he/she': nonFinite?.presentParticiple ?? '' },
        gerund: { ...emptyForms(), 'he/she': nonFinite?.gerund ?? '' },
      },
      // The -se paradigm is reference data and is never a quiz target or distractor.
      ...(languageId === 'spanish' ? { imperfectSubjunctiveSe: spanishImperfectSubjunctive(verb, 'se') } : {}),
    };
  });

export const languages: Language[] = [
  {
    id: 'english',
    name: 'English',
    nativeName: 'English',
    accent: '#2563eb',
    darkAccent: '#6d9ff5',
    pronounLabels: { I: 'I', you: 'you', 'he/she': 'he/she/it', we: 'we', 'you plural': 'you (plural)', they: 'they' },
    tenseLabels: { ...nonFiniteLabels.english, present: 'Present', past: 'Past', passeSimple: 'Passé simple', imperfect: 'Imperfect', future: 'Future', conditional: 'Conditional', subjunctive: 'Subjunctive', imperfectSubjunctive: 'Imperfect subjunctive', imperative: 'Affirmative imperative', imperativeNegative: 'Negative imperative', commands: 'Imperative', mixed: 'Mixed' },
    verbs: buildVerbEntries(englishVerbs, 'english', englishSubjunctive),
  },
  {
    id: 'french',
    name: 'French',
    nativeName: 'Français',
    accent: '#0f766e',
    darkAccent: '#5ec4b8',
    pronounLabels: { I: 'je', you: 'tu', 'he/she': 'il/elle', we: 'nous', 'you plural': 'vous', they: 'ils/elles' },
    tenseLabels: { ...nonFiniteLabels.french, present: 'Présent', past: 'Passé composé', passeSimple: 'Passé simple', imperfect: 'Imparfait', future: 'Futur', conditional: 'Conditionnel', subjunctive: 'Subjonctif', imperfectSubjunctive: 'Imperfecto de subjuntivo', imperative: 'Impératif affirmatif', imperativeNegative: 'Impératif négatif', commands: 'Impératif', mixed: 'Mixte' },
    verbs: buildVerbEntries(frenchVerbs, 'french', frenchSubjunctive),
  },
  {
    id: 'spanish',
    name: 'Spanish',
    nativeName: 'Español',
    accent: '#d97706',
    darkAccent: '#f5a623',
    pronounLabels: { I: 'yo', you: 'tú', 'he/she': 'él/ella', we: 'nosotros', 'you plural': 'vosotros/as', they: 'ellos/ellas' },
    tenseLabels: { ...nonFiniteLabels.spanish, present: 'Presente', past: 'Pretérito', passeSimple: 'Passé simple', imperfect: 'Imperfecto', future: 'Futuro', conditional: 'Condicional', subjunctive: 'Subjuntivo', imperfectSubjunctive: 'Imperfecto de subjuntivo', imperative: 'Imperativo afirmativo', imperativeNegative: 'Imperativo negativo', commands: 'Imperativo', mixed: 'Mixto' },
    verbs: buildVerbEntries(spanishVerbs, 'spanish', spanishSubjunctive),
  },
  {
    id: 'italian',
    name: 'Italian',
    nativeName: 'Italiano',
    accent: '#be123c',
    darkAccent: '#f06680',
    pronounLabels: { I: 'io', you: 'tu', 'he/she': 'lui/lei', we: 'noi', 'you plural': 'voi', they: 'loro' },
    tenseLabels: { ...nonFiniteLabels.italian, present: 'Presente', past: 'Passato prossimo', passeSimple: 'Passé simple', imperfect: 'Imperfetto', future: 'Futuro', conditional: 'Condizionale', subjunctive: 'Congiuntivo', imperfectSubjunctive: 'Imperfecto de subjuntivo', imperative: 'Imperativo affermativo', imperativeNegative: 'Imperativo negativo', commands: 'Imperativo', mixed: 'Misto' },
    verbs: buildVerbEntries(italianVerbs, 'italian', italianSubjunctive),
  },
];
