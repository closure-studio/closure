import type { PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ROUTES } from '@/constants/routes';
import type { LayoutSize } from '@/schemas/layout-size';
import { DashboardFrame } from './screens/dashboard-frame';
import { SettingsFrame } from './screens/settings-frame';

type NavigationFrameTestProps = PropsWithChildren<{
  activeId: string;
  onSelect: (id: string) => void;
  onToggleScope: () => void;
}>;

type DashboardShellTestProps = PropsWithChildren<{
  onSelectGameAccount: (gameAccountId: string) => void;
  selectedGameAccountId: string;
}>;

const mockNavigationFrame = jest.fn<React.ReactNode, [NavigationFrameTestProps]>(
  ({ children }) => children,
);
const mockNavigationHeader = jest.fn((_props: object) => null);
const mockDashboardShell = jest.fn(({ children }: DashboardShellTestProps) => children);
const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
const mockRouterSetParams = jest.fn();
const mockRouterNavigate = jest.fn();
const mockReturnToDashboard = jest.fn();
const mockLogout = jest.fn();
let mockPathname = '/dashboard/overview';
let mockLayoutSize: LayoutSize = 'small';

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    navigate: mockRouterNavigate,
    push: mockRouterPush,
    replace: mockRouterReplace,
    setParams: mockRouterSetParams,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: (namespace: string) => ({
    t: (key: string) => `${namespace}:${key}`,
  }),
}));

jest.mock('@/features/dashboard', () => ({
  DashboardShell: (props: DashboardShellTestProps) => mockDashboardShell(props),
  getGameAvatarImageUrl: () => 'avatar-url',
  useDashboardRoute: () => ({
    gameAccount: {
      account: 'G1',
      avatar: { id: 'avatar', type: 'DEFAULT' },
      nickname: 'Doctor',
    },
    gameAccountId: 'G1',
    gameAccounts: [{ account: 'G1' }, { account: 'G2' }],
  }),
}));

jest.mock('@/providers/layout-size-provider', () => ({
  useLayoutSize: () => mockLayoutSize,
}));

jest.mock('./components/navigation-frame', () => ({
  NavigationFrame: (props: NavigationFrameTestProps) => mockNavigationFrame(props),
}));

jest.mock('./components/navigation-header', () => ({
  NavigationHeader: (props: object) => mockNavigationHeader(props),
}));

jest.mock('./use-app-logout', () => ({
  useAppLogout: () => mockLogout,
  useReturnToDashboard: () => mockReturnToDashboard,
}));

function readLastFrameProps(): NavigationFrameTestProps {
  const call = mockNavigationFrame.mock.calls.at(-1);
  if (!call) throw new Error('Expected NavigationFrame props.');
  return call[0];
}

describe('navigation scope frames', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/dashboard/overview';
    mockLayoutSize = 'small';
  });

  it('pushes the complete Settings screen from Dashboard', async () => {
    const screen = await render(<DashboardFrame><Text>content</Text></DashboardFrame>);
    const frame = readLastFrameProps();

    frame.onToggleScope();

    expect(mockRouterPush).toHaveBeenCalledWith(ROUTES.settingsNetwork);
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('uses the active Dashboard tab and account when selecting a sidebar page', async () => {
    await render(<DashboardFrame />);
    const frame = readLastFrameProps();

    frame.onSelect('operators');

    expect(frame.activeId).toBe('overview');
    expect(mockRouterReplace).toHaveBeenCalledWith({
      pathname: '/dashboard/operators',
      params: { gameAccountId: 'G1' },
    });
  });

  it('updates account selection without navigating to another route', async () => {
    await render(<DashboardFrame><Text>pager content</Text></DashboardFrame>);

    const shellCall = mockDashboardShell.mock.calls.at(-1);
    if (!shellCall) throw new Error('Expected DashboardShell props.');
    shellCall[0].onSelectGameAccount('G2');

    expect(mockDashboardShell).toHaveBeenCalledWith(expect.objectContaining({
      selectedGameAccountId: 'G1',
    }));
    expect(mockRouterSetParams).toHaveBeenCalledWith({ gameAccountId: 'G2' });
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('keeps the last Dashboard page identity while Settings owns the global URL', async () => {
    mockPathname = '/dashboard/operators';
    const screen = await render(<DashboardFrame />);

    expect(readLastFrameProps().activeId).toBe('operators');

    mockPathname = '/settings/account';
    await screen.rerender(<DashboardFrame />);
    const backgroundFrame = readLastFrameProps();

    expect(backgroundFrame.activeId).toBe('operators');

    backgroundFrame.onSelect('overview');
    expect(mockRouterReplace).toHaveBeenCalledWith({
      pathname: '/dashboard/overview',
      params: { gameAccountId: 'G1' },
    });
  });

  it('dismisses Settings to the preserved Dashboard stack screen', async () => {
    mockPathname = '/settings/account';
    await render(<SettingsFrame />);
    const frame = readLastFrameProps();

    frame.onToggleScope();

    expect(frame.activeId).toBe('account');
    expect(mockReturnToDashboard).toHaveBeenCalledTimes(1);
  });

  it('navigates Settings pages through the nested tab route', async () => {
    mockPathname = '/settings/network';
    await render(<SettingsFrame />);
    const frame = readLastFrameProps();

    frame.onSelect('contributors');

    expect(mockRouterNavigate).toHaveBeenCalledWith(ROUTES.settingsContributors);
  });
});
