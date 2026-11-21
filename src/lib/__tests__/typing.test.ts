import { describe, expect, it } from 'vitest';
import { languages, type LanguageId, type TenseId } from '../../data/verbs';
import type { Pronoun } from '../../types';
import { gradeTypedAnswer } from '../typing';

function makePrompt(languageId: LanguageId, infinitive: string, tense: TenseId, pronoun: Pronoun, selectedPronounLabel?: string) {
  const language = languages.find((item) => item.id === languageId)!;
  const verb = language.verbs.find((item) => item.infinitive === infinitive)!;
  return { language, verb, tense, pronoun, selectedPronounLabel };
}

describe('typed answers', () => {
  it('accepts case, surrounding spaces and decomposed Unicode', () => {
    const prompt = makePrompt('spanish', 'hablar', 'past', 'he/she');
    expect(gradeTypedAnswer('  HABLO\u0301  ', prompt)).toBe('correct');
    expect(gradeTypedAnswer('hablo', prompt)).toBe('wrong');
  });

  it('distinguishes accent-only differences from misspellings', () => {
    const prompt = makePrompt('french', 'être', 'present', 'you plural');
    expect(gradeTypedAnswer('etes', prompt)).toBe('accent');
    expect(gradeTypedAnswer('etess', prompt)).toBe('wrong');
  });

  it('accepts the matching Spanish -se variant and preserves ñ as a distinct letter', () => {
    const prompt = makePrompt('spanish', 'enseñar', 'imperfectSubjunctive', 'we');
    expect(gradeTypedAnswer('enseñásemos', prompt)).toBe('correct');
    expect(gradeTypedAnswer('enseñasemos', prompt)).toBe('accent');
    expect(gradeTypedAnswer('enseñase', prompt)).toBe('wrong');
    expect(gradeTypedAnswer('ensenásemos', prompt)).toBe('wrong');
  });

  it('accepts spacing differences in multiword conjugations', () => {
    const prompt = makePrompt('french', 'parler', 'past', 'I');
    expect(gradeTypedAnswer(' ai    parlé ', prompt)).toBe('correct');
  });

  it('enforces gender agreement for French être elle/elles and accepts unmarked gender variants', () => {
    const elleAller = makePrompt('french', 'aller', 'past', 'he/she', 'elle');
    expect(gradeTypedAnswer('est allée', elleAller)).toBe('correct');
    expect(gradeTypedAnswer('est allee', elleAller)).toBe('accent');
    expect(gradeTypedAnswer('est allé', elleAller)).toBe('wrong');

    const ilAller = makePrompt('french', 'aller', 'past', 'he/she', 'il');
    expect(gradeTypedAnswer('est allé', ilAller)).toBe('correct');
    expect(gradeTypedAnswer('est allée', ilAller)).toBe('wrong');

    const ellesPartir = makePrompt('french', 'partir', 'past', 'they', 'elles');
    expect(gradeTypedAnswer('sont parties', ellesPartir)).toBe('correct');
    expect(gradeTypedAnswer('sont partis', ellesPartir)).toBe('wrong');

    const jeAller = makePrompt('french', 'aller', 'past', 'I', 'je');
    expect(gradeTypedAnswer('suis allé', jeAller)).toBe('correct');
    expect(gradeTypedAnswer('suis allée', jeAller)).toBe('correct');
    expect(gradeTypedAnswer('suis allee', jeAller)).toBe('accent');
    expect(gradeTypedAnswer('suis allés', jeAller)).toBe('wrong');

    const nousRester = makePrompt('french', 'rester', 'past', 'we', 'nous');
    expect(gradeTypedAnswer('sommes restés', nousRester)).toBe('correct');
    expect(gradeTypedAnswer('sommes restées', nousRester)).toBe('correct');
    expect(gradeTypedAnswer('sommes resté', nousRester)).toBe('wrong');

    const vousMourir = makePrompt('french', 'mourir', 'past', 'you plural', 'vous');
    expect(gradeTypedAnswer('êtes morts', vousMourir)).toBe('correct');
    expect(gradeTypedAnswer('êtes mortes', vousMourir)).toBe('correct');
    expect(gradeTypedAnswer('êtes mort', vousMourir)).toBe('correct');
    expect(gradeTypedAnswer('êtes morte', vousMourir)).toBe('correct');
    expect(gradeTypedAnswer('etes morte', vousMourir)).toBe('accent');
  });
});
