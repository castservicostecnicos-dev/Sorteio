import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export function useAppUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFunction, setUpdateFunction] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    // Only register service worker in browser environment
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Unregister stale dev service workers in development mode
    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          if (reg.active?.scriptURL.includes('dev-sw')) {
            reg.unregister();
          }
        }
      });
      return;
    }

    // In production, listen for controller change to reload cleanly
    let refreshing = false;
    const onControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true);
        // Automatically trigger update without waiting
        updateSW(true);
      },
      onOfflineReady() {
        console.log('FutSociety Pro: pronto para uso offline');
      },
      onRegisteredSW(swUrl, registration) {
        if (!registration) return;

        // Check for updates on tab visibility change or refocus
        const checkUpdate = () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        };

        document.addEventListener('visibilitychange', checkUpdate);
        window.addEventListener('focus', checkUpdate);

        // Periodic check every 2 minutes
        const intervalId = setInterval(() => {
          registration.update().catch(() => {});
        }, 2 * 60 * 1000);

        return () => {
          document.removeEventListener('visibilitychange', checkUpdate);
          window.removeEventListener('focus', checkUpdate);
          clearInterval(intervalId);
        };
      },
    });

    setUpdateFunction(() => async () => {
      setIsUpdating(true);
      await updateSW(true);
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  const triggerUpdate = async () => {
    if (updateFunction) {
      setIsUpdating(true);
      await updateFunction();
    } else {
      window.location.reload();
    }
  };

  const forceCheckUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
      } else {
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
  };

  return {
    needRefresh,
    isUpdating,
    triggerUpdate,
    forceCheckUpdate,
  };
}
