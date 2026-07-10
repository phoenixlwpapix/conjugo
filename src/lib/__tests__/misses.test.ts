import { describe, it, expect } from 'vitest';
import { languages } from '../../data/verbs';
import {
  upsertMiss,
  clearMasteredMiss,
} from '../misses';
import type { Prompt, StoredMiss } from '../../types';

describe('misses', () => {
  const spanish = languages.find((l) => l.id === 'spanish')!;
  const verb = spanish.verbs[0];
  
  const mockPrompt: Prompt = {
    language: spanish,
    verb,
    tense: 'present',
    pronoun: 'I',
  };

  describe('upsertMiss', () => {
    it('should add a new miss to the top of the array', () => {
      const current: StoredMiss[] = [];
      const updated = upsertMiss(current, mockPrompt);
      
      expect(updated).toHaveLength(1);
      expect(updated[0].verbInfinitive).toBe(verb.infinitive);
      expect(updated[0].tense).toBe('present');
      expect(updated[0].pronoun).toBe('I');
      expect(updated[0].answer).toBe(verb.forms.present.I);
    });

    it('should move an existing miss to the top and update missedAt', () => {
      const initialMiss: StoredMiss = {
        languageId: 'spanish',
        verbInfinitive: verb.infinitive,
        tense: 'present',
        pronoun: 'I',
        answer: 'foo',
        missedAt: 1000,
      };

      const current = [initialMiss];
      const updated = upsertMiss(current, mockPrompt);
      
      expect(updated).toHaveLength(1);
      expect(updated[0].missedAt).toBeGreaterThan(1000);
    });

    it('should respect the limit', () => {
      const current: StoredMiss[] = Array.from({ length: 24 }, (_, i) => ({
        languageId: 'spanish',
        verbInfinitive: `verb-${i}`,
        tense: 'present',
        pronoun: 'I',
        answer: 'foo',
        missedAt: Date.now(),
      }));

      const updated = upsertMiss(current, mockPrompt, 24);
      expect(updated).toHaveLength(24);
      expect(updated[0].verbInfinitive).toBe(verb.infinitive);
    });
  });

  describe('clearMasteredMiss', () => {
    it('should remove matched miss from the array', () => {
      const miss: StoredMiss = {
        languageId: 'spanish',
        verbInfinitive: verb.infinitive,
        tense: 'present',
        pronoun: 'I',
        answer: verb.forms.present.I,
        missedAt: Date.now(),
      };

      const current = [miss];
      const updated = clearMasteredMiss(current, mockPrompt);
      
      expect(updated).toHaveLength(0);
    });

    it('should not remove unmatched misses', () => {
      const otherMiss: StoredMiss = {
        languageId: 'spanish',
        verbInfinitive: verb.infinitive,
        tense: 'present',
        pronoun: 'you',
        answer: 'foo',
        missedAt: Date.now(),
      };

      const current = [otherMiss];
      const updated = clearMasteredMiss(current, mockPrompt);
      
      expect(updated).toHaveLength(1);
    });
  });
});
