export type LanguageId = 'english' | 'french' | 'spanish' | 'italian';
export type TenseId = 'present' | 'past' | 'imperfect' | 'future' | 'conditional';
export type PracticeTenseId = TenseId | 'mixed';
export type Pronoun = 'I' | 'you' | 'he/she' | 'we' | 'they';

export type VerbEntry = {
  infinitive: string;
  translation: string;
  forms: Record<TenseId, Record<Pronoun, string>>;
};

export type Language = {
  id: LanguageId;
  name: string;
  nativeName: string;
  accent: string;
  darkAccent: string;
  pronounLabels: Record<Pronoun, string>;
  verbs: VerbEntry[];
};

type Forms = VerbEntry['forms'];

export const concreteTenses: Array<{ id: TenseId; label: string }> = [
  { id: 'present', label: 'Present' },
  { id: 'past', label: 'Past' },
  { id: 'imperfect', label: 'Imperfect' },
  { id: 'future', label: 'Future' },
  { id: 'conditional', label: 'Conditional' },
];

export const tenseOptions: Array<{ id: PracticeTenseId; label: string }> = [
  ...concreteTenses,
  { id: 'mixed', label: 'Mixed' },
];

export const pronouns: Pronoun[] = ['I', 'you', 'he/she', 'we', 'they'];

const verb = (infinitive: string, translation: string, forms: Forms): VerbEntry => ({
  infinitive,
  translation,
  forms,
});

const englishVerb = (base: string, translation: string, presentThird: string, past: string) =>
  verb(`to ${base}`, translation, {
    present: { I: base, you: base, 'he/she': presentThird, we: base, they: base },
    past: { I: past, you: past, 'he/she': past, we: past, they: past },
    imperfect: { I: past, you: past, 'he/she': past, we: past, they: past },
    future: { I: `will ${base}`, you: `will ${base}`, 'he/she': `will ${base}`, we: `will ${base}`, they: `will ${base}` },
    conditional: { I: `would ${base}`, you: `would ${base}`, 'he/she': `would ${base}`, we: `would ${base}`, they: `would ${base}` },
  });

const frenchImperfect = (stem: string) => ({
  I: `${stem}ais`,
  you: `${stem}ais`,
  'he/she': `${stem}ait`,
  we: `${stem}ions`,
  they: `${stem}aient`,
});

const frenchConditional = (futureStem: string) => frenchImperfect(futureStem);

const spanishArImperfect = (stem: string) => ({
  I: `${stem}aba`,
  you: `${stem}abas`,
  'he/she': `${stem}aba`,
  we: `${stem}ábamos`,
  they: `${stem}aban`,
});

const spanishErIrImperfect = (stem: string) => ({
  I: `${stem}ía`,
  you: `${stem}ías`,
  'he/she': `${stem}ía`,
  we: `${stem}íamos`,
  they: `${stem}ían`,
});

const spanishConditional = (stem: string) => spanishErIrImperfect(stem);

const italianAreImperfect = (stem: string) => ({
  I: `${stem}avo`,
  you: `${stem}avi`,
  'he/she': `${stem}ava`,
  we: `${stem}avamo`,
  they: `${stem}avano`,
});

const italianEreImperfect = (stem: string) => ({
  I: `${stem}evo`,
  you: `${stem}evi`,
  'he/she': `${stem}eva`,
  we: `${stem}evamo`,
  they: `${stem}evano`,
});

const italianIreImperfect = (stem: string) => ({
  I: `${stem}ivo`,
  you: `${stem}ivi`,
  'he/she': `${stem}iva`,
  we: `${stem}ivamo`,
  they: `${stem}ivano`,
});

const italianConditional = (stem: string) => ({
  I: `${stem}ei`,
  you: `${stem}esti`,
  'he/she': `${stem}ebbe`,
  we: `${stem}emmo`,
  they: `${stem}ebbero`,
});

const frenchFuture = (stem: string) => ({
  I: `${stem}ai`,
  you: `${stem}as`,
  'he/she': `${stem}a`,
  we: `${stem}ons`,
  they: `${stem}ont`,
});

