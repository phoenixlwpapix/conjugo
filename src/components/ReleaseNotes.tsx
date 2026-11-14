import { X } from 'lucide-react';
import type { Ref } from 'react';
import { useI18n } from '../hooks/useI18n';
import releases from '../data/releases.json';

type ReleaseNotesProps = {
  dialogRef: Ref<HTMLDialogElement>;
  onClose: () => void;
};

export function ReleaseNotes({ dialogRef, onClose }: ReleaseNotesProps) {
  const { locale, t } = useI18n();
  const dateFormat = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en', { dateStyle: 'medium', timeZone: 'UTC' });

  return (
    <dialog ref={dialogRef} className="release-notes" aria-labelledby="release-notes-title" onClose={onClose}>
      <header className="release-notes-header">
        <h2 id="release-notes-title">{t('Changelog')}</h2>
        <form method="dialog">
          <button type="submit" className="release-notes-close" aria-label={t('Close')} autoFocus>
            <X size={18} aria-hidden="true" />
          </button>
        </form>
      </header>
      <ol className="release-timeline" role="list">
        {releases.map(({ version, date, changes }) => (
          <li className="release-entry" key={version}>
            <div className="release-entry-heading">
              <h3>v{version}</h3>
              <time dateTime={date}>{dateFormat.format(new Date(date))}</time>
            </div>
            <ul className="release-changes">
              {changes[locale].map((note) => <li key={note}>{note}</li>)}
            </ul>
          </li>
        ))}
      </ol>
    </dialog>
  );
}
