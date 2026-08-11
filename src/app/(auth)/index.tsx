import { Redirect } from 'expo-router';

import { resolveAuthEntryDestination } from '@/features/session';
import { useAppStore } from '@/store';

export default function AuthIndexRoute() {
  const session = useAppStore((state) => state.auth.session);
  const destination = resolveAuthEntryDestination(session);

  return <Redirect href={destination} />;
}
