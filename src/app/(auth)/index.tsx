import { Redirect } from 'expo-router';

import { resolveAuthEntryDestination } from '@/routing/auth-routing';
import { useAppStore } from '@/store';

export default function AuthIndexRoute() {
  const session = useAppStore((state) => state.auth.session);
  const destination = resolveAuthEntryDestination(session);

  return <Redirect href={destination} />;
}
