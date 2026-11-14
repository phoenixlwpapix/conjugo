import type { LanguageId } from '../verbs';
import { englishNonFiniteForms } from './english';
import { frenchNonFiniteForms } from './french';
import { italianNonFiniteForms } from './italian';
import { spanishNonFiniteForms } from './spanish';
import type { NonFiniteVerbForms } from './types';

export const nonFiniteFormsByLanguage: Record<LanguageId, Record<string, NonFiniteVerbForms>> = {
  english: englishNonFiniteForms,
  french: frenchNonFiniteForms,
  spanish: spanishNonFiniteForms,
  italian: italianNonFiniteForms,
};
