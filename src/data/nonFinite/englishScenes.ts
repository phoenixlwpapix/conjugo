import type { NonFiniteScene } from './types';

export const englishNonFiniteScenes = [
  // pastParticiple (14 scenes)
  {
    form: 'pastParticiple',
    verb: 'to draw',
    sentence: 'She has ____ a detailed map of the old harbor.',
    translation: {
      zh: '她已经画了一张老港口的详细地图。',
      en: 'She has drawn a detailed map of the old harbor.',
    },
    reason: {
      zh: '现在完成时“has + 过去分词”需要不规则过去分词 drawn，而不是过去式 drew 或规则化的 drawed。',
      en: 'Present perfect "has + past participle" requires the irregular past participle "drawn", not past-simple "drew" or regularized "drawed".',
    },
    distractors: ['drew', 'drawed', 'drawing'],
  },
  {
    form: 'pastParticiple',
    verb: 'to write',
    sentence: 'All the invitations were ____ by hand last night.',
    translation: {
      zh: '昨晚所有的邀请函都是手写的。',
      en: 'All the invitations were written by hand last night.',
    },
    reason: {
      zh: '被动语态“were + 过去分词”需要使用不规则过去分词 written（双写 t）。',
      en: 'Passive voice "were + past participle" requires the irregular past participle "written" with a doubled "t".',
    },
    distractors: ['wrote', 'writed', 'writen'],
  },
  {
    form: 'pastParticiple',
    verb: 'to break',
    sentence: 'Someone has ____ the handle on the kitchen door.',
    translation: {
      zh: '有人把厨房门的把手弄坏了。',
      en: 'Someone has broken the handle on the kitchen door.',
    },
    reason: {
      zh: '“has + 过去分词”构成现在完成时，break 的过去分词为 broken。',
      en: '"Has + past participle" forms the present perfect; the past participle of "break" is "broken".',
    },
    distractors: ['broke', 'breaked', 'breaking'],
  },
  {
    form: 'pastParticiple',
    verb: 'to choose',
    sentence: 'The committee has ____ three finalists for the award.',
    translation: {
      zh: '委员会已经选出了三位入围该奖项的决赛选手。',
      en: 'The committee has chosen three finalists for the award.',
    },
    reason: {
      zh: 'choose 的过去式是 chose，而在“has + 过去分词”中必须使用 chosen。',
      en: 'The past simple of "choose" is "chose", whereas "has + past participle" requires "chosen".',
    },
    distractors: ['chose', 'choosed', 'chosed'],
  },
  {
    form: 'pastParticiple',
    verb: 'to speak',
    sentence: 'We have ____ with the project lead about the schedule.',
    translation: {
      zh: '我们已经和项目负责人谈过时间表了。',
      en: 'We have spoken with the project lead about the schedule.',
    },
    reason: {
      zh: '“have + 过去分词”使用 speak 的过去分词 spoken，而不是过去式 spoke。',
      en: '"Have + past participle" uses "spoken", not the past-simple form "spoke".',
    },
    distractors: ['spoke', 'speaked', 'spokened'],
  },
  {
    form: 'pastParticiple',
    verb: 'to forget',
    sentence: 'I had completely ____ where I parked the bicycle.',
    translation: {
      zh: '我完全忘了自己把自行车停在哪里。',
      en: 'I had completely forgotten where I parked the bicycle.',
    },
    reason: {
      zh: '过去完成时“had + 过去分词”需要过去分词 forgotten（双写 t）。',
      en: 'Past perfect "had + past participle" requires "forgotten" with a doubled "t".',
    },
    distractors: ['forgot', 'forgetted', 'forgoten'],
  },
  {
    form: 'pastParticiple',
    verb: 'to take',
    sentence: 'Every seat near the window has already been ____.',
    translation: {
      zh: '靠窗的每一个座位都已经被占了。',
      en: 'Every seat near the window has already been taken.',
    },
    reason: {
      zh: '现在完成被动语态“has been + 过去分词”需要使用 take 的过去分词 taken。',
      en: 'The present perfect passive "has been + past participle" takes "taken".',
    },
    distractors: ['took', 'taked', 'taking'],
  },
  {
    form: 'pastParticiple',
    verb: 'to freeze',
    sentence: 'The pond has ____ solid overnight.',
    translation: {
      zh: '池塘一夜之间冻得结结实实。',
      en: 'The pond has frozen solid overnight.',
    },
    reason: {
      zh: 'freeze 的过去分词为 frozen，与助动词 has 搭配构成现在完成时。',
      en: 'The past participle of "freeze" is "frozen", paired with "has" for the present perfect.',
    },
    distractors: ['froze', 'freezed', 'freezing'],
  },
  {
    form: 'pastParticiple',
    verb: 'to steal',
    sentence: 'His bike was ____ from outside the train station.',
    translation: {
      zh: '他的自行车在火车站外被偷了。',
      en: 'His bike was stolen from outside the train station.',
    },
    reason: {
      zh: '被动语态“was + 过去分词”需要 steal 的过去分词 stolen。',
      en: 'Passive voice "was + past participle" requires "stolen".',
    },
    distractors: ['stole', 'stealed', 'stealing'],
  },
  {
    form: 'pastParticiple',
    verb: 'to swim',
    sentence: 'She has ____ across the bay twice this summer.',
    translation: {
      zh: '今年夏天她已经游过那个海湾两次了。',
      en: 'She has swum across the bay twice this summer.',
    },
    reason: {
      zh: 'swim 的过去式是 swam，但在完成时“has + 过去分词”中应使用 swum。',
      en: 'The past simple of "swim" is "swam", while "has + past participle" requires "swum".',
    },
    distractors: ['swam', 'swimmed', 'swimming'],
  },
  {
    form: 'pastParticiple',
    verb: 'to begin',
    sentence: 'The concert has just ____, so let us find our seats.',
    translation: {
      zh: '音乐会刚刚开始，我们去找座位吧。',
      en: 'The concert has just begun, so let us find our seats.',
    },
    reason: {
      zh: 'begin 的过去式是 began，过去分词是 begun，用于“has + 过去分词”。',
      en: '"Begin" has past simple "began" and past participle "begun" after "has".',
    },
    distractors: ['began', 'beginned', 'beginning'],
  },
  {
    form: 'pastParticiple',
    verb: 'to hide',
    sentence: 'The spare key is ____ under the flowerpot.',
    translation: {
      zh: '备用钥匙藏在花盆下面。',
      en: 'The spare key is hidden under the flowerpot.',
    },
    reason: {
      zh: '此处“is + 过去分词”表示状态被动，hide 的过去分词为 hidden（双写 d）。',
      en: '"Is + past participle" expresses a passive state using "hidden" with a doubled "d".',
    },
    distractors: ['hid', 'hided', 'hiden'],
  },
  {
    form: 'pastParticiple',
    verb: 'to lead',
    sentence: 'Our coach has ____ the team to three consecutive finals.',
    translation: {
      zh: '我们的教练已经带领球队连续三次闯入决赛。',
      en: 'Our coach has led the team to three consecutive finals.',
    },
    reason: {
      zh: 'lead 的过去分词是 led，注意不要与动词原形 lead 混淆。',
      en: 'The past participle of "lead" is "led", not to be confused with base "lead".',
    },
    distractors: ['lead', 'leaded', 'leading'],
  },
  {
    form: 'pastParticiple',
    verb: 'to prefer',
    sentence: 'I have always ____ tea over coffee in the afternoon.',
    translation: {
      zh: '下午我向来更喜欢喝茶而不是咖啡。',
      en: 'I have always preferred tea over coffee in the afternoon.',
    },
    reason: {
      zh: 'prefer 重读闭音节在词尾，加 -ed 构成过去分词时须双写 r，写作 preferred。',
      en: 'Because "prefer" ends in a stressed CVC syllable, the final "r" doubles in "preferred".',
    },
    distractors: ['prefered', 'prefering', 'prefer'],
  },

  // presentParticiple (14 scenes)
  {
    form: 'presentParticiple',
    verb: 'to run',
    sentence: 'He is ____ along the river before breakfast.',
    translation: {
      zh: '他正在早饭前沿着河边跑步。',
      en: 'He is running along the river before breakfast.',
    },
    reason: {
      zh: 'run 为重读闭音节单音节词，加 -ing 时须双写词尾 n，写作 running，而非 runing。',
      en: 'Because "run" is a stressed CVC verb, the final "n" doubles to form "running", not "runing".',
    },
    distractors: ['runing', 'ran', 'run'],
  },
  {
    form: 'presentParticiple',
    verb: 'to write',
    sentence: 'They are ____ a joint report on renewable energy.',
    translation: {
      zh: '他们正在合写一份关于可再生能源的报告。',
      en: 'They are writing a joint report on renewable energy.',
    },
    reason: {
      zh: 'write 以不发音的 e 结尾，加 -ing 时须去掉 e，写作 writing，而非 writeing。',
      en: 'Verbs ending in silent "e" drop the "e" before "-ing": "writing", not "writeing".',
    },
    distractors: ['writeing', 'writting', 'written'],
  },
  {
    form: 'presentParticiple',
    verb: 'to begin',
    sentence: 'Leaves are ____ to turn gold along the avenue.',
    translation: {
      zh: '大道两旁的树叶正开始变成金黄色。',
      en: 'Leaves are beginning to turn gold along the avenue.',
    },
    reason: {
      zh: 'begin 重音在第二个音节 -gin，加 -ing 时须双写 n，写作 beginning。',
      en: 'Because stress falls on the final CVC syllable "-gin", "n" doubles in "beginning".',
    },
    distractors: ['begining', 'begun', 'began'],
  },
  {
    form: 'presentParticiple',
    verb: 'to swim',
    sentence: 'We spent the whole afternoon ____ in the cove.',
    translation: {
      zh: '我们整个下午都在海湾里游泳。',
      en: 'We spent the whole afternoon swimming in the cove.',
    },
    reason: {
      zh: 'spend time + -ing 结构使用现在分词/动名词形式，swim 须双写 m 写作 swimming。',
      en: 'After "spend + time", use the "-ing" form; "swim" doubles its final "m" to "swimming".',
    },
    distractors: ['swiming', 'swum', 'swam'],
  },
  {
    form: 'presentParticiple',
    verb: 'to have',
    sentence: 'She is ____ lunch with an old classmate today.',
    translation: {
      zh: '她今天正在和一位老同学吃午饭。',
      en: 'She is having lunch with an old classmate today.',
    },
    reason: {
      zh: 'have 以不发音的 e 结尾，加 -ing 时去掉 e，构成 having。',
      en: '"Have" drops its silent final "e" before "-ing" to form "having".',
    },
    distractors: ['haveing', 'had', 'has'],
  },
  {
    form: 'presentParticiple',
    verb: 'to sit',
    sentence: 'The cat is ____ quietly on the warm windowsill.',
    translation: {
      zh: '那只猫正安静地坐在温暖的窗台上。',
      en: 'The cat is sitting quietly on the warm windowsill.',
    },
    reason: {
      zh: 'sit 为短元音重读闭音节动词，加 -ing 时须双写 t，写作 sitting。',
      en: '"Sit" is a short-vowel CVC verb, so the final "t" doubles to form "sitting".',
    },
    distractors: ['siting', 'sat', 'sitted'],
  },
  {
    form: 'presentParticiple',
    verb: 'to make',
    sentence: 'He enjoys ____ fresh pasta from scratch on Sundays.',
    translation: {
      zh: '他喜欢在周日亲手从头制作新鲜意面。',
      en: 'He enjoys making fresh pasta from scratch on Sundays.',
    },
    reason: {
      zh: 'enjoy 后接 -ing 形式作宾语，make 去掉词尾不发音的 e 变为 making。',
      en: '"Enjoy" takes an "-ing" complement, and "make" drops its silent "e" to become "making".',
    },
    distractors: ['makeing', 'made', 'makes'],
  },
  {
    form: 'presentParticiple',
    verb: 'to travel',
    sentence: 'They are ____ across northern Japan by train this month.',
    translation: {
      zh: '他们这个月正乘火车游历日本北部。',
      en: 'They are traveling across northern Japan by train this month.',
    },
    reason: {
      zh: '美式拼写中，travel 重音在第一音节，加 -ing 通常不双写 l，写作 traveling。',
      en: 'In US spelling, unstressed "-el" does not double before "-ing", giving "traveling".',
    },
    distractors: ['traveled', 'travel', 'travels'],
  },
  {
    form: 'presentParticiple',
    verb: 'to stop',
    sentence: 'Thank you for ____ by the studio to help us pack.',
    translation: {
      zh: '谢谢你顺道来工作室帮我们打包。',
      en: 'Thank you for stopping by the studio to help us pack.',
    },
    reason: {
      zh: '介词 for 后接 -ing 形式，stop 为重读闭音节词，须双写 p 写作 stopping。',
      en: 'After the preposition "for", use "-ing"; "stop" doubles its final "p" to "stopping".',
    },
    distractors: ['stoping', 'stopped', 'stoped'],
  },
  {
    form: 'presentParticiple',
    verb: 'to see',
    sentence: 'I am ____ my dentist for a routine checkup tomorrow.',
    translation: {
      zh: '我明天要去看牙医做常规检查。',
      en: 'I am seeing my dentist for a routine checkup tomorrow.',
    },
    reason: {
      zh: 'see 以双元音字母 ee 结尾，加 -ing 时保留双 e，写作 seeing。',
      en: 'Verbs ending in "-ee" keep both "e"s before "-ing", forming "seeing".',
    },
    distractors: ['seing', 'seen', 'saw'],
  },
  {
    form: 'presentParticiple',
    verb: 'to get',
    sentence: 'It is ____ dark much earlier in November.',
    translation: {
      zh: '十一月天黑得早多了。',
      en: 'It is getting dark much earlier in November.',
    },
    reason: {
      zh: 'get 为重读闭音节动词，现在进行时加 -ing 须双写 t，写作 getting。',
      en: '"Get" doubles its final "t" in the "-ing" form to produce "getting".',
    },
    distractors: ['geting', 'gotten', 'got'],
  },
  {
    form: 'presentParticiple',
    verb: 'to open',
    sentence: 'She is ____ a small bakery near the museum.',
    translation: {
      zh: '她正在博物馆附近开一家小面包店。',
      en: 'She is opening a small bakery near the museum.',
    },
    reason: {
      zh: 'open 重音在首音节 o-，词尾音节非重读，加 -ing 不双写 n，写作 opening。',
      en: 'Because the final syllable of "open" is unstressed, do not double "n": "opening".',
    },
    distractors: ['openning', 'opened', 'opens'],
  },
  {
    form: 'presentParticiple',
    verb: 'to drive',
    sentence: 'Be careful while ____ through the mountain fog.',
    translation: {
      zh: '在山雾中开车时要小心。',
      en: 'Be careful while driving through the mountain fog.',
    },
    reason: {
      zh: 'while 后可接现在分词引导时间状语，drive 去掉词尾 e 构成 driving。',
      en: '"While + -ing" forms a reduced time clause; "drive" drops its final "e" to "driving".',
    },
    distractors: ['driveing', 'driven', 'drove'],
  },
  {
    form: 'presentParticiple',
    verb: 'to prefer',
    sentence: 'More students are ____ digital notes to paper notebooks.',
    translation: {
      zh: '越来越多的学生更倾向于用电子笔记而不是纸质笔记本。',
      en: 'More students are preferring digital notes to paper notebooks.',
    },
    reason: {
      zh: 'prefer 重音在第二个音节 -fer，加 -ing 时须双写 r，写作 preferring。',
      en: 'Because "prefer" is stressed on "-fer", the final "r" doubles to form "preferring".',
    },
    distractors: ['prefering', 'preferred', 'prefered'],
  },
] as const satisfies readonly NonFiniteScene[];
