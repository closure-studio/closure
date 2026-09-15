import { renderHook, waitFor } from '@testing-library/react-native';

import { mockActiveSession } from '@/mocks/auth';
import { appStore } from '@/store';
import { useSessionLifetime } from './use-session-lifetime';

beforeEach(() => appStore.getState().logout());

it('logs out an expired persisted session', async () => {
  appStore.getState().setSession({
    ...mockActiveSession,
    expiresAt: new Date(Date.now() - 1_000).toISOString(),
  });

  await renderHook(() => useSessionLifetime());

  await waitFor(() => expect(appStore.getState().auth.session).toBeNull());
});
