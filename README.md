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
- Mixed tense mode that rotates through every tense the active language supports.
- Language-specific pronoun prompts instead of English-only pronouns.
- Answer choices are generated from the current verb's conjugation family, prioritizing the same tense and other pronouns.
- Answer card positions are shuffled per prompt so the correct conjugation does not stay tied to a predictable slot.
- Session metrics for target progress, attempts, accuracy, and current streak.
- Live session stopwatch in the practice progress card, paused outside the active drill and reset with each new set.
- Missed prompts are retained for the Stats workspace and automatically fed back into future practice sessions.
- Local persistence for selected language, active workspace, tense, missed prompts, and language-specific cumulative practice stats.
- Keyboard shortcuts for faster drills: A/B/C/D answer choices, Enter/Space for next missed question, and R reset.
- Dedicated Stats workspace with cumulative answer counts, completed sets, best streak, review load, weak spots, and a dependency-free seven-day accuracy bar chart.
- Responsive layout: desktop sidebar navigation with a focused trainer area, adaptive tablet-width drill cards, compact mobile header, and single-column mobile flow.
- Light and dark visual themes selectable from the navigation area.

## Current Features

- Four languages: English, French, Spanish, Italian.
- Quiz mode below Practice offers 10 randomly selected full-sentence questions per round, with a choice of any available tense or a mixed set. Each tense has 20 individually authored everyday situations in all four languages (420 supported language/tense questions), with varied subjects and verbs across three difficulty levels. Complete sentences, translations, and explanations are kept together in `src/data/quizScenes.ts`; contexts are never randomly combined with unrelated actions. Scenes include commuting, family meals, travel, interrupted past actions, and realistic hypothetical decisions. Every question has four distinct choices, prioritizing the same subject across tenses and filling remaining slots from the same verb’s conjugation family. Each question shows a Chinese or English translation matching the interface language, and explains the specific scene after answering. Redundant English translations are hidden when learning English in the English interface.
- A live panel beside the Quiz shows this round's progress, correct answers, accuracy, streak, and question-by-question results.
- Quiz supports A–D / 1–4 to answer and Enter / Space to continue. Spanish vosotros preference changes reset the quiz pool; interface-language changes preserve the current round.
- Incorrect or skipped Quiz answers enter the shared Leitner review queue; correct answers use the same review promotion rules as practice.
- Practice progress follows question order and keeps the current question number stable during feedback. Completed sets always offer New set, including after a correct final answer.
- Restarting review or hardest-verb drills preserves the current mode and verb scope. If every review item is mastered, New set repeats the previous review prompts.
- Answered practice prompts provide a shortcut to the matching verb and tense in the Verb Book.
- Quiz answers count toward the existing seven-day accuracy chart and tense breakdown, with separate quiz totals and accuracy on the Stats dashboard.
- Present, past, imperfect, future, conditional, and present subjunctive, plus a mixed mode. English drills present, past, and future only.
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
- The Stats workspace uses a tighter dashboard layout with consistent KPI typography, today’s performance, review load, and a responsive HTML/CSS accuracy bar chart (no charting library).
- The Stats workspace is lazy-loaded so it does not inflate the initial practice bundle.
- The prompt card no longer repeats the same build information in a side rail, giving the question more room.
- Desktop navigation now uses a sticky left sidebar for brand, language, and workspace switching.
- Mobile navigation now collapses language and workspace tabs behind a hamburger menu so the current drill stays visible first.
- Theme switching now supports Light and Dark tones from the sidebar and mobile menu, with the choice persisted locally.
- Mid-width practice layouts now move the progress rail below the drill and stack the prompt as pronoun, plus, and verb before words can wrap awkwardly.
- Mobile practice controls use a compact horizontal tense selector, with the pronoun prompt prioritized above metadata tags.
- Modern responsive interface using React 19, TypeScript, Vite, and lucide-react icons.
- The layered logo combines a blue C with speech-bubble negative space and navy, gold, and orange cards behind it. Transparent assets are sized for the header, browser favicon, Apple touch icon, and PWA icons.
- The per-question countdown timer is off by default and can be toggled from the trainer card.
- Gender-agreeing past forms (French être / Italian essere verbs) are prompted with the masculine pronoun so the expected participle is always correct.
- Saved misses are capped per language, and clearing every miss no longer revives legacy stored misses.
- Missed prompts use three Leitner boxes: a miss must be answered correctly on three separate days (today, then after 1 day, then after 3 days) before it is retired, and any wrong answer sends it back to box 1.
- Answers are tallied per tense and per verb; the Stats Weak spots card shows accuracy by tense, flags the weakest tense, and lists the five hardest verbs with one-click tense and verb drills.
- A single Chinese / English interface-language preference controls navigation, instructions, labels, grammar explanations, verb glosses, and sentence translations. Spanish learners can also hide vosotros from prompts, answer choices, reviews, and the Verb Book.
- Present subjunctive for French, Spanish, and Italian, derived from each verb's indicative forms with explicit tables for truly irregular stems; prompts read "que tu…", "qu'il…", "che io…".
- Installable, offline-capable PWA (vite-plugin-pwa) with precached assets and cached Google Fonts; the header logo uses WebP, and the maskable app icon keeps the mark inside the safe area.

