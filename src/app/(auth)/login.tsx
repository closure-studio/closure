import { Redirect, useLocalSearchParams } from 'expo-router';

import { AuthScreen } from '@/features/auth';
import { resolvePostLoginDestination } from '@/features/session';
import { useAppStore } from '@/store';

export default function LoginRoute() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const authStatus = useAppStore((state) => state.user.status);
  const signIn = useAppStore((state) => state.signIn);
  const destination = resolvePostLoginDestination(returnTo);

  if (authStatus === 'authenticated') return <Redirect href={destination} />;

  return <AuthScreen onAuthenticated={signIn} />;
}
