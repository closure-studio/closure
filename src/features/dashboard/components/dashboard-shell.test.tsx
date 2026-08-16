import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider, YStack } from 'tamagui';

import { i18n } from '@/i18n';
import { mockArkHostGameListResponse } from '@/mocks/arkhost';
import type { LayoutSize } from '@/schemas/layout-size';
import { tamaguiConfig } from '../../../../tamagui.config';
import { DashboardShell } from './dashboard-shell';

const initialGameAccounts = mockArkHostGameListResponse.code === 1
  ? mockArkHostGameListResponse.data.map((entry) => ({ account: entry.status.account, ap: entry.status.ap, avatar: entry.status.avatar, captchaInfo: entry.captcha_info, color: 'primary' as const, config: entry.game_config, createdAt: entry.status.created_at, isVerified: entry.status.is_verify, level: entry.status.level, nickname: entry.status.nick_name, platform: entry.status.platform, statusCode: entry.status.code, statusText: entry.status.text, userId: entry.status.uuid }))
  : [];

let mockLayoutSize: LayoutSize = 'large';

jest.mock('@/providers/layout-size-provider', () => ({
  useLayoutSize: () => mockLayoutSize,
}));

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');

  return {
    ...reanimated,
    ...reanimatedMock,
    useReducedMotion: () => true,
  };
});

function DashboardShellTestTree({ pageId, onSelectGameAccount }: { pageId: string; onSelectGameAccount: (gameAccountId: string) => void }) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <DashboardShell
          selectedGameAccountId="G18928069156"
          gameAccounts={initialGameAccounts}
          isContentSwipeEnabled
          onContentSwipe={jest.fn()}
          onSelectGameAccount={onSelectGameAccount}
        >
          <YStack testID={`dashboard-page-${pageId}`} />
        </DashboardShell>
      </I18nextProvider>
    </TamaguiProvider>
  );
}

describe('DashboardShell', () => {
  it('keeps the secondary header mounted while dashboard content changes', async () => {
    mockLayoutSize = 'large';
    const screen = await render(<DashboardShellTestTree pageId="overview" onSelectGameAccount={jest.fn()} />);

    expect(screen.getAllByTestId('dashboard-secondary-header')).toHaveLength(1);
    expect(screen.getByTestId('dashboard-page-overview')).toBeTruthy();
    expect(screen.getByTestId('game-account-option-G18928069156')).toBeTruthy();

    await screen.rerender(<DashboardShellTestTree pageId="inventory" onSelectGameAccount={jest.fn()} />);

    expect(screen.getAllByTestId('dashboard-secondary-header')).toHaveLength(1);
    expect(screen.getByTestId('dashboard-page-inventory')).toBeTruthy();
    expect(screen.getByTestId('game-account-option-G18928069156')).toBeTruthy();
    expect(screen.queryByTestId('dashboard-page-overview')).toBeNull();
  });

  it('hides the account switcher subtree on small layouts', async () => {
    mockLayoutSize = 'small';
    const screen = await render(<DashboardShellTestTree pageId="overview" onSelectGameAccount={jest.fn()} />);

    expect(screen.getAllByTestId('dashboard-secondary-header')).toHaveLength(1);
    expect(screen.getAllByText('// SECURE FRAME LINK · 18MS LATENCY').length).toBeGreaterThan(0);
    expect(screen.getByTestId('dashboard-page-overview')).toBeTruthy();
    expect(screen.queryAllByTestId(/game-account-option-/)).toHaveLength(0);
  });

  it('renders the account switcher with selection state and callback on large layouts', async () => {
    mockLayoutSize = 'large';
    const onSelectGameAccount = jest.fn();
    const screen = await render(<DashboardShellTestTree pageId="overview" onSelectGameAccount={onSelectGameAccount} />);

    expect(screen.getByTestId('game-account-option-G18928069156')).toHaveStyle({
      transform: [{ scale: 1 }, { scale: 1 }],
    });

    await fireEvent.press(screen.getByTestId('game-account-option-G16601716973'));

    expect(onSelectGameAccount).toHaveBeenCalledWith('G16601716973');
  });

  it('mounts the switcher when the layout grows from small to large', async () => {
    mockLayoutSize = 'small';
    const screen = await render(<DashboardShellTestTree pageId="overview" onSelectGameAccount={jest.fn()} />);

    expect(screen.queryAllByTestId(/game-account-option-/)).toHaveLength(0);

    mockLayoutSize = 'large';
    await screen.rerender(<DashboardShellTestTree pageId="overview" onSelectGameAccount={jest.fn()} />);

    expect(screen.getByTestId('game-account-option-G18928069156')).toBeTruthy();
    expect(screen.getByTestId('game-account-option-G18928069156')).toHaveStyle({
      transform: [{ scale: 1 }, { scale: 1 }],
    });
  });

  it('unmounts the switcher subtree when the layout shrinks to small', async () => {
    mockLayoutSize = 'large';
    const screen = await render(<DashboardShellTestTree pageId="overview" onSelectGameAccount={jest.fn()} />);

    expect(screen.getByTestId('game-account-option-G18928069156')).toBeTruthy();

    mockLayoutSize = 'small';
    await screen.rerender(<DashboardShellTestTree pageId="inventory" onSelectGameAccount={jest.fn()} />);

    expect(screen.queryAllByTestId(/game-account-option-/)).toHaveLength(0);
    expect(screen.getAllByTestId('dashboard-secondary-header')).toHaveLength(1);
    expect(screen.getAllByText('// SECURE FRAME LINK · 18MS LATENCY').length).toBeGreaterThan(0);
    expect(screen.getByTestId('dashboard-page-inventory')).toBeTruthy();
  });
});
