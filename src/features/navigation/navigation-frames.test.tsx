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
  header: React.ReactNode;
  onSelect: (id: string) => void;
  onToggleScope: () => void;
}>;

type DashboardShellTestProps = PropsWithChildren<{
  onSelectGameAccount: (gameAccountId: string) => void;
  selectedGameAccountId: string;
}>;

type NavigationHeaderTestProps = {
  avatarUrl?: string;
  title: string;
};

const mockNavigationFrame = jest.fn<React.ReactNode, [NavigationFrameTestProps]>(
  ({ children, header }) => <>{header}{children}</>,
);
const mockNavigationHeader = jest.fn((_props: NavigationHeaderTestProps) => null);
const mockDashboardShell = jest.fn(({ children }: DashboardShellTestProps) => children);
const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
const mockRouterNavigate = jest.fn();
const mockSelectGameAccount = jest.fn();
const mockReturnToDashboard = jest.fn();
const mockLogout = jest.fn();
const mockSetBackdropTint = jest.fn();
let mockPathname = '/dashboard/overview';
let mockLarge = false;
let mockSelectedGameAccount = {
  account: 'G1',
  avatar: { id: 'avatar', type: 'DEFAULT' },
  color: 'primary',
  nickname: 'Doctor One',
};

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
    selectedGameAccount: mockSelectedGameAccount,
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
  NavigationHeader: (props: NavigationHeaderTestProps) => mockNavigationHeader(props),
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
    mockPathname = '/dashboard/overview';
    mockLarge = false;
    mockSelectedGameAccount = {
      account: 'G1',
      avatar: { id: 'avatar', type: 'DEFAULT' },
      color: 'primary',
      nickname: 'Doctor One',
    };
  });

  it('pushes the complete Settings screen from Dashboard', async () => {
    const screen = await renderFrame(<DashboardFrame><Text>content</Text></DashboardFrame>);
    const frame = readLastFrameProps();

    frame.onToggleScope();

    expect(mockRouterPush).toHaveBeenCalledWith(ROUTES.settingsNetwork);
    expect(mockSetBackdropTint).toHaveBeenCalledWith(expect.any(String));
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('uses the active Dashboard tab when selecting a sidebar page', async () => {
    await renderFrame(<DashboardFrame />);
    const frame = readLastFrameProps();

    frame.onSelect('operators');

    expect(frame.activeId).toBe('overview');
    expect(mockRouterReplace).toHaveBeenCalledWith('/dashboard/operators');
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

  it('updates the Header from the selected Game Account', async () => {
    const screen = await renderFrame(<DashboardFrame />);
    expect(mockNavigationHeader.mock.calls.at(-1)?.[0].title).toBe('Doctor One');

    mockSelectedGameAccount = {
      ...mockSelectedGameAccount,
      account: 'G2',
      nickname: 'Doctor Two',
    };
    await screen.rerender(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <DashboardFrame />
      </TamaguiProvider>,
    );

    expect(mockNavigationHeader.mock.calls.at(-1)?.[0].title).toBe('Doctor Two');
    expect(mockDashboardShell.mock.calls.at(-1)?.[0].selectedGameAccountId).toBe('G2');
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
