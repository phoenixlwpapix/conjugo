type SegmentedControlProps<OptionId extends string> = {
  ariaLabel: string;
  className?: string;
  onChange: (id: OptionId) => void;
  options: Array<{ id: OptionId; label: string }>;
  value: OptionId;
};

export function SegmentedControl<OptionId extends string>({
  ariaLabel,
  className = 'segmented-control',
  onChange,
  options,
  value,
}: SegmentedControlProps<OptionId>) {
  return (
    <div className={className} aria-label={ariaLabel}>
      {options.map((item) => (
        <button
          className={className === 'book-tense-tabs' ? 'book-tense-button' : 'segment-button'}
          data-active={item.id === value}
          key={item.id}
          onClick={() => onChange(item.id)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
