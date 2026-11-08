import { Star } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

type FavoriteButtonProps = {
  infinitive: string;
  isFavorite: boolean;
  onToggle: (infinitive: string) => void;
};

export function FavoriteButton({ infinitive, isFavorite, onToggle }: FavoriteButtonProps) {
  const { t } = useI18n();
  const label = t('Favorite {verb}', { verb: infinitive });

  return (
    <button
      className="favorite-button"
      aria-label={label}
      aria-pressed={isFavorite}
      title={label}
      onClick={() => onToggle(infinitive)}
      type="button"
    >
      <Star size={17} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );
}
