import { Redirect } from 'expo-router';

import { AuthScreen } from '@/features/auth';
import { resolveAuthEntryDestination, useAuth } from '@/features/session';

export default function AuthIndexRoute() {
  const { authState } = useAuth();
  const destination = resolveAuthEntryDestination(authState.status);

  if (!destination) return <AuthScreen mode="checking" />;
  return <Redirect href={destination} />;
}
