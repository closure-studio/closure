import '@/lib/clarity';

import { Slot } from 'expo-router';

import { SessionShell, useSessionLifetime } from '@/features/session';
import { useSessionQueryCacheReset } from '@/features/dashboard';
import { AppProvider } from '@/providers';
import { VerificationHost } from '@/features/verification';

export default function RootLayout() {
  useSessionLifetime();

  return (
    <AppProvider>
      <SessionQueryCacheReset />
      <SessionShell>
        <Slot />
        <VerificationHost />
      </SessionShell>
    </AppProvider>
  );
}

function SessionQueryCacheReset() {
  useSessionQueryCacheReset();
  return null;
}
