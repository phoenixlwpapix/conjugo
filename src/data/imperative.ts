import type { LanguageId, Pronoun, TenseId } from './verbs';

export type ImperativeId = 'imperative' | 'imperativeNegative';
export const isImperative = (tense: TenseId): tense is ImperativeId =>
  tense === 'imperative' || tense === 'imperativeNegative';

/** Both vamos and vayamos are affirmative nosotros commands: never offer one as a wrong answer. */
export const isCommandVariant = (languageId: LanguageId, infinitive: string, tense: TenseId, pronoun: Pronoun, form: string) =>
  languageId === 'spanish' && infinitive === 'ir' && tense === 'imperative' && pronoun === 'we' && form === 'vayamos';

type PersonForms = Record<Pronoun, string>;
type MoodVerb = { infinitive: string; translation: string; forms: Record<Exclude<TenseId, ImperativeId | 'imperfectSubjunctive'>, PersonForms> };
const emptyForms = (): PersonForms => ({ I: '', you: '', 'he/she': '', we: '', 'you plural': '', they: '' });

// Start with useful everyday commands; unsupported verbs stay out of drills.
const supported: Record<LanguageId, Set<string>> = {
  english: new Set(),
  french: new Set('être avoir aller faire dire savoir voir prendre mettre lire écrire parler regarder écouter chercher donner travailler jouer marcher demander fermer étudier préparer oublier expliquer utiliser finir choisir venir manger boire acheter dormir ouvrir partir rester suivre attendre'.split(' ')),
  spanish: new Set('ser tener ir estar hacer decir saber ver venir poner salir dar comer beber aprender leer vivir abrir escribir hablar mirar escuchar buscar comprar trabajar jugar caminar cerrar estudiar preparar olvidar explicar usar terminar elegir dormir esperar'.split(' ')),
  italian: new Set('essere avere andare fare dire sapere vedere venire prendere mettere leggere scrivere parlare guardare ascoltare trovare lavorare camminare portare studiare preparare usare finire scegliere mangiare bere comprare dormire aprire partire restare seguire aspettare stare dare'.split(' ')),
};

const frenchIrregular: Record<string, [string, string, string]> = {
  être: ['sois', 'soyons', 'soyez'], avoir: ['aie', 'ayons', 'ayez'], savoir: ['sache', 'sachons', 'sachez'],
};
const spanishTu: Record<string, string> = {
  ser: 'sé', tener: 'ten', ir: 've', hacer: 'haz', decir: 'di', venir: 'ven', poner: 'pon', salir: 'sal',
};
// Use the full accepted variants (vai/fai/dai/stai), avoiding duplicate correct choices.
const italianTu: Record<string, string> = {
  essere: 'sii', avere: 'abbi', sapere: 'sappi', dire: "di'",
  andare: 'vai', fare: 'fai', dare: 'dai', stare: 'stai',
};

/** Empty cells mean unavailable, never a form to show or quiz. No attached object pronouns in v1. */
export function withImperative(verbs: MoodVerb[], languageId: LanguageId) {
  return verbs.map((verb) => {
    const affirmative = emptyForms();
    const negative = emptyForms();
    if (supported[languageId].has(verb.infinitive)) {
      const present = verb.forms.present;
      const subjunctive = verb.forms.subjunctive;
      if (languageId === 'french') {
        const regularTu = present.you.endsWith('es') || verb.infinitive === 'aller' ? present.you.slice(0, -1) : present.you;
        [affirmative.you, affirmative.we, affirmative['you plural']] = frenchIrregular[verb.infinitive] ?? [regularTu, present.we, present['you plural']];
        for (const pronoun of ['you', 'we', 'you plural'] as const) {
          const form = affirmative[pronoun];
          negative[pronoun] = `${/^[aeiouéh]/i.test(form) ? "n'" : 'ne '}${form} pas`;
        }
      } else if (languageId === 'spanish') {
        Object.assign(affirmative, {
          you: spanishTu[verb.infinitive] ?? present['he/she'],
          'he/she': subjunctive['he/she'], we: verb.infinitive === 'ir' ? 'vamos' : subjunctive.we,
          'you plural': `${verb.infinitive.slice(0, -1)}d`, they: subjunctive.they,
        });
        for (const pronoun of ['you', 'he/she', 'we', 'you plural', 'they'] as const) negative[pronoun] = `no ${subjunctive[pronoun]}`;
      } else if (languageId === 'italian') {
        Object.assign(affirmative, {
          you: italianTu[verb.infinitive] ?? (verb.infinitive.endsWith('are') ? present['he/she'] : present.you),
          'he/she': subjunctive['he/she'], we: present.we,
          'you plural': ['essere', 'avere', 'sapere'].includes(verb.infinitive) ? subjunctive['you plural'] : present['you plural'],
        });
        for (const pronoun of ['you', 'he/she', 'we', 'you plural'] as const) negative[pronoun] = `non ${pronoun === 'you' ? verb.infinitive : affirmative[pronoun]}`;
      }
    }
    return { ...verb, forms: { ...verb.forms, imperative: affirmative, imperativeNegative: negative } };
  });
}
