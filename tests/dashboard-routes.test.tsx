import { render } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import DashboardActivityRoute from '../src/app/(app)/dashboard/activity';
import DashboardInventoryRoute from '../src/app/(app)/dashboard/inventory';
import DashboardOperatorsRoute from '../src/app/(app)/dashboard/operators';
import DashboardOverviewRoute from '../src/app/(app)/dashboard/overview';
import DashboardTasksRoute from '../src/app/(app)/dashboard/tasks';

jest.mock('@/features/dashboard', () => {
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    ActivityTimelineView: () => <Text testID="activity-screen" />,
    DashboardPageScroll: ({ children }: PropsWithChildren) => children,
    GameAccountOverviewView: () => <Text testID="overview-screen" />,
    InventoryView: () => <Text testID="inventory-screen" />,
    OperatorRosterView: () => <Text testID="operators-screen" />,
    RoutineTasksView: () => <Text testID="tasks-screen" />,
    useDashboardState: () => ({
      activeGameAccount: {
        activityTimeline: [],
        inventory: {},
        operators: [],
        routineTasks: [],
      },
      toggleRoutineTaskCompletion: jest.fn(),
    }),
  };
});

jest.mock('@/features/dashboard/item-table', () => {
  return { itemTable: {} };
});

describe('dashboard routes', () => {
  it.each([
    ['activity', DashboardActivityRoute],
    ['inventory', DashboardInventoryRoute],
    ['operators', DashboardOperatorsRoute],
    ['overview', DashboardOverviewRoute],
    ['tasks', DashboardTasksRoute],
  ] as const)('renders the dedicated %s screen', async (screenId, Route) => {
    const screen = await render(<Route />);

    expect(screen.getByTestId(`${screenId}-screen`)).toBeTruthy();
  });
});
