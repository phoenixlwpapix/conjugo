import { englishContextReasons, englishTenseReasons } from './quizEnglish';
import { getLocalizedTenseName, type Locale } from '../lib/i18n';
import { getLanguageTenses, languages, type Language, type LanguageId, type PracticeTenseId, type Pronoun, type TenseId, type VerbEntry } from './verbs';

type Localized = Record<LanguageId, string>;
type Context = { text: Localized; zh: string; reason: string };

export type QuizQuestion = {
  id: string;
  tense: TenseId;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sentence: string;
  translation: Record<Locale, string>;
  explanation: Record<Locale, string>;
  pronoun: Pronoun;
  verb: VerbEntry;
  choices: string[];
  answer: string;
};

// Twenty distinct contextual sentence patterns per tense, localized for all
// four languages. Each also varies the subject and verb used in the blank.
const contexts: Record<TenseId, Context[]> = {
  present: [
    { text: { spanish: 'Cada mañana', french: 'Chaque matin', italian: 'Ogni mattina', english: 'Every morning' }, zh: '每天早上，', reason: '“每天早上”表明这是反复发生的日常习惯' },
    { text: { spanish: 'Normalmente', french: "D'habitude", italian: 'Di solito', english: 'Usually' }, zh: '通常，', reason: '“通常”描述习惯，不是某一次已经结束的动作' },
    { text: { spanish: 'Todos los lunes', french: 'Tous les lundis', italian: 'Ogni lunedì', english: 'Every Monday' }, zh: '每周一，', reason: '“每周一”说明动作定期重复' },
    { text: { spanish: 'Cuando hay tiempo libre', french: 'Quand il y a du temps libre', italian: "Quando c'è tempo libero", english: 'Whenever there is free time' }, zh: '只要有空，', reason: '句子说明在某种条件下经常会发生的事' },
    { text: { spanish: 'Hoy en día, por costumbre', french: "Aujourd'hui, par habitude", italian: "Oggi, per abitudine", english: 'These days, as a habit' }, zh: '如今按习惯，', reason: '“按习惯”指当前持续的规律' },
    { text: { spanish: 'Cada vez que nos reunimos', french: 'Chaque fois que nous nous réunissons', italian: 'Ogni volta che ci incontriamo', english: 'Every time we meet' }, zh: '每当我们见面，', reason: '“每当”引出反复出现的情况' },
    { text: { spanish: 'En general', french: 'En général', italian: 'In generale', english: 'In general' }, zh: '一般来说，', reason: '这是对通常情况的陈述，而非特定日期的一次事件' },
    { text: { spanish: 'Aunque ayer fue diferente, normalmente', french: "Même si hier était différent, d'habitude", italian: 'Anche se ieri è stato diverso, di solito', english: 'Although yesterday was different, normally' }, zh: '虽然昨天不同，但平时', reason: '转折后的“平时”说的是现在的习惯，不能被“昨天”带偏' },
    { text: { spanish: 'No solo hoy, sino todas las semanas', french: "Pas seulement aujourd'hui, mais chaque semaine", italian: 'Non solo oggi, ma ogni settimana', english: 'Not just today, but every week' }, zh: '不只是今天，而是每周都', reason: '“每周”强调反复，而不是只发生一次' },
    { text: { spanish: 'Siempre que surge la oportunidad', french: "Chaque fois que l'occasion se présente", italian: "Ogni volta che si presenta l'occasione", english: 'Whenever the opportunity comes up' }, zh: '每当有机会，', reason: '“每当”表示规律性反应，所以用现在时' },
  ],
  past: [
    { text: { spanish: 'Ayer', french: 'Hier', italian: 'Ieri', english: 'Yesterday' }, zh: '昨天，', reason: '“昨天”把动作定位在已经结束的过去' },
    { text: { spanish: 'El sábado pasado', french: 'Samedi dernier', italian: 'Sabato scorso', english: 'Last Saturday' }, zh: '上周六，', reason: '“上周六”是明确且已经结束的时间' },
    { text: { spanish: 'Hace dos días', french: 'Il y a deux jours', italian: 'Due giorni fa', english: 'Two days ago' }, zh: '两天前，', reason: '“两天前”指一次明确的过去事件' },
    { text: { spanish: 'Anoche, solo una vez', french: 'Hier soir, une seule fois', italian: 'Ieri sera, una sola volta', english: 'Last night, just once' }, zh: '昨晚只有一次，', reason: '“昨晚只有一次”强调已完成的单次动作' },
    { text: { spanish: 'Al terminar la reunión ayer', french: 'Après la réunion hier', italian: 'Dopo la riunione di ieri', english: 'After the meeting yesterday' }, zh: '昨天会议结束后，', reason: '会议后的动作发生在明确的过去时间' },
    { text: { spanish: 'Durante el viaje, una sola vez', french: 'Pendant le voyage, une seule fois', italian: 'Durante il viaggio, una sola volta', english: 'During the trip, just once' }, zh: '旅行中仅有一次，', reason: '“仅有一次”排除了过去习惯的意思' },
    { text: { spanish: 'El año pasado', french: "L'année dernière", italian: "L'anno scorso", english: 'Last year' }, zh: '去年，', reason: '“去年”提示动作发生在已结束的时期' },
    { text: { spanish: 'Antes de volver a casa el viernes pasado', french: 'Avant de rentrer vendredi dernier', italian: 'Prima di tornare a casa venerdì scorso', english: 'Before going home last Friday' }, zh: '上周五回家前，', reason: '这里说的是上周五完成的一次动作，并非以往每周五的习惯' },
    { text: { spanish: 'En cuanto llegó el tren ayer', french: 'Dès que le train est arrivé hier', italian: 'Appena il treno è arrivato ieri', english: 'As soon as the train arrived yesterday' }, zh: '昨天火车一到，', reason: '火车到达后紧接着发生一次动作，构成已完成的事件顺序' },
    { text: { spanish: 'Aunque no era habitual, aquel día', french: "Même si ce n'était pas habituel, ce jour-là", italian: 'Anche se non era abituale, quel giorno', english: 'Although it was unusual, on that day' }, zh: '尽管这并不寻常，但那天', reason: '“那天”强调一个例外的具体事件，而不是过去反复的习惯' },
  ],
  imperfect: [
    { text: { spanish: 'De pequeño, todos los veranos', french: 'Quand nous étions petits, chaque été', italian: 'Da piccoli, ogni estate', english: 'When we were young, every summer' }, zh: '小时候每个夏天，', reason: '“小时候每个夏天”表示过去反复发生的习惯' },
    { text: { spanish: 'Antes, cada mañana', french: 'Autrefois, chaque matin', italian: 'Una volta, ogni mattina', english: 'Back then, every morning' }, zh: '从前每天早上，', reason: '“从前每天早上”描述旧日习惯，而非一次完成的事件' },
    { text: { spanish: 'En aquella época, normalmente', french: "À cette époque, d'habitude", italian: "A quell'epoca, di solito", english: 'In those days, usually' }, zh: '那时候通常，', reason: '“那时候通常”指过去持续的规律' },
    { text: { spanish: 'Mientras los demás esperaban', french: 'Pendant que les autres attendaient', italian: 'Mentre gli altri aspettavano', english: 'While the others were waiting' }, zh: '其他人在等候时，', reason: '“在……时”把动作作为过去进行中的背景' },
    { text: { spanish: 'Cuando vivíamos allí, casi siempre', french: 'Quand nous habitions là-bas, presque toujours', italian: 'Quando abitavamo lì, quasi sempre', english: 'When we lived there, almost always' }, zh: '我们住在那里时几乎总是，', reason: '“几乎总是”强调过去的重复行为' },
    { text: { spanish: 'Cada vez que sonaba la campana', french: 'Chaque fois que la cloche sonnait', italian: 'Ogni volta che suonava la campana', english: 'Whenever the bell rang' }, zh: '过去每当铃响，', reason: '“每当”说明动作在过去反复出现' },
    { text: { spanish: 'Durante aquel invierno, casi todos los días', french: 'Pendant cet hiver-là, presque tous les jours', italian: "Durante quell'inverno, quasi ogni giorno", english: 'During that winter, almost every day' }, zh: '那个冬天几乎每天，', reason: '“几乎每天”描述过去一段时间的习惯' },
    { text: { spanish: 'Mientras anochecía', french: 'Pendant que la nuit tombait', italian: 'Mentre scendeva la sera', english: 'As night was falling' }, zh: '夜幕降临时，', reason: '这是过去场景中的背景动作，没有强调完成边界' },
    { text: { spanish: 'No una sola vez, sino a menudo por entonces', french: "Pas une seule fois, mais souvent à l'époque", italian: 'Non una sola volta, ma spesso allora', english: 'Not just once, but often back then' }, zh: '不是只一次，而是那时经常', reason: '“经常”直接指向过去的习惯，与单次过去事件相反' },
    { text: { spanish: 'Durante años, antes de mudarnos', french: 'Pendant des années, avant notre déménagement', italian: 'Per anni, prima di trasferirci', english: 'For years, before we moved' }, zh: '搬家前的很多年里，', reason: '“很多年里”描述过去长期持续的状态或行为' },
  ],
  future: [
    { text: { spanish: 'Mañana', french: 'Demain', italian: 'Domani', english: 'Tomorrow' }, zh: '明天，', reason: '“明天”明确指向尚未发生的动作' },
    { text: { spanish: 'El próximo sábado', french: 'Samedi prochain', italian: 'Sabato prossimo', english: 'Next Saturday' }, zh: '下周六，', reason: '“下周六”是未来时间' },
    { text: { spanish: 'Dentro de dos semanas', french: 'Dans deux semaines', italian: 'Fra due settimane', english: 'In two weeks' }, zh: '两周后，', reason: '“两周后”表示将来的事件' },
    { text: { spanish: 'El año que viene', french: "L'année prochaine", italian: "L'anno prossimo", english: 'Next year' }, zh: '明年，', reason: '“明年”使动作落在未来' },
    { text: { spanish: 'Esta noche, más tarde', french: 'Ce soir, plus tard', italian: 'Stasera, più tardi', english: 'Later tonight' }, zh: '今晚晚些时候，', reason: '“晚些时候”说明动作还没有发生' },
    { text: { spanish: 'Después de la reunión de mañana', french: 'Après la réunion de demain', italian: 'Dopo la riunione di domani', english: "After tomorrow's meeting" }, zh: '明天会议结束后，', reason: '会议在明天，后续动作也在将来' },
    { text: { spanish: 'Cuando empiece el próximo curso', french: 'Au début du prochain semestre', italian: "All'inizio del prossimo semestre", english: 'When the next term begins' }, zh: '下学期开学时，', reason: '“下学期”表示尚未到来的时间' },
    { text: { spanish: 'Antes del viernes que viene', french: 'Avant vendredi prochain', italian: 'Prima di venerdì prossimo', english: 'Before next Friday' }, zh: '下周五之前，', reason: '这个期限在未来，不是已经完成的过去' },
    { text: { spanish: 'Aunque hoy no pueda, la semana que viene', french: "Même si ce n'est pas possible aujourd'hui, la semaine prochaine", italian: 'Anche se oggi non è possibile, la settimana prossima', english: 'Even if it is not possible today, next week' }, zh: '即使今天不行，下周', reason: '转折后的“下周”决定主句要表达将来的动作' },
    { text: { spanish: 'En cuanto llegue el momento el mes que viene', french: 'Dès que le moment viendra le mois prochain', italian: 'Appena arriverà il momento il mese prossimo', english: 'When the time comes next month' }, zh: '下个月时机一到，', reason: '整个事件尚未发生；这里也没有虚拟的“如果”条件' },
  ],
  conditional: [
    { text: { spanish: 'Si hubiera más tiempo', french: "S'il y avait plus de temps", italian: 'Se ci fosse più tempo', english: 'If there were more time' }, zh: '如果时间更充裕，', reason: '“如果”提出与现实不一定相符的设想' },
    { text: { spanish: 'Si hiciera mejor tiempo', french: 'Si le temps était meilleur', italian: 'Se il tempo fosse migliore', english: 'If the weather were better' }, zh: '如果天气更好，', reason: '天气条件只是设想，主句说的是“会怎样”' },
    { text: { spanish: 'En otras circunstancias', french: "Dans d'autres circonstances", italian: 'In altre circostanze', english: 'Under different circumstances' }, zh: '在另一种情况下，', reason: '另一种情况是假设，并非已确定的未来计划' },
    { text: { spanish: 'Si el dinero no fuera un problema', french: "Si l'argent n'était pas un problème", italian: 'Se il denaro non fosse un problema', english: 'If money were no problem' }, zh: '如果钱不是问题，', reason: '主句依赖这个假想条件' },
    { text: { spanish: 'Con un poco más de ayuda', french: "Avec un peu plus d'aide", italian: "Con un po' più di aiuto", english: 'With a little more help' }, zh: '如果多一点帮助，', reason: '“多一点帮助”暗示条件成立时才会发生的结果' },
    { text: { spanish: 'Si cambiaran las reglas', french: 'Si les règles changeaient', italian: 'Se le regole cambiassero', english: 'If the rules changed' }, zh: '如果规则改变，', reason: '动作取决于规则改变这一条件' },
    { text: { spanish: 'Si no hubiera tanta prisa', french: "S'il n'y avait pas tant de précipitation", italian: 'Se non ci fosse tanta fretta', english: 'If there were no rush' }, zh: '如果不那么赶时间，', reason: '这是与当前情况不同的假设结果' },
    { text: { spanish: 'Si el viaje fuera más corto', french: 'Si le trajet était plus court', italian: 'Se il viaggio fosse più breve', english: 'If the trip were shorter' }, zh: '如果路程更短，', reason: '短途旅行是假设，主句不能用确定的将来时' },
    { text: { spanish: 'Si nada se lo impidiera', french: "Si rien ne l'en empêchait", italian: 'Se niente lo impedisse', english: 'If nothing stood in the way' }, zh: '如果没有阻碍，', reason: '这里描述的是排除阻碍后可能出现的结果' },
    { text: { spanish: 'Aunque sea poco probable, si se diera la oportunidad', french: "Même si c'est peu probable, si l'occasion se présentait", italian: "Anche se è improbabile, se si presentasse l'occasione", english: 'Even if unlikely, if the chance arose' }, zh: '即使机会渺茫，如果机会出现，', reason: '“机会出现”仍是假设；不能把它当作确定会发生的未来事件' },
  ],
  subjunctive: [
    { text: { spanish: 'Me alegra que', french: 'Je suis heureux que', italian: 'Sono felice che', english: 'I am glad that' }, zh: '我很高兴', reason: '“我很高兴”是说话者对另一件事的情感反应' },
    { text: { spanish: 'Espero que', french: 'Je souhaite que', italian: 'Spero che', english: 'I hope that' }, zh: '我希望', reason: '“希望”表达愿望，并非客观陈述已确定的事实' },
    { text: { spanish: 'Dudo que', french: 'Je doute que', italian: 'Dubito che', english: 'I doubt that' }, zh: '我怀疑', reason: '“怀疑”使从句内容带有不确定性' },
    { text: { spanish: 'Es importante que', french: 'Il est important que', italian: 'È importante che', english: 'It is important that' }, zh: '重要的是', reason: '“重要的是”表达评价或要求' },
    { text: { spanish: 'Es posible que', french: 'Il est possible que', italian: 'È possibile che', english: 'It is possible that' }, zh: '有可能', reason: '“有可能”表示不确定，而非肯定事实' },
    { text: { spanish: 'Prefiero que', french: 'Je préfère que', italian: 'Preferisco che', english: 'I prefer that' }, zh: '我更希望', reason: '“更希望”表达主观偏好' },
    { text: { spanish: 'Me sorprende que', french: 'Je suis surpris que', italian: 'Mi sorprende che', english: 'I am surprised that' }, zh: '我很惊讶', reason: '“很惊讶”是情绪评价，不是中性的事实叙述' },
    { text: { spanish: 'Insisto en que', french: "J'insiste pour que", italian: 'Insisto affinché', english: 'I insist that' }, zh: '我坚持要求', reason: '“坚持要求”体现说话者的意愿和要求' },
    { text: { spanish: 'Ojalá que', french: 'Je veux que', italian: 'Voglio che', english: 'I wish that' }, zh: '但愿', reason: '“但愿”明确表达愿望，而非已经确认的事实' },
    { text: { spanish: 'Es necesario que', french: 'Il faut que', italian: 'È necessario che', english: 'It is necessary that' }, zh: '有必要', reason: '“有必要”提出要求，触发从句的虚拟式' },
  ],
};

