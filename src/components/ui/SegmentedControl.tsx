import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

type SegmentedControlProps<OptionId extends string> = {
  ariaLabel: string;
  className?: string;
  onChange: (id: OptionId) => void;
  options: Array<{ id: OptionId; label: string; nativeLabel?: string; lang?: string }>;
  value: OptionId;
};

export function SegmentedControl<OptionId extends string>({
  ariaLabel,
  className = 'segmented-control',
  onChange,
  options,
  value,
}: SegmentedControlProps<OptionId>) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollControlsRef = useRef<HTMLDivElement>(null);
  const scrollLeftRef = useRef<HTMLButtonElement>(null);
  const scrollRightRef = useRef<HTMLButtonElement>(null);
  const isBookControl = className === 'book-tense-tabs';
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateScrollState = () => {
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      const canScrollLeft = container.scrollLeft > 4;
      const canScrollRight = maxScrollLeft - container.scrollLeft > 4;
      container.dataset.scrollLeft = String(canScrollLeft);
      container.dataset.scrollRight = String(canScrollRight);
      const controls = scrollControlsRef.current;
      controls?.toggleAttribute('data-overflow', container.scrollWidth - controls.clientWidth > 4);
      scrollLeftRef.current?.setAttribute('aria-disabled', String(!canScrollLeft));
      scrollRightRef.current?.setAttribute('aria-disabled', String(!canScrollRight));
    };
    const centerSelection = () => {
      if (container.scrollWidth > container.clientWidth) {
        const activeButton = container.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
        if (activeButton && container.clientWidth) {
          // Scroll only the tense strip so selection never moves the page vertically.
          const containerBounds = container.getBoundingClientRect();
          const activeBounds = activeButton.getBoundingClientRect();
          container.scrollTo({ left: container.scrollLeft + activeBounds.left - containerBounds.left - (container.clientWidth - activeButton.clientWidth) / 2 });
        }
      }
      updateScrollState();
    };
    centerSelection();
    container.addEventListener('scroll', updateScrollState, { passive: true });
    const observer = new ResizeObserver(centerSelection);
    observer.observe(container);
    return () => {
      container.removeEventListener('scroll', updateScrollState);
      observer.disconnect();
    };
  }, [className, value]);

  function scrollTenses(direction: -1 | 1) {
    const container = containerRef.current;
    const button = direction === -1 ? scrollLeftRef.current : scrollRightRef.current;
    if (!container || button?.getAttribute('aria-disabled') === 'true') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    container.scrollBy({ left: direction * Math.max(60, container.clientWidth * 0.75), behavior: reducedMotion ? 'instant' : 'smooth' });
  }

  const optionsControl = (
    <div ref={containerRef} className={className} aria-label={ariaLabel}>
      {options.map((item) => (
        <button
          className={className === 'book-tense-tabs' ? 'book-tense-button' : 'segment-button'}
          data-active={item.id === value}
          aria-pressed={item.id === value}
          key={item.id}
          onClick={() => onChange(item.id)}
          type="button"
        >
          <span>{item.label}</span>
          {item.nativeLabel && item.nativeLabel !== item.label && <small lang={item.lang}>{item.nativeLabel}</small>}
        </button>
      ))}
    </div>
  );

  if (!isBookControl) return optionsControl;

  return (
    <div className="book-tense-scroll" ref={scrollControlsRef}>
      <button ref={scrollLeftRef} className="book-tense-arrow" aria-label={t('Scroll verb forms left')} aria-disabled="true" type="button" onClick={() => scrollTenses(-1)}>
        <ChevronLeft size={16} aria-hidden="true" />
      </button>
      {optionsControl}
      <button ref={scrollRightRef} className="book-tense-arrow" aria-label={t('Scroll verb forms right')} aria-disabled="true" type="button" onClick={() => scrollTenses(1)}>
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
