# ConjuGO

ConjuGO is a Vite + React verb conjugation drill app for English, French, Spanish, and Italian learners. The name comes from Conjugation + Go.

## Product Plan

- Single-page training app with no hero or product-intro section.
- Desktop sidebar controls for brand, language, and workspace navigation, with tense controls kept near the practice flow.
- Mobile-first header with a hamburger menu for language and workspace switching.
- Top-right Word Book workspace for browsing every verb in the current language.
- Compact Word Book layout with an independently scrolling verb list and sticky conjugation reference.
- Word Book verbs can be browsed in their curated current order or alphabetically, without display numbering.
- Interactive conjugation reference: search verbs, choose a verb, switch tense, and inspect every pronoun form.
- Card-based multiple-choice drills with instant feedback and one-tap next-question flow.
- Correct answers auto-advance after a short pause; wrong answers keep the correction visible.
- Perfect 20/20 sessions trigger a confetti completion moment.
- Completed 20-question sets with misses show a summary modal with new-set and return-home actions.
- Mixed tense mode that rotates through present, past, and future prompts.
- Language-specific pronoun prompts instead of English-only pronouns.
- Answer choices are generated from the current verb's conjugation family, prioritizing the same tense and other pronouns.
- Answer card positions are shuffled per prompt so the correct conjugation does not stay tied to a predictable slot.
- Session metrics for target progress, attempts, accuracy, and current streak.
- Live session stopwatch in the practice progress card, paused outside the active drill and reset with each new set.
- Missed prompts are retained for the Stats workspace and automatically fed back into future practice sessions.
- Local persistence for selected language, active workspace, tense, missed prompts, and language-specific cumulative practice stats.
- Keyboard shortcuts for faster drills: A/B/C/D answer choices, Enter/Space for next missed question, and R reset.
- Dedicated Stats workspace with cumulative answer counts, completed sets, best streak, review load, and a Recharts-powered seven-day accuracy bar chart.
- Responsive layout: desktop sidebar navigation with a focused trainer area, adaptive tablet-width drill cards, compact mobile header, and single-column mobile flow.
- Light and dark visual themes selectable from the navigation area.

## Current Features

- Four languages: English, French, Spanish, Italian.
- Three focused tenses plus a mixed tense mode: present, past, future, mixed.
- 100 verbs per language, combining high-frequency irregular verbs with regular conjugation families.
- Each practice session randomly samples 20 prompts from the current language and tense range.
- New sessions reserve roughly 30% of prompts for recent missed items when matching review prompts are available.
- Verb and conjugation datasets live in `src/data/verbs.ts` instead of the main app component.
- Practice state is managed through focused hooks and prompt/scoring/storage helpers instead of one monolithic component.
- Verb data preserves proper French, Spanish, and Italian diacritics.
- Localized pronoun labels for English, French, Spanish, and Italian.
- Interactive verb book with per-tense conjugation tables.
- Review items can be opened directly in the Word Book with the matching tense selected.
- Searchable compact verb list built for larger future vocabularies.
- Card-style multiple-choice answer selection.
- Multiple-choice answer cards now use randomized positions per prompt while keeping distractors relevant to the current verb family.
- Auto-advance on correct answers and confetti for a perfect set.
- Non-perfect completed sets now open a completion summary modal instead of ending silently.
- Completion stats persist in localStorage across browser sessions and are tracked separately for each language.
- The practice side panel stays focused on current-session and all-time metrics, with its height aligned to the trainer card on desktop.
- The All-time Progress card now shows only the active language and includes a language tag for quick confirmation.
- The Stats workspace uses a tighter dashboard layout with consistent KPI typography, today’s performance, review load, and a responsive Recharts accuracy bar chart.
- The Stats workspace is lazy-loaded so chart dependencies do not inflate the initial practice bundle.
- The prompt card no longer repeats the same build information in a side rail, giving the question more room.
- Desktop navigation now uses a sticky left sidebar for brand, language, and workspace switching.
- Mobile navigation now collapses language and workspace tabs behind a hamburger menu so the current drill stays visible first.
- Theme switching now supports Light and Dark tones from the sidebar and mobile menu, with the choice persisted locally.
- Mid-width practice layouts now move the progress rail below the drill and stack the prompt as pronoun, plus, and verb before words can wrap awkwardly.
- Mobile practice controls use a compact horizontal tense selector, with the pronoun prompt prioritized above metadata tags.
- Modern responsive interface using React 19, TypeScript, Vite, and lucide-react icons.
- Generated modern app logo applied to the app header and browser favicon.

## Scripts

```bash
pnpm install
pnpm build
pnpm preview
```

`pnpm dev` is intentionally not run by the agent workflow.
