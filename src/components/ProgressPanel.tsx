import { useEffect, useRef, useState } from 'react';
import { BarChart3, BookOpenText, Flame, Target, Trophy, X } from 'lucide-react';
import { pronouns, type Language } from '../data/verbs';
import { useFocusTrap } from '../lib/focusTrap';
import { getAnswer, getPronounLabel, getTenseLabel } from '../lib/prompts';
import { getAccuracy } from '../lib/scoring';
import type { Attempt, PracticeStats } from '../types';
import { RingMeter } from './ui/RingMeter';

interface ProgressPanelProps {
  activeLanguage: Language;
  progress: number;
  progressPercent: number;
  attempts: Attempt[];
  accuracy: number;
  streak: number;
  recentMisses: Attempt[];
  cumulativeStats: PracticeStats;
  sessionTarget: number;
  onReviewModalChange: (isOpen: boolean) => void;
}

export function ProgressPanel({
  activeLanguage,
  progress,
  progressPercent,
  attempts,
  accuracy,
  streak,
  recentMisses,
  cumulativeStats,
  sessionTarget,
  onReviewModalChange,
}: ProgressPanelProps) {
  const [activeMiss, setActiveMiss] = useState<Attempt | null>(null);
  const modalRef = useRef<HTMLElement>(null);
  useFocusTrap(Boolean(activeMiss), modalRef);

  const allTimeAccuracy = getAccuracy(cumulativeStats.totalCorrect, cumulativeStats.totalAnswered);
  const activeMissTenseLabel = activeMiss ? getTenseLabel(activeMiss.prompt.tense) : '';
  const remaining = Math.max(sessionTarget - progress, 0);

  useEffect(() => {
    onReviewModalChange(Boolean(activeMiss));
    return () => onReviewModalChange(false);
  }, [activeMiss, onReviewModalChange]);

  useEffect(() => {
    if (!activeMiss) {
      return undefined;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMiss(null);
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [activeMiss]);

  return (
    <aside className="progress-panel" aria-label="Practice progress">
      <section className="progress-card">
        <div className="panel-title">
          <BarChart3 size={18} aria-hidden="true" />
          <h2>This set</h2>
        </div>
        <RingMeter progressPercent={progressPercent} />
        <p>{remaining > 0 ? `${remaining} more to complete this set` : 'Set complete. Reset or keep going.'}</p>
      </section>

      <section className="score-grid">
        <div>
          <span>Answered</span>
          <strong>
            <Target size={18} aria-hidden="true" />
            {attempts.length}
          </strong>
        </div>
        <div>
          <span>Accuracy</span>
          <strong>
            <Trophy size={18} aria-hidden="true" />
            {accuracy}%
          </strong>
        </div>
        <div>
          <span>Streak</span>
          <strong>
            <Flame size={18} aria-hidden="true" />
            {streak}
          </strong>
        </div>
      </section>

      <section className="progress-card alltime-card">
        <div className="panel-title-row">
          <div className="panel-title">
            <Trophy size={18} aria-hidden="true" />
            <h2>All-time Progress</h2>
          </div>
          <span className="language-stat-tag">{activeLanguage.name}</span>
        </div>
        <div className="score-grid alltime-score-grid">
          <div>
            <span>Total Drills</span>
            <strong>
              <Target size={18} aria-hidden="true" />
              {cumulativeStats.totalAnswered}
            </strong>
          </div>
          <div>
            <span>Accuracy</span>
            <strong>
              <Trophy size={18} aria-hidden="true" />
              {allTimeAccuracy}%
            </strong>
          </div>
          <div>
            <span>Max Streak</span>
            <strong>
              <Flame size={18} aria-hidden="true" />
              {cumulativeStats.bestStreak}
            </strong>
          </div>
        </div>
      </section>

      <section className="review-card">
        <div className="panel-title">
          <BookOpenText size={18} aria-hidden="true" />
          <h2>Review (Recent Misses)</h2>
        </div>
        {recentMisses.length === 0 ? (
          <p className="empty-state review-empty">Wrong choices will land here. Click a card to inspect this tense.</p>
        ) : (
          <div className="miss-list">
            {recentMisses.map((attempt, index) => {
              const label = getPronounLabel(attempt.prompt);
              const tense = getTenseLabel(attempt.prompt.tense);
              const infinitive = attempt.prompt.verb.infinitive;
              const correctForm = getAnswer(attempt.prompt);

              return (
                <button
                  className="miss-item clickable-miss-item"
                  key={`${infinitive}-${attempt.answer}-${index}`}
                  onClick={() => setActiveMiss(attempt)}
                  type="button"
                  title="View this tense"
                >
                  <span>
                    {label} · {tense} · {infinitive}
                  </span>
                  <strong>{correctForm}</strong>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {activeMiss && (
        <div
          className="miss-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveMiss(null);
            }
          }}
        >
          <section
            ref={modalRef}
            aria-labelledby="miss-modal-title"
            aria-modal="true"
            className="miss-modal"
            role="dialog"
          >
            <div className="miss-modal-head">
              <div>
                <span className="eyebrow">{activeMissTenseLabel}</span>
                <h2 id="miss-modal-title">{activeMiss.prompt.verb.infinitive}</h2>
                <p>{activeMiss.prompt.verb.translation}</p>
              </div>
              <button
                aria-label="Close conjugation detail"
                className="modal-close-button"
                onClick={() => setActiveMiss(null)}
                type="button"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="miss-conjugation-list">
              {pronouns.map((pronoun) => (
                <div className="miss-conjugation-row" data-current={pronoun === activeMiss.prompt.pronoun} key={pronoun}>
                  <span>{activeMiss.prompt.language.pronounLabels[pronoun]}</span>
                  <strong>{activeMiss.prompt.verb.forms[activeMiss.prompt.tense][pronoun]}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}
