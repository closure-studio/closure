import { createContext, use, useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import { useMedia } from 'tamagui';

import type { UiSettings } from '@/schemas/ui-settings';

const UiSettingsContext = createContext<UiSettings | null>(null);

export function UiSettingsProvider({ children }: PropsWithChildren) {
  const media = useMedia();
  const layoutSize = media.md ? 'large' : 'small';
  const uiSettings = useMemo<UiSettings>(() => ({ layoutSize }), [layoutSize]);

  return (
    <UiSettingsContext value={uiSettings}>
      {children}
    </UiSettingsContext>
  );
}

export function useUiSettings() {
  const uiSettings = use(UiSettingsContext);
  if (!uiSettings) {
    throw new Error('useUiSettings must be used within UiSettingsProvider.');
  }

  return uiSettings;
}
