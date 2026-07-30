import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AuthScreen } from '@/features/auth';
import { resolvePostLoginDestination, useAuth } from '@/features/session';

export default function LoginRoute() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const { authState, signIn } = useAuth();
  const destination = resolvePostLoginDestination(returnTo);

  useEffect(() => {
    if (authState.status === 'authenticated') router.replace(destination);
  }, [authState.status, destination, router]);

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
