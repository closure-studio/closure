import { render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider, YStack } from 'tamagui';

import { i18n } from '@/i18n';
import { initialGameAccounts } from '../mocks/game-accounts';
import { tamaguiConfig } from '../../../../tamagui.config';
import { DashboardShell } from './dashboard-shell';

jest.mock('./link-game-account-sheet', () => ({
  LinkGameAccountSheet: () => null,
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

function DashboardShellTestTree({ pageId }: { pageId: string }) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>
        <DashboardShell
          activeGameAccountId="acc-01"
          canSwipeNext
          canSwipePrevious={false}
          gameAccounts={initialGameAccounts}
          isContentSwipeEnabled
          isLinkGameAccountSheetOpen={false}
          onContentSwipe={jest.fn()}
          onLinkGameAccount={jest.fn()}
          onLinkGameAccountSheetOpenChange={jest.fn()}
          onOpenLinkGameAccount={jest.fn()}
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
    expect(screen.getByTestId('game-account-option-acc-01')).toBeTruthy();

    await screen.rerender(<DashboardShellTestTree pageId="inventory" />);

    expect(screen.getAllByTestId('dashboard-secondary-header')).toHaveLength(1);
    expect(screen.getByTestId('dashboard-page-inventory')).toBeTruthy();
    expect(screen.getByTestId('game-account-option-acc-01')).toBeTruthy();
    expect(screen.queryByTestId('dashboard-page-overview')).toBeNull();
  });
});
