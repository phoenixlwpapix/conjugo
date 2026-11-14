import type { NonFiniteScene } from './types';

export const spanishNonFiniteScenes = [
  // Past participle: haber + participio & estar + participio (masculine singular)
  {
    form: 'pastParticiple',
    verb: 'abrir',
    sentence: 'El museo ya ha ____ sus puertas al público.',
    translation: {
      zh: '这家博物馆已经向公众开放了。',
      en: 'The museum has already opened its doors to the public.',
    },
    reason: {
      zh: '完成时的 ha 后接过去分词，abrir 的不规则过去分词是 abierto。',
      en: 'Ha takes a past participle in the present perfect. The irregular form of abrir is abierto.',
    },
    distractors: ['abrido', 'abriendo', 'abrerto'],
  },
  {
    form: 'pastParticiple',
    verb: 'escribir',
    sentence: 'Ya he ____ el correo para confirmar la reunión.',
    translation: {
      zh: '我已经写好了确认会议的邮件。',
      en: 'I have already written the email to confirm the meeting.',
    },
    reason: {
      zh: 'haber 后接过去分词构成完成时态，escribir 的不规则过去分词是 escrito。',
      en: 'Use haber + past participle for the present perfect; escribir has the irregular past participle escrito.',
    },
    distractors: ['escribido', 'escribiendo', 'escritoido'],
  },
  {
    form: 'pastParticiple',
    verb: 'hacer',
    sentence: '¿Has ____ la tarea antes de salir con tus amigos?',
    translation: {
      zh: '你在和朋友出门前把作业做完了吗？',
      en: 'Have you done your homework before going out with your friends?',
    },
    reason: {
      zh: 'haber 构成的完成时中过去分词不变形，hacer 的不规则过去分词是 hecho。',
      en: 'Compound tenses with haber use the invariant past participle; hacer forms hecho.',
    },
    distractors: ['hacido', 'haciendo', 'hechado'],
  },
  {
    form: 'pastParticiple',
    verb: 'ver',
    sentence: 'Nunca habíamos ____ una película tan emocionante en el cine.',
    translation: {
      zh: '我们以前从未在电影院看过这么激动人心的电影。',
      en: 'We had never seen such an exciting movie at the cinema.',
    },
    reason: {
      zh: 'habíamos 后接过去分词构成过去完成时，ver 的不规则过去分词是 visto。',
      en: 'Habíamos + past participle forms the pluperfect; ver has the irregular past participle visto.',
    },
    distractors: ['veído', 'viendo', 'vido'],
  },
  {
    form: 'pastParticiple',
    verb: 'poner',
    sentence: 'Alguien ha ____ el abrigo sobre la silla del salón.',
    translation: {
      zh: '有人把大衣放在了客厅的椅子上。',
      en: 'Someone has put the coat on the living room chair.',
    },
    reason: {
      zh: '完成时的 ha 后接过去分词，poner 的不规则形式是 puesto。',
      en: 'The present perfect takes the irregular past participle of poner, puesto.',
    },
    distractors: ['ponido', 'poniendo', 'puestado'],
  },
  {
    form: 'pastParticiple',
    verb: 'decir',
    sentence: 'Nadie nos ha ____ a qué hora empieza el concierto.',
    translation: {
      zh: '还没有人告诉我们音乐会几点开始。',
      en: 'Nobody has told us what time the concert starts.',
    },
    reason: {
      zh: 'ha 后接过去分词构成现在完成时，decir 的不规则过去分词是 dicho。',
      en: 'Ha + past participle forms the present perfect; decir has the irregular past participle dicho.',
    },
    distractors: ['decido', 'diciendo', 'decho'],
  },
  {
    form: 'pastParticiple',
    verb: 'volver',
    sentence: 'Mis padres todavía no han ____ del viaje.',
    translation: {
      zh: '我父母还没有从旅行中回来。',
      en: 'My parents have not come back from the trip yet.',
    },
    reason: {
      zh: 'haber 构成的完成时中过去分词不随主语单复数变化，volver 的过去分词是 vuelto。',
      en: 'Past participles after haber stay invariable; volver has the irregular past participle vuelto.',
    },
    distractors: ['volvido', 'volviendo', 'vuelvido'],
  },
  {
    form: 'pastParticiple',
    verb: 'romper',
    sentence: 'Ten cuidado, ese vaso de cristal está ____ por el borde.',
    translation: {
      zh: '小心，那个玻璃杯的杯口破了。',
      en: 'Be careful, that glass is broken along the rim.',
    },
    reason: {
      zh: 'estar 后接过去分词描述破损状态，主语 ese vaso 为阳性单数，romper 的过去分词是 roto。',
      en: 'Estar + past participle describes a state; romper has the irregular past participle roto.',
    },
    distractors: ['rompido', 'rompió', 'rota'],
  },
  {
    form: 'pastParticiple',
    verb: 'leer',
    sentence: 'Hoy he ____ dos capítulos de esa novela histórica.',
    translation: {
      zh: '今天我读了那本历史小说的两章。',
      en: 'Today I have read two chapters of that historical novel.',
    },
    reason: {
      zh: '词干以元音 e 结尾的 -er 动词在过去分词 -ído 上加重音符号以拆开双元音，leer 变为 leído。',
      en: 'Vowel-stem -er verbs take an accent on í to break the hiatus: leer -> leído.',
    },
    distractors: ['leido', 'leyendo', 'leendo'],
  },
  {
    form: 'pastParticiple',
    verb: 'oír',
    sentence: '¿Habéis ____ el ruido que viene de la calle?',
    usesVosotros: true,
    translation: {
      zh: '你们听见街上传来的声音了吗？',
      en: 'Have you all heard the noise coming from the street?',
    },
    reason: {
      zh: 'oír 的过去分词需要在 í 上加重音符号表示分音节，即 oído。',
      en: 'Oír requires an accent on í in its past participle to mark the hiatus: oído.',
    },
    distractors: ['oido', 'oyendo', 'oídoo'],
  },
  {
    form: 'pastParticiple',
    verb: 'traer',
    sentence: 'Gracias por todo, ya hemos ____ las bebidas para la cena.',
    translation: {
      zh: '谢谢大家，我们已经把晚餐的饮料带来了。',
      en: 'Thanks for everything, we have already brought the drinks for dinner.',
    },
    reason: {
      zh: 'traer 的词干以元音 a 结尾，过去分词必须在 í 上加重音符号，即 traído。',
      en: 'Because the stem ends in a, traer takes an accent on í in the past participle: traído.',
    },
    distractors: ['traido', 'trayendo', 'traendo'],
  },
  {
    form: 'pastParticiple',
    verb: 'devolver',
    sentence: '¿Ya has ____ el diccionario que te presté la semana pasada?',
    translation: {
      zh: '你已经还了我上周借给你的词典吗？',
      en: 'Have you already returned the dictionary I lent you last week?',
    },
    reason: {
      zh: 'devolver 与 volver 同源，在完成时中同样使用不规则过去分词 devuelto。',
      en: 'Like volver, devolver forms an irregular past participle: devuelto.',
    },
    distractors: ['devolvido', 'devolviendo', 'devuelvido'],
  },
  {
    form: 'pastParticiple',
    verb: 'morir',
    sentence: 'El árbol del jardín ha ____ por falta de agua.',
    translation: {
      zh: '花园里的那棵树因为缺水枯死了。',
      en: 'The tree in the garden has died from lack of water.',
    },
    reason: {
      zh: '完成时的 ha 后接过去分词，morir 的不规则过去分词是 muerto。',
      en: 'Ha takes a past participle in the present perfect. The irregular form of morir is muerto.',
    },
    distractors: ['morido', 'muriendo', 'moriendo'],
  },
  {
    form: 'pastParticiple',
    verb: 'construir',
    sentence: 'El puente nuevo está ____ con materiales reciclados.',
    translation: {
      zh: '这座新桥是用再生材料建成的。',
      en: 'The new bridge is built with recycled materials.',
    },
    reason: {
      zh: 'ui 在西班牙语拼写规则中视为双元音，construir 的过去分词 construido 不加重音符号。',
      en: 'In Spanish orthography ui counts as a diphthong, so construido takes no written accent.',
    },
    distractors: ['construído', 'construyido', 'construida'],
  },
  {
    form: 'pastParticiple',
    verb: 'terminar',
    sentence: 'El informe ya está ____ y listo para enviar al cliente.',
    translation: {
      zh: '报告已经完成，可以发给客户了。',
      en: 'The report is already finished and ready to send to the client.',
    },
    reason: {
      zh: 'estar 后接过去分词表示完成后的状态，主语 el informe 为阳性单数，规则 -ar 动词变为 terminado。',
      en: 'Estar + past participle indicates completion; regular -ar verbs form -ado (terminado).',
    },
    distractors: ['terminido', 'terminada', 'termina'],
  },

  // Gerund: estar + gerundio & progressive / durative contexts
  {
    form: 'gerund',
    verb: 'ir',
    sentence: 'Ahora mismo estoy ____ al supermercado a comprar fruta.',
    translation: {
      zh: '我现在正去超市买水果。',
      en: 'Right now I am going to the supermarket to buy fruit.',
    },
    reason: {
      zh: 'estar + 副动词表示正在进行的动作；ir 的副动词是不规则的 yendo。',
      en: 'Use estar + gerund for an action in progress; ir has the irregular gerund yendo.',
    },
    distractors: ['iendo', 'ido', 'irando'],
  },
  {
    form: 'gerund',
    verb: 'dormir',
    sentence: 'Habla más bajo, que el bebé está ____ en su cuna.',
    translation: {
      zh: '小声点说话，宝宝正在婴儿床里睡觉。',
      en: 'Speak more quietly, because the baby is sleeping in the crib.',
    },
    reason: {
      zh: 'dormir 在构成副动词时词干元音 o 变为 u，即 durmiendo。',
      en: 'Dormir undergoes an o -> u stem change in the gerund: durmiendo.',
    },
    distractors: ['dormiendo', 'dormido', 'duermiendo'],
  },
  {
    form: 'gerund',
    verb: 'pedir',
    sentence: 'Mis vecinos siguen ____ ayuda para arreglar el jardín.',
    translation: {
      zh: '我的邻居们还在请求帮忙整理花园。',
      en: 'My neighbors keep asking for help to fix the garden.',
    },
    reason: {
      zh: 'seguir + 副动词表示“继续做某事”；pedir 的副动词发生 e -> i 词干变化，为 pidiendo。',
      en: 'Seguir + gerund means to keep doing something; pedir changes e -> i to form pidiendo.',
    },
    distractors: ['pediendo', 'pedido', 'pedando'],
  },
  {
    form: 'gerund',
    verb: 'leer',
    sentence: 'Lucía estaba ____ el periódico cuando sonó el teléfono.',
    translation: {
      zh: '电话响的时候，露西娅正在看报纸。',
      en: 'Lucía was reading the newspaper when the phone rang.',
    },
    reason: {
      zh: 'estaba + 副动词表示过去正在进行的动作；leer 的非重读 i 夹在元音间变为 y，即 leyendo。',
      en: 'When unstressed i falls between vowels in the gerund, it becomes y: leer -> leyendo.',
    },
    distractors: ['leiendo', 'leído', 'leendo'],
  },
  {
    form: 'gerund',
    verb: 'oír',
    sentence: 'Llevo diez minutos ____ la misma canción en la radio.',
    translation: {
      zh: '我已经在收音机里听了十分钟同一首歌了。',
      en: 'I have been listening to the same song on the radio for ten minutes.',
    },
    reason: {
      zh: 'llevar + 时间段 + 副动词表示动作持续了多久；oír 的副动词使用 y，写作 oyendo。',
      en: 'Llevar + duration + gerund expresses how long an action has been going on; oír forms oyendo.',
    },
    distractors: ['oiendo', 'oído', 'oíndo'],
  },
  {
    form: 'gerund',
    verb: 'seguir',
    sentence: 'A pesar de la lluvia, los corredores están ____ adelante.',
    translation: {
      zh: '尽管下着雨，跑步者们仍在继续往前跑。',
      en: 'Despite the rain, the runners are continuing forward.',
    },
    reason: {
      zh: 'seguir 的副动词发生 e -> i 词干变化并保留 gu 拼写，写作 siguiendo。',
      en: 'Seguir changes e -> i in the gerund while keeping gu: siguiendo.',
    },
    distractors: ['seguiendo', 'seguido', 'siguendo'],
  },
  {
    form: 'gerund',
    verb: 'venir',
    sentence: '¿Por qué estás ____ tan tarde hoy?',
    translation: {
      zh: '你今天怎么来得这么晚？',
      en: 'Why are you coming so late today?',
    },
    reason: {
      zh: 'venir 在副动词中发生 e -> i 词干变化，正确形式是 viniendo。',
      en: 'Venir has an irregular e -> i stem change in the gerund: viniendo.',
    },
    distractors: ['veniendo', 'venido', 'vieniendo'],
  },
  {
    form: 'gerund',
    verb: 'decir',
    sentence: 'Creo que me estás ____ la verdad desde el principio.',
    translation: {
      zh: '我觉得你从一开始就在对我说实话。',
      en: 'I think you are telling me the truth from the beginning.',
    },
    reason: {
      zh: 'decir 的副动词发生 e -> i 词干变化，为 diciendo。',
      en: 'Decir undergoes an e -> i stem change in the gerund: diciendo.',
    },
    distractors: ['deciendo', 'dicho', 'dicendo'],
  },
  {
    form: 'gerund',
    verb: 'poder',
    sentence: 'Estamos ____ avanzar mucho más rápido con este nuevo método.',
    translation: {
      zh: '用这个新方法，我们能够推进得快得多。',
      en: 'We are managing to move forward much faster with this new method.',
    },
    reason: {
      zh: 'poder 是少数发生 o -> u 词干变化的 -er 动词之一，副动词为 pudiendo。',
      en: 'Poder is an exceptional -er verb with an o -> u stem change in the gerund: pudiendo.',
    },
    distractors: ['podiendo', 'podido', 'puediendo'],
  },
  {
    form: 'gerund',
    verb: 'reír',
    sentence: 'Todos en la mesa se están ____ con la historia de Mateo.',
    translation: {
      zh: '桌上的每个人都在为马特奥的故事大笑。',
      en: 'Everyone at the table is laughing at Mateo’s story.',
    },
    reason: {
      zh: 'reír 的词干 e 变为 i 后与词尾的 i 合并，副动词写作 riendo。',
      en: 'In reír, the stem e -> i merges with the ending i to form riendo.',
    },
    distractors: ['reiendo', 'riiendo', 'reído'],
  },
  {
    form: 'gerund',
    verb: 'sentir',
    sentence: 'Últimamente me estoy ____ mucho más tranquilo en el trabajo.',
    translation: {
      zh: '最近我在工作上感觉平静多了。',
      en: 'Lately I am feeling much calmer at work.',
    },
    reason: {
      zh: 'sentir 作为 e -> ie/i 变化的 -ir 动词，在副动词中词干 e 变为 i，即 sintiendo。',
      en: 'Stem-changing -ir verbs like sentir change e -> i in the gerund: sintiendo.',
    },
    distractors: ['sentiendo', 'sentido', 'sientiendo'],
  },
  {
    form: 'gerund',
    verb: 'servir',
    sentence: 'El camarero está ____ la sopa caliente en este momento.',
    translation: {
      zh: '服务员此刻正在端上热汤。',
      en: 'The waiter is serving the hot soup right now.',
    },
    reason: {
      zh: 'servir 在副动词中发生 e -> i 词干变化，形式为 sirviendo。',
      en: 'Servir changes e -> i in the gerund: sirviendo.',
    },
    distractors: ['serviendo', 'servido', 'sirvido'],
  },
  {
    form: 'gerund',
    verb: 'caer',
    sentence: 'Mira por la ventana: está ____ una lluvia muy fina.',
    translation: {
      zh: '往窗外看：外面正下着很细的雨。',
      en: 'Look out the window: a very light rain is falling.',
    },
    reason: {
      zh: 'caer 的词干以元音 a 结尾，副动词词尾的 i 变为 y，写作 cayendo。',
      en: 'Because caer has a vowel-final stem, i becomes y in the gerund: cayendo.',
    },
    distractors: ['caiendo', 'caído', 'caendo'],
  },
  {
    form: 'gerund',
    verb: 'construir',
    sentence: 'Están ____ una biblioteca moderna cerca de la plaza.',
    translation: {
      zh: '他们正在广场附近建造一座现代化的图书馆。',
      en: 'They are building a modern library near the square.',
    },
    reason: {
      zh: '以 -uir 结尾的动词在副动词中同样将 i 变为 y，construir 变为 construyendo。',
      en: 'Verbs ending in -uir replace i with y in the gerund: construir -> construyendo.',
    },
    distractors: ['construiendo', 'construido', 'construyendoi'],
  },
  {
    form: 'gerund',
    verb: 'trabajar',
    sentence: 'Mi hermana lleva tres años ____ en esa empresa.',
    translation: {
      zh: '我姐姐在那家公司已经工作三年了。',
      en: 'My sister has been working at that company for three years.',
    },
    reason: {
      zh: 'llevar + 时间段 + 副动词表示持续至今的动作，规则 -ar 动词的副动词词尾为 -ando（trabajando）。',
      en: 'Llevar + duration + gerund expresses ongoing duration; regular -ar verbs take -ando (trabajando).',
    },
    distractors: ['trabajado', 'trabajiendo', 'trabajándo'],
  },
] as const satisfies readonly NonFiniteScene[];
