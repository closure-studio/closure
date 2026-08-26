import { renderHook } from '@testing-library/react-native';

import { ROUTES } from '@/constants/routes';
import { useAppLogout, useReturnToDashboard } from './navigation-actions';

const mockBack = jest.fn();
const mockCanGoBack = jest.fn(() => true);
const mockReplace = jest.fn();
const mockResetBackdropTint = jest.fn();
const mockLogout = jest.fn();

jest.mock('expo-router', () => ({
  useNavigation: () => ({
    canGoBack: mockCanGoBack,
    goBack: mockBack,
  }),
  useRouter: () => ({
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
    mockCanGoBack.mockReturnValue(true);
  });

  it('clears the session presentation before logging out and replacing the route', async () => {
    const { result } = await renderHook(() => useAppLogout());

    result.current();

    expect(mockResetBackdropTint).toHaveBeenCalledTimes(1);
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.login);
  });

  it('pops Settings to the preserved Dashboard stack screen', async () => {
    const { result } = await renderHook(() => useReturnToDashboard());

    result.current();

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('replaces a direct Settings deep link with Dashboard when there is no history', async () => {
    mockCanGoBack.mockReturnValue(false);
    const { result } = await renderHook(() => useReturnToDashboard());

    result.current();

    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.dashboard);
  });
});
