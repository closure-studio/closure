import {
  router,
  Slot,
  useGlobalSearchParams,
  usePathname,
} from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { Text } from 'react-native';
import {
  act,
  renderRouter,
  waitFor,
} from 'expo-router/testing-library';

let dashboardAccountId: string | null = null;
const dashboardLayoutMount = jest.fn();
const dashboardFrameMount = jest.fn();
const terminalMarqueeMount = jest.fn();

function RootLayoutFixture() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

function TerminalMarqueeFixture() {
  useEffect(() => {
    terminalMarqueeMount();
  }, []);
  return null;
}

function DashboardFrameFixture({ children }: PropsWithChildren) {
  useEffect(() => {
    dashboardFrameMount();
  }, []);
  return (
    <>
      <TerminalMarqueeFixture />
      {children}
    </>
  );
}

function DashboardLayoutFixture() {
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ gameAccountId?: string | string[] }>();
  const routeAccountId = typeof params.gameAccountId === 'string'
    ? params.gameAccountId
    : null;
  const [retainedAccountId, setRetainedAccountId] = useState(routeAccountId);

  if (pathname.startsWith('/dashboard') && routeAccountId !== retainedAccountId) {
    setRetainedAccountId(routeAccountId);
  }
  dashboardAccountId = retainedAccountId;

  useEffect(() => {
    dashboardLayoutMount();
  }, []);

  return (
    <DashboardFrameFixture>
      <Text testID="dashboard-account-id">{dashboardAccountId}</Text>
      <Slot />
    </DashboardFrameFixture>
  );
}

function EmptyRouteFixture() {
  return null;
}

describe('Dashboard search-param route lifetime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dashboardAccountId = null;
  });

  it('keeps the layout, frame, and marquee mounted across accounts and Settings', async () => {
    const routerResult = renderRouter({
      _layout: { default: RootLayoutFixture },
      'dashboard/_layout': { default: DashboardLayoutFixture },
      'dashboard/overview': { default: EmptyRouteFixture },
      'settings/account': { default: EmptyRouteFixture },
    }, { initialUrl: '/dashboard/overview?gameAccountId=G1' });
    const rendered = await routerResult;

    expect(rendered.getByTestId('dashboard-account-id')).toHaveTextContent('G1');

    await act(async () => {
      router.setParams({ gameAccountId: 'G2' });
    });
    await waitFor(() => {
      expect(rendered.getByTestId('dashboard-account-id')).toHaveTextContent('G2');
    });
    await act(async () => {
      router.setParams({ gameAccountId: 'G3' });
    });
    await waitFor(() => {
      expect(rendered.getByTestId('dashboard-account-id')).toHaveTextContent('G3');
    });

    await act(async () => {
      router.push('/settings/account');
    });
    await waitFor(() => {
      expect(routerResult.getPathname()).toBe('/settings/account');
    });

    expect(dashboardAccountId).toBe('G3');
    expect(dashboardLayoutMount).toHaveBeenCalledTimes(1);
    expect(dashboardFrameMount).toHaveBeenCalledTimes(1);
    expect(terminalMarqueeMount).toHaveBeenCalledTimes(1);
  });
});