const furtherContexts: Record<TenseId, Context[]> = {
  present: [
    { text: { spanish: 'Todos los domingos', french: 'Tous les dimanches', italian: 'Ogni domenica', english: 'Every Sunday' }, zh: '每个星期天，', reason: '“每个星期天”表示按周重复的习惯' },
    { text: { spanish: 'Siempre antes de cenar', french: 'Toujours avant le dîner', italian: 'Sempre prima di cena', english: 'Always before dinner' }, zh: '每次晚餐前，', reason: '“每次”标明现在的固定规律' },
    { text: { spanish: 'Cada vez que llueve', french: "Chaque fois qu'il pleut", italian: 'Ogni volta che piove', english: 'Whenever it rains' }, zh: '每当下雨，', reason: '这不是某个雨天，而是每次下雨时都会发生的事' },
    { text: { spanish: 'Aunque hoy tiene mucho trabajo, por lo general', french: "Même s'il est occupé aujourd'hui, en général", italian: 'Anche se oggi è molto impegnato, in generale', english: 'Although today is busy, in general' }, zh: '虽然今天很忙，但一般来说，', reason: '“一般来说”指常态；“今天”只是对照' },
    { text: { spanish: 'Desde hace años, semana tras semana', french: 'Depuis des années, semaine après semaine', italian: 'Da anni, settimana dopo settimana', english: 'For years, week after week' }, zh: '多年来每周，', reason: '“每周”突出持续至今的重复行为' },
    { text: { spanish: 'En esta familia, por tradición', french: 'Dans cette famille, par tradition', italian: 'In questa famiglia, per tradizione', english: 'In this family, by tradition' }, zh: '按这个家庭的传统，', reason: '家庭传统属于惯常做法，而非一次过去事件' },
    { text: { spanish: 'Cuando termina la jornada laboral, normalmente', french: 'Quand la journée de travail se termine, normalement', italian: 'Quando finisce la giornata di lavoro, di solito', english: 'When the workday ends, normally' }, zh: '下班后通常，', reason: '“通常”说明条件满足时反复发生' },
    { text: { spanish: 'No solo los martes, sino a diario', french: 'Pas seulement le mardi, mais tous les jours', italian: 'Non solo il martedì, ma ogni giorno', english: 'Not just on Tuesdays, but daily' }, zh: '不只周二，而是每天都', reason: '“每天”明确要求表达当下的重复习惯' },
    { text: { spanish: 'Mientras sigue la misma rutina', french: 'Tant que la routine reste la même', italian: 'Finché la routine rimane la stessa', english: 'As long as the routine stays the same' }, zh: '只要日常安排不变，', reason: '句子概括现行安排下的一般情况' },
    { text: { spanish: 'Siempre que llegan visitas', french: 'Chaque fois que des invités arrivent', italian: 'Ogni volta che arrivano ospiti', english: 'Whenever visitors arrive' }, zh: '每当有客人来，', reason: '“每当”指反复出现的情境' },
  ],
  past: [
    { text: { spanish: 'El viernes anterior', french: 'Le vendredi précédent', italian: 'Il venerdì precedente', english: 'The previous Friday' }, zh: '此前那个星期五，', reason: '特定的星期五属于已结束的过去' },
    { text: { spanish: 'La primera vez, en 2020', french: 'La première fois, en 2020', italian: 'La prima volta, nel 2020', english: 'The first time, in 2020' }, zh: '2020 年第一次，', reason: '“第一次”加明确年份，指一次已完成的事件' },
    { text: { spanish: 'Justo después de la llamada de ayer', french: "Juste après l'appel d'hier", italian: 'Subito dopo la chiamata di ieri', english: "Right after yesterday's call" }, zh: '昨天那通电话之后，', reason: '动作接在昨天的电话之后，形成已结束的事件顺序' },
    { text: { spanish: 'Ayer al mediodía', french: 'Hier à midi', italian: 'Ieri a mezzogiorno', english: 'At noon yesterday' }, zh: '昨天中午，', reason: '时间精确到昨天中午，表示一次过去动作' },
    { text: { spanish: 'Al final de la fiesta', french: 'À la fin de la fête', italian: 'Alla fine della festa', english: 'At the end of the party' }, zh: '聚会结束时，', reason: '聚会结束是一个有边界的过去时点' },
    { text: { spanish: 'Aquella noche, y nunca más', french: 'Cette nuit-là, et jamais plus', italian: 'Quella notte, e mai più', english: 'That night, and never again' }, zh: '仅在那晚，之后再没有，', reason: '“之后再没有”强调不是重复习惯' },
    { text: { spanish: 'Por fin, el mes pasado', french: 'Enfin, le mois dernier', italian: 'Finalmente, il mese scorso', english: 'Finally, last month' }, zh: '终于在上个月，', reason: '“上个月终于”强调一件已经实现的事' },
    { text: { spanish: 'El último día del viaje', french: 'Le dernier jour du voyage', italian: "L'ultimo giorno del viaggio", english: 'On the last day of the trip' }, zh: '旅程最后一天，', reason: '最后一天限定了单次完成的过去事件' },
    { text: { spanish: 'Antes de la medianoche de ayer', french: "Avant minuit hier", italian: 'Prima della mezzanotte di ieri', english: 'Before midnight yesterday' }, zh: '昨天午夜之前，', reason: '“昨天午夜之前”是明确的过去时间范围' },
    { text: { spanish: 'El día en que nos conocimos', french: 'Le jour où nous nous sommes rencontrés', italian: 'Il giorno in cui ci siamo conosciuti', english: 'On the day we met' }, zh: '我们初次见面的那天，', reason: '“初次见面的那天”是一次具体事件，而非旧日习惯' },
  ],
  imperfect: [
    { text: { spanish: 'Antes de cambiar de trabajo, todos los viernes', french: 'Avant de changer de travail, tous les vendredis', italian: 'Prima di cambiare lavoro, ogni venerdì', english: 'Before changing jobs, every Friday' }, zh: '换工作前的每个星期五，', reason: '“每个星期五”表示过去一段时期的习惯' },
    { text: { spanish: 'Mientras llovía', french: "Pendant qu'il pleuvait", italian: 'Mentre pioveva', english: 'While it was raining' }, zh: '当时下着雨，', reason: '动作处于过去进行中的背景场景' },
    { text: { spanish: 'Durante toda la infancia, casi siempre', french: "Pendant toute l'enfance, presque toujours", italian: "Per tutta l'infanzia, quasi sempre", english: 'Throughout childhood, almost always' }, zh: '童年期间几乎总是，', reason: '整个童年加“几乎总是”表示持续的旧日习惯' },
    { text: { spanish: 'Cada vez que abrían la puerta', french: "Chaque fois qu'ils ouvraient la porte", italian: 'Ogni volta che aprivano la porta', english: 'Every time they opened the door' }, zh: '过去每次开门时，', reason: '“每次”指过去反复发生的动作' },
    { text: { spanish: 'En aquellos años, por lo general', french: 'Pendant ces années-là, en général', italian: 'In quegli anni, in generale', english: 'In those years, generally' }, zh: '那些年一般来说，', reason: '这里概括过去长期的通常情况' },
    { text: { spanish: 'Mientras empezaba la película', french: 'Pendant que le film commençait', italian: 'Mentre il film cominciava', english: 'As the film was beginning' }, zh: '电影开始的时候，', reason: '主句动作是过去场景中的同时进行背景' },
    { text: { spanish: 'Antes de la mudanza, casi siempre', french: 'Avant le déménagement, presque toujours', italian: 'Prima del trasloco, quasi sempre', english: 'Before the move, almost always' }, zh: '搬家前几乎总是，', reason: '“几乎总是”显示过去习惯而不是单次事件' },
    { text: { spanish: 'Todas las tardes de aquel verano', french: 'Tous les après-midi de cet été-là', italian: "Ogni pomeriggio di quell'estate", english: 'Every afternoon that summer' }, zh: '那个夏天的每个下午，', reason: '整个夏天每个下午都发生，属于旧日重复行为' },
    { text: { spanish: 'Cuando el pueblo era pequeño, habitualmente', french: 'Quand le village était petit, habituellement', italian: 'Quando il paese era piccolo, di solito', english: 'When the town was small, usually' }, zh: '小镇还很小的时候通常，', reason: '这是给旧日时期做背景介绍，并描述常态' },
    { text: { spanish: 'Mientras los niños dormían', french: 'Pendant que les enfants dormaient', italian: 'Mentre i bambini dormivano', english: 'While the children were sleeping' }, zh: '孩子们睡着时，', reason: '“当时正在……”为动作提供过去进行中的背景' },
  ],
  future: [
    { text: { spanish: 'El próximo lunes', french: 'Lundi prochain', italian: 'Lunedì prossimo', english: 'Next Monday' }, zh: '下周一，', reason: '“下周一”是尚未到来的时间' },
    { text: { spanish: 'Dentro de una hora', french: 'Dans une heure', italian: "Tra un'ora", english: 'In one hour' }, zh: '一小时后，', reason: '动作发生在一小时后' },
    { text: { spanish: 'Cuando termine esta semana', french: 'Quand cette semaine sera terminée', italian: 'Quando finirà questa settimana', english: 'When this week ends' }, zh: '本周结束时，', reason: '本周结束还在将来' },
    { text: { spanish: 'Después de las próximas vacaciones', french: 'Après les prochaines vacances', italian: 'Dopo le prossime vacanze', english: 'After the next holiday' }, zh: '下次假期之后，', reason: '下次假期之后的动作尚未发生' },
    { text: { spanish: 'El mes próximo', french: 'Le mois prochain', italian: 'Il mese prossimo', english: 'Next month' }, zh: '下个月，', reason: '“下个月”明确锁定未来' },
    { text: { spanish: 'En los años venideros', french: 'Dans les années à venir', italian: 'Negli anni a venire', english: 'In the years to come' }, zh: '未来几年，', reason: '“未来几年”表达将来的预期' },
    { text: { spanish: 'En la próxima visita', french: 'Lors de la prochaine visite', italian: 'Alla prossima visita', english: 'On the next visit' }, zh: '下次来访时，', reason: '下一次来访尚未发生' },
    { text: { spanish: 'Tan pronto como llegue el paquete mañana', french: 'Dès que le colis arrivera demain', italian: 'Appena arriverà il pacco domani', english: 'As soon as the parcel arrives tomorrow' }, zh: '明天包裹一到，', reason: '包裹明天才到，主句随后的动作也在未来' },
    { text: { spanish: 'Aunque hoy no, mañana sí', french: "Pas aujourd'hui, mais demain", italian: 'Non oggi, ma domani', english: 'Not today, but tomorrow' }, zh: '今天不行，但明天', reason: '转折把动作明确移到明天' },
    { text: { spanish: 'Antes de que termine el año', french: "Avant la fin de l'année", italian: "Prima della fine dell'anno", english: 'Before the year ends' }, zh: '今年结束之前，', reason: '这是面向未来的期限，不是已经完成的事件' },
  ],
  conditional: [
    { text: { spanish: 'Si existiera otra oportunidad', french: "S'il existait une autre possibilité", italian: "Se ci fosse un'altra occasione", english: 'If there were another opportunity' }, zh: '如果还有一次机会，', reason: '另一机会只是设想，主句是其假设结果' },
    { text: { spanish: 'Si pudiera escoger libremente', french: 'Si le choix était libre', italian: 'Se la scelta fosse libera', english: 'If the choice were free' }, zh: '如果可以自由选择，', reason: '自由选择是条件，不保证真的发生' },
    { text: { spanish: 'De no ser por ese obstáculo', french: "Sans cet obstacle", italian: 'Senza questo ostacolo', english: 'Were it not for that obstacle' }, zh: '如果没有那个障碍，', reason: '这是排除现实障碍后的想象结果' },
    { text: { spanish: 'Si hubiera más espacio', french: "S'il y avait plus de place", italian: 'Se ci fosse più spazio', english: 'If there were more space' }, zh: '如果空间更大，', reason: '空间更大是假设条件' },
    { text: { spanish: 'Si las entradas fueran más baratas', french: 'Si les billets étaient moins chers', italian: 'Se i biglietti costassero meno', english: 'If the tickets were cheaper' }, zh: '如果票价更便宜，', reason: '主句只在票价变化的假设下成立' },
    { text: { spanish: 'En un mundo ideal', french: 'Dans un monde idéal', italian: 'In un mondo ideale', english: 'In an ideal world' }, zh: '在理想世界里，', reason: '“理想世界”提示不是现实事实' },
    { text: { spanish: 'Si terminara antes la temporada', french: 'Si la saison se terminait plus tôt', italian: 'Se la stagione finisse prima', english: 'If the season ended earlier' }, zh: '如果季节提前结束，', reason: '是否提前结束尚属假设' },
    { text: { spanish: 'Si alguien lo pidiera', french: 'Si quelqu’un le demandait', italian: 'Se qualcuno lo chiedesse', english: 'If someone asked for it' }, zh: '如果有人提出请求，', reason: '动作依赖一个尚未成立的请求' },
    { text: { spanish: 'Si no tuviera miedo', french: "S'il n'y avait pas de peur", italian: 'Se non ci fosse paura', english: 'If there were no fear' }, zh: '如果没有恐惧，', reason: '排除恐惧是假想前提' },
    { text: { spanish: 'Si la suerte acompañara', french: 'Si la chance était au rendez-vous', italian: 'Se la fortuna aiutasse', english: 'If luck were on our side' }, zh: '如果运气好的话，', reason: '好运仅是可能的条件，主句是条件结果' },
  ],
  subjunctive: [
    { text: { spanish: 'Quiero que', french: 'Je veux que', italian: 'Voglio che', english: 'I want that' }, zh: '我想要', reason: '“想要”表达对另一动作的愿望' },
    { text: { spanish: 'Me preocupa que', french: 'Je suis inquiet que', italian: 'Mi preoccupa che', english: 'I worry that' }, zh: '我担心', reason: '“担心”体现说话者的情绪态度' },
    { text: { spanish: 'Es una lástima que', french: "C'est dommage que", italian: 'È un peccato che', english: 'It is a pity that' }, zh: '令人遗憾的是', reason: '“令人遗憾”是情感评价' },
    { text: { spanish: 'No creo que', french: 'Je ne crois pas que', italian: 'Non credo che', english: 'I do not believe that' }, zh: '我不认为', reason: '否定的“认为”表示未确信从句内容' },
    { text: { spanish: 'Recomiendo que', french: 'Je recommande que', italian: 'Raccomando che', english: 'I recommend that' }, zh: '我建议', reason: '“建议”提出希望发生的行动' },
    { text: { spanish: 'Temo que', french: 'Je crains que', italian: 'Temo che', english: 'I fear that' }, zh: '我害怕', reason: '“害怕”表达担忧，并非中性事实报告' },
    { text: { spanish: 'Es mejor que', french: 'Il vaut mieux que', italian: 'È meglio che', english: 'It is better that' }, zh: '最好', reason: '“最好”是主观评价与建议' },
    { text: { spanish: 'Es improbable que', french: 'Il est peu probable que', italian: 'È improbabile che', english: 'It is unlikely that' }, zh: '不太可能', reason: '“不太可能”明确表达不确定' },
    { text: { spanish: 'Necesito que', french: "J'ai besoin que", italian: 'Ho bisogno che', english: 'I need that' }, zh: '我需要', reason: '“需要”对从句动作提出要求' },
    { text: { spanish: 'No permito que', french: 'Je ne permets pas que', italian: 'Non permetto che', english: 'I do not allow that' }, zh: '我不允许', reason: '“不允许”体现意愿或禁止' },
  ],
};

