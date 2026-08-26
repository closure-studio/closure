import { render } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import DashboardActivityRoute from '../src/app/(app)/dashboard/[gameAccountId]/activity';
import DashboardInventoryRoute from '../src/app/(app)/dashboard/[gameAccountId]/inventory';
import DashboardOperatorsRoute from '../src/app/(app)/dashboard/[gameAccountId]/operators';
import DashboardOverviewRoute from '../src/app/(app)/dashboard/[gameAccountId]/overview';
import DashboardSettingsRoute from '../src/app/(app)/dashboard/[gameAccountId]/settings';
import type { ArkHostGameLogEntry } from '@/schemas/arkhost';

const mockUseGameLogsQuery = jest.fn((): { data: { hasMore: boolean; logs: ArkHostGameLogEntry[] } } => ({
  data: { hasMore: false, logs: [] },
}));

const mockGameAccount = {
  account: 'G1',
  config: { map_id: 'main_01-07' },
};

jest.mock('@/features/dashboard', () => {
  const { Text, View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    ActivityTimelineView: ({ entries }: { entries: readonly unknown[] }) => <Text testID="activity-screen">{entries.length}</Text>,
    DashboardPageFrame: ({ children }: PropsWithChildren) => (
      <View testID="dashboard-page-frame">{children}</View>
    ),
    EMPTY_INVENTORY: {},
    GameAccountOverviewView: ({ logs }: { logs: readonly unknown[] }) => (
      <View testID="overview-screen">
        <Text testID="game-logs-screen">{logs.length}</Text>
      </View>
    ),
    GameHostingConfigScreen: () => <View testID="hosting-config-screen" />,
    getCharacterDisplayName: (_table: object, characterId: string) => characterId,
    getStageDisplayParts: (_table: object, stageId: string) => ({ title: stageId, subtitle: undefined }),
    InventoryView: () => <Text testID="inventory-screen" />,
    OperatorRosterView: () => <Text testID="operators-screen" />,
    useDashboardRoute: () => ({ gameAccount: mockGameAccount, gameAccountId: 'G1' }),
    useGameDetailQuery: () => ({ data: { inventory: {} } }),
    useCharactersQuery: () => ({ data: { chars: [], total: 0 } }),
    useGameLogsQuery: () => mockUseGameLogsQuery(),
    useCharacterTable: () => ({}),
    useItemTable: () => ({}),
    useStageTable: () => ({}),
  };
});

beforeEach(() => {
  mockUseGameLogsQuery.mockReset();
  mockUseGameLogsQuery.mockReturnValue({ data: { hasMore: false, logs: [] } });
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

  it('renders the hosting configuration screen', async () => {
    const screen = await render(<DashboardSettingsRoute />);

    expect(screen.getByTestId('hosting-config-screen')).toBeTruthy();
  });

  it('keeps the restored schedule tab independent from game logs', async () => {
    const screen = await render(<DashboardActivityRoute />);

    expect(screen.getByTestId('activity-screen').props.children).toBe(5);
    expect(mockUseGameLogsQuery).not.toHaveBeenCalled();
  });

  it('passes selected game logs into the overview summary grid', async () => {
    mockUseGameLogsQuery.mockReturnValue({
      data: {
        hasMore: false,
        logs: [{ content: 'log entry', id: 1, logLevel: 1, name: 'G1', ts: 1 }],
      },
    });

    const screen = await render(<DashboardOverviewRoute />);

    expect(screen.getByTestId('overview-screen')).toBeTruthy();
    expect(screen.getByTestId('game-logs-screen').props.children).toBe(1);
  });
});
