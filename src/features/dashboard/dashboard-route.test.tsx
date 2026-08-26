import { renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import * as v from 'valibot';

import { mockArkHostGameListResponse } from '@/mocks/arkhost';
import { gameAccountSchema } from '@/schemas/game-account';
import { DashboardRouteProvider, useDashboardRoute } from './dashboard-route';

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

jest.mock('expo-router', () => ({
  useGlobalSearchParams: jest.fn(() => ({})),
  useLocalSearchParams: jest.fn(() => ({ gameAccountId: 'G16601716973' })),
}));

jest.mock('./queries', () => ({
  findGameAccountById: (accounts: readonly { account: string }[] | undefined, accountId: string | null) => (
    accountId === null
      ? null
      : accounts?.find((account) => account.account === accountId) ?? null
  ),
  useGameAccountsQuery: jest.fn(() => mockGameAccountsQuery),
}));

const mockUseLocalSearchParams = jest.mocked(
  jest.requireMock<typeof import('expo-router')>('expo-router').useLocalSearchParams,
);

function DashboardRouteTestWrapper({ children }: PropsWithChildren) {
  return <DashboardRouteProvider>{children}</DashboardRouteProvider>;
}

function createWrapper() {
  return DashboardRouteTestWrapper;
}

beforeEach(() => {
  mockUseLocalSearchParams.mockReset();
  mockUseLocalSearchParams.mockReturnValue({ gameAccountId: mockFirstAccount.account });
  mockGameAccountsQuery = {
    data: [mockFirstAccount, mockSecondAccount],
    isError: false,
    isPending: false,
  };
});

describe('DashboardRouteProvider', () => {
  it('derives the route account from the Dashboard screen local URL', async () => {
    const { result } = await renderHook(() => useDashboardRoute(), {
      wrapper: createWrapper(),
    });

    expect(result.current.gameAccountId).toBe(mockFirstAccount.account);
    expect(result.current.gameAccount?.account).toBe(mockFirstAccount.account);
    expect(result.current.gameAccounts).toHaveLength(2);
  });

  it('rejects array route parameters before they reach account lookup', async () => {
    mockUseLocalSearchParams.mockReturnValue({ gameAccountId: ['G1'] });

    const { result } = await renderHook(() => useDashboardRoute(), {
      wrapper: createWrapper(),
    });

    expect(result.current.gameAccountId).toBeNull();
    expect(result.current.gameAccount).toBeNull();
  });

  it('keeps foreign account IDs out of the dashboard context', async () => {
    mockUseLocalSearchParams.mockReturnValue({ gameAccountId: 'G9' });

    const { result } = await renderHook(() => useDashboardRoute(), {
      wrapper: createWrapper(),
    });

    expect(result.current.gameAccountId).toBe('G9');
    expect(result.current.gameAccount).toBeNull();
  });
});
