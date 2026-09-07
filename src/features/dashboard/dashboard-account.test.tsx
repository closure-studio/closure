import { act, renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import * as v from 'valibot';

import { mockArkHostGameListResponse } from '@/mocks/arkhost';
import { gameAccountSchema } from '@/schemas/game-account';
import { DashboardAccountProvider, useDashboardAccount } from './dashboard-account';

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
  config: firstAccountEntry.game_config,
  createdAt: firstAccountEntry.status.created_at,
  isVerified: firstAccountEntry.status.is_verify,
  level: firstAccountEntry.status.level,
  nickname: firstAccountEntry.status.nick_name,
  platform: firstAccountEntry.status.platform,
  statusCode: firstAccountEntry.status.code,
  statusText: firstAccountEntry.status.text,
  userId: firstAccountEntry.status.uuid,
});
const mockSecondAccount = { ...mockFirstAccount, account: 'G2' };
let mockGameAccountsQuery = {
  data: [mockFirstAccount, mockSecondAccount],
  isError: false,
  isPending: false,
};

jest.mock('./queries', () => ({
  findGameAccountById: (accounts: readonly { account: string }[] | undefined, accountId: string | null) => (
    accountId === null
      ? null
      : accounts?.find((account) => account.account === accountId) ?? null
  ),
  useGameAccountsQuery: jest.fn(() => mockGameAccountsQuery),
}));

function DashboardAccountTestWrapper({ children }: PropsWithChildren) {
  return <DashboardAccountProvider>{children}</DashboardAccountProvider>;
}

beforeEach(() => {
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

  it('clears a selection when its account leaves the Query result', async () => {
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

    expect(result.current.selectedGameAccount?.account).toBe(mockFirstAccount.account);
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
