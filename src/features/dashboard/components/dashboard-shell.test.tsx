import { fireEvent, render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider, YStack } from 'tamagui';

import { i18n } from '@/i18n';
import { mockArkHostGameListResponse } from '@/mocks/arkhost';
import { tamaguiConfig } from '../../../../tamagui.config';
import { DashboardShell } from './dashboard-shell';

const initialGameAccounts = mockArkHostGameListResponse.code === 1
  ? mockArkHostGameListResponse.data.map((entry) => ({ account: entry.status.account, ap: entry.status.ap, avatar: entry.status.avatar, captchaInfo: entry.captcha_info, color: 'primary' as const, config: entry.game_config, createdAt: entry.status.created_at, isVerified: entry.status.is_verify, level: entry.status.level, nickname: entry.status.nick_name, platform: entry.status.platform, statusCode: entry.status.code, statusText: entry.status.text, userId: entry.status.uuid }))
  : [];

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');
  return { ...reanimated, ...reanimatedMock, useReducedMotion: () => true };
});

function DashboardShellTestTree({
  pageId,
  onSelectGameAccount,
  selectedGameAccountId = 'G18928069156',
}: {
  pageId: string;
  onSelectGameAccount: (gameAccountId: string) => void;
  selectedGameAccountId?: string;
}) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <DashboardShell selectedGameAccountId={selectedGameAccountId} gameAccounts={initialGameAccounts} onSelectGameAccount={onSelectGameAccount}>
          <YStack testID={`dashboard-page-${pageId}`} />
        </DashboardShell>
      </I18nextProvider>
    </TamaguiProvider>
  );
}

describe('DashboardShell', () => {
  it('keeps the Header and marquee mounted while page and account content change', async () => {
    const screen = await render(<DashboardShellTestTree pageId="overview" onSelectGameAccount={jest.fn()} />);
    const secondaryHeader = screen.getByTestId('dashboard-secondary-header');
    const marquee = screen.getByTestId('terminal-marquee');
    expect(screen.getByTestId('dashboard-page-overview')).toBeTruthy();

    await screen.rerender(
      <DashboardShellTestTree
        pageId="inventory"
        selectedGameAccountId="G16601716973"
        onSelectGameAccount={jest.fn()}
      />,
    );
    expect(screen.getByTestId('dashboard-secondary-header')).toBe(secondaryHeader);
    expect(screen.getByTestId('terminal-marquee')).toBe(marquee);
    expect(screen.getByTestId('dashboard-page-inventory')).toBeTruthy();
    expect(screen.queryByTestId('dashboard-page-overview')).toBeNull();
  });

  it('keeps account navigation under the large-only style owner', async () => {
    const onSelectGameAccount = jest.fn();
    const screen = await render(<DashboardShellTestTree pageId="overview" onSelectGameAccount={onSelectGameAccount} />);
    expect(screen.getByTestId('dashboard-account-switcher', { includeHiddenElements: true })).toHaveStyle({ display: 'none' });

    await fireEvent.press(screen.getByTestId('game-account-option-G16601716973', { includeHiddenElements: true }));
    expect(onSelectGameAccount).toHaveBeenCalledWith('G16601716973');
  });
});
