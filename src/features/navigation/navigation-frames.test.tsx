import type { PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { ROUTES } from '@/constants/routes';
import { tamaguiConfig } from '../../../tamagui.config';
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
const mockRouterNavigate = jest.fn();
const mockSelectGameAccount = jest.fn();
const mockReturnToDashboard = jest.fn();
const mockLogout = jest.fn();
const mockSetBackdropTint = jest.fn();
let mockPathname = '/dashboard/G1/overview';
let mockLarge = false;

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
  useSegments: () => mockPathname.split('/').filter(Boolean),
  useRouter: () => ({
    navigate: mockRouterNavigate,
    push: mockRouterPush,
    replace: mockRouterReplace,
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
  selectBackdropTint: () => '#3dccdf',
  useDashboardAccount: () => ({
    selectedGameAccount: {
      account: 'G1',
      avatar: { id: 'avatar', type: 'DEFAULT' },
      color: 'primary',
      nickname: 'Doctor',
    },
    gameAccountsQuery: {
      data: [{ account: 'G1' }, { account: 'G2' }],
    },
    selectGameAccount: mockSelectGameAccount,
  }),
}));

jest.mock('tamagui', () => ({
  ...jest.requireActual<typeof import('tamagui')>('tamagui'),
  useMedia: () => ({ large: mockLarge }),
}));

jest.mock('@/features/session', () => ({
  useSessionBackdrop: () => ({ setBackdropTint: mockSetBackdropTint }),
}));

jest.mock('./components/navigation-frame', () => ({
  NavigationFrame: (props: NavigationFrameTestProps) => mockNavigationFrame(props),
}));

jest.mock('./components/navigation-header', () => ({
  NavigationHeader: (props: object) => mockNavigationHeader(props),
}));

jest.mock('./navigation-actions', () => ({
  useAppLogout: () => mockLogout,
  useReturnToDashboard: () => mockReturnToDashboard,
}));

function readLastFrameProps(): NavigationFrameTestProps {
  const call = mockNavigationFrame.mock.calls.at(-1);
  if (!call) throw new Error('Expected NavigationFrame props.');
  return call[0];
}

function renderFrame(children: React.ReactNode) {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      {children}
    </TamaguiProvider>,
  );
}

describe('navigation scope frames', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/dashboard/G1/overview';
    mockLarge = false;
  });

  it('pushes the complete Settings screen from Dashboard', async () => {
    const screen = await renderFrame(<DashboardFrame><Text>content</Text></DashboardFrame>);
    const frame = readLastFrameProps();

    frame.onToggleScope();

    expect(mockRouterPush).toHaveBeenCalledWith(ROUTES.settingsNetwork);
    expect(mockSetBackdropTint).toHaveBeenCalledWith(expect.any(String));
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('uses the active Dashboard tab and account when selecting a sidebar page', async () => {
    await renderFrame(<DashboardFrame />);
    const frame = readLastFrameProps();

    frame.onSelect('operators');

    expect(frame.activeId).toBe('overview');
    expect(mockRouterReplace).toHaveBeenCalledWith({
      pathname: '/dashboard/[gameAccountId]/operators',
      params: { gameAccountId: 'G1' },
    });
  });

  it('updates account selection without navigating to another route', async () => {
    await renderFrame(<DashboardFrame><Text>pager content</Text></DashboardFrame>);

    const shellCall = mockDashboardShell.mock.calls.at(-1);
    if (!shellCall) throw new Error('Expected DashboardShell props.');
    shellCall[0].onSelectGameAccount('G2');

    expect(mockDashboardShell).toHaveBeenCalledWith(expect.objectContaining({
      selectedGameAccountId: 'G1',
    }));
    expect(mockSelectGameAccount).toHaveBeenCalledWith('G2');
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('dismisses Settings to the preserved Dashboard stack screen', async () => {
    mockPathname = '/settings/account';
    await renderFrame(<SettingsFrame />);
    const frame = readLastFrameProps();

    frame.onToggleScope();

    expect(frame.activeId).toBe('account');
    expect(mockReturnToDashboard).toHaveBeenCalledTimes(1);
  });

  it('navigates Settings pages through the nested tab route', async () => {
    mockPathname = '/settings/network';
    await renderFrame(<SettingsFrame />);
    const frame = readLastFrameProps();

    frame.onSelect('contributors');

    expect(mockRouterNavigate).toHaveBeenCalledWith(ROUTES.settingsContributors);
  });
});
