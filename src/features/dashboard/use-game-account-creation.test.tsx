import { toast } from '@tamagui/toast/v2';
import { act, renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '@/i18n';
import type { ArkHostCreateGameInput } from '@/schemas/arkhost';
import { useGameAccountCreation } from './use-game-account-creation';

function wrapper({ children }: PropsWithChildren) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

const mockCreateMutateAsync = jest.fn<Promise<string | null>, [ArkHostCreateGameInput]>();
const mockCreateReset = jest.fn();
const mockLoginMutateAsync = jest.fn<Promise<void>, [string]>();
const mockLoginReset = jest.fn();
const mockSelectGameAccount = jest.fn();
const mockGameAccountSelected = jest.fn();
const workflowEvents: string[] = [];
let mockGameAccounts: readonly { account: string }[] = [];
let mockGameAccountsSuccess = true;

jest.mock('@tamagui/toast/v2', () => ({
  toast: { success: jest.fn(), warning: jest.fn() },
}));

jest.mock('./dashboard-account', () => ({
  useDashboardAccount: () => ({
    gameAccountsQuery: {
      data: mockGameAccounts,
      isSuccess: mockGameAccountsSuccess,
    },
    selectGameAccount: mockSelectGameAccount,
  }),
}));

jest.mock('./queries', () => ({
  useCreateGame: () => ({
    error: null,
    isPending: false,
    mutateAsync: mockCreateMutateAsync,
    reset: mockCreateReset,
  }),
  useLoginGame: () => ({
    isPending: false,
    mutateAsync: mockLoginMutateAsync,
    reset: mockLoginReset,
  }),
}));

function renderCreationHook() {
  return renderHook(() => useGameAccountCreation({
    onGameAccountSelected: mockGameAccountSelected,
  }), { wrapper });
}

describe('useGameAccountCreation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    workflowEvents.length = 0;
    mockGameAccounts = [];
    mockGameAccountsSuccess = true;
    mockCreateMutateAsync.mockResolvedValue('Gdoctor@example.com');
    mockLoginMutateAsync.mockImplementation(() => {
      workflowEvents.push('login');
      return Promise.resolve();
    });
    mockSelectGameAccount.mockImplementation(() => {
      workflowEvents.push('select');
    });
    mockGameAccountSelected.mockImplementation(() => {
      workflowEvents.push('navigate');
    });
  });

  it('opens creation only after an explicit request', async () => {
    const { result } = await renderCreationHook();

    expect(result.current.canCreateGame).toBe(true);
    expect(result.current.dialog.open).toBe(false);

    await act(() => {
      result.current.openDialog();
    });

    expect(result.current.dialog.open).toBe(true);

    await act(() => {
      result.current.dialog.onOpenChange(false);
    });

    expect(result.current.dialog.open).toBe(false);
    expect(mockCreateReset).toHaveBeenCalledTimes(2);
    expect(mockLoginReset).toHaveBeenCalledTimes(2);
  });

  it('hides creation when all three account slots are occupied', async () => {
    mockGameAccounts = [{ account: 'G1' }, { account: 'G2' }, { account: 'G3' }];

    const { result } = await renderCreationHook();

    expect(result.current.canCreateGame).toBe(false);
    expect(result.current.dialog.open).toBe(false);
  });

  it('creates, selects, opens Overview, and starts the new game in order', async () => {
    const { result } = await renderCreationHook();
    const input = {
      account: 'doctor@example.com',
      password: 'secret',
      platform: 1,
    } as const;

    await act(async () => {
      await result.current.dialog.onSubmit(input);
    });

    expect(mockCreateMutateAsync).toHaveBeenCalledWith(input);
    expect(mockSelectGameAccount).toHaveBeenCalledWith('Gdoctor@example.com');
    expect(mockGameAccountSelected).toHaveBeenCalledTimes(1);
    expect(mockLoginMutateAsync).toHaveBeenCalledWith('Gdoctor@example.com');
    expect(workflowEvents).toEqual(['select', 'navigate', 'login']);
    expect(toast.success).toHaveBeenCalledWith(
      'Game account added. The game is starting.',
    );
  });

  it('keeps the selected account and reports a recoverable start failure', async () => {
    mockLoginMutateAsync.mockImplementationOnce(() => {
      workflowEvents.push('login');
      return Promise.reject(new Error('Start failed'));
    });
    const { result } = await renderCreationHook();

    await act(async () => {
      await result.current.dialog.onSubmit({
        account: 'doctor@example.com',
        password: 'secret',
        platform: 1,
      });
    });

    expect(workflowEvents).toEqual(['select', 'navigate', 'login']);
    expect(mockSelectGameAccount).toHaveBeenCalledWith('Gdoctor@example.com');
    expect(toast.warning).toHaveBeenCalledWith(
      'Game account added, but the game could not be started. Try again from Overview.',
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('does not start an unknown account when the refreshed list cannot identify it', async () => {
    mockCreateMutateAsync.mockResolvedValueOnce(null);
    const { result } = await renderCreationHook();

    await act(async () => {
      await result.current.dialog.onSubmit({
        account: 'doctor@example.com',
        password: 'secret',
        platform: 1,
      });
    });

    expect(workflowEvents).toEqual([]);
    expect(mockSelectGameAccount).not.toHaveBeenCalled();
    expect(mockGameAccountSelected).not.toHaveBeenCalled();
    expect(mockLoginMutateAsync).not.toHaveBeenCalled();
    expect(toast.warning).toHaveBeenCalledWith(
      'Game account added, but the new account could not be selected. Select it and start the game manually.',
    );
  });
});
