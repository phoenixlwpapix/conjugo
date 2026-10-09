import { describe, expect, it } from 'vitest';
import { chineseMessages, formatStudyDate, getLocalizedTenseName, translate, type MessageKey } from '../i18n';

describe('interface localization', () => {
  it('preserves every interpolation parameter in both languages', () => {
    for (const key of Object.keys(chineseMessages) as MessageKey[]) {
      const parameters = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
      expect(parameters(chineseMessages[key]), key).toEqual(parameters(key));
      expect(translate('zh', key).length).toBeGreaterThan(0);
      expect(translate('en', key)).toBe(key);
    }
    expect(translate('zh', 'Question {number} / {count}', { number: 3, count: 10 })).toBe('第 3 / 10 题');
    expect(translate('en', 'Question {number} / {count}', { number: 3, count: 10 })).toBe('Question 3 / 10');
  });

  it('uses language-specific past names rather than conflating different tenses', () => {
    expect(getLocalizedTenseName({ id: 'french' }, 'past', 'zh')).toBe('复合过去时');
    expect(getLocalizedTenseName({ id: 'spanish' }, 'past', 'en')).toBe('Preterite');
    expect(getLocalizedTenseName({ id: 'italian' }, 'past', 'zh')).toBe('近过去时');
    expect(getLocalizedTenseName({ id: 'english' }, 'past', 'en')).toBe('Past');
  });

  it('formats weekdays from the stored calendar day in the selected locale', () => {
    expect(formatStudyDate('2026-10-09', 'en')).toBe('Fri');
    expect(formatStudyDate('2026-10-09', 'zh')).toBe('周五');
  });
});