export const quizBank: Record<TenseId, Context[]> = Object.fromEntries(
  Object.entries(contexts).map(([tense, items]) => [tense, [...items, ...furtherContexts[tense as TenseId]]]),
) as Record<TenseId, Context[]>;

const verbsByMeaning = {
  go: { english: 'to go', french: 'aller', spanish: 'ir', italian: 'andare' },
  eat: { english: 'to eat', french: 'manger', spanish: 'comer', italian: 'mangiare' },
  speak: { english: 'to speak', french: 'parler', spanish: 'hablar', italian: 'parlare' },
  work: { english: 'to work', french: 'travailler', spanish: 'trabajar', italian: 'lavorare' },
  live: { english: 'to live', french: 'vivre', spanish: 'vivir', italian: 'vivere' },
  have: { english: 'to have', french: 'avoir', spanish: 'tener', italian: 'avere' },
  see: { english: 'to see', french: 'voir', spanish: 'ver', italian: 'vedere' },
  read: { english: 'to read', french: 'lire', spanish: 'leer', italian: 'leggere' },
  write: { english: 'to write', french: 'écrire', spanish: 'escribir', italian: 'scrivere' },
  drink: { english: 'to drink', french: 'boire', spanish: 'beber', italian: 'bere' },
  buy: { english: 'to buy', french: 'acheter', spanish: 'comprar', italian: 'comprare' },
  sleep: { english: 'to sleep', french: 'dormir', spanish: 'dormir', italian: 'dormire' },
} as const;

