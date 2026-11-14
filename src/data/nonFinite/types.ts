export const nonFiniteForms = ['pastParticiple', 'presentParticiple', 'gerund'] as const;
export type NonFiniteForm = (typeof nonFiniteForms)[number];

export type NonFiniteVerbForms = {
  pastParticiple: string;
  presentParticiple?: string;
  gerund?: string;
  accepted?: Partial<Record<NonFiniteForm, readonly string[]>>;
};

export type NonFiniteScene = {
  form: NonFiniteForm;
  verb: string;
  sentence: string;
  translation: Record<'zh' | 'en', string>;
  reason: Record<'zh' | 'en', string>;
  distractors?: readonly string[];
  usesVosotros?: boolean;
};

export const isNonFiniteForm = (form: string): form is NonFiniteForm =>
  nonFiniteForms.some((candidate) => candidate === form);
