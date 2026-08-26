import { Fragment, type ReactNode } from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import * as v from 'valibot';
import { TamaguiProvider } from 'tamagui';

import { mockArkHostGameListResponse } from '@/mocks/arkhost';
import { gameAccountSchema, type GameAccount } from '@/schemas/game-account';
import { tamaguiConfig } from '../../../tamagui.config';
import { DashboardAccountPager } from './dashboard-account-pager';
import { dashboardPageHref } from './navigation-config';

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
const mockRouterReplace = jest.fn();
const mockUseAdjacentGameAccountPrefetch = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
}));

jest.mock('react-native-tab-view', () => ({
  TabView: (props: MockTabViewProps) => mockTabView(props),
}));

jest.mock('@/features/dashboard', () => ({
  useAdjacentGameAccountPrefetch: (...args: unknown[]) => {
    mockUseAdjacentGameAccountPrefetch(...args);
  },
  useDashboardRoute: () => mockDashboardRoute,
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

let mockDashboardRoute: {
  gameAccountId: string;
  gameAccounts: readonly GameAccount[];
} = {
  gameAccountId: secondGameAccount.account,
  gameAccounts,
};

function readPagerProps(): MockTabViewProps {
  const call = mockTabView.mock.calls.at(-1);
  if (!call) throw new Error('Expected TabView props.');
  return call[0];
}

function renderPager() {
  const renderAccount = (gameAccount: GameAccount) => (
    <Text testID={`dashboard-account-scene-${gameAccount.account}`}>
      {gameAccount.account}
    </Text>
  );

  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <DashboardAccountPager pageId="overview" renderAccount={renderAccount} />
    </TamaguiProvider>,
  );
}

describe('DashboardAccountPager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDashboardRoute = {
      gameAccountId: secondGameAccount.account,
      gameAccounts,
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

  it('updates the canonical URL only after the pager settles on another account', async () => {
    await renderPager();
    const pager = readPagerProps();

    pager.onIndexChange(2);

    expect(mockRouterReplace).toHaveBeenCalledWith(
      dashboardPageHref('overview', thirdGameAccount.account),
    );
    expect(pager.renderTabBar()).toBeNull();

    mockRouterReplace.mockClear();
    pager.onIndexChange(1);

    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});
