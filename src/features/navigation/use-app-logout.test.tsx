import { renderHook } from '@testing-library/react-native';

import { ROUTES } from '@/constants/routes';
import { useAppLogout, useReturnToDashboard } from './use-app-logout';

const mockDismissTo = jest.fn();
const mockReplace = jest.fn();
const mockResetBackdropTint = jest.fn();
const mockLogout = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    dismissTo: mockDismissTo,
    replace: mockReplace,
  }),
}));

jest.mock('@/features/session', () => ({
  useSessionBackdrop: () => ({ resetBackdropTint: mockResetBackdropTint }),
}));

jest.mock('@/store', () => ({
  useAppStore: (selector: (state: { logout: () => void }) => unknown) => selector({
    logout: mockLogout,
  }),
}));

describe('app navigation actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('clears the session presentation before logging out and replacing the route', async () => {
    const { result } = await renderHook(() => useAppLogout());

    result.current();

    expect(mockResetBackdropTint).toHaveBeenCalledTimes(1);
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.login);
  });

  it('dismisses to Dashboard so deep links also have a deterministic destination', async () => {
    const { result } = await renderHook(() => useReturnToDashboard());

    result.current();

    expect(mockDismissTo).toHaveBeenCalledWith(ROUTES.dashboard);
  });
});
