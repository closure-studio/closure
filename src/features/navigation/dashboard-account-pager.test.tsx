import { Fragment, type ReactNode } from 'react';
import { act, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import * as v from 'valibot';
import { TamaguiProvider } from 'tamagui';

import { mockArkHostGameListResponse } from '@/mocks/arkhost';
import { gameAccountSchema, type GameAccount } from '@/schemas/game-account';
import { tamaguiConfig } from '../../../tamagui.config';
import { DashboardAccountPager } from './dashboard-account-pager';

type PagerRoute = {
  gameAccount: GameAccount;
  key: string;
};

type MockTabViewProps = {
  lazy: boolean;
  lazyPreloadDistance: number;
  navigationState: {
    index: number;
    routes: readonly PagerRoute[];
  };
  onIndexChange: (index: number) => void;
  renderScene: (props: { route: PagerRoute }) => ReactNode;
  renderTabBar: () => null;
  swipeEnabled: boolean;
};

const mockTabView = jest.fn<ReactNode, [MockTabViewProps]>(({
  navigationState,
  renderScene,
}) => (
  <>
    {navigationState.routes.map((route) => (
      <Fragment key={route.key}>{renderScene({ route })}</Fragment>
    ))}
  </>
));
const mockUseAdjacentGameAccountPrefetch = jest.fn();
const mockSelectGameAccount = jest.fn();

jest.mock('react-native-tab-view', () => ({
  TabView: (props: MockTabViewProps) => mockTabView(props),
}));

jest.mock('@/features/dashboard', () => ({
  useAdjacentGameAccountPrefetch: (...args: unknown[]) => {
    mockUseAdjacentGameAccountPrefetch(...args);
  },
  useDashboardAccount: () => ({
    ...mockDashboardAccount,
    selectGameAccount: mockSelectGameAccount,
  }),
}));

const accountEntries = mockArkHostGameListResponse.code === 1
  ? mockArkHostGameListResponse.data
  : [];
const gameAccounts = accountEntries.map((entry) => v.parse(gameAccountSchema, {
  account: entry.status.account,
  ap: entry.status.ap,
  avatar: entry.status.avatar,
  captchaInfo: entry.captcha_info,
  color: 'primary',
  config: entry.game_config,
  createdAt: entry.status.created_at,
  isVerified: entry.status.is_verify,
  level: entry.status.level,
  nickname: entry.status.nick_name,
  platform: entry.status.platform,
  statusCode: entry.status.code,
  statusText: entry.status.text,
  userId: entry.status.uuid,
}));

const firstGameAccount = gameAccounts[0];
const secondGameAccount = gameAccounts[1];
const thirdGameAccount = gameAccounts[2];
if (!firstGameAccount || !secondGameAccount || !thirdGameAccount) {
  throw new Error('Expected three game account fixtures.');
}

let mockDashboardAccount: {
  selectedGameAccount: GameAccount;
  gameAccountsQuery: { data: readonly GameAccount[] };
} = {
  selectedGameAccount: secondGameAccount,
  gameAccountsQuery: { data: gameAccounts },
};

function readPagerProps(): MockTabViewProps {
  const call = mockTabView.mock.calls.at(-1);
  if (!call) throw new Error('Expected TabView props.');
  return call[0];
}

function DashboardAccountPagerTestTree() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <DashboardAccountPager
        renderAccount={(gameAccount) => (
          <Text testID={`dashboard-account-scene-${gameAccount.account}`}>
            {gameAccount.account}
          </Text>
        )}
      />
    </TamaguiProvider>
  );
}

function renderPager() {
  return render(
    <DashboardAccountPagerTestTree />,
  );
}

describe('DashboardAccountPager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDashboardAccount = {
      selectedGameAccount: secondGameAccount,
      gameAccountsQuery: { data: gameAccounts },
    };
  });

  it('renders account-bound scenes and prefetches only adjacent accounts', async () => {
    const screen = await renderPager();
    const pager = readPagerProps();

    expect(pager.navigationState.index).toBe(1);
    expect(pager.navigationState.routes.map((route) => route.key)).toEqual(
      gameAccounts.map((gameAccount) => gameAccount.account),
    );
    expect(pager.lazy).toBe(true);
    expect(pager.lazyPreloadDistance).toBe(1);
    expect(pager.swipeEnabled).toBe(true);
    expect(screen.getByTestId(`dashboard-account-scene-${firstGameAccount.account}`)).toBeTruthy();
    expect(screen.getByTestId(`dashboard-account-scene-${thirdGameAccount.account}`)).toBeTruthy();
    expect(mockUseAdjacentGameAccountPrefetch).toHaveBeenCalledWith(
      gameAccounts,
      secondGameAccount.account,
    );
  });

  it('selects the swiped account through the Dashboard account owner', async () => {
    await renderPager();
    const pager = readPagerProps();

    await act(() => {
      pager.onIndexChange(2);
    });

    expect(mockSelectGameAccount).toHaveBeenCalledWith(thirdGameAccount.account);
    expect(readPagerProps().navigationState.index).toBe(1);
    expect(pager.renderTabBar()).toBeNull();
  });

  it('derives the controlled index from Dashboard account state', async () => {
    const screen = await renderPager();

    mockDashboardAccount = {
      selectedGameAccount: firstGameAccount,
      gameAccountsQuery: { data: gameAccounts },
    };
    await screen.rerender(<DashboardAccountPagerTestTree />);

    expect(readPagerProps().navigationState.index).toBe(0);
    expect(mockSelectGameAccount).not.toHaveBeenCalled();
  });
});
