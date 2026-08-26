import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import { useSessionBackdrop } from '@/features/session';
import { useAppStore } from '@/store';

export function useAppLogout() {
  const router = useRouter();
  const logout = useAppStore((state) => state.logout);
  const { resetBackdropTint } = useSessionBackdrop();

  return useCallback(() => {
    resetBackdropTint();
    logout();
    router.replace(ROUTES.login);
  }, [logout, resetBackdropTint, router]);
}

export function useReturnToDashboard() {
  const router = useRouter();

  return useCallback(() => {
    router.dismissTo(ROUTES.dashboard);
  }, [router]);
}