## UI design

- Stageshow-inspired visual hierarchy: the conjugation prompt is the focal surface, with a quiet navigation rail and lighter session metrics. The existing Vite/React components remain fully interactive; no simulated cursor or decorative app frame is added.
- Neutral canvas, restrained borders and shadows, consistent rounded surfaces, language accents, and serif study text carry across Practice, Quiz, Stats, and the Verb Book.
- Quiz tense selection uses compact two-column options with lighter typography, subtle selection fills and checked indicators. Mixed practice spans the full row, and the start action sits in a separate footer.
- All workspaces share panel radii, responsive padding, spacing, body/caption typography, and primary/secondary action styling based on the Practice screen. Quiz answers use the same A–D key badges and sans-serif answer typography as practice choices; sentence prompts retain display serif text.
- Stats uses neutral metric surfaces, quieter chart summaries, lighter supporting text, consistent review buttons and a scrollable missed-answer table. The Word Book uses navigation-style verb selection, the same inset active tense control as Practice, and compact ruled conjugation rows that retain two columns on phones.
- Practice completion dialogs and quiz results follow the same panel, metric and action styling. Empty/search states, answer feedback, Chinese/English interfaces, and both themes use the shared styling.
- A 20-segment trail above each practice prompt shows completed correct/incorrect answers and the current question. The progress ring, timer, and cumulative metrics remain available.
- At narrow widths, short prompts keep the pronoun and infinitive on one line; longer prompts wrap only when space runs out, keeping the separator with the pronoun. Answer choices become full-width rows, and session progress becomes a compact summary. Navigation stays in the mobile menu. Both color themes and reduced-motion preferences are supported.

## Bilingual interface

- The sidebar and mobile menu expose one **Interface language** switch: 中文 / English. Translations follow this choice automatically; there is no separate translation-language setting.
- Existing `conjugo.translationLanguage` preferences are reused unchanged. Without a valid saved preference, Chinese browser locales default to Chinese and other locales default to English.
- Switching the interface language updates every workspace, completion dialog, tooltip, accessible label, and chart weekday without restarting the current practice or quiz round. Question order, answer choices, selected answers, progress, and recorded scores remain intact.
- The learning language is independent. Verbs, pronouns, conjugations, question sentences, and answer choices remain in English, French, Spanish, or Italian, with language attributes for assistive technology.
- Tense labels are centralized and distinguish French compound past, Spanish preterite, and Italian compound past. Quiz setup cards and the Verb Book show native tense names as secondary labels when different from the interface label. Mixed quizzes reveal the target tense in the explanation only after answering.
- All supported quiz banks include Chinese and English sentence translations and context-specific grammar explanations. English translations use the corresponding action and tense, including hypothetical conditionals and natural subjunctive meanings.
- Quiz cards, navigation, selection states, and headings follow the existing UI typography and theme colors; only the study sentence uses display serif typography. Tense controls wrap within their containers at narrow widths.
- Interface messages live in `src/lib/i18n.ts`; components consume the locale through `src/hooks/useI18n.ts`. Quiz sentences and bilingual explanations live together in `src/data/quizScenes.ts`. New UI copy must have a Chinese message and preserve interpolation parameters.

## Scripts

```bash
pnpm install
pnpm build
pnpm preview
```

`pnpm dev` is intentionally not run by the agent workflow.
