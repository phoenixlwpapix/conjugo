import { languages, type LanguageId, type PracticeTenseId } from '../data/verbs';
import type { AppView, PracticeStats, StoredMiss } from '../types';
import { emptyStats } from './scoring';

const storageKeys = {
  languageId: 'conjugo.languageId',
  practiceTense: 'conjugo.practiceTense',
  activeView: 'conjugo.activeView',
  misses: 'conjugo.misses',
  stats: 'conjugo.stats',
} as const;

const canUseStorage = () => typeof window !== 'undefined' && 'localStorage' in window;

const readJson = <Value>(key: string, fallback: Value): Value => {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    return rawValue ? (JSON.parse(rawValue) as Value) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = <Value>(key: string, value: Value) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const readString = <Value extends string>(key: string, fallback: Value, allowedValues: readonly Value[]) => {
  if (!canUseStorage()) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);

  return allowedValues.includes(rawValue as Value) ? (rawValue as Value) : fallback;
};

export const readLanguageId = () => readString<LanguageId>(storageKeys.languageId, 'spanish', languages.map((language) => language.id));

export const writeLanguageId = (languageId: LanguageId) => {
  if (canUseStorage()) {
    window.localStorage.setItem(storageKeys.languageId, languageId);
  }
};

export const readPracticeTense = () =>
  readString<PracticeTenseId>(storageKeys.practiceTense, 'present', ['present', 'past', 'future', 'mixed']);

export const writePracticeTense = (practiceTense: PracticeTenseId) => {
  if (canUseStorage()) {
    window.localStorage.setItem(storageKeys.practiceTense, practiceTense);
  }
};

export const readActiveView = () => readString<AppView>(storageKeys.activeView, 'practice', ['practice', 'wordbook']);

export const writeActiveView = (activeView: AppView) => {
  if (canUseStorage()) {
    window.localStorage.setItem(storageKeys.activeView, activeView);
  }
};

export const readStoredMisses = () => readJson<StoredMiss[]>(storageKeys.misses, []);

export const writeStoredMisses = (misses: StoredMiss[]) => writeJson(storageKeys.misses, misses.slice(0, 24));

export const readPracticeStats = () => readJson<PracticeStats>(storageKeys.stats, emptyStats());

export const writePracticeStats = (stats: PracticeStats) => writeJson(storageKeys.stats, stats);
