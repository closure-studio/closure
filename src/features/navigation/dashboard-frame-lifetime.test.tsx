import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { TamaguiProvider } from 'tamagui';

import { tamaguiConfig } from '../../../tamagui.config';
import { DashboardFrame } from './screens/dashboard-frame';

const mockTerminalMarqueeMount = jest.fn();
const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
const mockRouterSetParams = jest.fn();
let mockPathname = '/dashboard/overview';
let mockGameAccountId = 'G1';

jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
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

jest.mock('@/components', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const components = jest.requireActual<typeof import('@/components')>('@/components');
  return {
    ...components,
    TerminalMarquee: function MockTerminalMarquee() {
      React.useEffect(() => {
        mockTerminalMarqueeMount();
      }, []);
      return null;
    },
  };
});

jest.mock('@/features/dashboard', () => ({
  DashboardShell: jest.requireActual<
    typeof import('@/features/dashboard/components/dashboard-shell')
  >('@/features/dashboard/components/dashboard-shell').DashboardShell,
  getGameAvatarImageUrl: () => null,
  useDashboardRoute: () => ({
    gameAccount: {
      account: mockGameAccountId,
      avatar: { id: 'avatar', type: 'DEFAULT' },
      nickname: `Doctor ${mockGameAccountId}`,
    },
    gameAccountId: mockGameAccountId,
    gameAccounts: [
      { account: 'G1' },
      { account: 'G2' },
      { account: 'G3' },
    ],
  }),
}));

jest.mock('@/providers/layout-size-provider', () => ({
  useLayoutSize: () => 'small',
}));

jest.mock('./components/navigation-frame', () => ({
  NavigationFrame: ({ children }: React.PropsWithChildren) => children,
}));

jest.mock('./components/navigation-header', () => ({
  NavigationHeader: () => null,
}));

jest.mock('./use-app-logout', () => ({
  useAppLogout: () => jest.fn(),
}));

function DashboardFrameTestTree() {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <DashboardFrame>
        <Text>{mockGameAccountId}</Text>
      </DashboardFrame>
    </TamaguiProvider>
  );
}

describe('DashboardFrame account lifetime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/dashboard/overview';
    mockGameAccountId = 'G1';
  });

  it('keeps the real secondary-header marquee mounted across account changes', async () => {
    const screen = await render(<DashboardFrameTestTree />);

    mockGameAccountId = 'G2';
    await screen.rerender(<DashboardFrameTestTree />);
    mockGameAccountId = 'G3';
    await screen.rerender(<DashboardFrameTestTree />);

    expect(mockTerminalMarqueeMount).toHaveBeenCalledTimes(1);
  });
});
