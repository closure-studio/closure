import { Redirect, useLocalSearchParams } from 'expo-router';

import { AuthScreen } from '@/features/auth';
import { resolvePostLoginDestination, useAuth } from '@/features/session';

export default function LoginRoute() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const { authState, signIn } = useAuth();
  const destination = resolvePostLoginDestination(returnTo);

  if (authState.status === 'authenticated') return <Redirect href={destination} />;

  return <AuthScreen onAuthenticated={signIn} />;
}
