import type { NonFiniteScene } from './types';

export const italianNonFiniteScenes = [
  // Past participle scenes (12)
  {
    form: 'pastParticiple',
    verb: 'parlare',
    sentence: 'Ho ____ con il professore prima della lezione.',
    translation: {
      zh: '我在课前和教授聊过了。',
      en: 'I spoke with the professor before the class.',
    },
    reason: {
      zh: '第一变位动词 parlare 的过去分词为规则形式 parlato，与助动词 avere 连用构成近过去时。',
      en: 'The regular -are verb parlare forms its past participle parlato with avere in the passato prossimo.',
    },
    distractors: ['parlito', 'parluto', 'parlando'],
  },
  {
    form: 'pastParticiple',
    verb: 'fare',
    sentence: 'Elena ha ____ una torta al cioccolato per la festa.',
    translation: {
      zh: '埃莱娜为派对做了一个巧克力蛋糕。',
      en: 'Elena made a chocolate cake for the party.',
    },
    reason: {
      zh: '不规则动词 fare 的过去分词是 fatto，搭配 avere 构成近过去时时不随主语变格。',
      en: 'The irregular verb fare has the past participle fatto, which stays invariable with avere.',
    },
    distractors: ['faciuto', 'fato', 'facendo'],
  },
  {
    form: 'pastParticiple',
    verb: 'scrivere',
    sentence: 'Abbiamo ____ una lunga lettera ai nostri amici.',
    translation: {
      zh: '我们给朋友们写了一封长信。',
      en: 'We wrote a long letter to our friends.',
    },
    reason: {
      zh: '动词 scrivere 的不规则过去分词是 scritto，在助动词 avere 后保持阳性单数形式。',
      en: 'The irregular past participle of scrivere is scritto, remaining masculine singular after avere.',
    },
    distractors: ['scrivuto', 'scrito', 'scrivendo'],
  },
  {
    form: 'pastParticiple',
    verb: 'leggere',
    sentence: 'Marco ha ____ tutto il romanzo in due giorni.',
    translation: {
      zh: '马尔科两天就读完了整本小说。',
      en: 'Marco read the whole novel in two days.',
    },
    reason: {
      zh: '动词 leggere 的不规则过去分词为 letto，与助动词 avere 构成近过去时。',
      en: 'The irregular verb leggere takes the past participle letto with avere in the passato prossimo.',
    },
    distractors: ['legguto', 'leggiuto', 'leggendo'],
  },
  {
    form: 'pastParticiple',
    verb: 'aprire',
    sentence: 'Hai ____ la finestra per far entrare aria fresca?',
    translation: {
      zh: '你打开窗户让新鲜空气进来了吗？',
      en: 'Did you open the window to let fresh air in?',
    },
    reason: {
      zh: '动词 aprire 的不规则过去分词是 aperto，与 avere 连用时保持不变。',
      en: 'The irregular past participle of aprire is aperto, which remains invariable with avere.',
    },
    distractors: ['aprito', 'aprendo', 'aprio'],
  },
  {
    form: 'pastParticiple',
    verb: 'prendere',
    sentence: 'Stamattina ho ____ il treno delle sette.',
    translation: {
      zh: '今天早上我坐了七点的火车。',
      en: 'This morning I took the seven o’clock train.',
    },
    reason: {
      zh: '动词 prendere 的不规则过去分词为 preso，搭配 avere 构成近过去时。',
      en: 'The irregular verb prendere forms its past participle preso with avere.',
    },
    distractors: ['prenduto', 'presso', 'prendendo'],
  },
  {
    form: 'pastParticiple',
    verb: 'mettere',
    sentence: 'Luca ha ____ le chiavi sul tavolo dell’ingresso.',
    translation: {
      zh: '卢卡把钥匙放在了玄关的桌子上。',
      en: 'Luca put the keys on the hallway table.',
    },
    reason: {
      zh: '动词 mettere 的不规则过去分词是 messo，注意双写 s。',
      en: 'The irregular past participle of mettere is messo, spelled with a double s.',
    },
    distractors: ['mettuto', 'meso', 'mettendo'],
  },
  {
    form: 'pastParticiple',
    verb: 'chiedere',
    sentence: 'Ho ____ informazioni alla biglietteria centrale.',
    translation: {
      zh: '我向中央售票处询问了信息。',
      en: 'I asked for information at the main ticket office.',
    },
    reason: {
      zh: '动词 chiedere 的不规则过去分词为 chiesto，与 avere 连用表示过去完成的动作。',
      en: 'The irregular verb chiedere uses the past participle chiesto with avere.',
    },
    distractors: ['chieduto', 'chieso', 'chiedendo'],
  },
  {
    form: 'pastParticiple',
    verb: 'scegliere',
    sentence: 'Abbiamo ____ un ristorante tranquillo vicino al fiume.',
    translation: {
      zh: '我们选了一家靠近河边的安静餐厅。',
      en: 'We chose a quiet restaurant near the river.',
    },
    reason: {
      zh: '动词 scegliere 的不规则过去分词是 scelto，搭配 avere 构成近过去时。',
      en: 'The irregular past participle of scegliere is scelto when forming the passato prossimo with avere.',
    },
    distractors: ['scegliuto', 'sceluto', 'scegliendo'],
  },
  {
    form: 'pastParticiple',
    verb: 'rompere',
    sentence: 'Il bambino ha ____ il bicchiere di vetro per sbaglio.',
    translation: {
      zh: '那个小男孩不小心打碎了玻璃杯。',
      en: 'The little boy broke the glass cup by mistake.',
    },
    reason: {
      zh: '动词 rompere 的不规则过去分词为 rotto，不可规则化为 romputo。',
      en: 'The irregular verb rompere forms the past participle rotto rather than a regular -uto form.',
    },
    distractors: ['romputo', 'roto', 'rompendo'],
  },
  {
    form: 'pastParticiple',
    verb: 'andare',
    sentence: 'Mio fratello è ____ a Milano per lavoro.',
    translation: {
      zh: '我哥哥去米兰出差了。',
      en: 'My brother went to Milan for work.',
    },
    reason: {
      zh: '主语 mio fratello 为阳性单数，与助动词 essere 连用时 andare 的过去分词为 andato。',
      en: 'With the masculine singular subject mio fratello and essere, andare takes the past participle andato.',
    },
    distractors: ['anduto', 'andata', 'andando'],
  },
  {
    form: 'pastParticiple',
    verb: 'venire',
    sentence: 'Il nostro amico Paolo è ____ a trovarci ieri sera.',
    translation: {
      zh: '我们的朋友保罗昨晚来看我们了。',
      en: 'Our friend Paolo came to visit us last night.',
    },
    reason: {
      zh: '主语 il nostro amico Paolo 为阳性单数，venire 与 essere 连用时过去分词为 venuto。',
      en: 'With the masculine singular subject il nostro amico Paolo and essere, venire uses venuto.',
    },
    distractors: ['venito', 'venuta', 'venendo'],
  },

  // Gerund scenes (12, including stare progressive and adverbial uses)
  {
    form: 'gerund',
    verb: 'lavorare',
    sentence: 'In questo momento sto ____ a un nuovo progetto.',
    translation: {
      zh: '我现在正在做一个新项目。',
      en: 'Right now I am working on a new project.',
    },
    reason: {
      zh: 'stare + 副动词构成进行时，第一变位动词 lavorare 的副动词为 lavorando。',
      en: 'The progressive construction stare + gerund uses lavorando for the -are verb lavorare.',
    },
    distractors: ['lavorendo', 'lavorato', 'lavorante'],
  },
  {
    form: 'gerund',
    verb: 'leggere',
    sentence: 'Giulia sta ____ un articolo interessante in giardino.',
    translation: {
      zh: '朱莉娅正在花园里读一篇有趣的文章。',
      en: 'Giulia is reading an interesting article in the garden.',
    },
    reason: {
      zh: 'stare + 副动词表示正在进行的动作，leggere 的副动词为规则形式 leggendo。',
      en: 'Stare + gerund expresses an ongoing action; leggere forms the regular gerund leggendo.',
    },
    distractors: ['leggiando', 'leggando', 'letto'],
  },
  {
    form: 'gerund',
    verb: 'dormire',
    sentence: 'Fai piano, il bambino sta ancora ____.',
    translation: {
      zh: '小声点，宝宝还在睡觉呢。',
      en: 'Be quiet, the baby is still sleeping.',
    },
    reason: {
      zh: '第三变位动词 dormire 的副动词词尾为 -endo，与 sta 连用表示正在睡觉。',
      en: 'The -ire verb dormire takes -endo to form dormendo in the stare + gerund progressive.',
    },
    distractors: ['dormando', 'dormito', 'dormiente'],
  },
  {
    form: 'gerund',
    verb: 'preparare',
    sentence: 'Stiamo ____ la cena per tutti gli ospiti.',
    translation: {
      zh: '我们正在为所有客人准备晚餐。',
      en: 'We are preparing dinner for all the guests.',
    },
    reason: {
      zh: 'stiamo + 副动词表示“我们正在……”，preparare 的副动词为 preparando。',
      en: 'Stiamo + gerund means we are doing something right now; preparare forms preparando.',
    },
    distractors: ['preparendo', 'preparato', 'prepariamo'],
  },
  {
    form: 'gerund',
    verb: 'aspettare',
    sentence: 'Marco sta ____ l’autobus sotto la pioggia.',
    translation: {
      zh: '马尔科正在雨中等公交车。',
      en: 'Marco is waiting for the bus in the rain.',
    },
    reason: {
      zh: '进行时 sta + 副动词搭配 aspettare 时使用 aspettando。',
      en: 'The progressive sta + gerund uses aspettando for the -are verb aspettare.',
    },
    distractors: ['aspettendo', 'aspettato', 'aspettante'],
  },
  {
    form: 'gerund',
    verb: 'fare',
    sentence: 'Che cosa stai ____ in cucina così tardi?',
    translation: {
      zh: '这么晚了你在厨房里做什么呢？',
      en: 'What are you doing in the kitchen so late?',
    },
    reason: {
      zh: '不规则动词 fare 的副动词源于词干 fac-，写作 facendo，常与 stare 连用。',
      en: 'The irregular verb fare uses the stem fac- to form the gerund facendo with stare.',
    },
    distractors: ['farendo', 'fando', 'fatto'],
  },
  {
    form: 'gerund',
    verb: 'dire',
    sentence: 'Non capisco che cosa stia ____ il relatore.',
    translation: {
      zh: '我不明白主讲人正在说什么。',
      en: 'I do not understand what the speaker is saying.',
    },
    reason: {
      zh: '不规则动词 dire 的副动词源于词干 dic-，形式为 dicendo。',
      en: 'The irregular verb dire forms its gerund dicendo from the stem dic-.',
    },
    distractors: ['direndo', 'diendo', 'detto'],
  },
  {
    form: 'gerund',
    verb: 'bere',
    sentence: 'I ragazzi stanno ____ un succo d’arancia al bar.',
    translation: {
      zh: '年轻人们正在咖啡馆里喝橙汁。',
      en: 'The young people are drinking orange juice at the café.',
    },
    reason: {
      zh: '不规则动词 bere 的副动词源于词干 bev-，写作 bevendo。',
      en: 'The irregular verb bere forms its gerund bevendo from the stem bev-.',
    },
    distractors: ['berendo', 'beando', 'bevuto'],
  },
  {
    form: 'gerund',
    verb: 'camminare',
    sentence: 'Siamo arrivati in centro ____ lungo il fiume.',
    translation: {
      zh: '我们沿着河边散步来到了市中心。',
      en: 'We arrived downtown by walking along the river.',
    },
    reason: {
      zh: '副动词 camminando 单独使用，表示到达市中心的方式或伴随动作。',
      en: 'The gerund camminando is used adverbially to express the manner of arriving downtown.',
    },
    distractors: ['camminendo', 'camminato', 'camminante'],
  },
  {
    form: 'gerund',
    verb: 'studiare',
    sentence: 'Puoi migliorare la pronuncia ____ ogni giorno ad alta voce.',
    translation: {
      zh: '通过每天大声朗读学习，你可以改善发音。',
      en: 'You can improve your pronunciation by studying aloud every day.',
    },
    reason: {
      zh: '副动词 studiando 表示方式或手段（“通过学习”），-iare 动词保留 i 加 -ando。',
      en: 'The gerund studiando expresses means (“by studying”); -iare verbs keep the i before -ando.',
    },
    distractors: ['studiendo', 'studando', 'studiato'],
  },
  {
    form: 'gerund',
    verb: 'tradurre',
    sentence: 'Ho imparato molti vocaboli ____ questi articoli.',
    translation: {
      zh: '我通过翻译这些文章学到了很多词汇。',
      en: 'I learned many words by translating these articles.',
    },
    reason: {
      zh: '不规则动词 tradurre 的副动词源于词干 traduc-，写作 traducendo。',
      en: 'The irregular verb tradurre forms its gerund traducendo from the stem traduc-.',
    },
    distractors: ['tradurrendo', 'tradurando', 'tradotto'],
  },
  {
    form: 'gerund',
    verb: 'essere',
    sentence: 'Non ____ pronto, Carlo ha deciso di aspettare il turno successivo.',
    translation: {
      zh: '因为还没准备好，卡洛决定等下一班。',
      en: 'Not being ready, Carlo decided to wait for the next turn.',
    },
    reason: {
      zh: '不规则动词 essere 的副动词为 essendo，在句中可引导原因状语从句。',
      en: 'The irregular verb essere has the gerund essendo, used here in a causal adverbial clause.',
    },
    distractors: ['esserendo', 'sendo', 'stato'],
  },
] as const satisfies readonly NonFiniteScene[];
