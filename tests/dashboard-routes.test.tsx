import { render } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import DashboardActivityRoute from '../src/app/(app)/dashboard/activity';
import DashboardInventoryRoute from '../src/app/(app)/dashboard/inventory';
import DashboardOperatorsRoute from '../src/app/(app)/dashboard/operators';
import DashboardOverviewRoute from '../src/app/(app)/dashboard/overview';
import type { ArkHostGameLogEntry } from '@/schemas/arkhost';

const mockUseSelectedGameLogsQuery = jest.fn((): { data: { hasMore: boolean; logs: ArkHostGameLogEntry[] } } => ({
  data: { hasMore: false, logs: [] },
}));

const mockSelectedGameAccount = {
  account: 'G1',
  config: { map_id: 'main_01-07' },
};

jest.mock('@/store', () => ({
  useAppStore: (selector: (state: { selectedGameAccountId: string | null }) => unknown) =>
    selector({ selectedGameAccountId: 'G1' }),
}));

jest.mock('@/features/dashboard', () => {
  const { Text, View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    ActivityTimelineView: ({ entries }: { entries: readonly unknown[] }) => <Text testID="activity-screen">{entries.length}</Text>,
    DashboardPageFrame: ({ children }: PropsWithChildren) => (
      <View testID="dashboard-page-frame">{children}</View>
    ),
    EMPTY_INVENTORY: {},
    GameAccountOverviewView: () => <Text testID="overview-screen" />,
    GameLogsView: ({ entries }: { entries: readonly unknown[] }) => <Text testID="game-logs-screen">{entries.length}</Text>,
    getCharacterDisplayName: (_table: object, characterId: string) => characterId,
    getStageDisplayLabel: (_table: object, stageId: string) => stageId,
    InventoryView: () => <Text testID="inventory-screen" />,
    OperatorRosterView: () => <Text testID="operators-screen" />,
    useSelectedGameAccount: () => mockSelectedGameAccount,
    useSelectedGameDetailQuery: () => ({ data: { inventory: {} } }),
    useSelectedCharactersQuery: () => ({ data: { chars: [], total: 0 } }),
    useSelectedGameLogsQuery: () => mockUseSelectedGameLogsQuery(),
    useCharacterTable: () => ({}),
    useItemTable: () => ({}),
    useStageTable: () => ({}),
  };
});

beforeEach(() => {
  mockUseSelectedGameLogsQuery.mockReset();
  mockUseSelectedGameLogsQuery.mockReturnValue({ data: { hasMore: false, logs: [] } });
});

describe('dashboard routes', () => {
  it.each([
    ['activity', DashboardActivityRoute, 'dashboard-page-frame'],
    ['inventory', DashboardInventoryRoute, 'dashboard-page-frame'],
    ['operators', DashboardOperatorsRoute, 'dashboard-page-frame'],
    ['overview', DashboardOverviewRoute, 'dashboard-page-frame'],
  ] as const)('renders the dedicated %s screen', async (screenId, Route, wrapperTestId) => {
    const screen = await render(<Route />);

    expect(screen.getByTestId(wrapperTestId)).toBeTruthy();
    expect(screen.getByTestId(`${screenId}-screen`)).toBeTruthy();
  });

  it('keeps the restored schedule tab independent from game logs', async () => {
    const screen = await render(<DashboardActivityRoute />);

    expect(screen.getByTestId('activity-screen').props.children).toBe(5);
    expect(mockUseSelectedGameLogsQuery).not.toHaveBeenCalled();
  });

  it('renders selected game logs after the summary content', async () => {
    mockUseSelectedGameLogsQuery.mockReturnValue({
      data: {
        hasMore: false,
        logs: [{ content: 'log entry', id: 1, logLevel: 1, name: 'G1', ts: 1 }],
      },
    });

    const screen = await render(<DashboardOverviewRoute />);
    const summaryNodes = screen.getAllByTestId(/^(overview-screen|game-logs-screen)$/);

    expect(summaryNodes).toEqual([
      screen.getByTestId('overview-screen'),
      screen.getByTestId('game-logs-screen'),
    ]);
    expect(screen.getByTestId('game-logs-screen').props.children).toBe(1);
  });
});
