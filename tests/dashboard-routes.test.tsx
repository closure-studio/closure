import { render } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import DashboardActivityRoute from '../src/app/(app)/dashboard/activity';
import DashboardInventoryRoute from '../src/app/(app)/dashboard/inventory';
import DashboardOperatorsRoute from '../src/app/(app)/dashboard/operators';
import DashboardOverviewRoute from '../src/app/(app)/dashboard/overview';

const mockActiveGameAccount = {
  account: 'G1',
  config: { map_id: 'main_01-07' },
};

jest.mock('@/features/dashboard', () => {
  const { Text, View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    ActivityTimelineView: () => <Text testID="activity-screen" />,
    DashboardPageScroll: ({ children }: PropsWithChildren) => (
      <View testID="dashboard-page-scroll">{children}</View>
    ),
    GameAccountOverviewView: () => <Text testID="overview-screen" />,
    getCharacterDisplayName: (_table: object, characterId: string) => characterId,
    getStageDisplayLabel: (_table: object, stageId: string) => stageId,
    InventoryView: () => <Text testID="inventory-screen" />,
    OperatorRosterView: () => <Text testID="operators-screen" />,
    useActiveCharacters: () => ({ chars: [], total: 0 }),
    useActiveGameAccount: () => mockActiveGameAccount,
    useActiveGameDetail: () => ({ inventory: {} }),
    useActiveLogs: () => ({ hasMore: false, logs: [] }),
    useCharacterTable: () => ({}),
    useItemTable: () => ({}),
    useStageTable: () => ({}),
  };
});

describe('dashboard routes', () => {
  it.each([
    ['activity', DashboardActivityRoute],
    ['inventory', DashboardInventoryRoute],
    ['operators', DashboardOperatorsRoute],
    ['overview', DashboardOverviewRoute],
  ] as const)('renders the dedicated %s screen', async (screenId, Route) => {
    const screen = await render(<Route />);

    expect(screen.getByTestId('dashboard-page-scroll')).toBeTruthy();
    expect(screen.getByTestId(`${screenId}-screen`)).toBeTruthy();
  });
});
