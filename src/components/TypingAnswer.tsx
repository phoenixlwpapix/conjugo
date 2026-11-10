import { useState, type RefObject } from 'react';
import type { LanguageId } from '../data/verbs';
import { useI18n } from '../hooks/useI18n';
import { getStudyLanguageTag } from '../lib/i18n';

const accentCharacters: Record<LanguageId, string> = {
  english: '',
  french: 'éèêçâîû',
  spanish: 'áéíóúüñ',
  italian: 'àèéìíòóùú',
};

type TypingAnswerProps = {
  languageId: LanguageId;
  inputRef: RefObject<HTMLInputElement | null>;
  showAccentHint: boolean;
  onSubmit: (answer: string) => void;
};

export function TypingAnswer({ languageId, inputRef, showAccentHint, onSubmit }: TypingAnswerProps) {
  const { t } = useI18n();
  const [draft, setDraft] = useState('');
  const lang = getStudyLanguageTag(languageId);
  const characters = accentCharacters[languageId];

  const insert = (character: string) => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.setRangeText(character, input.selectionStart ?? draft.length, input.selectionEnd ?? draft.length, 'end');
    setDraft(input.value);
  };

  return (
    <form className="typing-form" onSubmit={(event) => { event.preventDefault(); onSubmit(draft); }}>
      <div className="typing-entry">
        <input
          ref={inputRef}
          aria-label={t('Your answer')}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          lang={lang}
          placeholder={t('Your answer')}
          spellCheck={false}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.repeat)) event.preventDefault();
          }}
        />
        <button className="quiz-primary" type="submit" disabled={!draft.trim()}>{t('Check answer')}</button>
      </div>
      {characters && (
        <div className="accent-characters" role="group" aria-label={t('Accent characters')}>
          {Array.from(characters, (character) => (
            <button key={character} type="button" lang={lang} onMouseDown={(event) => event.preventDefault()} onClick={() => insert(character)}>
              {character}
            </button>
          ))}
        </div>
      )}
      <div className="accent-hint" role="status">{showAccentHint && t('Check the accent marks and try again.')}</div>
    </form>
  );
}
