import { render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider, YStack } from 'tamagui';

import { i18n } from '@/i18n';
import { mockArkHostGameListResponse } from '../api';
import { tamaguiConfig } from '../../../../tamagui.config';
import { DashboardShell } from './dashboard-shell';

const initialGameAccounts = mockArkHostGameListResponse.code === 1
  ? mockArkHostGameListResponse.data.map((entry) => ({ account: entry.status.account, ap: entry.status.ap, avatar: entry.status.avatar, captchaInfo: entry.captcha_info, color: 'primary' as const, config: entry.game_config, createdAt: entry.status.created_at, isVerified: entry.status.is_verify, level: entry.status.level, nickname: entry.status.nick_name, platform: entry.status.platform, statusCode: entry.status.code, statusText: entry.status.text, userId: entry.status.uuid }))
  : [];

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');

  return {
    ...reanimated,
    ...reanimatedMock,
    useReducedMotion: () => true,
  };
});

function DashboardShellTestTree({ pageId }: { pageId: string }) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <DashboardShell
          activeGameAccountId="G18928069156"
          gameAccounts={initialGameAccounts}
          isContentSwipeEnabled
          onContentSwipe={jest.fn()}
          onSelectGameAccount={jest.fn()}
        >
          <YStack testID={`dashboard-page-${pageId}`} />
        </DashboardShell>
      </I18nextProvider>
    </TamaguiProvider>
  );
}

describe('DashboardShell', () => {
  it('keeps the secondary header mounted while dashboard content changes', async () => {
    const screen = await render(<DashboardShellTestTree pageId="overview" />);

    expect(screen.getAllByTestId('dashboard-secondary-header')).toHaveLength(1);
    expect(screen.getByTestId('dashboard-page-overview')).toBeTruthy();
    expect(screen.getByTestId('game-account-option-G18928069156')).toBeTruthy();

    await screen.rerender(<DashboardShellTestTree pageId="inventory" />);

    expect(screen.getAllByTestId('dashboard-secondary-header')).toHaveLength(1);
    expect(screen.getByTestId('dashboard-page-inventory')).toBeTruthy();
    expect(screen.getByTestId('game-account-option-G18928069156')).toBeTruthy();
    expect(screen.queryByTestId('dashboard-page-overview')).toBeNull();
  });
});
