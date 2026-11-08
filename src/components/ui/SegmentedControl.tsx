import { useEffect, useRef } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const centerSelection = () => {
      if (container.scrollWidth <= container.clientWidth) return;
      const activeButton = container.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
      if (!activeButton || !container.clientWidth) return;
      // Scroll only the tense strip so selection never moves the page vertically.
      const containerBounds = container.getBoundingClientRect();
      const activeBounds = activeButton.getBoundingClientRect();
      container.scrollTo({ left: container.scrollLeft + activeBounds.left - containerBounds.left - (container.clientWidth - activeButton.clientWidth) / 2 });
    };
    centerSelection();
    const observer = new ResizeObserver(centerSelection);
    observer.observe(container);
    return () => observer.disconnect();
  }, [className, value]);
  return (
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
}