type Meaning = keyof typeof verbsByMeaning;
const meanings = Object.keys(verbsByMeaning) as Meaning[];
const subjects: Pronoun[] = ['he/she', 'you', 'we', 'they'];
const subjectText: Record<LanguageId, Record<Pronoun, string>> = {
  spanish: { I: 'yo', you: 'tú', 'he/she': 'Ana', we: 'nosotros', 'you plural': 'vosotros', they: 'ellos' },
  french: { I: 'je', you: 'tu', 'he/she': 'Paul', we: 'nous', 'you plural': 'vous', they: 'ils' },
  italian: { I: 'io', you: 'tu', 'he/she': 'Marco', we: 'noi', 'you plural': 'voi', they: 'loro' },
  english: { I: 'I', you: 'you', 'he/she': 'Alex', we: 'we', 'you plural': 'you', they: 'they' },
};
const chineseSubjects: Record<Pronoun, string> = { I: '我', you: '你', 'he/she': '她/他', we: '我们', 'you plural': '你们', they: '他们' };
const chineseNames: Record<LanguageId, string> = { spanish: '安娜', french: '保罗', italian: '马尔科', english: '亚历克斯' };
const actions: Record<Meaning, { tail: Localized; zh: string }> = {
  go: { tail: { spanish: 'al mercado', french: 'au marché', italian: 'al mercato', english: 'to the market' }, zh: '去市场' },
  eat: { tail: { spanish: 'con la familia', french: 'avec sa famille', italian: 'con la famiglia', english: 'with the family' }, zh: '和家人一起吃饭' },
  speak: { tail: { spanish: 'con sus amigos', french: 'avec ses amis', italian: 'con i suoi amici', english: 'with friends' }, zh: '和朋友交谈' },
  work: { tail: { spanish: 'en el centro', french: 'au centre-ville', italian: 'in centro', english: 'downtown' }, zh: '在市中心工作' },
  live: { tail: { spanish: 'cerca de aquí', french: "près d'ici", italian: 'vicino a qui', english: 'near here' }, zh: '住在这附近' },
  have: { tail: { spanish: 'tiempo para descansar', french: 'du temps pour se reposer', italian: 'tempo per riposarsi', english: 'time to rest' }, zh: '有时间休息' },
  see: { tail: { spanish: 'a sus vecinos', french: 'ses voisins', italian: 'i suoi vicini', english: 'their neighbors' }, zh: '看见邻居' },
  read: { tail: { spanish: 'un libro', french: 'un livre', italian: 'un libro', english: 'a book' }, zh: '读一本书' },
  write: { tail: { spanish: 'una carta', french: 'une lettre', italian: 'una lettera', english: 'a letter' }, zh: '写一封信' },
  drink: { tail: { spanish: 'agua', french: "de l'eau", italian: 'acqua', english: 'water' }, zh: '喝水' },
  buy: { tail: { spanish: 'pan', french: 'du pain', italian: 'del pane', english: 'bread' }, zh: '买面包' },
  sleep: { tail: { spanish: 'tranquilamente', french: 'paisiblement', italian: 'tranquillamente', english: 'peacefully' }, zh: '安稳地睡觉' },
};

