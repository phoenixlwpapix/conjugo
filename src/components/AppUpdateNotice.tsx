import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../hooks/useI18n';

export function AppUpdateNotice() {
  const { t } = useI18n();
  const [updateReady, setUpdateReady] = useState(false);
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);
  const registration = useRef<ServiceWorkerRegistration | null>(null);
  const reloadOnUpdate = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const workers = navigator.serviceWorker;
    let controller = workers.controller;
    let installing: ServiceWorker | null = null;
    let updateWorker: ServiceWorker | null = null;
    let disposed = false;

    const showUpdate = (worker: ServiceWorker) => {
      if (worker === updateWorker) return;
      updateWorker = worker;
      setUpdateReady(true);
      setUpdateVersion(null);
      setDismissed(false);
      try {
        worker.postMessage({ type: 'CONJUGO_GET_VERSION' });
      } catch {
        // Another tab may replace the worker before it receives the message.
      }
    };

    const handleVersionMessage = (event: MessageEvent<unknown>) => {
      if (!updateWorker || event.source !== updateWorker || !event.data || typeof event.data !== 'object') return;
      const data = event.data as { type?: unknown; version?: unknown };
      if (data.type === 'CONJUGO_VERSION' && typeof data.version === 'string' && /^\d+\.\d+\.\d+$/.test(data.version)) {
        setUpdateVersion(data.version);
      }
    };

    const showWaitingUpdate = () => {
      const waiting = registration.current?.waiting;
      if (waiting) showUpdate(waiting);
    };

    const watchInstallingWorker = () => {
      installing?.removeEventListener('statechange', showWaitingUpdate);
      installing = registration.current?.installing ?? null;
      installing?.addEventListener('statechange', showWaitingUpdate);
    };

    const handleControllerChange = () => {
      const nextController = workers.controller;
      if (nextController && controller !== nextController) {
        if (reloadOnUpdate.current) window.location.reload();
        else if (controller) showUpdate(registration.current?.waiting ?? nextController);
      }
      controller = nextController;
    };

    const checkForUpdate = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        showWaitingUpdate();
        // The current release remains usable if an update check fails.
        void registration.current?.update().catch(() => {});
      }
    };

    workers.addEventListener('controllerchange', handleControllerChange);
    workers.addEventListener('message', handleVersionMessage);
    document.addEventListener('visibilitychange', checkForUpdate);
    window.addEventListener('focus', checkForUpdate);
    window.addEventListener('online', checkForUpdate);

    void workers.ready.then((readyRegistration) => {
      if (disposed) return;
      registration.current = readyRegistration;
      readyRegistration.addEventListener('updatefound', watchInstallingWorker);
      watchInstallingWorker();
      showWaitingUpdate();
      checkForUpdate();
    });

    return () => {
      disposed = true;
      registration.current?.removeEventListener('updatefound', watchInstallingWorker);
      installing?.removeEventListener('statechange', showWaitingUpdate);
      workers.removeEventListener('controllerchange', handleControllerChange);
      workers.removeEventListener('message', handleVersionMessage);
      document.removeEventListener('visibilitychange', checkForUpdate);
      window.removeEventListener('focus', checkForUpdate);
      window.removeEventListener('online', checkForUpdate);
    };
  }, []);

  const applyUpdate = () => {
    const waiting = registration.current?.waiting;
    if (waiting) {
      reloadOnUpdate.current = true;
      setUpdating(true);
      waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // A different tab may already have activated the update.
      window.location.reload();
    }
  };

  const visible = updateReady && !dismissed;
  const message = updating
    ? t('Updating…')
    : updateVersion ? t('Version v{version} is ready', { version: updateVersion }) : t('A new version is ready');

  return (
    <>
      <span className="sr-only" role="status">{visible ? message : ''}</span>
      {visible && (
        <div className="app-update-notice">
          <strong aria-hidden="true">{message}</strong>
          <div className="app-update-actions">
            <button className="quiz-secondary" type="button" disabled={updating} onClick={() => setDismissed(true)}>
              {t('Later')}
            </button>
            <button className="quiz-primary" type="button" disabled={updating} onClick={applyUpdate}>
              {t('Update now')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
