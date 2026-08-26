import { renderHook } from '@testing-library/react-native';
import { usePreventRemove } from 'expo-router/react-navigation';

import { useBackDismissal } from './use-back-dismissal';

jest.mock('expo-router/react-navigation', () => ({
  usePreventRemove: jest.fn(),
}));

describe('useBackDismissal', () => {
  beforeEach(() => {
    jest.mocked(usePreventRemove).mockClear();
  });

  it('registers open overlays with stack and browser removal prevention', async () => {
    const onDismiss = jest.fn();
    const { rerender, unmount } = await renderHook(
      ({ open }: { open: boolean }) => useBackDismissal(open, onDismiss),
      { initialProps: { open: true } },
    );

    expect(usePreventRemove).toHaveBeenLastCalledWith(true, expect.any(Function));
    const preventRemoveCallback = jest.mocked(usePreventRemove).mock.calls.at(-1)?.[1];
    preventRemoveCallback?.({ data: { action: { type: 'GO_BACK' } } });
    expect(onDismiss).toHaveBeenCalledTimes(1);

    await rerender({ open: false });
    expect(usePreventRemove).toHaveBeenLastCalledWith(false, expect.any(Function));

    await unmount();
  });
});