const frenchCompound = (participle: string) => ({
  I: `ai ${participle}`,
  you: `as ${participle}`,
  'he/she': `a ${participle}`,
  we: `avons ${participle}`,
  they: `ont ${participle}`,
});

const frenchErVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -2);

  return verb(infinitive, translation, {
    present: { I: `${stem}e`, you: `${stem}es`, 'he/she': `${stem}e`, we: `${stem}ons`, they: `${stem}ent` },
    past: frenchCompound(`${stem}é`),
    imperfect: frenchImperfect(stem),
    future: frenchFuture(infinitive),
    conditional: frenchConditional(infinitive),
  });
};

const frenchIrVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -2);

  return verb(infinitive, translation, {
    present: { I: `${stem}is`, you: `${stem}is`, 'he/she': `${stem}it`, we: `${stem}issons`, they: `${stem}issent` },
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
    present: { I: `${stem}s`, you: `${stem}s`, 'he/she': stem, we: `${stem}ons`, they: `${stem}ent` },
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
  they: `${stem}án`,
});

const spanishArVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -2);

  return verb(infinitive, translation, {
    present: { I: `${stem}o`, you: `${stem}as`, 'he/she': `${stem}a`, we: `${stem}amos`, they: `${stem}an` },
    past: { I: `${stem}é`, you: `${stem}aste`, 'he/she': `${stem}ó`, we: `${stem}amos`, they: `${stem}aron` },
    imperfect: spanishArImperfect(stem),
    future: spanishFuture(infinitive),
    conditional: spanishConditional(infinitive),
  });
};

const spanishErVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -2);

  return verb(infinitive, translation, {
    present: { I: `${stem}o`, you: `${stem}es`, 'he/she': `${stem}e`, we: `${stem}emos`, they: `${stem}en` },
    past: { I: `${stem}í`, you: `${stem}iste`, 'he/she': `${stem}ió`, we: `${stem}imos`, they: `${stem}ieron` },
    imperfect: spanishErIrImperfect(stem),
    future: spanishFuture(infinitive),
    conditional: spanishConditional(infinitive),
  });
};

const spanishIrVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -2);

  return verb(infinitive, translation, {
    present: { I: `${stem}o`, you: `${stem}es`, 'he/she': `${stem}e`, we: `${stem}imos`, they: `${stem}en` },
    past: { I: `${stem}í`, you: `${stem}iste`, 'he/she': `${stem}ió`, we: `${stem}imos`, they: `${stem}ieron` },
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
  they: `${stem}anno`,
});

const italianCompound = (participle: string) => ({
  I: `ho ${participle}`,
  you: `hai ${participle}`,
  'he/she': `ha ${participle}`,
  we: `abbiamo ${participle}`,
  they: `hanno ${participle}`,
});

const italianAreVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -3);

  return verb(infinitive, translation, {
    present: { I: `${stem}o`, you: `${stem}i`, 'he/she': `${stem}a`, we: `${stem}iamo`, they: `${stem}ano` },
    past: italianCompound(`${stem}ato`),
    imperfect: italianAreImperfect(stem),
    future: italianFuture(`${stem}er`),
    conditional: italianConditional(`${stem}er`),
  });
};

const italianEreVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -3);

  return verb(infinitive, translation, {
    present: { I: `${stem}o`, you: `${stem}i`, 'he/she': `${stem}e`, we: `${stem}iamo`, they: `${stem}ono` },
    past: italianCompound(`${stem}uto`),
    imperfect: italianEreImperfect(stem),
    future: italianFuture(infinitive.slice(0, -1)),
    conditional: italianConditional(infinitive.slice(0, -1)),
  });
};

const italianIreVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -3);

  return verb(infinitive, translation, {
    present: { I: `${stem}o`, you: `${stem}i`, 'he/she': `${stem}e`, we: `${stem}iamo`, they: `${stem}ono` },
    past: italianCompound(`${stem}ito`),
    imperfect: italianIreImperfect(stem),
    future: italianFuture(infinitive.slice(0, -1)),
    conditional: italianConditional(infinitive.slice(0, -1)),
  });
};

