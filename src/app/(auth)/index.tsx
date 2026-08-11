import { Redirect } from 'expo-router';

import { resolveAuthEntryDestination } from '@/features/session';
import { useAppStore } from '@/store';

export default function AuthIndexRoute() {
  const authStatus = useAppStore((state) => state.user.status);
  const destination = resolveAuthEntryDestination(authStatus);

  return <Redirect href={destination} />;
}
