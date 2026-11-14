import type { NonFiniteScene } from './types';

export const frenchNonFiniteScenes = [
  // Past participle (participe passé)
  {
    form: 'pastParticiple',
    verb: 'faire',
    sentence: "J'ai ____ un gâteau au chocolat pour son anniversaire.",
    translation: {
      zh: '我为他的生日做了一个巧克力蛋糕。',
      en: 'I made a chocolate cake for his birthday.',
    },
    reason: {
      zh: '复合过去时中助动词 ai 后接过去分词，faire 的过去分词为不规则形式 fait。',
      en: 'After the auxiliary ai in the passé composé, faire takes the irregular past participle fait.',
    },
    distractors: ['fais', 'faisant', 'fairé'],
  },
  {
    form: 'pastParticiple',
    verb: 'prendre',
    sentence: 'Il a ____ le dernier train pour rentrer chez lui.',
    translation: {
      zh: '他坐最后一班火车回家了。',
      en: 'He took the last train to go home.',
    },
    reason: {
      zh: '助动词 a 后接过去分词，prendre 的过去分词为不规则形式 pris。',
      en: 'After the auxiliary a, prendre uses its irregular past participle pris.',
    },
    distractors: ['prendu', 'prenant', 'prendre'],
  },
  {
    form: 'pastParticiple',
    verb: 'devoir',
    sentence: 'Marc a ____ annuler son voyage à cause de la tempête.',
    translation: {
      zh: '因为暴风雨，马克不得不取消他的旅行。',
      en: 'Marc had to cancel his trip because of the storm.',
    },
    reason: {
      zh: 'devoir 的阳性单数过去分词为 dû，带长音符以区分于缩合冠词 du。',
      en: 'The masculine singular past participle of devoir is dû, written with a circumflex to distinguish it from du.',
    },
    distractors: ['du', 'devu', 'devant'],
  },
  {
    form: 'pastParticiple',
    verb: 'ouvrir',
    sentence: 'Nous avons ____ toutes les fenêtres pour aérer le salon.',
    translation: {
      zh: '我们打开了所有的窗户来给客厅通风。',
      en: 'We opened all the windows to air out the living room.',
    },
    reason: {
      zh: 'ouvrir 属于以 -ert 结尾的不规则过去分词，复合过去时中用 ouvert。',
      en: 'ouvrir forms an irregular past participle in -ert, so avons takes ouvert.',
    },
    distractors: ['ouvri', 'ouvrant', 'ouvru'],
  },
  {
    form: 'pastParticiple',
    verb: 'écrire',
    sentence: 'Tu as ____ une longue lettre à ton grand-père.',
    translation: {
      zh: '你给你的祖父写了一封长信。',
      en: 'You wrote a long letter to your grandfather.',
    },
    reason: {
      zh: '助动词 as 后接过去分词，écrire 的过去分词为不规则形式 écrit。',
      en: 'After the auxiliary as, écrire requires the irregular past participle écrit.',
    },
    distractors: ['écri', 'écrivant', 'écrivé'],
  },
  {
    form: 'pastParticiple',
    verb: 'boire',
    sentence: "J'ai ____ un grand verre d'eau fraîche après la course.",
    translation: {
      zh: '跑完步后我喝了一大杯凉水。',
      en: 'I drank a large glass of cold water after the run.',
    },
    reason: {
      zh: 'boire 的过去分词为不规则的 bu，与助动词 ai 构成复合过去时。',
      en: 'boire has the irregular past participle bu after the auxiliary ai.',
    },
    distractors: ['boivu', 'buvant', 'boi'],
  },
  {
    form: 'pastParticiple',
    verb: 'partir',
    sentence: 'Mon frère est ____ tôt ce matin pour éviter les bouchons.',
    translation: {
      zh: '我哥哥今早很早就出发了，好避开堵车。',
      en: 'My brother left early this morning to avoid traffic jams.',
    },
    reason: {
      zh: '主语 mon frère 为阳性单数，与助动词 est 搭配时 partir 的过去分词为 parti。',
      en: 'With the masculine singular subject mon frère and auxiliary est, partir takes parti.',
    },
    distractors: ['partu', 'partant', 'parté'],
  },
  {
    form: 'pastParticiple',
    verb: 'mourir',
    sentence: 'Le vieux chien du voisin est ____ paisiblement cet hiver.',
    translation: {
      zh: '邻居家的老狗今年冬天平静地去世了。',
      en: "The neighbor's old dog died peacefully this winter.",
    },
    reason: {
      zh: 'mourir 的阳性单数过去分词为不规则形式 mort，且与助动词 est 连用。',
      en: 'mourir takes the irregular masculine singular past participle mort with est.',
    },
    distractors: ['mouri', 'mouru', 'mourant'],
  },
  {
    form: 'pastParticiple',
    verb: 'recevoir',
    sentence: 'Paul a ____ ton colis juste avant midi.',
    translation: {
      zh: '保罗刚好在中午前收到了你的包裹。',
      en: 'Paul received your package just before noon.',
    },
    reason: {
      zh: 'recevoir 的过去分词为 reçu，在元音 u 前 c 需加软音符变为 ç。',
      en: 'recevoir forms the past participle reçu, adding a cedilla under c before u.',
    },
    distractors: ['recu', 'recevu', 'recevant'],
  },
  {
    form: 'pastParticiple',
    verb: 'peindre',
    sentence: 'Ils ont ____ les murs de la cuisine en blanc.',
    translation: {
      zh: '他们把厨房的墙刷成了白色。',
      en: 'They painted the kitchen walls white.',
    },
    reason: {
      zh: '以 -eindre 结尾的动词过去分词通常以 -eint 结尾，peindre 为 peint。',
      en: 'Verbs ending in -eindre form their past participle in -eint, giving peint.',
    },
    distractors: ['peignu', 'peignant', 'peindé'],
  },
  {
    form: 'pastParticiple',
    verb: 'finir',
    sentence: 'Vous avez ____ ce projet plus vite que prévu.',
    translation: {
      zh: '你们比预想的更快完成了这个项目。',
      en: 'You finished this project faster than expected.',
    },
    reason: {
      zh: '规则第二组动词 finir 去掉 -ir 加 -i，过去分词为 fini。',
      en: 'Regular -ir verb finir drops -ir and adds -i to form the past participle fini.',
    },
    distractors: ['finé', 'finu', 'finissant'],
  },
  {
    form: 'pastParticiple',
    verb: 'naître',
    sentence: 'Lucas est ____ dans un petit village au bord de la mer.',
    translation: {
      zh: '卢卡斯出生在海边的一个小村庄。',
      en: 'Lucas was born in a small village by the sea.',
    },
    reason: {
      zh: 'naître 的阳性单数过去分词为不规则形式 né，主语 Lucas 为阳性单数。',
      en: 'naître has the irregular masculine singular past participle né for masculine singular Lucas.',
    },
    distractors: ['naîtu', 'naîssant', 'nait'],
  },
  {
    form: 'pastParticiple',
    verb: 'vivre',
    sentence: 'Cet écrivain a ____ dix ans à Montréal.',
    translation: {
      zh: '这位作家在蒙特利尔生活了十年。',
      en: 'This writer lived in Montreal for ten years.',
    },
    reason: {
      zh: 'vivre 的过去分词为不规则形式 vécu，与助动词 a 搭配使用。',
      en: 'vivre takes the irregular past participle vécu after the auxiliary a.',
    },
    distractors: ['vivu', 'vivant', 'vivé'],
  },
  {
    form: 'pastParticiple',
    verb: 'résoudre',
    sentence: 'Nous avons ____ ce problème complexe ensemble.',
    translation: {
      zh: '我们一起解决了这个复杂的问题。',
      en: 'We solved this complex problem together.',
    },
    reason: {
      zh: 'résoudre 的过去分词为 résolu，用于 avoir 构成的复合过去时中。',
      en: 'résoudre forms the irregular past participle résolu with the auxiliary avons.',
    },
    distractors: ['résoudu', 'résolvant', 'résout'],
  },

  // Present participle (participe présent)
  {
    form: 'presentParticiple',
    verb: 'savoir',
    sentence: "Ne ____ pas quoi répondre, il a préféré garder le silence.",
    translation: {
      zh: '不知道该怎么回答，他选择保持沉默。',
      en: 'Not knowing what to answer, he preferred to stay silent.',
    },
    reason: {
      zh: 'savoir 是三大不规则现在分词之一，形式为 sachant，而非由 savons 派生。',
      en: 'savoir is one of the three irregular present participles in French, taking sachant.',
    },
    distractors: ['savant', 'su', 'savoir'],
  },
  {
    form: 'presentParticiple',
    verb: 'être',
    sentence: "N'____ pas disponible ce soir, je passerai demain matin.",
    translation: {
      zh: '今晚没空，我明天早上再过来。',
      en: 'Not being available tonight, I will stop by tomorrow morning.',
    },
    reason: {
      zh: 'être 的现在分词为不规则形式 étant，表示原因或状态。',
      en: 'être has the irregular present participle étant, expressing cause or state here.',
    },
    distractors: ['sommant', 'été', 'êtant'],
  },
  {
    form: 'presentParticiple',
    verb: 'avoir',
    sentence: "N'____ plus de monnaie, elle a payé par carte.",
    translation: {
      zh: '因为没有零钱了，她用银行卡付了款。',
      en: 'Having no more change, she paid by card.',
    },
    reason: {
      zh: 'avoir 的现在分词为不规则形式 ayant，用于分词从句说明原因。',
      en: 'avoir uses the irregular present participle ayant in a participial clause of reason.',
    },
    distractors: ['avant', 'eu', 'avayant'],
  },
  {
    form: 'presentParticiple',
    verb: 'manger',
    sentence: 'Il lit souvent le journal en ____ son petit déjeuner.',
    translation: {
      zh: '他吃早饭时经常看报纸。',
      en: 'He often reads the newspaper while eating breakfast.',
    },
    reason: {
      zh: '以 -ger 结尾的动词在 -ant 前需保留 e 以维持软音，因此为 mangeant。',
      en: 'Verbs ending in -ger keep the e before -ant to preserve the soft g sound, giving mangeant.',
    },
    distractors: ['mangant', 'mangé', 'manger'],
  },
  {
    form: 'presentParticiple',
    verb: 'commencer',
    sentence: 'En ____ plus tôt, tu finiras avant la nuit.',
    translation: {
      zh: '早点开始的话，你天黑前就能完成。',
      en: 'By starting earlier, you will finish before dark.',
    },
    reason: {
      zh: '以 -cer 结尾的动词在 -ant 前需将 c 改为 ç，因此为 commençant。',
      en: 'Verbs ending in -cer change c to ç before -ant, producing commençant.',
    },
    distractors: ['commencant', 'commencé', 'commencer'],
  },
  {
    form: 'presentParticiple',
    verb: 'faire',
    sentence: "Elle s'est blessée au genou en ____ du vélo.",
    translation: {
      zh: '她骑自行车时伤到了膝盖。',
      en: 'She hurt her knee while riding a bicycle.',
    },
    reason: {
      zh: '由直陈式现在时第一人称复数 faisons 去 -ons 加 -ant，得到 faisant。',
      en: 'Derived from the nous present stem faisons by replacing -ons with -ant: faisant.',
    },
    distractors: ['faissant', 'fait', 'ferant'],
  },
  {
    form: 'presentParticiple',
    verb: 'finir',
    sentence: 'En ____ ses devoirs à temps, Léa peut jouer dehors.',
    translation: {
      zh: '按时完成作业后，莱娅可以出去玩。',
      en: 'By finishing her homework on time, Léa can play outside.',
    },
    reason: {
      zh: '规则第二组动词 finir 由 finissons 去掉 -ons 加 -ant，形成 finissant。',
      en: 'Regular -ir verb finir forms its present participle from finissons: finissant.',
    },
    distractors: ['finant', 'fini', 'finir'],
  },
  {
    form: 'presentParticiple',
    verb: 'prendre',
    sentence: 'En ____ le métro, nous arriverons à l’heure au concert.',
    translation: {
      zh: '坐地铁的话，我们就能准时到音乐会。',
      en: 'By taking the subway, we will arrive at the concert on time.',
    },
    reason: {
      zh: 'prendre 的 nous 形式为 prenons，去掉 -ons 加 -ant 得到 prenant。',
      en: 'From nous prenons, drop -ons and add -ant to form prenant.',
    },
    distractors: ['prendant', 'pris', 'prennant'],
  },
  {
    form: 'presentParticiple',
    verb: 'boire',
    sentence: 'Il se détend sur la terrasse en ____ un thé chaud.',
    translation: {
      zh: '他在露台上一边喝热茶一边放松。',
      en: 'He relaxes on the terrace while drinking a hot tea.',
    },
    reason: {
      zh: 'boire 的 nous 形式为 buvons，因此现在分词为 buvant。',
      en: 'boire has the nous stem buvons, giving the present participle buvant.',
    },
    distractors: ['boivant', 'bu', 'boirant'],
  },
  {
    form: 'presentParticiple',
    verb: 'courir',
    sentence: 'Il a rattrapé le bus en ____ très vite.',
    translation: {
      zh: '他跑得很快，赶上了公交车。',
      en: 'He caught the bus by running very fast.',
    },
    reason: {
      zh: 'courir 的 nous 形式为 courons，去掉 -ons 加 -ant 得到 courant（单 r）。',
      en: 'From nous courons, the present participle is courant with a single r.',
    },
    distractors: ['courrant', 'couru', 'courissant'],
  },
  {
    form: 'presentParticiple',
    verb: 'connaître',
    sentence: 'Ne ____ personne dans cette ville, il s’est inscrit à un club.',
    translation: {
      zh: '在这座城市谁也不认识，他便加入了一个俱乐部。',
      en: 'Knowing no one in this city, he joined a club.',
    },
    reason: {
      zh: 'connaître 的 nous 形式为 connaissons，现在分词为 connaissant。',
      en: 'From nous connaissons, connaissant is the regular stem-based present participle.',
    },
    distractors: ['connaîtant', 'connu', 'connaisant'],
  },
  {
    form: 'presentParticiple',
    verb: 'voir',
    sentence: 'En ____ la neige tomber, les enfants ont crié de joie.',
    translation: {
      zh: '看到雪花飘落，孩子们高兴地欢呼起来。',
      en: 'Seeing the snow fall, the children shouted with joy.',
    },
    reason: {
      zh: 'voir 的 nous 形式为 voyons，去掉 -ons 加 -ant 得到 voyant。',
      en: 'From nous voyons, replace -ons with -ant to form voyant.',
    },
    distractors: ['voiant', 'vu', 'voirant'],
  },
  {
    form: 'presentParticiple',
    verb: 'craindre',
    sentence: 'Ne ____ pas la pluie, il est sorti sans parapluie.',
    translation: {
      zh: '他不怕下雨，没带伞就出门了。',
      en: 'Not fearing the rain, he went out without an umbrella.',
    },
    reason: {
      zh: 'craindre 的 nous 形式为 craignons，因此现在分词为 craignant。',
      en: 'craindre uses its nous stem craign- to form craignant.',
    },
    distractors: ['craindant', 'craint', 'craingnant'],
  },
  {
    form: 'presentParticiple',
    verb: 'appeler',
    sentence: 'Il a trouvé un hôtel libre en ____ plusieurs réceptions.',
    translation: {
      zh: '他给好几家前台打了电话，才找到一间有空房的酒店。',
      en: 'He found an available hotel by calling several front desks.',
    },
    reason: {
      zh: 'appeler 的 nous 形式为 appelons（单 l），因此现在分词为 appelant。',
      en: 'appeler keeps a single l in nous appelons, so its present participle is appelant.',
    },
    distractors: ['appellant', 'appelé', 'appeller'],
  },
] as const satisfies readonly NonFiniteScene[];
