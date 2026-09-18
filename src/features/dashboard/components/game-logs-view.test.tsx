import { render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { mockArkHostGameLogsResponse } from '@/mocks/arkhost';
import { tamaguiConfig } from '../../../../tamagui.config';
import { GameLogsView } from './game-logs-view';

describe('GameLogsView', () => {
  it('renders ArkHost log content', async () => {
    const entries = mockArkHostGameLogsResponse.code === 1
      ? mockArkHostGameLogsResponse.data.logs
      : [];
    const firstEntry = entries[0];
    if (!firstEntry) throw new Error('Expected a game log fixture.');

    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <I18nextProvider i18n={i18n}>
          <GameLogsView activeSection="logs" entries={entries} onActivate={() => undefined} />
        </I18nextProvider>
      </TamaguiProvider>,
    );

    expect(screen.getByTestId('game-logs-view')).toBeTruthy();
    expect(screen.getByText(firstEntry.content)).toBeTruthy();
  });
});
