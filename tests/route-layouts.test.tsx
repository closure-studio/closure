import { render } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

const mockSlot = jest.fn(() => null);
const mockAppProvider = jest.fn(({ children }: PropsWithChildren) => children);
const mockSessionShell = jest.fn(({ children }: PropsWithChildren) => children);
const mockUseSessionQueryCacheReset = jest.fn();

jest.mock('expo-router', () => ({
  Slot: mockSlot,
}));

jest.mock('@/features/dashboard', () => ({
  useSessionQueryCacheReset: mockUseSessionQueryCacheReset,
}));

jest.mock('@/features/session', () => ({
  SessionShell: mockSessionShell,
}));

jest.mock('@/providers', () => ({
  AppProvider: mockAppProvider,
}));

const RootLayout = jest.requireActual<typeof import('../src/app/_layout')>(
  '../src/app/_layout',
).default;

describe('route layouts', () => {
  beforeEach(() => {
    mockSlot.mockClear();
    mockUseSessionQueryCacheReset.mockClear();
  });

  it('renders the Root child through Slot', async () => {
    await render(<RootLayout />);

    expect(mockSlot).toHaveBeenCalledTimes(1);
  });
});
