import { Redirect } from 'expo-router';

import { resolveAuthEntryDestination, useAuth } from '@/features/session';

export default function AuthIndexRoute() {
  const { authState } = useAuth();
  const destination = resolveAuthEntryDestination(authState.status);

  return <Redirect href={destination} />;
}
