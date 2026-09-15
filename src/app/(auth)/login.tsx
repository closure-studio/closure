import { reloadAppAsync } from 'expo';
import { Redirect, useLocalSearchParams } from 'expo-router';

import { AuthScreen, AccountForms, useAuthEntry } from '@/features/auth';
import { resolvePostLoginDestination } from '@/routing/auth-routing';
import { appStore } from '@/store';

function toggleRequestMode(): void {
  const state = appStore.getState();
  state.setNextRequestMode(state.requestMode === 'remote' ? 'mock' : 'remote');
  void reloadAppAsync().catch(() => undefined);
}

export default function LoginRoute() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const destination = resolvePostLoginDestination(returnTo);
  const { session, forms } = useAuthEntry(destination);
  if (session) return <Redirect href={destination} />;
  return (
    <AuthScreen onToggleRequestMode={toggleRequestMode}>
      <AccountForms {...forms} />
    </AuthScreen>
  );
}
