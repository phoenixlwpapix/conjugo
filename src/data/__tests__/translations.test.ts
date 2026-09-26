import { describe, expect, it } from 'vitest';
import { englishGlosses, getVerbTranslation } from '../translations';
import { languages } from '../verbs';

describe('translations', () => {
  it('has an English gloss for every non-English verb and no stray entries', () => {
    for (const language of languages) {
      if (language.id === 'english') continue;
      const glosses = englishGlosses[language.id];
      const infinitives = language.verbs.map((verb) => verb.infinitive);

      expect(infinitives.filter((infinitive) => !glosses[infinitive])).toEqual([]);
      expect(Object.keys(glosses).filter((infinitive) => !infinitives.includes(infinitive))).toEqual([]);
    }
  });

  it('shows no English gloss for English verbs', () => {
    const english = languages.find((language) => language.id === 'english')!;
    expect(getVerbTranslation(english, english.verbs[0], 'en')).toBe('');
    expect(getVerbTranslation(english, english.verbs[0], 'zh')).toBe(english.verbs[0].translation);
  });
});
