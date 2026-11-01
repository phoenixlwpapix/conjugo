import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { languages } from '../../data/verbs';
import { ConjugationPanel } from '../WordBook/ConjugationPanel';

describe('imperfect subjunctive reference', () => {
  it('shows both variants for visible pronouns, and respects the vosotros preference', () => {
    const spanish = languages.find((language) => language.id === 'spanish')!;
    const verb = spanish.verbs.find((entry) => entry.infinitive === 'venir')!;
    for (const includeVosotros of [true, false]) {
      const html = renderToStaticMarkup(<ConjugationPanel
        activeLanguage={includeVosotros ? spanish : { ...spanish, excludedPronouns: ['you plural'] }}
        bookTense="imperfectSubjunctive"
        selectedVerb={verb}
        onTenseChange={() => {}}
        translationLanguage="en"
      />);
      expect(html).toContain('<th scope="col">-ra</th><th scope="col">-se</th>');
      expect(html).toContain('<th scope="row">que yo</th><td>viniera</td><td>viniese</td>');
      expect(html).not.toContain('Practice: -ra');
      expect(html).toContain('viniera');
      expect(html).toContain('viniese');
      expect(html).toContain('viniéramos');
      expect(html).toContain('viniésemos');
      expect(html.includes('vinierais')).toBe(includeVosotros);
      expect(html.includes('vinieseis')).toBe(includeVosotros);
    }
  });
});

describe('command comparison', () => {
  it.each(['imperative', 'imperativeNegative'] as const)('opens one comparison from either polarity (%s)', (bookTense) => {
    const spanish = languages.find((language) => language.id === 'spanish')!;
    const verb = spanish.verbs.find((entry) => entry.infinitive === 'tener')!;
    const html = renderToStaticMarkup(<ConjugationPanel activeLanguage={spanish} bookTense={bookTense} selectedVerb={verb} onTenseChange={() => {}} translationLanguage="en" />);
    expect(html).toContain('class="conjugation-comparison"');
    expect(html).toContain('<th scope="col">Affirmative</th><th scope="col">Negative</th>');
    expect(html).toContain('<th scope="row">tú</th><td>ten</td><td>no tengas</td>');
    expect(html).toContain('<th scope="row">usted</th><td>tenga</td><td>no tenga</td>');
    expect(html).toMatch(/aria-pressed="true"[^>]*><span>Imperative<\/span>/);
    expect(html).not.toContain('Affirmative imperative');
    expect(html).not.toContain('Negative imperative');
  });

  it('compares both columns only for allowed pronouns', () => {
    for (const id of ['french', 'spanish', 'italian'] as const) {
      const language = { ...languages.find((entry) => entry.id === id)!, excludedPronouns: id === 'spanish' ? ['you plural' as const] : [] };
      const verb = language.verbs[0];
      const html = renderToStaticMarkup(<ConjugationPanel activeLanguage={language} bookTense="imperative" selectedVerb={verb} onTenseChange={() => {}} translationLanguage="en" />);
      expect(html).toContain('class="conjugation-comparison"');
      expect(html).not.toContain('<th scope="row">yo</th>');
      expect(html).not.toContain('<th scope="row">vosotros/as</th>');
      expect(html).toContain(`<td>${verb.forms.imperative.you}</td><td>${verb.forms.imperativeNegative.you}</td>`);
    }
  });

  it('shows the unavailable-verb message without empty comparison cells', () => {
    const french = languages.find((language) => language.id === 'french')!;
    const verb = french.verbs.find((entry) => entry.infinitive === 'pouvoir')!;
    const html = renderToStaticMarkup(<ConjugationPanel activeLanguage={french} bookTense="imperative" selectedVerb={verb} onTenseChange={() => {}} translationLanguage="en" />);
    expect(html).toContain('Command forms for this verb are not included yet.');
    expect(html).not.toContain('class="conjugation-comparison"');
  });
});
