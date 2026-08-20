import { render } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import type { ReactElement } from 'react';
import { TamaguiProvider } from 'tamagui';

import { i18n } from '@/i18n';
import { mockDashboardSchedule } from '@/mocks/dashboard';
import { mockArkHostGameLogsResponse } from '@/mocks/arkhost';
import { tamaguiConfig } from '../../../../tamagui.config';
import { ActivityTimelineView } from './activity-timeline-view';
import { GameLogsView } from './game-logs-view';

async function renderDashboardView(view: ReactElement) {
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <I18nextProvider i18n={i18n}>{view}</I18nextProvider>
    </TamaguiProvider>,
  );
}

describe('Dashboard timeline views', () => {
  it('renders every restored schedule entry in the schedule view', async () => {
    const screen = await renderDashboardView(<ActivityTimelineView entries={mockDashboardSchedule} />);

    expect(screen.getByTestId('dashboard-schedule')).toBeTruthy();
    for (const entry of mockDashboardSchedule) {
      expect(screen.getByTestId(`dashboard-schedule-entry-${entry.id}`)).toBeTruthy();
    }
  });

  it('renders ArkHost log content in the game logs view', async () => {
    const entries = mockArkHostGameLogsResponse.code === 1
      ? mockArkHostGameLogsResponse.data.logs
      : [];
    const firstEntry = entries[0];
    if (!firstEntry) throw new Error('Expected a game log fixture.');

    const screen = await renderDashboardView(<GameLogsView entries={entries} />);

    expect(screen.getByTestId('game-logs-view')).toBeTruthy();
    expect(screen.getByText(firstEntry.content)).toBeTruthy();
  });
});