const tenseReason: Record<TenseId, string> = {
  present: '主句说的是现在仍成立的习惯或一般情况，因此用现在时；过去时只适合已结束的事件。',
  past: '动作发生在明确的过去时间，并作为一次完成的事件叙述；未完成过去时更偏向背景或旧日习惯。',
  imperfect: '这里强调过去持续或反复的背景，没有把动作作为一次有明确边界的完成事件。',
  future: '主句动作尚未发生，描述的是将来的实际安排或预期；条件式则需要假想条件。',
  conditional: '主句是“如果……就会……”的假设结果，不是肯定会发生的未来事件。',
  subjunctive: '前面的表达体现情绪、愿望、怀疑、评价或要求，从句按该语言的语法规则用虚拟式，而非把内容当作普通事实陈述。',
};

const shuffle = <Value,>(items: Value[]): Value[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
};

const englishLanguage = languages.find((language) => language.id === 'english');
if (!englishLanguage) throw new Error('English verb data is missing');

const objectiveSubjects: Record<Pronoun, string> = { I: 'me', you: 'you', 'he/she': '', we: 'us', 'you plural': 'you', they: 'them' };

function englishQuizTranslation(languageId: LanguageId, tense: TenseId, index: number, meaning: Meaning, pronoun: Pronoun, context: string): string {
  const verb = englishLanguage?.verbs.find((entry) => entry.infinitive === verbsByMeaning[meaning].english);
  if (!verb) throw new Error(`Missing English quiz verb ${meaning}`);
  const base = verb.infinitive.replace(/^to /, '');
  const subject = pronoun === 'he/she' ? subjectText[languageId][pronoun] : subjectText.english[pronoun];
  const tail = actions[meaning].tail.english;
  if (tense === 'subjunctive') {
    const present = verb.forms.present[pronoun];
    const object = pronoun === 'he/she' ? subject : objectiveSubjects[pronoun];
    const clauses = [
      `I am glad that ${subject} ${present}`,
      `I hope that ${subject} ${present}`,
      `I doubt that ${subject} ${present}`,
      `It is important that ${subject} ${base}`,
      `It is possible that ${subject} ${present}`,
      `I prefer that ${subject} ${base}`,
      `I am surprised that ${subject} ${present}`,
      `I insist that ${subject} ${base}`,
      `I wish ${subject} would ${base}`,
      `It is necessary that ${subject} ${base}`,
      `I want ${object} to ${base}`,
      `I am worried that ${subject} ${present}`,
      `It is a pity that ${subject} ${present}`,
      `I do not believe that ${subject} ${present}`,
      `I recommend that ${subject} ${base}`,
      `I fear that ${subject} ${present}`,
      `It is better that ${subject} ${base}`,
      `It is unlikely that ${subject} ${present}`,
      `I need ${object} to ${base}`,
      `I do not allow ${object} to ${base}`,
    ];
    return `${clauses[index]} ${tail}.`;
  }
  // English conveys imperfect background through past continuous or habitual "used to".
  const continuousContexts = [3, 7, 11, 15, 19];
  const progressive = base === 'see' ? 'seeing' : base.endsWith('e') ? `${base.slice(0, -1)}ing` : `${base}ing`;
  const form = tense === 'imperfect'
    ? continuousContexts.includes(index)
      ? `${pronoun === 'he/she' || pronoun === 'I' ? 'was' : 'were'} ${progressive}`
      : `used to ${base}`
    : verb.forms[tense][pronoun];
  return `${context}, ${subject} ${form} ${tail}.`;
}

