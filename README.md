# ConjuGO

ConjuGO is a Vite + React verb conjugation drill app for English, French, Spanish, and Italian learners. The name comes from Conjugation + Go.

## Product Plan

- Single-page training app with no hero or product-intro section.
- Compact top controls for language, workspace, and tense selection.
- Top-right Word Book workspace for browsing every verb in the current language.
- Compact Word Book layout with an independently scrolling verb list and sticky conjugation reference.
- Interactive conjugation reference: search verbs, choose a verb, switch tense, and inspect every pronoun form.
- Card-based multiple-choice drills with instant feedback and one-tap next-question flow.
- Correct answers auto-advance after a short pause; wrong answers keep the correction visible.
- Perfect 20/20 sessions trigger a confetti completion moment.
- Mixed tense mode that rotates through present, past, and future prompts.
- Language-specific pronoun prompts instead of English-only pronouns.
- Answer choices are generated from the current verb's conjugation family, prioritizing the same tense and other pronouns.
- Session metrics for target progress, attempts, accuracy, and current streak.
- Review queue that surfaces recent missed prompts with the correct answer.
- Responsive layout: focused desktop trainer with side progress panel, single-column mobile flow.

## Current Features

- Four languages: English, French, Spanish, Italian.
- Three focused tenses plus a mixed tense mode: present, past, future, mixed.
- 50 verbs per language, combining high-frequency irregular verbs with regular conjugation families.
- Each practice session randomly samples 20 prompts from the current language and tense range.
- Verb and conjugation datasets live in `src/data/verbs.ts` instead of the main app component.
- Verb data preserves proper French, Spanish, and Italian diacritics.
- Localized pronoun labels for English, French, Spanish, and Italian.
- Interactive verb book with per-tense conjugation tables.
- Searchable compact verb list built for larger future vocabularies.
- Card-style multiple-choice answer selection.
- Auto-advance on correct answers and confetti for a perfect set.
- Modern responsive interface using React 19, TypeScript, Vite, and lucide-react icons.
- Generated modern app logo applied to the app header and browser favicon.

## Scripts

```bash
pnpm install
pnpm build
pnpm preview
```

`pnpm dev` is intentionally not run by the agent workflow.
