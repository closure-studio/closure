import { useEffect } from 'react';

import { appStore, useAppStore } from '@/store';

export function useSessionLifetime() {
  const session = useAppStore((state) => state.auth.session);

  useEffect(() => {
    if (!session) return;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      if (appStore.getState().auth.session !== session) return;
      const remaining = Date.parse(session.expiresAt) - Date.now();
      if (remaining <= 0) {
        appStore.getState().logout();
        return;
      }
      timer = setTimeout(check, Math.min(remaining, 2147483647));
    };
    check();
    return () => clearTimeout(timer);
  }, [session]);
}
