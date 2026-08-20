import { Slot } from 'expo-router';

import { SessionShell } from '@/features/session';
import { useSessionQueryCacheReset } from '@/features/dashboard';
import { AppProvider } from '@/providers';

export default function RootLayout() {
  return (
    <AppProvider>
      <SessionQueryCacheReset />
      <SessionShell>
        <Slot />
      </SessionShell>
    </AppProvider>
  );
}

function SessionQueryCacheReset() {
  useSessionQueryCacheReset();
  return null;
}
