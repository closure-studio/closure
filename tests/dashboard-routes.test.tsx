import { render } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import DashboardActivityRoute from '../src/app/(app)/dashboard/activity';
import DashboardInventoryRoute from '../src/app/(app)/dashboard/inventory';
import DashboardOperatorsRoute from '../src/app/(app)/dashboard/operators';
import DashboardOverviewRoute from '../src/app/(app)/dashboard/overview';

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
    ActivityTimelineView: () => <Text testID="activity-screen" />,
    DashboardPageFrame: ({ children }: PropsWithChildren) => (
      <View testID="dashboard-page-frame">{children}</View>
    ),
    EMPTY_INVENTORY: {},
    GameAccountOverviewView: () => <Text testID="overview-screen" />,
    getCharacterDisplayName: (_table: object, characterId: string) => characterId,
    getStageDisplayLabel: (_table: object, stageId: string) => stageId,
    InventoryView: () => <Text testID="inventory-screen" />,
    OperatorRosterView: () => <Text testID="operators-screen" />,
    useSelectedGameAccount: () => mockSelectedGameAccount,
    useSelectedGameDetailQuery: () => ({ data: { inventory: {} } }),
    useSelectedCharactersQuery: () => ({ data: { chars: [], total: 0 } }),
    useSelectedGameLogsQuery: () => ({ data: { hasMore: false, logs: [] } }),
    useCharacterTable: () => ({}),
    useItemTable: () => ({}),
    useStageTable: () => ({}),
  };
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
});
