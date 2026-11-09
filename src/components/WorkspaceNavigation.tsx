import { BarChart3, BookOpenText, ClipboardList, Settings, Target } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import type { MessageKey } from '../lib/i18n';
import type { AppView } from '../types';

type WorkspaceNavigationProps = {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  placement: 'header' | 'bottom';
};

type Workspace = { view: AppView; label: MessageKey; Icon: typeof Target };

const workspaces: Workspace[] = [
  { view: 'practice', label: 'Practice', Icon: Target },
  { view: 'quiz', label: 'Quiz', Icon: ClipboardList },
  { view: 'stats', label: 'Stats', Icon: BarChart3 },
  { view: 'wordbook', label: 'Verb Book', Icon: BookOpenText },
];

const bottomWorkspaces: Workspace[] = [
  ...workspaces,
  { view: 'settings', label: 'Settings', Icon: Settings },
];

export function WorkspaceNavigation({ activeView, onViewChange, placement }: WorkspaceNavigationProps) {
  const { t } = useI18n();
  const isBottom = placement === 'bottom';

  const selectView = (view: AppView) => {
    if (isBottom) {
      if (view === activeView) return;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    onViewChange(view);
  };

  return (
    <nav className="view-switch" data-placement={placement} aria-label={t('Choose workspace')}>
      {(isBottom ? bottomWorkspaces : workspaces).map(({ view, label, Icon }) => (
        <button
          key={view}
          className="view-button"
          data-active={activeView === view}
          aria-current={activeView === view ? 'page' : undefined}
          onClick={() => selectView(view)}
          type="button"
        >
          <Icon size={isBottom ? 22 : 16} aria-hidden="true" />
          <span>{t(label)}</span>
        </button>
      ))}
    </nav>
  );
}
