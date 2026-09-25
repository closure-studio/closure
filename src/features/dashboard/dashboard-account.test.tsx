import { toast } from '@tamagui/toast/v2';
import { act, renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import * as v from 'valibot';

import { mockArkHostGameListResponse } from '@/mocks/arkhost';
import type { ArkHostGameLogEntry } from '@/schemas/arkhost';
import { gameAccountSchema } from '@/schemas/game-account';
import { DashboardAccountProvider, useDashboardAccount, useDashboardLiveLogToast } from './dashboard-account';

const accountEntries = mockArkHostGameListResponse.code === 1
  ? mockArkHostGameListResponse.data
  : [];
const firstAccountEntry = accountEntries[0];
if (!firstAccountEntry) throw new Error('Expected a Game Account fixture.');

const mockFirstAccount = v.parse(gameAccountSchema, {
  account: firstAccountEntry.status.account,
  ap: firstAccountEntry.status.ap,
  avatar: firstAccountEntry.status.avatar,
  captchaInfo: firstAccountEntry.captcha_info,
  color: 'primary',
  createdAt: firstAccountEntry.status.created_at,
  isVerified: firstAccountEntry.status.is_verify,
  level: firstAccountEntry.status.level,
  nickname: firstAccountEntry.status.nick_name,
  platform: firstAccountEntry.status.platform,
  statusCode: firstAccountEntry.status.code,
  userId: firstAccountEntry.status.uuid,
});
const mockSecondAccount = { ...mockFirstAccount, account: 'G2' };
let mockGameAccountsQuery = {
  data: [mockFirstAccount, mockSecondAccount],
  isError: false,
  isPending: false,
};
let mockLarge = false;
let mockLiveLogListener: ((log: ArkHostGameLogEntry) => void) | undefined;

jest.mock('react-i18next', () => {
  const t = (key: string) => key;
  return { useTranslation: () => ({ t }) };
});
jest.mock('tamagui', () => ({
  ...jest.requireActual<typeof import('tamagui')>('tamagui'),
  useMedia: () => ({ large: mockLarge }),
}));
jest.mock('@tamagui/toast/v2', () => ({
  toast: { info: jest.fn(), dismiss: jest.fn() },
}));
jest.mock('./queries', () => ({
  useGameAccountsQuery: jest.fn(() => mockGameAccountsQuery),
  subscribeToLiveGameLogs: jest.fn((listener: (log: ArkHostGameLogEntry) => void) => {
    mockLiveLogListener = listener;
    return () => { if (mockLiveLogListener === listener) mockLiveLogListener = undefined; };
  }),
}));

function DashboardAccountTestWrapper({ children }: PropsWithChildren) {
  return <DashboardAccountProvider>{children}</DashboardAccountProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockLarge = false;
  mockLiveLogListener = undefined;
  mockGameAccountsQuery = {
    data: [mockFirstAccount, mockSecondAccount],
    isError: false,
    isPending: false,
  };
});

describe('DashboardAccountProvider', () => {
  it('derives the first account when the current run has no explicit selection', async () => {
    const { result } = await renderHook(() => useDashboardAccount(), {
      wrapper: DashboardAccountTestWrapper,
    });

    expect(result.current.selectedGameAccount?.account).toBe(mockFirstAccount.account);
    expect(result.current.gameAccountsQuery.data).toHaveLength(2);
  });

  it('updates every consumer from the Provider selection without Router state', async () => {
    const { result } = await renderHook(() => useDashboardAccount(), {
      wrapper: DashboardAccountTestWrapper,
    });

    await act(() => {
      result.current.selectGameAccount(mockSecondAccount.account);
    });

    expect(result.current.selectedGameAccount?.account).toBe(mockSecondAccount.account);
  });

  it('falls back to the first account when the selected account is unavailable', async () => {
    const { result } = await renderHook(() => useDashboardAccount(), {
      wrapper: DashboardAccountTestWrapper,
    });

    await act(() => {
      result.current.selectGameAccount('G9');
    });

    expect(result.current.selectedGameAccount?.account).toBe(mockFirstAccount.account);
  });

  it('falls back while a selected account is absent from the Query result', async () => {
    const { result, rerender } = await renderHook(() => useDashboardAccount(), {
      wrapper: DashboardAccountTestWrapper,
    });

    await act(() => {
      result.current.selectGameAccount(mockSecondAccount.account);
    });
    expect(result.current.selectedGameAccount?.account).toBe(mockSecondAccount.account);

    mockGameAccountsQuery = {
      ...mockGameAccountsQuery,
      data: [mockFirstAccount],
    };
    await rerender(undefined);

    expect(result.current.selectedGameAccount?.account).toBe(mockFirstAccount.account);

    mockGameAccountsQuery = {
      ...mockGameAccountsQuery,
      data: [mockFirstAccount, mockSecondAccount],
    };
    await rerender(undefined);

    expect(result.current.selectedGameAccount?.account).toBe(mockSecondAccount.account);
  });

  it('returns no selection when the account list is empty', async () => {
    mockGameAccountsQuery = {
      ...mockGameAccountsQuery,
      data: [],
    };

    const { result } = await renderHook(() => useDashboardAccount(), {
      wrapper: DashboardAccountTestWrapper,
    });

    expect(result.current.selectedGameAccount).toBeNull();
  });
});

describe('Dashboard live log toast', () => {
  const log: ArkHostGameLogEntry = {
    content: 'New game log', id: 10, logLevel: 1, name: mockFirstAccount.account, ts: 100,
  };

  it('shows only live logs for the selected account and replaces the prior toast', async () => {
    const { result } = await renderHook(() => {
      useDashboardLiveLogToast();
      return useDashboardAccount();
    }, { wrapper: DashboardAccountTestWrapper });

    await act(() => {
      mockLiveLogListener?.({ ...log, name: mockSecondAccount.account });
      mockLiveLogListener?.(log);
      mockLiveLogListener?.({ ...log, id: 11, content: 'Latest game log' });
    });
    expect(toast.info).toHaveBeenCalledTimes(2);
    expect(toast.info).toHaveBeenLastCalledWith('logs.title', {
      id: `dashboard-live-log-${mockFirstAccount.account}`, description: 'Latest game log',
    });

    await act(() => result.current.selectGameAccount(mockSecondAccount.account));
    expect(toast.dismiss).toHaveBeenCalledWith(`dashboard-live-log-${mockFirstAccount.account}`);
    await act(() => {
      mockLiveLogListener?.(log);
      mockLiveLogListener?.({ ...log, name: mockSecondAccount.account });
    });
    expect(toast.info).toHaveBeenCalledTimes(3);
  });

  it('does not subscribe on large screens and stops when leaving Dashboard', async () => {
    mockLarge = true;
    const { rerender, unmount } = await renderHook(() => useDashboardLiveLogToast(), {
      wrapper: DashboardAccountTestWrapper,
    });
    expect(mockLiveLogListener).toBeUndefined();

    mockLarge = false;
    await rerender(undefined);
    expect(mockLiveLogListener).toBeDefined();
    mockLarge = true;
    await rerender(undefined);
    expect(mockLiveLogListener).toBeUndefined();
    mockLarge = false;
    await rerender(undefined);
    expect(mockLiveLogListener).toBeDefined();
    await unmount();
    expect(mockLiveLogListener).toBeUndefined();
    expect(toast.dismiss).toHaveBeenCalledWith(`dashboard-live-log-${mockFirstAccount.account}`);
  });
});
