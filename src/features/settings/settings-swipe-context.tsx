import { createContext, use, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

import type { HorizontalSwipeDirection } from '@/components';

type SettingsSwipeContextValue = {
  enabled: boolean;
  onSwipe: (direction: HorizontalSwipeDirection) => void;
};

const SettingsSwipeContext = createContext<SettingsSwipeContextValue | null>(null);

export function SettingsSwipeProvider({
  children,
  enabled,
  onSwipe,
}: PropsWithChildren<SettingsSwipeContextValue>) {
  const value = useMemo(() => ({ enabled, onSwipe }), [enabled, onSwipe]);

  return (
    <SettingsSwipeContext value={value}>
      {children}
    </SettingsSwipeContext>
  );
}

export function useSettingsSwipe() {
  const context = use(SettingsSwipeContext);
  if (!context) {
    throw new Error('Settings swipe surfaces must be rendered within SettingsSwipeProvider.');
  }

  return context;
}