const italianIscVerb = (infinitive: string, translation: string) => {
  const stem = infinitive.slice(0, -3);

  return verb(infinitive, translation, {
    present: { I: `${stem}isco`, you: `${stem}isci`, 'he/she': `${stem}isce`, we: `${stem}iamo`, they: `${stem}iscono` },
    past: italianCompound(`${stem}ito`),
    imperfect: italianIreImperfect(stem),
    future: italianFuture(infinitive.slice(0, -1)),
    conditional: italianConditional(infinitive.slice(0, -1)),
  });
};

const englishVerbs: VerbEntry[] = [
  verb('to be', '是 / 存在', {
    present: { I: 'am', you: 'are', 'he/she': 'is', we: 'are', they: 'are' },
    past: { I: 'was', you: 'were', 'he/she': 'was', we: 'were', they: 'were' },
    imperfect: { I: 'was', you: 'were', 'he/she': 'was', we: 'were', they: 'were' },
    future: { I: 'will be', you: 'will be', 'he/she': 'will be', we: 'will be', they: 'will be' },
    conditional: { I: 'would be', you: 'would be', 'he/she': 'would be', we: 'would be', they: 'would be' },
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
];

const frenchVerbs: VerbEntry[] = [
  verb('être', '是 / 存在', {
    present: { I: 'suis', you: 'es', 'he/she': 'est', we: 'sommes', they: 'sont' },
    past: { I: 'ai été', you: 'as été', 'he/she': 'a été', we: 'avons été', they: 'ont été' },
    imperfect: frenchImperfect('ét'),
    future: { I: 'serai', you: 'seras', 'he/she': 'sera', we: 'serons', they: 'seront' },
    conditional: frenchConditional('ser'),
  }),
  verb('avoir', '有', {
    present: { I: 'ai', you: 'as', 'he/she': 'a', we: 'avons', they: 'ont' },
    past: { I: 'ai eu', you: 'as eu', 'he/she': 'a eu', we: 'avons eu', they: 'ont eu' },
    imperfect: frenchImperfect('av'),
    future: { I: 'aurai', you: 'auras', 'he/she': 'aura', we: 'aurons', they: 'auront' },
    conditional: frenchConditional('aur'),
  }),
  verb('aller', '去', {
    present: { I: 'vais', you: 'vas', 'he/she': 'va', we: 'allons', they: 'vont' },
    past: { I: 'suis allé', you: 'es allé', 'he/she': 'est allé', we: 'sommes allés', they: 'sont allés' },
    imperfect: frenchImperfect('all'),
    future: { I: 'irai', you: 'iras', 'he/she': 'ira', we: 'irons', they: 'iront' },
    conditional: frenchConditional('ir'),
  }),
  verb('faire', '做 / 制作', {
    present: { I: 'fais', you: 'fais', 'he/she': 'fait', we: 'faisons', they: 'font' },
    past: frenchCompound('fait'),
    imperfect: frenchImperfect('fais'),
    future: frenchFuture('fer'),
    conditional: frenchConditional('fer'),
  }),
  verb('dire', '说', {
    present: { I: 'dis', you: 'dis', 'he/she': 'dit', we: 'disons', they: 'disent' },
    past: frenchCompound('dit'),
    imperfect: frenchImperfect('dis'),
    future: frenchFuture('dir'),
    conditional: frenchConditional('dir'),
  }),
  verb('pouvoir', '能够', {
    present: { I: 'peux', you: 'peux', 'he/she': 'peut', we: 'pouvons', they: 'peuvent' },
    past: frenchCompound('pu'),
    imperfect: frenchImperfect('pouv'),
    future: frenchFuture('pourr'),
    conditional: frenchConditional('pourr'),
  }),
  verb('vouloir', '想要', {
    present: { I: 'veux', you: 'veux', 'he/she': 'veut', we: 'voulons', they: 'veulent' },
    past: frenchCompound('voulu'),
    imperfect: frenchImperfect('voul'),
    future: frenchFuture('voudr'),
    conditional: frenchConditional('voudr'),
  }),
  verb('savoir', '知道', {
    present: { I: 'sais', you: 'sais', 'he/she': 'sait', we: 'savons', they: 'savent' },
    past: frenchCompound('su'),
    imperfect: frenchImperfect('sav'),
    future: frenchFuture('saur'),
    conditional: frenchConditional('saur'),
  }),
  verb('voir', '看见', {
    present: { I: 'vois', you: 'vois', 'he/she': 'voit', we: 'voyons', they: 'voient' },
    past: frenchCompound('vu'),
    imperfect: frenchImperfect('voy'),
    future: frenchFuture('verr'),
    conditional: frenchConditional('verr'),
  }),
  verb('prendre', '拿 / 乘坐', {
    present: { I: 'prends', you: 'prends', 'he/she': 'prend', we: 'prenons', they: 'prennent' },
    past: frenchCompound('pris'),
    imperfect: frenchImperfect('pren'),
    future: frenchFuture('prendr'),
    conditional: frenchConditional('prendr'),
  }),
  verb('mettre', '放置 / 穿上', {
    present: { I: 'mets', you: 'mets', 'he/she': 'met', we: 'mettons', they: 'mettent' },
    past: frenchCompound('mis'),
    imperfect: frenchImperfect('mett'),
    future: frenchFuture('mettr'),
    conditional: frenchConditional('mettr'),
  }),
  verb('devoir', '必须 / 应该', {
    present: { I: 'dois', you: 'dois', 'he/she': 'doit', we: 'devons', they: 'doivent' },
    past: frenchCompound('dû'),
    imperfect: frenchImperfect('dev'),
    future: frenchFuture('devr'),
    conditional: frenchConditional('devr'),
  }),
  verb('lire', '读', {
    present: { I: 'lis', you: 'lis', 'he/she': 'lit', we: 'lisons', they: 'lisent' },
    past: frenchCompound('lu'),
    imperfect: frenchImperfect('lis'),
    future: frenchFuture('lir'),
    conditional: frenchConditional('lir'),
  }),
  verb('écrire', '写', {
    present: { I: 'écris', you: 'écris', 'he/she': 'écrit', we: 'écrivons', they: 'écrivent' },
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
];

const spanishVerbs: VerbEntry[] = [
  verb('ser', '是 / 本质', {
    present: { I: 'soy', you: 'eres', 'he/she': 'es', we: 'somos', they: 'son' },
    past: { I: 'fui', you: 'fuiste', 'he/she': 'fue', we: 'fuimos', they: 'fueron' },
    imperfect: { I: 'era', you: 'eras', 'he/she': 'era', we: 'éramos', they: 'eran' },
    future: { I: 'seré', you: 'serás', 'he/she': 'será', we: 'seremos', they: 'serán' },
    conditional: spanishConditional('ser'),
  }),
  verb('tener', '有', {
    present: { I: 'tengo', you: 'tienes', 'he/she': 'tiene', we: 'tenemos', they: 'tienen' },
    past: { I: 'tuve', you: 'tuviste', 'he/she': 'tuvo', we: 'tuvimos', they: 'tuvieron' },
    imperfect: spanishErIrImperfect('ten'),
    future: { I: 'tendré', you: 'tendrás', 'he/she': 'tendrá', we: 'tendremos', they: 'tendrán' },
    conditional: spanishConditional('tendr'),
  }),
  verb('ir', '去', {
    present: { I: 'voy', you: 'vas', 'he/she': 'va', we: 'vamos', they: 'van' },
    past: { I: 'fui', you: 'fuiste', 'he/she': 'fue', we: 'fuimos', they: 'fueron' },
    imperfect: { I: 'iba', you: 'ibas', 'he/she': 'iba', we: 'íbamos', they: 'iban' },
    future: { I: 'iré', you: 'irás', 'he/she': 'irá', we: 'iremos', they: 'irán' },
    conditional: spanishConditional('ir'),
  }),
  verb('estar', '是 / 处于', {
    present: { I: 'estoy', you: 'estás', 'he/she': 'está', we: 'estamos', they: 'están' },
    past: { I: 'estuve', you: 'estuviste', 'he/she': 'estuvo', we: 'estuvimos', they: 'estuvieron' },
    imperfect: spanishArImperfect('est'),
    future: spanishFuture('estar'),
    conditional: spanishConditional('estar'),
  }),
  verb('hacer', '做 / 制作', {
    present: { I: 'hago', you: 'haces', 'he/she': 'hace', we: 'hacemos', they: 'hacen' },
    past: { I: 'hice', you: 'hiciste', 'he/she': 'hizo', we: 'hicimos', they: 'hicieron' },
    imperfect: spanishErIrImperfect('hac'),
    future: spanishFuture('har'),
    conditional: spanishConditional('har'),
  }),
  verb('decir', '说', {
    present: { I: 'digo', you: 'dices', 'he/she': 'dice', we: 'decimos', they: 'dicen' },
    past: { I: 'dije', you: 'dijiste', 'he/she': 'dijo', we: 'dijimos', they: 'dijeron' },
    imperfect: spanishErIrImperfect('dec'),
    future: spanishFuture('dir'),
    conditional: spanishConditional('dir'),
  }),
  verb('poder', '能够', {
    present: { I: 'puedo', you: 'puedes', 'he/she': 'puede', we: 'podemos', they: 'pueden' },
    past: { I: 'pude', you: 'pudiste', 'he/she': 'pudo', we: 'pudimos', they: 'pudieron' },
    imperfect: spanishErIrImperfect('pod'),
    future: spanishFuture('podr'),
    conditional: spanishConditional('podr'),
  }),
  verb('querer', '想要 / 爱', {
    present: { I: 'quiero', you: 'quieres', 'he/she': 'quiere', we: 'queremos', they: 'quieren' },
    past: { I: 'quise', you: 'quisiste', 'he/she': 'quiso', we: 'quisimos', they: 'quisieron' },
    imperfect: spanishErIrImperfect('quer'),
    future: spanishFuture('querr'),
    conditional: spanishConditional('querr'),
  }),
  verb('saber', '知道', {
    present: { I: 'sé', you: 'sabes', 'he/she': 'sabe', we: 'sabemos', they: 'saben' },
    past: { I: 'supe', you: 'supiste', 'he/she': 'supo', we: 'supimos', they: 'supieron' },
    imperfect: spanishErIrImperfect('sab'),
    future: spanishFuture('sabr'),
    conditional: spanishConditional('sabr'),
  }),
  verb('ver', '看见', {
    present: { I: 'veo', you: 'ves', 'he/she': 've', we: 'vemos', they: 'ven' },
    past: { I: 'vi', you: 'viste', 'he/she': 'vio', we: 'vimos', they: 'vieron' },
    imperfect: spanishErIrImperfect('ve'),
    future: spanishFuture('ver'),
    conditional: spanishConditional('ver'),
  }),
  verb('venir', '来', {
    present: { I: 'vengo', you: 'vienes', 'he/she': 'viene', we: 'venimos', they: 'vienen' },
    past: { I: 'vine', you: 'viniste', 'he/she': 'vino', we: 'vinimos', they: 'vinieron' },
    imperfect: spanishErIrImperfect('ven'),
    future: spanishFuture('vendr'),
    conditional: spanishConditional('vendr'),
  }),
  verb('poner', '放置', {
    present: { I: 'pongo', you: 'pones', 'he/she': 'pone', we: 'ponemos', they: 'ponen' },
    past: { I: 'puse', you: 'pusiste', 'he/she': 'puso', we: 'pusimos', they: 'pusieron' },
    imperfect: spanishErIrImperfect('pon'),
    future: spanishFuture('pondr'),
    conditional: spanishConditional('pondr'),
  }),
  verb('salir', '出去 / 离开', {
    present: { I: 'salgo', you: 'sales', 'he/she': 'sale', we: 'salimos', they: 'salen' },
    past: { I: 'salí', you: 'saliste', 'he/she': 'salió', we: 'salimos', they: 'salieron' },
    imperfect: spanishErIrImperfect('sal'),
    future: spanishFuture('saldr'),
    conditional: spanishConditional('saldr'),
  }),
  verb('dar', '给', {
    present: { I: 'doy', you: 'das', 'he/she': 'da', we: 'damos', they: 'dan' },
    past: { I: 'di', you: 'diste', 'he/she': 'dio', we: 'dimos', they: 'dieron' },
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
];

const italianVerbs: VerbEntry[] = [
  verb('essere', '是 / 存在', {
    present: { I: 'sono', you: 'sei', 'he/she': 'è', we: 'siamo', they: 'sono' },
    past: { I: 'sono stato', you: 'sei stato', 'he/she': 'è stato', we: 'siamo stati', they: 'sono stati' },
    imperfect: { I: 'ero', you: 'eri', 'he/she': 'era', we: 'eravamo', they: 'erano' },
    future: { I: 'sarò', you: 'sarai', 'he/she': 'sarà', we: 'saremo', they: 'saranno' },
    conditional: italianConditional('sar'),
  }),
  verb('avere', '有', {
    present: { I: 'ho', you: 'hai', 'he/she': 'ha', we: 'abbiamo', they: 'hanno' },
    past: { I: 'ho avuto', you: 'hai avuto', 'he/she': 'ha avuto', we: 'abbiamo avuto', they: 'hanno avuto' },
    imperfect: italianEreImperfect('av'),
    future: { I: 'avrò', you: 'avrai', 'he/she': 'avrà', we: 'avremo', they: 'avranno' },
    conditional: italianConditional('avr'),
  }),
  verb('andare', '去', {
    present: { I: 'vado', you: 'vai', 'he/she': 'va', we: 'andiamo', they: 'vanno' },
    past: { I: 'sono andato', you: 'sei andato', 'he/she': 'è andato', we: 'siamo andati', they: 'sono andati' },
    imperfect: italianAreImperfect('and'),
    future: { I: 'andrò', you: 'andrai', 'he/she': 'andrà', we: 'andremo', they: 'andranno' },
    conditional: italianConditional('andr'),
  }),
  verb('fare', '做 / 制作', {
    present: { I: 'faccio', you: 'fai', 'he/she': 'fa', we: 'facciamo', they: 'fanno' },
    past: italianCompound('fatto'),
    imperfect: italianEreImperfect('fac'),
    future: italianFuture('far'),
    conditional: italianConditional('far'),
  }),
  verb('dire', '说', {
    present: { I: 'dico', you: 'dici', 'he/she': 'dice', we: 'diciamo', they: 'dicono' },
    past: italianCompound('detto'),
    imperfect: italianEreImperfect('dic'),
    future: italianFuture('dir'),
    conditional: italianConditional('dir'),
  }),
  verb('potere', '能够', {
    present: { I: 'posso', you: 'puoi', 'he/she': 'può', we: 'possiamo', they: 'possono' },
    past: italianCompound('potuto'),
    imperfect: italianEreImperfect('pot'),
    future: italianFuture('potr'),
    conditional: italianConditional('potr'),
  }),
  verb('volere', '想要', {
    present: { I: 'voglio', you: 'vuoi', 'he/she': 'vuole', we: 'vogliamo', they: 'vogliono' },
    past: italianCompound('voluto'),
    imperfect: italianEreImperfect('vol'),
    future: italianFuture('vorr'),
    conditional: italianConditional('vorr'),
  }),
  verb('sapere', '知道', {
    present: { I: 'so', you: 'sai', 'he/she': 'sa', we: 'sappiamo', they: 'sanno' },
    past: italianCompound('saputo'),
    imperfect: italianEreImperfect('sap'),
    future: italianFuture('sapr'),
    conditional: italianConditional('sapr'),
  }),
  verb('vedere', '看见', {
    present: { I: 'vedo', you: 'vedi', 'he/she': 'vede', we: 'vediamo', they: 'vedono' },
    past: italianCompound('visto'),
    imperfect: italianEreImperfect('ved'),
    future: italianFuture('vedr'),
    conditional: italianConditional('vedr'),
  }),
  verb('venire', '来', {
    present: { I: 'vengo', you: 'vieni', 'he/she': 'viene', we: 'veniamo', they: 'vengono' },
    past: { I: 'sono venuto', you: 'sei venuto', 'he/she': 'è venuto', we: 'siamo venuti', they: 'sono venuti' },
    imperfect: italianIreImperfect('ven'),
    future: italianFuture('verr'),
    conditional: italianConditional('verr'),
  }),
  verb('prendere', '拿 / 乘坐', {
    present: { I: 'prendo', you: 'prendi', 'he/she': 'prende', we: 'prendiamo', they: 'prendono' },
    past: italianCompound('preso'),
    imperfect: italianEreImperfect('prend'),
    future: italianFuture('prender'),
    conditional: italianConditional('prender'),
  }),
  verb('mettere', '放置 / 穿上', {
    present: { I: 'metto', you: 'metti', 'he/she': 'mette', we: 'mettiamo', they: 'mettono' },
    past: italianCompound('messo'),
    imperfect: italianEreImperfect('mett'),
    future: italianFuture('metter'),
    conditional: italianConditional('metter'),
  }),
  verb('dovere', '必须 / 应该', {
    present: { I: 'devo', you: 'devi', 'he/she': 'deve', we: 'dobbiamo', they: 'devono' },
    past: italianCompound('dovuto'),
    imperfect: italianEreImperfect('dov'),
    future: italianFuture('dovr'),
    conditional: italianConditional('dovr'),
  }),
  verb('leggere', '读', {
    present: { I: 'leggo', you: 'leggi', 'he/she': 'legge', we: 'leggiamo', they: 'leggono' },
    past: italianCompound('letto'),
    imperfect: italianEreImperfect('legg'),
    future: italianFuture('legger'),
    conditional: italianConditional('legger'),
  }),
  verb('scrivere', '写', {
    present: { I: 'scrivo', you: 'scrivi', 'he/she': 'scrive', we: 'scriviamo', they: 'scrivono' },
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
  italianEreVerb('rispondere', '回答'),
  italianEreVerb('perdere', '失去 / 输'),
  italianEreVerb('temere', '害怕'),
  italianEreVerb('battere', '敲打 / 击败'),
  italianIreVerb('dormire', '睡觉'),
  italianIreVerb('sentire', '听见 / 感觉'),
  italianIreVerb('servire', '服务 / 需要'),
  italianIscVerb('capire', '理解'),
  italianIscVerb('finire', '完成'),
  italianIscVerb('costruire', '建造'),
];

export const languages: Language[] = [
  {
    id: 'english',
    name: 'English',
    nativeName: 'English',
    accent: '#2563eb',
    darkAccent: '#6d9ff5',
    pronounLabels: { I: 'I', you: 'you', 'he/she': 'he/she', we: 'we', they: 'they' },
    verbs: englishVerbs,
  },
  {
    id: 'french',
    name: 'French',
    nativeName: 'Français',
    accent: '#0f766e',
    darkAccent: '#5ec4b8',
    pronounLabels: { I: 'je', you: 'tu', 'he/she': 'il/elle', we: 'nous', they: 'ils/elles' },
    verbs: frenchVerbs,
  },
  {
    id: 'spanish',
    name: 'Spanish',
    nativeName: 'Español',
    accent: '#d97706',
    darkAccent: '#f5a623',
    pronounLabels: { I: 'yo', you: 'tú', 'he/she': 'él/ella', we: 'nosotros', they: 'ellos/ellas' },
    verbs: spanishVerbs,
  },
  {
    id: 'italian',
    name: 'Italian',
    nativeName: 'Italiano',
    accent: '#be123c',
    darkAccent: '#f06680',
    pronounLabels: { I: 'io', you: 'tu', 'he/she': 'lui/lei', we: 'noi', they: 'loro' },
    verbs: italianVerbs,
  },
];
