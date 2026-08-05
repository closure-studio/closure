import { Redirect, useLocalSearchParams } from 'expo-router';

import { AuthScreen } from '@/features/auth';
import { resolvePostLoginDestination, useAuth } from '@/features/session';

export default function LoginRoute() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const { authState, signIn } = useAuth();
  const destination = resolvePostLoginDestination(returnTo);

  if (authState.status === 'checking') return <AuthScreen mode="checking" />;
  if (authState.status === 'authenticated') return <Redirect href={destination} />;

  const handleAuthenticated = () => {
    if (process.env.EXPO_OS === 'web' && typeof document !== 'undefined') {
      const focusedElement = document.activeElement;

      if (focusedElement instanceof HTMLElement) {
        focusedElement.blur();
      }
    }

    signIn();
  };

  return <AuthScreen onAuthenticated={handleAuthenticated} />;
}
