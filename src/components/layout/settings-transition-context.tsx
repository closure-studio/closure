import { createContext, use } from 'react';
import type { PropsWithChildren } from 'react';

export type SettingsTransitionDirection = 'backward' | 'forward' | 'none';

type SettingsTransitionContextValue = {
  direction: SettingsTransitionDirection;
  reducedMotion: boolean;
};

const SettingsTransitionContext = createContext<SettingsTransitionContextValue>({
  direction: 'none',
  reducedMotion: true,
});

export function SettingsTransitionProvider({
  children,
  direction,
  reducedMotion,
}: PropsWithChildren<SettingsTransitionContextValue>) {
  return (
    <SettingsTransitionContext value={{ direction, reducedMotion }}>
      {children}
    </SettingsTransitionContext>
  );
}

export function useSettingsTransitionDirection() {
  return use(SettingsTransitionContext);
}