export const createQuizBank = (language: Language, tense: TenseId): QuizQuestion[] => {
  const available = getLanguageTenses(language.id).map(({ id }) => id);
  if (!available.includes(tense)) return [];
  return quizBank[tense].map((seed, index) => {
    const meaning = meanings[(index + (tense === 'subjunctive' ? 4 : 0)) % meanings.length];
    const pronoun = subjects[index % subjects.length];
    const infinitive = verbsByMeaning[meaning][language.id];
    const verb = language.verbs.find((entry) => entry.infinitive === infinitive);
    if (!verb) throw new Error(`Missing quiz verb ${infinitive}`);
    const answer = verb.forms[tense][pronoun];
    const alternatives = shuffle(available.filter((other) => other !== tense)).map((other) => verb.forms[other][pronoun]);
    const choices = shuffle([answer, ...alternatives.filter((form, position) => form !== answer && alternatives.indexOf(form) === position)].slice(0, Math.min(4, available.length)));
    const subject = subjectText[language.id][pronoun];
    const context = seed.text[language.id];
    const prefix = tense === 'subjunctive' ? `${context} ${subject}` : `${context}, ${subject}`;
    const sentencePrefix = language.id === 'french' && tense === 'subjunctive'
      ? prefix.replace(/que (il|ils)$/, "qu'$1")
      : prefix;
    const sentence = `${sentencePrefix} ____ ${actions[meaning].tail[language.id]}.`;
    const modality = tense === 'future' || tense === 'conditional' ? '会' : '';
    const chineseTranslation = `${seed.zh}${pronoun === 'he/she' ? chineseNames[language.id] : chineseSubjects[pronoun]}${modality}${actions[meaning].zh}。`;
    const chineseExplanation = `${seed.reason}。${tenseReason[tense]}本题目标时态是${getLocalizedTenseName(language, tense, 'zh')}（${language.tenseLabels[tense]}）；主语“${subject}”对应 ${verb.infinitive} 的变位是“${answer}”。其余选项是同一人称在其他时态的形式。`;
    return {
      id: `${tense}-${index}`,
      tense,
      difficulty: index < 7 ? 'beginner' : index < 14 ? 'intermediate' : 'advanced',
      sentence,
      translation: {
        zh: chineseTranslation,
        en: englishQuizTranslation(language.id, tense, index, meaning, pronoun, seed.text.english),
      },
      explanation: {
        zh: chineseExplanation,
        en: `“${context}”: ${englishContextReasons[tense][index]} ${englishTenseReasons[tense]} The target is ${getLocalizedTenseName(language, tense, 'en')} (${language.tenseLabels[tense]}). With the subject “${subject}”, the form of ${verb.infinitive} is “${answer}”. The other options use the same person in other tenses.`,
      },
      pronoun,
      verb,
      choices,
      answer,
    };
  });
};

export const createQuizQuestions = (language: Language, selectedTense: PracticeTenseId): QuizQuestion[] => {
  const tenses = getLanguageTenses(language.id).map(({ id }) => id).filter((tense) => selectedTense === 'mixed' || tense === selectedTense);
  const pool = tenses.flatMap((tense) => createQuizBank(language, tense));
  if (selectedTense !== 'mixed') return shuffle(pool).slice(0, 10);
  const selected = tenses.flatMap((tense) => shuffle(pool.filter((question) => question.tense === tense)).slice(0, 1));
  return shuffle([...selected, ...shuffle(pool.filter((question) => !selected.includes(question))).slice(0, 10 - selected.length)]);
};
